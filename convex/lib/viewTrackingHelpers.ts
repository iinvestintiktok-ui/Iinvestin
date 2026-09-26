import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { computeResult } from "./computeResult";
import {
  INVESTMENT_WINDOW_MS,
  VIEW_CHECK_INTERVAL_MS,
  parseTiktokVideoUrl,
} from "./tiktokVideo";

export async function syncCreatorProfile(
  ctx: MutationCtx,
  creatorId: Id<"creators">,
  profile: {
    followers?: number;
    nickname?: string;
    avatar?: string;
    handle?: string;
  },
) {
  const creator = await ctx.db.get("creators", creatorId);
  if (!creator) {
    return;
  }

  const updates: {
    followers?: number;
    pseudo?: string;
    avatar?: string;
    tiktokUrl?: string;
  } = {};

  if (profile.followers !== undefined && profile.followers > 0) {
    updates.followers = profile.followers;
  }
  if (profile.nickname) {
    updates.pseudo = profile.nickname.startsWith("@")
      ? profile.nickname
      : `@${profile.nickname}`;
  }
  if (profile.avatar) {
    updates.avatar = profile.avatar;
  }
  if (profile.handle) {
    updates.tiktokUrl = `https://www.tiktok.com/@${profile.handle}`;
  }

  if (Object.keys(updates).length > 0) {
    await ctx.db.patch("creators", creatorId, updates);
  }
}

export async function ensureTrackedVideo(
  ctx: MutationCtx,
  tiktokUrl: string,
  metadata?: {
    videoTitle?: string;
    thumbnail?: string;
    creatorHandle?: string;
    creatorFollowers?: number;
    creatorNickname?: string;
    creatorAvatar?: string;
  },
): Promise<Id<"trackedVideos">> {
  const parsed = parseTiktokVideoUrl(tiktokUrl);
  if (!parsed) {
    throw new Error("Invalid TikTok video URL");
  }

  const existing = await ctx.db
    .query("trackedVideos")
    .withIndex("by_video_key", (q) => q.eq("videoKey", parsed.videoKey))
    .unique();

  if (existing) {
    const updates: {
      videoTitle?: string;
      thumbnail?: string;
      creatorHandle?: string;
      creatorFollowers?: number;
      creatorNickname?: string;
      creatorAvatar?: string;
    } = {};

    if (metadata?.videoTitle && !existing.videoTitle) {
      updates.videoTitle = metadata.videoTitle;
    }
    if (metadata?.thumbnail && !existing.thumbnail) {
      updates.thumbnail = metadata.thumbnail;
    }
    if (metadata?.creatorHandle && !existing.creatorHandle) {
      updates.creatorHandle = metadata.creatorHandle;
    }
    if (metadata?.creatorFollowers !== undefined && metadata.creatorFollowers > 0) {
      updates.creatorFollowers = metadata.creatorFollowers;
    }
    if (metadata?.creatorNickname && !existing.creatorNickname) {
      updates.creatorNickname = metadata.creatorNickname;
    }
    if (metadata?.creatorAvatar && !existing.creatorAvatar) {
      updates.creatorAvatar = metadata.creatorAvatar;
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch("trackedVideos", existing._id, updates);
    }

    return existing._id;
  }

  return await ctx.db.insert("trackedVideos", {
    videoKey: parsed.videoKey,
    tiktokUrl: parsed.tiktokUrl,
    creatorHandle: metadata?.creatorHandle ?? parsed.creatorHandle,
    creatorFollowers: metadata?.creatorFollowers ?? null,
    creatorNickname: metadata?.creatorNickname,
    creatorAvatar: metadata?.creatorAvatar,
    videoTitle: metadata?.videoTitle,
    thumbnail: metadata?.thumbnail,
    lastViews: null,
    lastCheckedAt: null,
    nextCheckAt: Date.now(),
  });
}

export async function insertInvestmentSnapshot(
  ctx: MutationCtx,
  investment: Doc<"investments">,
  views: number,
  recordedAt: number,
  likes?: number,
) {
  const result = computeResult(
    investment.viewsAtInvestment,
    investment.followersAtInvestment,
    investment.amountInvested,
    Math.max(1, views),
    investment.likesAtInvestment ?? 0,
    likes ?? 0,
  );

  await ctx.db.insert("investmentSnapshots", {
    investmentId: investment._id,
    recordedAt,
    views,
    likes,
    percentage: result.percentage,
    valueAfter: result.valueAfter,
  });

  return result;
}

export async function settleInvestment(
  ctx: MutationCtx,
  investment: Doc<"investments">,
  views: number,
  recordedAt: number,
  likes?: number,
) {
  const result = await insertInvestmentSnapshot(ctx, investment, views, recordedAt, likes);

  await ctx.db.patch("investments", investment._id, {
    currentViews: views,
    currentLikes: likes ?? investment.currentLikes ?? null,
    viewsAfter48h: views,
    valueAfter48h: result.valueAfter,
    multiplier: result.multiplier,
    percentage: result.percentage,
    status: result.status,
  });
}

export async function updateOpenInvestment(
  ctx: MutationCtx,
  investment: Doc<"investments">,
  views: number,
  recordedAt: number,
  likes?: number,
) {
  const result = await insertInvestmentSnapshot(ctx, investment, views, recordedAt, likes);

  await ctx.db.patch("investments", investment._id, {
    currentViews: views,
    currentLikes: likes ?? investment.currentLikes ?? null,
    percentage: result.percentage,
    valueAfter48h: result.valueAfter,
    multiplier: result.multiplier,
  });
}

export function getSettleAt(timestamp: number): number {
  return timestamp + INVESTMENT_WINDOW_MS;
}

export function getNextVideoCheckAt(now: number): number {
  return now + VIEW_CHECK_INTERVAL_MS;
}
