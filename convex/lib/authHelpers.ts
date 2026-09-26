import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

const AVATAR_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-blue-500 to-cyan-600",
  "from-violet-500 to-fuchsia-600",
];

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeTiktokHandle(handle: string): string {
  const trimmed = handle.trim();
  return trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
}

export function buildInvestorTag(nickname: string): string {
  const letters = nickname.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (letters.length >= 2) return letters.slice(0, 2);
  if (letters.length === 1) return `${letters}X`;
  return "KW";
}

export function slugifyNickname(nickname: string): string {
  const slug = nickname
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "investor";
}

export async function createUniqueInvestorSlug(
  ctx: MutationCtx,
  nickname: string,
): Promise<string> {
  const baseSlug = slugifyNickname(nickname);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const existing = await ctx.db
      .query("investors")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .unique();

    if (!existing) return candidate;
  }

  throw new Error("Unable to generate a unique investor profile");
}

export function pickAvatarColor(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index) * (index + 1)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
}

export function createSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getSessionExpiry(): number {
  return Date.now() + SESSION_DURATION_MS;
}

export async function getUserByToken(
  ctx: QueryCtx | MutationCtx,
  token: string,
): Promise<{ user: Doc<"users">; sessionId: Id<"sessions"> } | null> {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    return null;
  }

  const user = await ctx.db.get("users", session.userId);
  if (!user) return null;

  return { user, sessionId: session._id };
}

export function mapAuthUser(user: Doc<"users">) {
  return {
    id: user._id,
    email: user.email,
    nickname: user.nickname,
    tiktokHandle: user.tiktokHandle,
    investorSlug: user.investorSlug,
    avatarUrl: user.avatarUrl ?? null,
    onboardingCompleted: user.onboardingCompleted,
  };
}

const MAX_AVATAR_BYTES = 500_000;

export function validateAvatarUrl(avatarUrl: string | null | undefined): string | undefined {
  if (avatarUrl === null || avatarUrl === undefined || avatarUrl === "") {
    return undefined;
  }

  if (!avatarUrl.startsWith("data:image/")) {
    throw new Error("Profile image must be a valid image file");
  }

  if (avatarUrl.length > MAX_AVATAR_BYTES) {
    throw new Error("Profile image must be smaller than 500 KB");
  }

  return avatarUrl;
}
