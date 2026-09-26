"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { tiktokProfileValidator } from "./lib/validators";
import { searchTiktokProfiles } from "./lib/tiktokProfile";

export const lookupProfiles = action({
  args: { query: v.string() },
  returns: v.array(tiktokProfileValidator),
  handler: async (_ctx, args) => {
    return await searchTiktokProfiles(args.query);
  },
});
