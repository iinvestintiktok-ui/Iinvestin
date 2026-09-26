import { query } from "./_generated/server";
import { v } from "convex/values";
import {
  investorStatsValidator,
  investorValidator,
} from "./lib/validators";
import { mapInvestor } from "./lib/mappers";
import { getInvestorRank } from "./lib/leaderboard";

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(investorValidator, v.null()),
  handler: async (ctx, args) => {
    const investor = await ctx.db
      .query("investors")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return investor ? mapInvestor(investor) : null;
  },
});

export const getStats = query({
  args: { slug: v.string() },
  returns: v.union(investorStatsValidator, v.null()),
  handler: async (ctx, args) => {
    const investor = await ctx.db
      .query("investors")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!investor) return null;

    const investments = await ctx.db.query("investments").collect();
    const investors = await ctx.db.query("investors").collect();
    const investorBets = investments.filter((bet) => bet.investorId === investor._id);
    const completedBets = investorBets.filter((bet) => bet.status !== "pending");

    const totalProfit = completedBets.reduce(
      (sum, bet) => sum + ((bet.valueAfter48h ?? 0) - bet.amountInvested),
      0,
    );
    const winningBets = completedBets.filter((bet) => bet.status === "gain").length;
    const winRate =
      completedBets.length > 0
        ? Math.round((winningBets / completedBets.length) * 100)
        : 0;
    const bestMultiplier = completedBets.reduce(
      (max, bet) => Math.max(max, bet.multiplier ?? 0),
      0,
    );

    const rank = getInvestorRank(investors, investments, investor._id);

    return {
      totalProfit,
      rank,
      winRate,
      bestMultiplier,
      winningBets,
      totalBets: completedBets.length,
    };
  },
});
