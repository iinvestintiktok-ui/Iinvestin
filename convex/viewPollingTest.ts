import { action, internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  ensureTrackedVideo,
  getSettleAt,
  insertInvestmentSnapshot,
  syncCreatorProfile,
} from "./lib/viewTrackingHelpers";
import { fetchTiktokVideoStats, sleep, VIEW_POLL_DELAY_MS } from "./lib/tiktokVideo";

export const insertPendingInvestment = internalMutation({
  args: {
    investorSlug: v.string(),
    amountInvested: v.number(),
    stats: v.object({
      videoKey: v.string(),
      tiktokUrl: v.string(),
      creatorHandle: v.string(),
      videoId: v.string(),
      playCount: v.number(),
      likeCount: v.number(),
      followerCount: v.number(),
      creatorNickname: v.string(),
      creatorAvatar: v.string(),
      title: v.string(),
      description: v.string(),
      thumbnail: v.string(),
    }),
    seedKey: v.string(),
  },
  returns: v.union(v.id("investments"), v.null()),
  handler: async (ctx, args) => {
    const investor = await ctx.db
      .query("investors")
      .withIndex("by_slug", (q) => q.eq("slug", args.investorSlug))
      .unique();

    if (!investor) {
      return null;
    }

    const trackedVideoId = await ensureTrackedVideo(ctx, args.stats.tiktokUrl, {
      videoTitle: args.stats.title,
      thumbnail: args.stats.thumbnail,
      creatorHandle: args.stats.creatorHandle,
      creatorFollowers: args.stats.followerCount,
      creatorNickname: args.stats.creatorNickname,
      creatorAvatar: args.stats.creatorAvatar,
    });

    let creator = await ctx.db
      .query("creators")
      .withIndex("by_slug", (q) => q.eq("slug", `tv-${args.stats.creatorHandle}`))
      .unique();

    if (!creator) {
      const creatorId = await ctx.db.insert("creators", {
        slug: `tv-${args.stats.creatorHandle}`,
        pseudo: args.stats.creatorNickname.startsWith("@")
          ? args.stats.creatorNickname
          : `@${args.stats.creatorNickname}`,
        avatar: args.stats.creatorAvatar || args.stats.thumbnail,
        followers: Math.max(0, args.stats.followerCount),
        tiktokUrl: `https://www.tiktok.com/@${args.stats.creatorHandle}`,
        bio: "",
        joinedAt: Date.now(),
        isMock: true,
      });
      creator = await ctx.db.get("creators", creatorId);
    }

    if (!creator) {
      return null;
    }

    await syncCreatorProfile(ctx, creator._id, {
      followers: args.stats.followerCount,
      nickname: args.stats.creatorNickname,
      avatar: args.stats.creatorAvatar || args.stats.thumbnail,
      handle: args.stats.creatorHandle,
    });

    const now = Date.now();
    const investmentId = await ctx.db.insert("investments", {
      slug: args.seedKey,
      investorId: investor._id,
      creatorId: creator._id,
      trackedVideoId,
      videoTitle: args.stats.title || args.stats.videoKey,
      videoDescription: args.stats.description,
      thumbnail: args.stats.thumbnail,
      viewsAtInvestment: args.stats.playCount,
      followersAtInvestment: Math.max(1, args.stats.followerCount || creator.followers),
      amountInvested: args.amountInvested,
      currentViews: args.stats.playCount,
      viewsAfter48h: null,
      valueAfter48h: null,
      multiplier: null,
      percentage: null,
      status: "pending",
      timestamp: now,
      settleAt: getSettleAt(now),
      tiktokUrl: args.stats.tiktokUrl,
      isMock: true,
    });

    const investment = await ctx.db.get("investments", investmentId);
    if (investment) {
      await insertInvestmentSnapshot(ctx, investment, args.stats.playCount, now);
    }

    return investmentId;
  },
});

export const seedPendingInvestmentsFromUrls = action({
  args: {
    urls: v.array(v.string()),
    investorSlug: v.optional(v.string()),
    amountInvested: v.optional(v.number()),
  },
  returns: v.object({
    created: v.number(),
    skipped: v.number(),
    investmentIds: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const investorSlug = args.investorSlug ?? "i1";
    const amountInvested = args.amountInvested ?? 5000;
    const now = Date.now();

    let created = 0;
    let skipped = 0;
    const investmentIds: string[] = [];

    for (const [index, url] of args.urls.entries()) {
      const stats = await fetchTiktokVideoStats(url);
      if (!stats) {
        skipped += 1;
        continue;
      }

      const investmentId = await ctx.runMutation(internal.viewPollingTest.insertPendingInvestment, {
        investorSlug,
        amountInvested,
        stats,
        seedKey: `pending-${now}-${index}`,
      });

      if (investmentId) {
        created += 1;
        investmentIds.push(investmentId);
      } else {
        skipped += 1;
      }

      await sleep(VIEW_POLL_DELAY_MS);
    }

    return { created, skipped, investmentIds };
  },
});

export const scheduleImmediatePoll = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const videos = await ctx.db.query("trackedVideos").collect();
    for (const video of videos) {
      await ctx.db.patch("trackedVideos", video._id, {
        nextCheckAt: Date.now(),
      });
    }

    await ctx.scheduler.runAfter(0, internal.viewTrackingActions.startPollingWave, {});
    return null;
  },
});
