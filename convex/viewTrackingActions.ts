"use node";

import { internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  VIEW_POLL_BATCH_SIZE,
  VIEW_POLL_DELAY_MS,
  fetchTiktokVideoStats,
  parseTiktokVideoUrl,
  sleep,
} from "./lib/tiktokVideo";
import { videoFetchResultValidator } from "./lib/validators";

export const startPollingWave = internalAction({
  args: {},
  returns: v.object({
    processedVideos: v.number(),
    updatedInvestments: v.number(),
    settledInvestments: v.number(),
    failedVideos: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    let processedVideos = 0;
    let updatedInvestments = 0;
    let settledInvestments = 0;
    let failedVideos = 0;

    for (let batch = 0; batch < 50; batch += 1) {
      const dueVideos = await ctx.runQuery(internal.viewTracking.getDueVideos, {
        now,
        limit: VIEW_POLL_BATCH_SIZE,
      });

      if (dueVideos.length === 0) {
        break;
      }

      for (const video of dueVideos) {
        try {
          const stats = await fetchTiktokVideoStats(video.tiktokUrl);
          if (!stats) {
            failedVideos += 1;
            await ctx.runMutation(internal.viewTracking.markVideoChecked, {
              trackedVideoId: video._id,
              now: Date.now(),
              success: false,
            });
            continue;
          }

          const result = await ctx.runMutation(internal.viewTracking.recordVideoViews, {
            trackedVideoId: video._id,
            views: stats.playCount,
            likes: stats.likeCount,
            recordedAt: Date.now(),
            videoTitle: stats.title || undefined,
            thumbnail: stats.thumbnail || undefined,
            creatorHandle: stats.creatorHandle || undefined,
            creatorFollowers: stats.followerCount > 0 ? stats.followerCount : undefined,
            creatorNickname: stats.creatorNickname || undefined,
            creatorAvatar: stats.creatorAvatar || undefined,
          });

          processedVideos += 1;
          updatedInvestments += result.updatedInvestments;
          settledInvestments += result.settledInvestments;
        } catch {
          failedVideos += 1;
          await ctx.runMutation(internal.viewTracking.markVideoChecked, {
            trackedVideoId: video._id,
            now: Date.now(),
            success: false,
          });
        }

        await sleep(VIEW_POLL_DELAY_MS);
      }
    }

    return {
      processedVideos,
      updatedInvestments,
      settledInvestments,
      failedVideos,
    };
  },
});

const pollingWaveResultValidator = v.object({
  processedVideos: v.number(),
  updatedInvestments: v.number(),
  settledInvestments: v.number(),
  failedVideos: v.number(),
});

export const pollNow = action({
  args: {},
  returns: pollingWaveResultValidator,
  handler: async (ctx): Promise<{
    processedVideos: number;
    updatedInvestments: number;
    settledInvestments: number;
    failedVideos: number;
  }> => {
    return await ctx.runAction(internal.viewTrackingActions.startPollingWave, {});
  },
});

export const testFetchVideoUrls = action({
  args: { urls: v.array(v.string()) },
  returns: v.array(videoFetchResultValidator),
  handler: async (_ctx, args) => {
    const results = [];

    for (const url of args.urls) {
      const parsed = parseTiktokVideoUrl(url);
      if (!parsed) {
        results.push({
          url,
          videoKey: null,
          views: null,
          likes: null,
          followers: null,
          creatorHandle: null,
          title: null,
          success: false,
          error: "Invalid TikTok video URL",
        });
        continue;
      }

      try {
        const stats = await fetchTiktokVideoStats(parsed.tiktokUrl);
        if (!stats) {
          results.push({
            url,
            videoKey: parsed.videoKey,
            views: null,
            likes: null,
            followers: null,
            creatorHandle: parsed.creatorHandle,
            title: null,
            success: false,
            error: "Unable to fetch video stats",
          });
          continue;
        }

        results.push({
          url,
          videoKey: stats.videoKey,
          views: stats.playCount,
          likes: stats.likeCount > 0 ? stats.likeCount : null,
          followers: stats.followerCount > 0 ? stats.followerCount : null,
          creatorHandle: stats.creatorHandle,
          title: stats.title || null,
          success: true,
          error: null,
        });
      } catch (error) {
        results.push({
          url,
          videoKey: parsed.videoKey,
          views: null,
          likes: null,
          followers: null,
          creatorHandle: parsed.creatorHandle,
          title: null,
          success: false,
          error: error instanceof Error ? error.message : "Fetch failed",
        });
      }

      await sleep(VIEW_POLL_DELAY_MS);
    }

    return results;
  },
});
