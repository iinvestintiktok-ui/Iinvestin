"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { fetchTiktokVideoStats, parseTiktokVideoUrl } from "./lib/tiktokVideo";
import { tiktokPreviewValidator } from "./lib/validators";

export const previewTiktokVideo = action({
  args: { url: v.string() },
  returns: v.union(tiktokPreviewValidator, v.null()),
  handler: async (_ctx, args) => {
    const parsed = parseTiktokVideoUrl(args.url);
    if (!parsed) {
      return null;
    }

    const stats = await fetchTiktokVideoStats(parsed.tiktokUrl);
    if (!stats) {
      return null;
    }

    return {
      videoKey: stats.videoKey,
      tiktokUrl: stats.tiktokUrl,
      creatorHandle: stats.creatorHandle,
      creatorNickname: stats.creatorNickname,
      creatorAvatar: stats.creatorAvatar || null,
      thumbnail: stats.thumbnail || null,
      title: stats.title,
      description: stats.description,
      views: stats.playCount,
      likes: stats.likeCount,
      followers: stats.followerCount,
    };
  },
});

export const createInvestment = action({
  args: {
    token: v.string(),
    url: v.string(),
  },
  returns: v.object({
    investmentSlug: v.string(),
  }),
  handler: async (ctx, args): Promise<{ investmentSlug: string }> => {
    const parsed = parseTiktokVideoUrl(args.url);
    if (!parsed) {
      throw new Error("Invalid TikTok video URL");
    }

    const stats = await fetchTiktokVideoStats(parsed.tiktokUrl);
    if (!stats) {
      throw new Error("Unable to fetch video stats. Check the link and try again.");
    }

    const result: { investmentSlug: string } = await ctx.runMutation(
      internal.investments.createInvestmentInternal,
      {
      token: args.token,
        stats: {
          videoKey: stats.videoKey,
          tiktokUrl: stats.tiktokUrl,
          creatorHandle: stats.creatorHandle,
          videoId: stats.videoId,
          playCount: stats.playCount,
          likeCount: stats.likeCount,
          followerCount: stats.followerCount,
          creatorNickname: stats.creatorNickname,
          creatorAvatar: stats.creatorAvatar,
          title: stats.title,
          description: stats.description,
          thumbnail: stats.thumbnail,
        },
      },
    );

    return { investmentSlug: result.investmentSlug };
  },
});
