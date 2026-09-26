import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { LeaderboardPeriod } from '../types';
import { formatKwai } from '../lib/format';
import RankBadge from './RankBadge';
import LeaderboardProfitHover from './LeaderboardProfitHover';
import SectionHeaderLink from './SectionHeaderLink';

interface Props {
  maxItems?: number;
}

export default function LeaderboardWidget({ maxItems = 10 }: Props) {
  const [period, setPeriod] = useState<LeaderboardPeriod>('day');
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const tabs: { key: LeaderboardPeriod; label: string }[] = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'all', label: 'All-time' },
  ];

  const leaderboardArgs = useMemo(() => ({ period }), [period]);
  const allEntries = useQuery(api.leaderboard.list, leaderboardArgs);
  const entries = (allEntries ?? []).slice(0, maxItems);

  return (
    <div ref={sentinelRef} className="space-y-4" data-tour="leaderboard">
      <SectionHeaderLink
        to="/leaderboard"
        className={`font-display font-bold text-xl transition-all duration-200 ${
          isSticky ? 'opacity-0 h-0 overflow-hidden mb-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        Leaderboard
      </SectionHeaderLink>

      <div className="card overflow-visible">
        {isSticky && (
          <div className="sticky top-16 z-10 bg-[#131316] px-5 py-3">
            <SectionHeaderLink to="/leaderboard" className="font-display font-bold text-base">
              Leaderboard
            </SectionHeaderLink>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0a0a0c] mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key)}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  period === tab.key
                    ? 'bg-indigo-500/15 text-indigo-300'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            {allEntries === undefined ? (
              Array.from({ length: maxItems }).map((_, index) => (
                <div key={index} className="h-14 rounded-lg bg-white/5 animate-pulse" />
              ))
            ) : entries.map((entry, index) => {
              const rank = index + 1;
              const profitClass = entry.totalProfit > 0 ? 'text-emerald-400' : entry.totalProfit < 0 ? 'text-rose-400' : 'text-gray-400';

              return (
                <div
                  key={entry.investor.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <Link
                    to={`/investor/${entry.investor.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-7 flex-shrink-0 flex items-center justify-center">
                      <RankBadge rank={rank} />
                    </div>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${entry.investor.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {entry.investor.tag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 font-medium truncate group-hover:text-white transition-colors">
                        {entry.investor.pseudo}
                      </p>
                      <p className="text-xs text-gray-500">
                        {entry.winningBets} winning bet{entry.winningBets !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </Link>
                  <LeaderboardProfitHover
                    investorId={entry.investor.id}
                    winningBets={entry.winningBets}
                    losingBets={entry.losingBets}
                    maxPercentage={entry.maxPercentage}
                    className={`text-sm font-display font-bold tabular-nums ${profitClass}`}
                  >
                    {entry.totalProfit > 0 ? '+' : ''}{formatKwai(entry.totalProfit).replace(' KWAÏ', '')}
                  </LeaderboardProfitHover>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
