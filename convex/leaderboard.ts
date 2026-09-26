import { query } from "./_generated/server";
import { v } from "convex/values";
import { leaderboardEntryValidator } from "./lib/validators";
import { buildLeaderboard } from "./lib/leaderboard";

export const list = query({
  args: {
    period: v.union(v.literal("day"), v.literal("week"), v.literal("all")),
    // Legacy clients may still send `now`; ignored — time is computed server-side.
    now: v.optional(v.number()),
  },
  returns: v.array(leaderboardEntryValidator),
  handler: async (ctx, args) => {
    const investors = await ctx.db.query("investors").collect();
    const investments = await ctx.db.query("investments").collect();

    return buildLeaderboard(investors, investments, args.period, Date.now());
  },
});
