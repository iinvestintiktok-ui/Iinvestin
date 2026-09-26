import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import {
  investmentSnapshotValidator,
  videoFetchResultValidator,
} from "./lib/validators";
import {
  ensureTrackedVideo,
  getNextVideoCheckAt,
  settleInvestment,
  syncCreatorProfile,
  updateOpenInvestment,
} from "./lib/viewTrackingHelpers";
import { VIEW_POLL_BATCH_SIZE } from "./lib/tiktokVideo";

export const getDueVideos = internalQuery({
  args: {
    now: v.number(),
    limit: v.number(),
  },
  returns: v.array(
    v.object({
      _id: v.id("trackedVideos"),
      tiktokUrl: v.string(),
      videoKey: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("trackedVideos")
      .withIndex("by_next_check", (q) => q.lte("nextCheckAt", args.now))
      .take(args.limit);

    return videos.map((video) => ({
      _id: video._id,
      tiktokUrl: video.tiktokUrl,
      videoKey: video.videoKey,
    }));
  },
});

export const markVideoChecked = internalMutation({
  args: {
    trackedVideoId: v.id("trackedVideos"),
    now: v.number(),
    success: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("trackedVideos", args.trackedVideoId, {
      lastCheckedAt: args.now,
      nextCheckAt: getNextVideoCheckAt(args.now),
    });
    return null;
  },
});

export const recordVideoViews = internalMutation({
  args: {
    trackedVideoId: v.id("trackedVideos"),
    views: v.number(),
    likes: v.optional(v.number()),
    recordedAt: v.number(),
    videoTitle: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    creatorHandle: v.optional(v.string()),
    creatorFollowers: v.optional(v.number()),
    creatorNickname: v.optional(v.string()),
    creatorAvatar: v.optional(v.string()),
  },
  returns: v.object({
    updatedInvestments: v.number(),
    settledInvestments: v.number(),
  }),
  handler: async (ctx, args) => {
    const trackedVideo = await ctx.db.get("trackedVideos", args.trackedVideoId);
    if (!trackedVideo) {
      throw new Error("Tracked video not found");
    }

    await ctx.db.patch("trackedVideos", args.trackedVideoId, {
      lastViews: args.views,
      lastLikes:
        args.likes !== undefined && args.likes >= 0 ? args.likes : trackedVideo.lastLikes,
      lastCheckedAt: args.recordedAt,
      nextCheckAt: getNextVideoCheckAt(args.recordedAt),
      videoTitle: args.videoTitle ?? trackedVideo.videoTitle,
      thumbnail: args.thumbnail ?? trackedVideo.thumbnail,
      creatorHandle: args.creatorHandle ?? trackedVideo.creatorHandle,
      creatorFollowers:
        args.creatorFollowers !== undefined && args.creatorFollowers > 0
          ? args.creatorFollowers
          : trackedVideo.creatorFollowers,
      creatorNickname: args.creatorNickname ?? trackedVideo.creatorNickname,
      creatorAvatar: args.creatorAvatar ?? trackedVideo.creatorAvatar,
    });

    const investments = await ctx.db
      .query("investments")
      .withIndex("by_tracked_video", (q) => q.eq("trackedVideoId", args.trackedVideoId))
      .collect();

    const syncedCreators = new Set<string>();
    let updatedInvestments = 0;
    let settledInvestments = 0;

    for (const investment of investments) {
      if (!syncedCreators.has(investment.creatorId)) {
        await syncCreatorProfile(ctx, investment.creatorId, {
          followers: args.creatorFollowers,
          nickname: args.creatorNickname,
          avatar: args.creatorAvatar,
          handle: args.creatorHandle ?? trackedVideo.creatorHandle,
        });
        syncedCreators.add(investment.creatorId);
      }
      if (investment.status !== "pending") {
        continue;
      }

      const settleAt = investment.settleAt ?? investment.timestamp + 48 * 60 * 60 * 1000;
      if (args.recordedAt >= settleAt) {
        await settleInvestment(ctx, investment, args.views, args.recordedAt, args.likes);
        settledInvestments += 1;
      } else {
        await updateOpenInvestment(ctx, investment, args.views, args.recordedAt, args.likes);
        updatedInvestments += 1;
      }
    }

    return { updatedInvestments, settledInvestments };
  },
});

export const registerTrackedVideos = mutation({
  args: {
    urls: v.array(v.string()),
  },
  returns: v.array(videoFetchResultValidator),
  handler: async (ctx, args) => {
    const results = [];

    for (const url of args.urls) {
      try {
        const trackedVideoId = await ensureTrackedVideo(ctx, url);
        const trackedVideo = await ctx.db.get("trackedVideos", trackedVideoId);
        results.push({
          url,
          videoKey: trackedVideo?.videoKey ?? null,
          views: trackedVideo?.lastViews ?? null,
          likes: trackedVideo?.lastLikes ?? null,
          followers: trackedVideo?.creatorFollowers ?? null,
          creatorHandle: trackedVideo?.creatorHandle ?? null,
          title: trackedVideo?.videoTitle ?? null,
          success: true,
          error: null,
        });
      } catch (error) {
        results.push({
          url,
          videoKey: null,
          views: null,
          likes: null,
          followers: null,
          creatorHandle: null,
          title: null,
          success: false,
          error: error instanceof Error ? error.message : "Failed to register video",
        });
      }
    }

    return results;
  },
});

export const listSnapshotsByInvestmentSlug = query({
  args: { investmentSlug: v.string() },
  returns: v.array(investmentSnapshotValidator),
  handler: async (ctx, args) => {
    const investment = await ctx.db
      .query("investments")
      .withIndex("by_slug", (q) => q.eq("slug", args.investmentSlug))
      .unique();

    if (!investment) {
      return [];
    }

    const snapshots = await ctx.db
      .query("investmentSnapshots")
      .withIndex("by_investment", (q) => q.eq("investmentId", investment._id))
      .collect();

    return snapshots
      .sort((left, right) => left.recordedAt - right.recordedAt)
      .map((snapshot) => ({
        recordedAt: snapshot.recordedAt,
        views: snapshot.views,
        likes: snapshot.likes ?? null,
        percentage: snapshot.percentage,
        valueAfter: snapshot.valueAfter,
      }));
  },
});

export const getPollingStatus = query({
  args: {},
  returns: v.object({
    trackedVideos: v.number(),
    pendingInvestments: v.number(),
    dueVideos: v.number(),
    totalSnapshots: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    const trackedVideos = await ctx.db.query("trackedVideos").collect();
    const pendingInvestments = await ctx.db
      .query("investments")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const dueVideos = trackedVideos.filter((video) => video.nextCheckAt <= now).length;
    const snapshots = await ctx.db.query("investmentSnapshots").collect();

    return {
      trackedVideos: trackedVideos.length,
      pendingInvestments: pendingInvestments.length,
      dueVideos,
      totalSnapshots: snapshots.length,
    };
  },
});

export const getDueVideoCount = internalQuery({
  args: { now: v.number() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("trackedVideos")
      .withIndex("by_next_check", (q) => q.lte("nextCheckAt", args.now))
      .take(VIEW_POLL_BATCH_SIZE + 1);

    return videos.length;
  },
});
