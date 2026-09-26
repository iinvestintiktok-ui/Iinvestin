import { query } from "./_generated/server";
import { v } from "convex/values";
import { creatorStatsValidator, creatorValidator } from "./lib/validators";
import { mapCreator } from "./lib/mappers";

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(creatorValidator, v.null()),
  handler: async (ctx, args) => {
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return creator ? mapCreator(creator) : null;
  },
});

export const getStats = query({
  args: { slug: v.string() },
  returns: v.union(creatorStatsValidator, v.null()),
  handler: async (ctx, args) => {
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!creator) return null;

    const creatorBets = await ctx.db
      .query("investments")
      .withIndex("by_creator", (q) => q.eq("creatorId", creator._id))
      .collect();
    const completedBets = creatorBets.filter((bet) => bet.status !== "pending");

    const totalGain = completedBets.reduce(
      (sum, bet) => sum + ((bet.valueAfter48h ?? 0) - bet.amountInvested),
      0,
    );

    let mostProfitableVideo: string | null = null;
    let bestProfit = -Infinity;
    let bestMultiplier = 0;

    for (const bet of completedBets) {
      const profit = (bet.valueAfter48h ?? 0) - bet.amountInvested;
      if (profit > bestProfit) {
        bestProfit = profit;
        mostProfitableVideo = bet.videoTitle;
      }
      if ((bet.multiplier ?? 0) > bestMultiplier) {
        bestMultiplier = bet.multiplier ?? 0;
      }
    }

    return {
      timesBet: creatorBets.length,
      totalGain,
      mostProfitableVideo,
      bestMultiplier,
    };
  },
});
