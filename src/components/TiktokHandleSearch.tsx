import { useEffect, useState } from 'react';
import { useAction } from 'convex/react';
import { Check, Loader2 } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { formatNumber } from '../lib/format';

export interface TiktokProfile {
  uniqueId: string;
  nickname: string;
  avatarUrl: string;
  followerCount: number;
  bio: string;
  profileUrl: string;
}

interface Props {
  query: string;
  selected: TiktokProfile | null;
  onQueryChange: (query: string) => void;
  onSelect: (profile: TiktokProfile | null) => void;
  inputClassName: string;
}

export default function TiktokHandleSearch({
  query,
  selected,
  onQueryChange,
  onSelect,
  inputClassName,
}: Props) {
  const lookupProfiles = useAction(api.tiktokActions.lookupProfiles);
  const [results, setResults] = useState<TiktokProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const normalized = query.trim().replace(/^@/, '');
    if (normalized.length < 2) {
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    if (selected && selected.uniqueId.toLowerCase() === normalized.toLowerCase()) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsSearching(true);
      setSearchError(null);

      void lookupProfiles({ query: normalized })
        .then((profiles) => {
          setResults(profiles);
          if (profiles.length === 0) {
            setSearchError('No TikTok account found. Try a slightly different handle.');
            onSelect(null);
          } else {
            setSearchError(null);
          }
        })
        .catch(() => {
          setResults([]);
          setSearchError('Unable to search TikTok right now. Try again.');
          onSelect(null);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [lookupProfiles, onSelect, query, selected]);

  const handleQueryChange = (value: string) => {
    const normalizedValue = value.trim().replace(/^@/, '').toLowerCase();
    onQueryChange(normalizedValue ? `@${normalizedValue}` : value);
    if (selected && normalizedValue !== selected.uniqueId.toLowerCase()) {
      onSelect(null);
    }
  };

  const handleSelect = (profile: TiktokProfile) => {
    onSelect(profile);
    onQueryChange(`@${profile.uniqueId}`);
    setSearchError(null);
    setResults([]);
  };

  const showDropdown = !selected && (isSearching || results.length > 0 || Boolean(searchError));

  return (
    <div>
      <label className="block space-y-2">
        <span className="text-sm text-gray-300">TikTok handle</span>
        <div className="relative z-30">
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="@yourhandle or profile link"
            autoFocus
            className={inputClassName}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 animate-spin" />
          )}

          {showDropdown && (
            <div
              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-xl border border-white/10 bg-[#131316] shadow-2xl shadow-black/80 overflow-hidden"
              style={{ maxHeight: 'min(15rem, 40vh)' }}
            >
              <div className="px-3 py-2 border-b border-white/10 bg-[#16161a]">
                <p className="text-xs text-gray-400">
                  {isSearching ? 'Searching TikTok accounts...' : 'Select your account'}
                </p>
              </div>

              <div className="max-h-52 overflow-y-auto p-2 space-y-1.5">
                {searchError && !isSearching && results.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-rose-300">{searchError}</p>
                ) : (
                  results.map((profile) => (
                    <button
                      key={profile.uniqueId}
                      type="button"
                      onClick={() => handleSelect(profile)}
                      className="w-full text-left rounded-lg border border-transparent px-2.5 py-2.5 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={profile.nickname}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {profile.nickname}
                          </p>
                          <p className="text-xs text-gray-400">@{profile.uniqueId}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatNumber(profile.followerCount)} followers
                          </p>
                        </div>
                      </div>

                      {profile.bio && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-1 pl-[3.25rem]">
                          {profile.bio}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </label>

      {selected && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-2.5">
          {selected.avatarUrl ? (
            <img
              src={selected.avatarUrl}
              alt={selected.nickname}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/10 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{selected.nickname}</p>
            <p className="text-xs text-gray-400">@{selected.uniqueId}</p>
          </div>
          <Check className="w-4 h-4 text-indigo-400 shrink-0" />
        </div>
      )}
    </div>
  );
}
