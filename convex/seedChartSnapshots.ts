import { mutation, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { computeResult } from "./lib/computeResult";
import { insertInvestmentSnapshot } from "./lib/viewTrackingHelpers";

const HOUR_MS = 60 * 60 * 1000;
const EIGHT_HOURS = 8;
const BET_DURATION_HOURS = 48;

function estimateLikes(views: number, baseViews: number, baseLikes: number): number {
  if (baseViews <= 0) {
    return Math.round(views * 0.05);
  }
  return Math.round(baseLikes * (views / baseViews));
}

function buildMilestoneHours(elapsedHours: number): number[] {
  const hours: number[] = [0];
  for (let h = EIGHT_HOURS; h <= elapsedHours; h += EIGHT_HOURS) {
    hours.push(h);
  }
  return hours;
}

async function seedSnapshotsForInvestment(
  ctx: MutationCtx,
  investment: Doc<"investments">,
  now: number,
) {
  const existing = await ctx.db
    .query("investmentSnapshots")
    .withIndex("by_investment", (q) => q.eq("investmentId", investment._id))
    .collect();

  for (const snapshot of existing) {
    await ctx.db.delete(snapshot._id);
  }

  const startTime = investment.timestamp;
  const elapsedHours = Math.min(
    (now - startTime) / HOUR_MS,
    BET_DURATION_HOURS,
  );

  if (elapsedHours < 0) {
    return 0;
  }

  const targetViews =
    investment.viewsAfter48h ??
    investment.currentViews ??
    Math.round(investment.viewsAtInvestment * 1.15);

  const baseLikes = investment.likesAtInvestment ?? estimateLikes(
    investment.viewsAtInvestment,
    investment.viewsAtInvestment,
    Math.round(investment.viewsAtInvestment * 0.05),
  );

  const targetLikes =
    investment.currentLikes ??
    estimateLikes(targetViews, investment.viewsAtInvestment, baseLikes);

  const milestoneHours = buildMilestoneHours(elapsedHours);
  let inserted = 0;

  for (const hours of milestoneHours) {
    const progress = hours / BET_DURATION_HOURS;
    const views = Math.max(
      1,
      Math.round(
        investment.viewsAtInvestment + (targetViews - investment.viewsAtInvestment) * progress,
      ),
    );
    const likes = Math.max(
      0,
      Math.round(baseLikes + (targetLikes - baseLikes) * progress),
    );
    const recordedAt = startTime + hours * HOUR_MS;

    await insertInvestmentSnapshot(ctx, investment, views, recordedAt, likes);
    inserted += 1;
  }

  const lastResult = computeResult(
    investment.viewsAtInvestment,
    investment.followersAtInvestment,
    investment.amountInvested,
    targetViews,
    baseLikes,
    targetLikes,
  );

  await ctx.db.patch(investment._id, {
    likesAtInvestment: investment.likesAtInvestment ?? baseLikes,
    currentLikes: targetLikes,
    currentViews: targetViews,
    percentage: lastResult.percentage,
    multiplier: lastResult.multiplier,
    valueAfter48h: lastResult.valueAfter,
  });

  return inserted;
}

export const seedForRecentMockBets = mutation({
  args: {
    minAgeHours: v.optional(v.number()),
    maxAgeHours: v.optional(v.number()),
  },
  returns: v.object({
    processed: v.number(),
    snapshotsInserted: v.number(),
    slugs: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const minAgeHours = args.minAgeHours ?? 21;
    const maxAgeHours = args.maxAgeHours ?? 26;

    const minTimestamp = now - maxAgeHours * HOUR_MS;
    const maxTimestamp = now - minAgeHours * HOUR_MS;

    const investments = await ctx.db.query("investments").collect();

    const targets = investments.filter(
      (inv) =>
        inv.isMock &&
        inv.timestamp >= minTimestamp &&
        inv.timestamp <= maxTimestamp,
    );

    let snapshotsInserted = 0;
    const slugs: string[] = [];

    for (const investment of targets) {
      const count = await seedSnapshotsForInvestment(ctx, investment, now);
      snapshotsInserted += count;
      slugs.push(investment.slug);
    }

    return {
      processed: targets.length,
      snapshotsInserted,
      slugs,
    };
  },
});
