import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  investmentDetailValidator,
  investmentWithRelationsValidator,
  myPositionsValidator,
} from "./lib/validators";
import { getUserByToken } from "./lib/authHelpers";
import { mapCreator, mapInvestor, mapInvestment } from "./lib/mappers";
import { summarizeOpenPositions } from "./lib/positions";
import {
  ensureTrackedVideo,
  getSettleAt,
  insertInvestmentSnapshot,
  syncCreatorProfile,
} from "./lib/viewTrackingHelpers";

const investmentStatsValidator = v.object({
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
});

export const createInvestmentInternal = internalMutation({
  args: {
    token: v.string(),
    stats: investmentStatsValidator,
  },
  returns: v.object({
    investmentSlug: v.string(),
  }),
  handler: async (ctx, args) => {
    const sessionData = await getUserByToken(ctx, args.token);
    if (!sessionData) {
      throw new Error("Not authenticated");
    }

    const investor = await ctx.db.get("investors", sessionData.user.investorId);
    if (!investor) {
      throw new Error("Investor profile not found");
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
        isMock: false,
      });
      creator = await ctx.db.get("creators", creatorId);
    }

    if (!creator) {
      throw new Error("Unable to create creator profile");
    }

    await syncCreatorProfile(ctx, creator._id, {
      followers: args.stats.followerCount,
      nickname: args.stats.creatorNickname,
      avatar: args.stats.creatorAvatar || args.stats.thumbnail,
      handle: args.stats.creatorHandle,
    });

    const now = Date.now();
    const investmentSlug = `bet-${investor.slug}-${now}`;

    const investmentId = await ctx.db.insert("investments", {
      slug: investmentSlug,
      investorId: investor._id,
      creatorId: creator._id,
      trackedVideoId,
      videoTitle: args.stats.title || args.stats.videoKey,
      videoDescription: args.stats.description,
      thumbnail: args.stats.thumbnail,
      viewsAtInvestment: args.stats.playCount,
      likesAtInvestment: args.stats.likeCount,
      followersAtInvestment: Math.max(1, args.stats.followerCount || creator.followers),
      amountInvested: 0,
      currentViews: args.stats.playCount,
      currentLikes: args.stats.likeCount,
      viewsAfter48h: null,
      valueAfter48h: 0,
      multiplier: 1,
      percentage: 0,
      status: "pending",
      timestamp: now,
      settleAt: getSettleAt(now),
      tiktokUrl: args.stats.tiktokUrl,
      isMock: false,
    });

    const investment = await ctx.db.get("investments", investmentId);
    if (investment) {
      await insertInvestmentSnapshot(
        ctx,
        investment,
        args.stats.playCount,
        now,
        args.stats.likeCount,
      );
    }

    return { investmentSlug };
  },
});

export const getMyPositions = query({
  args: {
    token: v.union(v.string(), v.null()),
    now: v.number(),
  },
  returns: myPositionsValidator,
  handler: async (ctx, args) => {
    if (!args.token) {
      return { count: 0, averagePercentage: null, totalStaked: 0 };
    }

    const sessionData = await getUserByToken(ctx, args.token);
    if (!sessionData) {
      return { count: 0, averagePercentage: null, totalStaked: 0 };
    }

    const investments = await ctx.db
      .query("investments")
      .withIndex("by_investor", (q) => q.eq("investorId", sessionData.user.investorId))
      .collect();

    return summarizeOpenPositions(investments, args.now);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(investmentDetailValidator, v.null()),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("investments")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!doc) {
      return null;
    }

    const investorDoc = await ctx.db.get("investors", doc.investorId);
    const creatorDoc = await ctx.db.get("creators", doc.creatorId);

    return {
      ...mapInvestment(doc),
      investorId: investorDoc?.slug ?? "",
      creatorId: creatorDoc?.slug ?? "",
      investor: investorDoc ? mapInvestor(investorDoc) : null,
      creator: creatorDoc ? mapCreator(creatorDoc) : null,
      settleAt: doc.settleAt ?? doc.timestamp + 48 * 60 * 60 * 1000,
      likesAtInvestment: doc.likesAtInvestment ?? null,
      currentLikes: doc.currentLikes ?? null,
    };
  },
});

export const list = query({
  args: {},
  returns: v.array(investmentWithRelationsValidator),
  handler: async (ctx) => {
    const investments = await ctx.db
      .query("investments")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();

    const investors = await ctx.db.query("investors").collect();
    const creators = await ctx.db.query("creators").collect();

    const investorById = new Map(investors.map((doc) => [doc._id, doc]));
    const creatorById = new Map(creators.map((doc) => [doc._id, doc]));
    const investorSlugById = new Map(investors.map((doc) => [doc._id, doc.slug]));
    const creatorSlugById = new Map(creators.map((doc) => [doc._id, doc.slug]));

    return investments.map((doc) => {
      const investment = mapInvestment(doc);
      const investorDoc = investorById.get(doc.investorId);
      const creatorDoc = creatorById.get(doc.creatorId);
      return {
        ...investment,
        investorId: investorSlugById.get(doc.investorId) ?? "",
        creatorId: creatorSlugById.get(doc.creatorId) ?? "",
        investor: investorDoc ? mapInvestor(investorDoc) : null,
        creator: creatorDoc ? mapCreator(creatorDoc) : null,
      };
    });
  },
});

export const listByInvestor = query({
  args: { investorSlug: v.string() },
  returns: v.array(investmentWithRelationsValidator),
  handler: async (ctx, args) => {
    const investor = await ctx.db
      .query("investors")
      .withIndex("by_slug", (q) => q.eq("slug", args.investorSlug))
      .unique();
    if (!investor) return [];

    const investments = await ctx.db
      .query("investments")
      .withIndex("by_investor", (q) => q.eq("investorId", investor._id))
      .collect();

    const creators = await ctx.db.query("creators").collect();
    const creatorById = new Map(creators.map((doc) => [doc._id, doc]));

    return investments
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((doc) => {
        const creatorDoc = creatorById.get(doc.creatorId);
        return {
          ...mapInvestment(doc),
          investorId: investor.slug,
          creatorId: creatorDoc?.slug ?? "",
          investor: mapInvestor(investor),
          creator: creatorDoc ? mapCreator(creatorDoc) : null,
        };
      });
  },
});

export const listByCreator = query({
  args: { creatorSlug: v.string() },
  returns: v.array(investmentWithRelationsValidator),
  handler: async (ctx, args) => {
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_slug", (q) => q.eq("slug", args.creatorSlug))
      .unique();
    if (!creator) return [];

    const investments = await ctx.db
      .query("investments")
      .withIndex("by_creator", (q) => q.eq("creatorId", creator._id))
      .collect();

    const investors = await ctx.db.query("investors").collect();
    const investorById = new Map(investors.map((doc) => [doc._id, doc]));

    return investments
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((doc) => {
        const investorDoc = investorById.get(doc.investorId);
        return {
          ...mapInvestment(doc),
          investorId: investorDoc?.slug ?? "",
          creatorId: creator.slug,
          investor: investorDoc ? mapInvestor(investorDoc) : null,
          creator: mapCreator(creator),
        };
      });
  },
});
