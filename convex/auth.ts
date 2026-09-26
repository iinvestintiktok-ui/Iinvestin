import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { authUserValidator } from "./lib/validators";
import {
  buildInvestorTag,
  createSessionToken,
  createUniqueInvestorSlug,
  getSessionExpiry,
  getUserByToken,
  mapAuthUser,
  normalizeEmail,
  normalizeTiktokHandle,
  pickAvatarColor,
  validateAvatarUrl,
} from "./lib/authHelpers";
import { hashPassword, verifyPassword } from "./lib/passwordWeb";

export const checkEmail = query({
  args: { email: v.string() },
  returns: v.object({ exists: v.boolean() }),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    if (!email.includes("@")) {
      return { exists: false };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    return { exists: user !== null };
  },
});

export const signUp = action({
  args: {
    email: v.string(),
    password: v.string(),
    tiktokHandle: v.string(),
    nickname: v.string(),
  },
  returns: v.object({ token: v.string() }),
  handler: async (ctx, args): Promise<{ token: string }> => {
    const email = normalizeEmail(args.email);
    const tiktokHandle = normalizeTiktokHandle(args.tiktokHandle);
    const nickname = args.nickname.trim();

    if (!email.includes("@")) {
      throw new Error("Invalid email address");
    }
    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    if (!tiktokHandle) {
      throw new Error("TikTok handle is required");
    }
    if (nickname.length < 2) {
      throw new Error("Nickname must be at least 2 characters");
    }

    const passwordHash = await hashPassword(args.password);

    return await ctx.runMutation(internal.auth.createUserAndSession, {
      email,
      passwordHash,
      tiktokHandle,
      nickname,
    });
  },
});

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  returns: v.object({ token: v.string() }),
  handler: async (ctx, args): Promise<{ token: string }> => {
    const email = normalizeEmail(args.email);
    const user = await ctx.runQuery(internal.auth.getUserByEmail, { email });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await verifyPassword(args.password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    const token = await ctx.runMutation(internal.auth.createSessionForUser, {
      userId: user._id,
    });

    return { token };
  },
});

export const getCurrentUser = query({
  args: { token: v.union(v.string(), v.null()) },
  returns: v.union(authUserValidator, v.null()),
  handler: async (ctx, args) => {
    if (!args.token) return null;

    const sessionData = await getUserByToken(ctx, args.token);
    if (!sessionData) return null;

    return mapAuthUser(sessionData.user);
  },
});

export const logout = mutation({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const sessionData = await getUserByToken(ctx, args.token);
    if (sessionData) {
      await ctx.db.delete("sessions", sessionData.sessionId);
    }
    return null;
  },
});

export const completeOnboarding = mutation({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const sessionData = await getUserByToken(ctx, args.token);
    if (!sessionData) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch("users", sessionData.user._id, {
      onboardingCompleted: true,
    });

    return null;
  },
});

export const updateProfile = mutation({
  args: {
    token: v.string(),
    nickname: v.optional(v.string()),
    tiktokHandle: v.optional(v.string()),
    avatarUrl: v.optional(v.union(v.string(), v.null())),
  },
  returns: authUserValidator,
  handler: async (ctx, args) => {
    const sessionData = await getUserByToken(ctx, args.token);
    if (!sessionData) {
      throw new Error("Not authenticated");
    }

    const user = sessionData.user;
    const userUpdates: {
      nickname?: string;
      tiktokHandle?: string;
      avatarUrl?: string;
    } = {};
    const investorUpdates: {
      pseudo?: string;
      tag?: string;
      avatarUrl?: string;
    } = {};

    if (args.nickname !== undefined) {
      const nickname = args.nickname.trim();
      if (nickname.length < 2) {
        throw new Error("Nickname must be at least 2 characters");
      }
      if (nickname.length > 32) {
        throw new Error("Nickname must be 32 characters or less");
      }
      userUpdates.nickname = nickname;
      investorUpdates.pseudo = nickname;
      investorUpdates.tag = buildInvestorTag(nickname);
    }

    if (args.tiktokHandle !== undefined) {
      const tiktokHandle = normalizeTiktokHandle(args.tiktokHandle);
      if (!tiktokHandle) {
        throw new Error("TikTok handle is required");
      }
      userUpdates.tiktokHandle = tiktokHandle;
    }

    if (args.avatarUrl !== undefined) {
      const avatarUrl = validateAvatarUrl(args.avatarUrl);
      userUpdates.avatarUrl = avatarUrl;
      investorUpdates.avatarUrl = avatarUrl;
    }

    if (Object.keys(userUpdates).length > 0) {
      await ctx.db.patch("users", user._id, userUpdates);
    }

    if (Object.keys(investorUpdates).length > 0) {
      await ctx.db.patch("investors", user.investorId, investorUpdates);
    }

    const updatedUser = await ctx.db.get("users", user._id);
    if (!updatedUser) {
      throw new Error("User not found");
    }

    return mapAuthUser(updatedUser);
  },
});

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      passwordHash: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) return null;

    return {
      _id: user._id,
      passwordHash: user.passwordHash,
    };
  },
});

export const createUserAndSession = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    tiktokHandle: v.string(),
    nickname: v.string(),
  },
  returns: v.object({ token: v.string() }),
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    const investorSlug = await createUniqueInvestorSlug(ctx, args.nickname);
    const joinedAt = Date.now();

    const investorId = await ctx.db.insert("investors", {
      slug: investorSlug,
      pseudo: args.nickname,
      tag: buildInvestorTag(args.nickname),
      avatarColor: pickAvatarColor(args.email),
      joinedAt,
      isMock: false,
    });

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: args.passwordHash,
      tiktokHandle: args.tiktokHandle,
      nickname: args.nickname,
      investorId,
      investorSlug,
      onboardingCompleted: false,
      joinedAt,
    });

    const token = createSessionToken();
    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt: getSessionExpiry(),
    });

    const platformStats = await ctx.db.query("platformStats").first();
    if (platformStats) {
      await ctx.db.patch("platformStats", platformStats._id, {
        totalUsers: platformStats.totalUsers + 1,
      });
    }

    return { token };
  },
});

export const createSessionForUser = internalMutation({
  args: { userId: v.id("users") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const token = createSessionToken();
    await ctx.db.insert("sessions", {
      userId: args.userId,
      token,
      expiresAt: getSessionExpiry(),
    });
    return token;
  },
});
