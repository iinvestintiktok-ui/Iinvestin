import type { Doc } from "../_generated/dataModel";

function mapJoinedAt(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function mapCreator(doc: Doc<"creators">) {
  return {
    id: doc.slug,
    pseudo: doc.pseudo,
    avatar: doc.avatar,
    followers: doc.followers,
    tiktokUrl: doc.tiktokUrl,
    bio: doc.bio,
    joinedAt: mapJoinedAt(doc.joinedAt ?? doc._creationTime),
  };
}

export function mapInvestor(doc: Doc<"investors">) {
  return {
    id: doc.slug,
    pseudo: doc.pseudo,
    tag: doc.tag,
    avatarColor: doc.avatarColor,
    avatarUrl: doc.avatarUrl ?? null,
    joinedAt: mapJoinedAt(doc.joinedAt ?? doc._creationTime),
  };
}

export function mapInvestment(doc: Doc<"investments">) {
  return {
    id: doc.slug,
    investorId: "",
    creatorId: "",
    videoTitle: doc.videoTitle,
    videoDescription: doc.videoDescription,
    thumbnail: doc.thumbnail,
    viewsAtInvestment: doc.viewsAtInvestment,
    followersAtInvestment: doc.followersAtInvestment,
    amountInvested: doc.amountInvested,
    currentViews: doc.currentViews ?? null,
    viewsAfter48h: doc.viewsAfter48h,
    valueAfter48h: doc.valueAfter48h,
    multiplier: doc.multiplier,
    percentage: doc.percentage,
    status: doc.status,
    timestamp: new Date(doc.timestamp).toISOString(),
    tiktokUrl: doc.tiktokUrl,
  };
}
