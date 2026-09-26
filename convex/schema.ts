import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const investmentStatus = v.union(
  v.literal("gain"),
  v.literal("loss"),
  v.literal("neutral"),
  v.literal("pending"),
);

export default defineSchema({
  creators: defineTable({
    slug: v.string(),
    pseudo: v.string(),
    avatar: v.string(),
    followers: v.number(),
    tiktokUrl: v.string(),
    bio: v.string(),
    joinedAt: v.optional(v.number()),
    isMock: v.boolean(),
  }).index("by_slug", ["slug"]),

  investors: defineTable({
    slug: v.string(),
    pseudo: v.string(),
    tag: v.string(),
    avatarColor: v.string(),
    avatarUrl: v.optional(v.string()),
    joinedAt: v.optional(v.number()),
    isMock: v.boolean(),
  }).index("by_slug", ["slug"]),

  trackedVideos: defineTable({
    videoKey: v.string(),
    tiktokUrl: v.string(),
    creatorHandle: v.string(),
    creatorFollowers: v.optional(v.union(v.number(), v.null())),
    creatorNickname: v.optional(v.string()),
    creatorAvatar: v.optional(v.string()),
    videoTitle: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    lastViews: v.union(v.number(), v.null()),
    lastLikes: v.optional(v.union(v.number(), v.null())),
    lastCheckedAt: v.union(v.number(), v.null()),
    nextCheckAt: v.number(),
  })
    .index("by_video_key", ["videoKey"])
    .index("by_next_check", ["nextCheckAt"]),

  investmentSnapshots: defineTable({
    investmentId: v.id("investments"),
    recordedAt: v.number(),
    views: v.number(),
    likes: v.optional(v.number()),
    percentage: v.number(),
    valueAfter: v.number(),
  }).index("by_investment", ["investmentId", "recordedAt"]),

  investments: defineTable({
    slug: v.string(),
    investorId: v.id("investors"),
    creatorId: v.id("creators"),
    trackedVideoId: v.optional(v.id("trackedVideos")),
    videoTitle: v.string(),
    videoDescription: v.string(),
    thumbnail: v.string(),
    viewsAtInvestment: v.number(),
    likesAtInvestment: v.optional(v.number()),
    followersAtInvestment: v.number(),
    amountInvested: v.number(),
    currentViews: v.optional(v.union(v.number(), v.null())),
    currentLikes: v.optional(v.union(v.number(), v.null())),
    viewsAfter48h: v.union(v.number(), v.null()),
    valueAfter48h: v.union(v.number(), v.null()),
    multiplier: v.union(v.number(), v.null()),
    percentage: v.union(v.number(), v.null()),
    status: investmentStatus,
    timestamp: v.number(),
    settleAt: v.optional(v.number()),
    tiktokUrl: v.string(),
    isMock: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_investor", ["investorId"])
    .index("by_creator", ["creatorId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_status", ["status"])
    .index("by_tracked_video", ["trackedVideoId"]),

  sponsors: defineTable({
    name: v.string(),
    logo: v.string(),
    prizePool: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
    isMock: v.boolean(),
  }).index("by_active", ["isActive"]),

  platformStats: defineTable({
    totalDistributed: v.number(),
    totalUsers: v.number(),
    investmentsLast48h: v.number(),
    bestMultiplier: v.number(),
    activeBets: v.number(),
    isMock: v.boolean(),
  }),

  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    tiktokHandle: v.string(),
    nickname: v.string(),
    investorId: v.id("investors"),
    investorSlug: v.string(),
    avatarUrl: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    joinedAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),
});
