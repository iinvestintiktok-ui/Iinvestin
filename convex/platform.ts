import { query } from "./_generated/server";
import { v } from "convex/values";
import { kpiValidator, sponsorValidator } from "./lib/validators";

export const getKpis = query({
  args: {
    // Legacy clients may still send `now`; ignored — time is computed server-side.
    now: v.optional(v.number()),
  },
  returns: kpiValidator,
  handler: async (ctx) => {
    const mockStats = await ctx.db
      .query("platformStats")
      .filter((q) => q.eq(q.field("isMock"), true))
      .first();

    if (mockStats) {
      return {
        totalDistributed: mockStats.totalDistributed,
        totalUsers: mockStats.totalUsers,
        investmentsLast48h: mockStats.investmentsLast48h,
        bestMultiplier: mockStats.bestMultiplier,
        activeBets: mockStats.activeBets,
      };
    }

    const investments = await ctx.db.query("investments").collect();
    const investors = await ctx.db.query("investors").collect();
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;

    const completed = investments.filter((bet) => bet.status !== "pending");
    const totalDistributed = completed.reduce(
      (sum, bet) => sum + (bet.valueAfter48h ?? 0),
      0,
    );
    const investmentsLast48h = investments.filter(
      (bet) => bet.timestamp >= fortyEightHoursAgo,
    ).length;
    const bestMultiplier = completed.reduce(
      (max, bet) => Math.max(max, bet.multiplier ?? 0),
      0,
    );
    const activeBets = investments.filter((bet) => bet.status === "pending").length;

    return {
      totalDistributed,
      totalUsers: investors.length,
      investmentsLast48h,
      bestMultiplier: bestMultiplier > 0 ? bestMultiplier : 1,
      activeBets,
    };
  },
});

export const getSponsor = query({
  args: {},
  returns: v.union(sponsorValidator, v.null()),
  handler: async (ctx) => {
    const sponsor = await ctx.db
      .query("sponsors")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();

    if (!sponsor) return null;

    return {
      name: sponsor.name,
      logo: sponsor.logo,
      prizePool: sponsor.prizePool,
      endDate: new Date(sponsor.endDate).toISOString(),
    };
  },
});
