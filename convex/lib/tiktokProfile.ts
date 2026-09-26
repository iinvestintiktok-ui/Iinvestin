export interface TiktokProfileResult {
  uniqueId: string;
  nickname: string;
  avatarUrl: string;
  followerCount: number;
  bio: string;
  profileUrl: string;
}

const TIKTOK_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const VARIANT_SUFFIXES = ["", "1", "2", "3", "0", "_", "official", "real", "tv", "tt", "x"];
const VARIANT_PREFIXES = ["the", "real", "its"];

export function parseTiktokQuery(input: string): string {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/tiktok\.com\/@([a-zA-Z0-9._]+)/i);
  if (urlMatch) return urlMatch[1].toLowerCase();

  return trimmed.replace(/^@/, "").toLowerCase();
}

export function isValidTiktokHandle(handle: string): boolean {
  return /^[a-zA-Z0-9._]{2,24}$/.test(handle);
}

function getSearchStems(query: string): string[] {
  const stems = new Set<string>([query]);
  const withoutTrailingDigits = query.replace(/\d+$/g, "");
  if (withoutTrailingDigits.length >= 2) {
    stems.add(withoutTrailingDigits);
  }
  return Array.from(stems);
}

function buildSearchCandidates(stem: string): string[] {
  const base = stem.toLowerCase();
  const candidates = new Set<string>([base]);

  for (const suffix of VARIANT_SUFFIXES) {
    if (suffix) candidates.add(`${base}${suffix}`);
  }

  for (const prefix of VARIANT_PREFIXES) {
    candidates.add(`${prefix}${base}`);
  }

  return Array.from(candidates).filter((handle) => isValidTiktokHandle(handle));
}

function isRelevantMatch(handle: string, query: string, stems: string[]): boolean {
  const normalizedHandle = handle.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (
    normalizedHandle === normalizedQuery ||
    normalizedHandle.startsWith(normalizedQuery) ||
    normalizedQuery.startsWith(normalizedHandle)
  ) {
    return true;
  }

  if (normalizedHandle.includes(normalizedQuery) || normalizedQuery.includes(normalizedHandle)) {
    return true;
  }

  return stems.some((stem) => {
    if (stem.length < 2) return false;
    return (
      normalizedHandle.startsWith(stem) ||
      stem.startsWith(normalizedHandle) ||
      normalizedHandle.includes(stem)
    );
  });
}

function sortProfiles(profiles: TiktokProfileResult[], query: string): TiktokProfileResult[] {
  const normalizedQuery = query.toLowerCase();

  return [...profiles].sort((left, right) => {
    const leftId = left.uniqueId.toLowerCase();
    const rightId = right.uniqueId.toLowerCase();

    if (leftId === normalizedQuery && rightId !== normalizedQuery) return -1;
    if (rightId === normalizedQuery && leftId !== normalizedQuery) return 1;

    const leftStarts = leftId.startsWith(normalizedQuery);
    const rightStarts = rightId.startsWith(normalizedQuery);
    if (leftStarts && !rightStarts) return -1;
    if (rightStarts && !leftStarts) return 1;

    if (leftId.includes(normalizedQuery) && !rightId.includes(normalizedQuery)) return -1;
    if (rightId.includes(normalizedQuery) && !leftId.includes(normalizedQuery)) return 1;

    return right.followerCount - left.followerCount;
  });
}

async function fetchTiktokProfileViaOembed(handle: string): Promise<TiktokProfileResult | null> {
  const normalizedHandle = handle.toLowerCase();
  const response = await fetch(
    `https://www.tiktok.com/oembed?url=${encodeURIComponent(`https://www.tiktok.com/@${normalizedHandle}`)}`,
    {
      headers: {
        "User-Agent": TIKTOK_USER_AGENT,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    author_name?: string;
    author_url?: string;
  };

  const uniqueIdMatch = data.author_url?.match(/@([a-zA-Z0-9._]+)/i);
  if (!uniqueIdMatch) {
    return null;
  }

  const uniqueId = uniqueIdMatch[1].toLowerCase();
  return {
    uniqueId,
    nickname: data.author_name ?? uniqueId,
    avatarUrl: "",
    followerCount: 0,
    bio: "",
    profileUrl: `https://www.tiktok.com/@${uniqueId}`,
  };
}

export async function fetchTiktokProfile(handle: string): Promise<TiktokProfileResult | null> {
  const normalizedHandle = handle.toLowerCase();

  try {
    const response = await fetch(`https://www.tiktok.com/@${normalizedHandle}`, {
      headers: {
        "User-Agent": TIKTOK_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.tiktok.com/",
      },
    });

    if (response.ok) {
      const html = await response.text();
      const match = html.match(
        /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/,
      );

      if (match) {
        const payload = JSON.parse(match[1]) as {
          __DEFAULT_SCOPE__?: {
            "webapp.user-detail"?: {
              userInfo?: {
                user?: {
                  uniqueId?: string;
                  nickname?: string;
                  avatarMedium?: string;
                  signature?: string;
                };
                stats?: {
                  followerCount?: number;
                };
              };
            };
          };
        };

        const userInfo = payload.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo;
        const user = userInfo?.user;
        const stats = userInfo?.stats;

        if (user?.uniqueId) {
          return {
            uniqueId: user.uniqueId.toLowerCase(),
            nickname: user.nickname ?? user.uniqueId,
            avatarUrl: user.avatarMedium ?? "",
            followerCount: stats?.followerCount ?? 0,
            bio: user.signature ?? "",
            profileUrl: `https://www.tiktok.com/@${user.uniqueId}`,
          };
        }
      }
    }
  } catch {
    // Fall through to oEmbed lookup.
  }

  return await fetchTiktokProfileViaOembed(normalizedHandle);
}

async function fetchProfilesInBatches(handles: string[], batchSize = 4): Promise<TiktokProfileResult[]> {
  const profiles: TiktokProfileResult[] = [];

  for (let index = 0; index < handles.length; index += batchSize) {
    const batch = handles.slice(index, index + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (handle) => {
        try {
          return await fetchTiktokProfile(handle);
        } catch {
          return null;
        }
      }),
    );

    for (const profile of batchResults) {
      if (profile) profiles.push(profile);
    }
  }

  return profiles;
}

export async function searchTiktokProfiles(query: string): Promise<TiktokProfileResult[]> {
  const normalizedQuery = parseTiktokQuery(query);
  if (!isValidTiktokHandle(normalizedQuery)) {
    return [];
  }

  const stems = getSearchStems(normalizedQuery);
  const candidateSet = new Set<string>([normalizedQuery]);

  for (const stem of stems) {
    for (const candidate of buildSearchCandidates(stem)) {
      candidateSet.add(candidate);
    }
  }

  const candidates = Array.from(candidateSet).slice(0, 16);
  const otherCandidates = candidates.filter((handle) => handle !== normalizedQuery);

  const exactProfile = await fetchTiktokProfile(normalizedQuery);
  const fetchedProfiles = [
    ...(exactProfile ? [exactProfile] : []),
    ...(await fetchProfilesInBatches(otherCandidates, 4)),
  ];

  const uniqueProfiles = new Map<string, TiktokProfileResult>();
  for (const profile of fetchedProfiles) {
    uniqueProfiles.set(profile.uniqueId.toLowerCase(), profile);
  }

  const filtered = Array.from(uniqueProfiles.values()).filter((profile) =>
    isRelevantMatch(profile.uniqueId, normalizedQuery, stems),
  );

  return sortProfiles(filtered, normalizedQuery).slice(0, 8);
}
