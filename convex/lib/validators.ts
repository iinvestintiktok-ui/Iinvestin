import { v } from "convex/values";

export const creatorValidator = v.object({
  id: v.string(),
  pseudo: v.string(),
  avatar: v.string(),
  followers: v.number(),
  tiktokUrl: v.string(),
  bio: v.string(),
  joinedAt: v.string(),
});

export const investorValidator = v.object({
  id: v.string(),
  pseudo: v.string(),
  tag: v.string(),
  avatarColor: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  joinedAt: v.string(),
});

export const investmentValidator = v.object({
  id: v.string(),
  investorId: v.string(),
  creatorId: v.string(),
  videoTitle: v.string(),
  videoDescription: v.string(),
  thumbnail: v.string(),
  viewsAtInvestment: v.number(),
  followersAtInvestment: v.number(),
  amountInvested: v.number(),
  currentViews: v.union(v.number(), v.null()),
  viewsAfter48h: v.union(v.number(), v.null()),
  valueAfter48h: v.union(v.number(), v.null()),
  multiplier: v.union(v.number(), v.null()),
  percentage: v.union(v.number(), v.null()),
  status: v.union(
    v.literal("gain"),
    v.literal("loss"),
    v.literal("neutral"),
    v.literal("pending"),
  ),
  timestamp: v.string(),
  tiktokUrl: v.string(),
});

export const investmentSnapshotValidator = v.object({
  recordedAt: v.number(),
  views: v.number(),
  likes: v.union(v.number(), v.null()),
  percentage: v.number(),
  valueAfter: v.number(),
});

export const videoFetchResultValidator = v.object({
  url: v.string(),
  videoKey: v.union(v.string(), v.null()),
  views: v.union(v.number(), v.null()),
  likes: v.union(v.number(), v.null()),
  followers: v.union(v.number(), v.null()),
  creatorHandle: v.union(v.string(), v.null()),
  title: v.union(v.string(), v.null()),
  success: v.boolean(),
  error: v.union(v.string(), v.null()),
});

export const tiktokPreviewValidator = v.object({
  videoKey: v.string(),
  tiktokUrl: v.string(),
  creatorHandle: v.string(),
  creatorNickname: v.string(),
  creatorAvatar: v.union(v.string(), v.null()),
  thumbnail: v.union(v.string(), v.null()),
  title: v.string(),
  description: v.string(),
  views: v.number(),
  likes: v.number(),
  followers: v.number(),
});

export const investmentWithRelationsValidator = v.object({
  ...investmentValidator.fields,
  investor: v.union(investorValidator, v.null()),
  creator: v.union(creatorValidator, v.null()),
});

export const investmentDetailValidator = v.object({
  ...investmentValidator.fields,
  investor: v.union(investorValidator, v.null()),
  creator: v.union(creatorValidator, v.null()),
  settleAt: v.union(v.number(), v.null()),
  likesAtInvestment: v.union(v.number(), v.null()),
  currentLikes: v.union(v.number(), v.null()),
});

export const sponsorValidator = v.object({
  name: v.string(),
  logo: v.string(),
  prizePool: v.number(),
  endDate: v.string(),
});

export const kpiValidator = v.object({
  totalDistributed: v.number(),
  totalUsers: v.number(),
  investmentsLast48h: v.number(),
  bestMultiplier: v.number(),
  activeBets: v.number(),
});

export const myPositionsValidator = v.object({
  count: v.number(),
  averagePercentage: v.union(v.number(), v.null()),
  totalStaked: v.number(),
});

export const leaderboardEntryValidator = v.object({
  investor: investorValidator,
  totalProfit: v.number(),
  winningBets: v.number(),
  losingBets: v.number(),
  totalBets: v.number(),
  maxPercentage: v.number(),
});

export const investorStatsValidator = v.object({
  totalProfit: v.number(),
  rank: v.number(),
  winRate: v.number(),
  bestMultiplier: v.number(),
  winningBets: v.number(),
  totalBets: v.number(),
});

export const creatorStatsValidator = v.object({
  timesBet: v.number(),
  totalGain: v.number(),
  mostProfitableVideo: v.union(v.string(), v.null()),
  bestMultiplier: v.number(),
});

export const authUserValidator = v.object({
  id: v.id("users"),
  email: v.string(),
  nickname: v.string(),
  tiktokHandle: v.string(),
  investorSlug: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  onboardingCompleted: v.boolean(),
});

export const tiktokProfileValidator = v.object({
  uniqueId: v.string(),
  nickname: v.string(),
  avatarUrl: v.string(),
  followerCount: v.number(),
  bio: v.string(),
  profileUrl: v.string(),
});
