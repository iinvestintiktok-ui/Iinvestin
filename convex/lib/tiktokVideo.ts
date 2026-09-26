export interface ParsedTiktokVideoUrl {
  videoKey: string;
  tiktokUrl: string;
  creatorHandle: string;
  videoId: string;
}

export interface TiktokVideoStats {
  videoKey: string;
  tiktokUrl: string;
  creatorHandle: string;
  videoId: string;
  playCount: number;
  likeCount: number;
  followerCount: number;
  creatorNickname: string;
  creatorAvatar: string;
  title: string;
  description: string;
  thumbnail: string;
}

const TIKTOK_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export const VIEW_CHECK_INTERVAL_MS = EIGHT_HOURS_MS;
export const INVESTMENT_WINDOW_MS = FORTY_EIGHT_HOURS_MS;
export const VIEW_POLL_BATCH_SIZE = 20;
export const VIEW_POLL_DELAY_MS = 750;

export function parseTiktokVideoUrl(input: string): ParsedTiktokVideoUrl | null {
  const trimmed = input.trim().split("?")[0]?.split("#")[0] ?? "";

  const standardMatch = trimmed.match(
    /tiktok\.com\/@([a-zA-Z0-9._]+)\/video\/(\d+)/i,
  );
  if (standardMatch) {
    const creatorHandle = standardMatch[1].toLowerCase();
    const videoId = standardMatch[2];
    const tiktokUrl = `https://www.tiktok.com/@${creatorHandle}/video/${videoId}`;
    return {
      videoKey: `@${creatorHandle}/video/${videoId}`,
      tiktokUrl,
      creatorHandle,
      videoId,
    };
  }

  return null;
}

function extractPlayCountFromHtml(html: string): number | null {
  const playCountPatterns = [
    /"playCount":(\d+)/,
    /"play_count":(\d+)/,
    /"viewCount":(\d+)/,
  ];

  for (const pattern of playCountPatterns) {
    const match = html.match(pattern);
    if (match) {
      const value = Number.parseInt(match[1], 10);
      if (Number.isFinite(value) && value >= 0) {
        return value;
      }
    }
  }

  return null;
}

function extractLikeCountFromHtml(html: string): number | null {
  const likePatterns = [
    /"diggCount":(\d+)/,
    /"likeCount":(\d+)/,
  ];

  for (const pattern of likePatterns) {
    const match = html.match(pattern);
    if (match) {
      const value = Number.parseInt(match[1], 10);
      if (Number.isFinite(value) && value >= 0) {
        return value;
      }
    }
  }

  return null;
}

function extractFollowerCountFromHtml(html: string): number | null {
  const followerPatterns = [
    /"followerCount":(\d+)/,
    /"follower_count":(\d+)/,
  ];

  for (const pattern of followerPatterns) {
    const match = html.match(pattern);
    if (match) {
      const value = Number.parseInt(match[1], 10);
      if (Number.isFinite(value) && value >= 0) {
        return value;
      }
    }
  }

  return null;
}

function parseMetricValue(value: number | string | undefined): number {
  if (value === undefined) {
    return 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }

  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function normalizeMetricCount(
  value: number,
  html: string,
  field: "playCount" | "diggCount",
  statsV2Value?: string,
): number {
  const fromStatsV2 = parseMetricValue(statsV2Value);
  if (fromStatsV2 > 0) {
    return fromStatsV2;
  }

  if (value >= 0) {
    return value;
  }

  const quotedPattern =
    field === "playCount" ? /"playCount":"(\d+)"/ : /"diggCount":"(\d+)"/;
  const quotedMatch = html.match(quotedPattern);
  if (quotedMatch) {
    const parsed = Number.parseInt(quotedMatch[1], 10);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  const pattern = field === "playCount" ? /"playCount":(\d+)/ : /"diggCount":(\d+)/;
  const match = html.match(pattern);
  if (!match) {
    return 0;
  }

  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function extractVideoFromPayload(payload: unknown): {
  playCount: number;
  likeCount: number;
  followerCount: number;
  title: string;
  description: string;
  thumbnail: string;
  creatorHandle: string;
  creatorNickname: string;
  creatorAvatar: string;
  videoId: string;
} | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const scope = (payload as {
    __DEFAULT_SCOPE__?: Record<string, unknown>;
  }).__DEFAULT_SCOPE__;

  if (!scope) {
    return null;
  }

  const videoDetail = scope["webapp.video-detail"] as {
    itemInfo?: {
      itemStruct?: {
        id?: string;
        desc?: string;
        author?: {
          uniqueId?: string;
          nickname?: string;
          avatarMedium?: string;
        };
        authorStats?: {
          followerCount?: number;
        };
        video?: {
          cover?: string;
        };
        stats?: {
          playCount?: number;
          diggCount?: number;
        };
        statsV2?: {
          playCount?: string;
          diggCount?: string;
        };
        authorStatsV2?: {
          followerCount?: string;
        };
      };
    };
  } | undefined;

  const item = videoDetail?.itemInfo?.itemStruct;
  const playCount =
    parseMetricValue(item?.statsV2?.playCount) ||
    parseMetricValue(item?.stats?.playCount);
  const likeCount =
    parseMetricValue(item?.statsV2?.diggCount) ||
    parseMetricValue(item?.stats?.diggCount);

  if (!item?.id || (playCount === 0 && likeCount === 0)) {
    return null;
  }

  const creatorHandle = item.author?.uniqueId?.toLowerCase() ?? "";
  const followerCount =
    parseMetricValue(item.authorStatsV2?.followerCount) ||
    parseMetricValue(item.authorStats?.followerCount);

  return {
    playCount,
    likeCount,
    followerCount,
    title: item.desc ?? "",
    description: item.desc ?? "",
    thumbnail: item.video?.cover ?? "",
    creatorHandle,
    creatorNickname: item.author?.nickname ?? creatorHandle,
    creatorAvatar: item.author?.avatarMedium ?? "",
    videoId: item.id,
  };
}

export async function fetchTiktokVideoStats(
  inputUrl: string,
): Promise<TiktokVideoStats | null> {
  const parsed = parseTiktokVideoUrl(inputUrl);
  if (!parsed) {
    return null;
  }

  try {
    const response = await fetch(parsed.tiktokUrl, {
      headers: {
        "User-Agent": TIKTOK_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.tiktok.com/",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const hydrationMatch = html.match(
      /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/,
    );

    if (hydrationMatch) {
      const rawPayload = hydrationMatch[1];
      const payload = JSON.parse(rawPayload) as unknown;
      const video = extractVideoFromPayload(payload);
      if (video) {
        const creatorHandle = video.creatorHandle || parsed.creatorHandle;
        const videoId = video.videoId || parsed.videoId;
        const tiktokUrl = `https://www.tiktok.com/@${creatorHandle}/video/${videoId}`;
        return {
          videoKey: `@${creatorHandle}/video/${videoId}`,
          tiktokUrl,
          creatorHandle,
          videoId,
          playCount: normalizeMetricCount(video.playCount, rawPayload, "playCount"),
          likeCount: normalizeMetricCount(video.likeCount, rawPayload, "diggCount"),
          followerCount: video.followerCount,
          creatorNickname: video.creatorNickname,
          creatorAvatar: video.creatorAvatar,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
        };
      }
    }

    const playCount = extractPlayCountFromHtml(html);
    const likeCount = extractLikeCountFromHtml(html);
    const followerCount = extractFollowerCountFromHtml(html);
    if (playCount !== null) {
      return {
        videoKey: parsed.videoKey,
        tiktokUrl: parsed.tiktokUrl,
        creatorHandle: parsed.creatorHandle,
        videoId: parsed.videoId,
        playCount,
        likeCount: likeCount ?? 0,
        followerCount: followerCount ?? 0,
        creatorNickname: parsed.creatorHandle,
        creatorAvatar: "",
        title: "",
        description: "",
        thumbnail: "",
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
