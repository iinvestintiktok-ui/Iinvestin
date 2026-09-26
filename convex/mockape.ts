import { mutation, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id, TableNames } from "./_generated/dataModel";
import { computeResult } from "./lib/computeResult";
import { getSettleAt, ensureTrackedVideo } from "./lib/viewTrackingHelpers";
import {
  getMockInvestmentVideos,
  mockCreators,
  mockInvestmentStats,
  mockInvestors,
  mockKpiData,
  mockSponsor,
} from "./lib/mockSeedData";

async function deleteMockRecords(ctx: MutationCtx) {
  const tables: TableNames[] = [
    "investmentSnapshots",
    "investments",
    "trackedVideos",
    "investors",
    "creators",
    "sponsors",
    "platformStats",
  ];

  for (const table of tables) {
    const rows = await ctx.db.query(table).collect();
    for (const row of rows) {
      if ("isMock" in row && row.isMock) {
        await ctx.db.delete(row._id);
      }
    }
  }
}

export const load = mutation({
  args: {},
  returns: v.object({
    creators: v.number(),
    investors: v.number(),
    investments: v.number(),
  }),
  handler: async (ctx) => {
    await deleteMockRecords(ctx);

    const activeSponsors = await ctx.db
      .query("sponsors")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    for (const sponsor of activeSponsors) {
      await ctx.db.patch(sponsor._id, { isActive: false });
    }

    const creatorIdBySlug = new Map<string, Id<"creators">>();
    for (const creator of mockCreators) {
      const { joinedAt, ...creatorFields } = creator;
      const id = await ctx.db.insert("creators", {
        ...creatorFields,
        joinedAt: new Date(joinedAt).getTime(),
        isMock: true,
      });
      creatorIdBySlug.set(creator.slug, id);
    }

    const investorIdBySlug = new Map<string, Id<"investors">>();
    for (const investor of mockInvestors) {
      const { joinedAt, ...investorFields } = investor;
      const id = await ctx.db.insert("investors", {
        ...investorFields,
        joinedAt: new Date(joinedAt).getTime(),
        isMock: true,
      });
      investorIdBySlug.set(investor.slug, id);
    }

    const videos = getMockInvestmentVideos();
    for (const [index, stats] of mockInvestmentStats.entries()) {
      const video = videos[index % videos.length];
      const investorId = investorIdBySlug.get(stats.investorSlug);
      const creatorId = creatorIdBySlug.get(video.creatorSlug);
      if (!investorId || !creatorId) continue;

      const result = computeResult(
        stats.viewsAtInvestment,
        stats.followersAtInvestment,
        stats.amountInvested,
        stats.viewsAfter48h,
      );

      const timestamp = new Date(stats.timestamp).getTime();
      const creatorHandleMatch = video.tiktokUrl.match(/@([a-zA-Z0-9._]+)\/video\//i);
      const trackedVideoId = await ensureTrackedVideo(ctx, video.tiktokUrl, {
        videoTitle: video.videoTitle,
        thumbnail: video.thumbnail,
        creatorHandle: creatorHandleMatch?.[1]?.toLowerCase() ?? video.creatorSlug,
      });

      await ctx.db.insert("investments", {
        slug: stats.slug,
        investorId,
        creatorId,
        trackedVideoId,
        videoTitle: video.videoTitle,
        videoDescription: video.videoDescription,
        thumbnail: video.thumbnail,
        viewsAtInvestment: stats.viewsAtInvestment,
        followersAtInvestment: stats.followersAtInvestment,
        amountInvested: stats.amountInvested,
        currentViews: stats.viewsAfter48h,
        viewsAfter48h: stats.viewsAfter48h,
        valueAfter48h: result.valueAfter,
        multiplier: result.multiplier,
        percentage: result.percentage,
        status: result.status,
        timestamp,
        settleAt: getSettleAt(timestamp),
        tiktokUrl: video.tiktokUrl,
        isMock: true,
      });
    }

    await ctx.db.insert("sponsors", {
      name: mockSponsor.name,
      logo: mockSponsor.logo,
      prizePool: mockSponsor.prizePool,
      endDate: new Date(mockSponsor.endDate).getTime(),
      isActive: true,
      isMock: true,
    });

    await ctx.db.insert("platformStats", {
      ...mockKpiData,
      isMock: true,
    });

    return {
      creators: mockCreators.length,
      investors: mockInvestors.length,
      investments: mockInvestmentStats.length,
    };
  },
});

export const clear = mutation({
  args: {},
  returns: v.object({ cleared: v.boolean() }),
  handler: async (ctx) => {
    await deleteMockRecords(ctx);
    return { cleared: true };
  },
});
