import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Navbar from '../components/Navbar';
import RankBadge from '../components/RankBadge';
import LeaderboardProfitHover from '../components/LeaderboardProfitHover';
import type { LeaderboardPeriod } from '../types';
import { formatKwai } from '../lib/format';

const podiumColorsByRank: Record<number, string> = {
  1: 'from-amber-300 via-yellow-400 to-amber-600',
  2: 'from-slate-200 via-gray-300 to-slate-400',
  3: 'from-orange-500 via-amber-700 to-orange-800',
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('day');
  const [search, setSearch] = useState('');

  const tabs: { key: LeaderboardPeriod; label: string }[] = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'all', label: 'All-time' },
  ];

  const leaderboardArgs = useMemo(() => ({ period }), [period]);
  const leaderboardData = useQuery(api.leaderboard.list, leaderboardArgs);
  const allEntries = useMemo(() => leaderboardData ?? [], [leaderboardData]);

  const rankByInvestorId = useMemo(() => {
    const ranks = new Map<string, number>();
    allEntries.forEach((entry, index) => {
      ranks.set(entry.investor.id, index + 1);
    });
    return ranks;
  }, [allEntries]);

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allEntries;

    return allEntries.filter((entry) =>
      entry.investor.pseudo.toLowerCase().includes(query),
    );
  }, [allEntries, search]);

  const showPodium = !search.trim();
  const top3 = allEntries.slice(0, 3);
  const listEntries = showPodium ? allEntries.slice(3) : filteredEntries;

  const podiumOrder = [1, 0, 2];
  const podiumHeights = ['h-20', 'h-28', 'h-16'];

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-white">
              Leaderboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              The top bettors on the KWAÏ platform
            </p>
          </div>

          <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:w-56 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="text"
                inputMode="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search a bettor..."
                className="search-input w-full rounded-xl bg-[#131316] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none border-0 ring-0 shadow-none focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0a0a0c] shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setPeriod(tab.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    period === tab.key
                      ? 'bg-indigo-500/15 text-indigo-300'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {showPodium && (
          <div className="flex items-end justify-center gap-2 sm:gap-4 pt-4 overflow-visible">
            {podiumOrder.map((dataIdx, visualIdx) => {
              const entry = top3[dataIdx];
              if (!entry) return null;
              const rank = dataIdx + 1;
              const profitClass = entry.totalProfit > 0 ? 'text-emerald-400' : entry.totalProfit < 0 ? 'text-rose-400' : 'text-gray-400';

              return (
                <div
                  key={entry.investor.id}
                  className="flex flex-col items-center flex-1 max-w-[180px]"
                >
                  <Link
                    to={`/investor/${entry.investor.id}`}
                    className="flex flex-col items-center group w-full"
                  >
                    <div className="relative mb-3">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${entry.investor.avatarColor} flex items-center justify-center text-white text-lg font-bold shadow-xl group-hover:scale-105 transition-transform duration-300`}>
                        {entry.investor.tag}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                        <RankBadge rank={rank} size="md" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors mb-1 text-center">
                      {entry.investor.pseudo}
                    </p>
                  </Link>

                  <LeaderboardProfitHover
                    investorId={entry.investor.id}
                    winningBets={entry.winningBets}
                    losingBets={entry.losingBets}
                    maxPercentage={entry.maxPercentage}
                    className={`text-sm font-display font-bold tabular-nums mb-3 ${profitClass}`}
                  >
                    {entry.totalProfit > 0 ? '+' : ''}{formatKwai(entry.totalProfit).replace(' KWAÏ', '')}
                  </LeaderboardProfitHover>

                  <Link
                    to={`/investor/${entry.investor.id}`}
                    className={`w-full ${podiumHeights[visualIdx]} rounded-t-xl bg-gradient-to-b ${podiumColorsByRank[rank]} opacity-70 flex items-center justify-center hover:opacity-80 transition-opacity shadow-lg`}
                  >
                    <span className="font-display font-bold text-3xl sm:text-4xl text-white tabular-nums drop-shadow-md">
                      {rank}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div className="card overflow-visible">
          <div>
            {leaderboardData === undefined ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-16 border-b border-white/5 animate-pulse" />
              ))
            ) : listEntries.length > 0 ? (
              listEntries.map((entry) => {
                const rank = rankByInvestorId.get(entry.investor.id) ?? 0;
                const profitClass = entry.totalProfit > 0 ? 'text-emerald-400' : entry.totalProfit < 0 ? 'text-rose-400' : 'text-gray-400';

                return (
                  <div
                    key={entry.investor.id}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
                  >
                    <Link
                      to={`/investor/${entry.investor.id}`}
                      className="flex items-center gap-4 flex-1 min-w-0"
                    >
                      <div className="w-8 flex-shrink-0 flex items-center justify-center">
                        <RankBadge rank={rank} size="md" />
                      </div>
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${entry.investor.avatarColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                        {entry.investor.tag}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                          {entry.investor.pseudo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.winningBets} winning bet{entry.winningBets !== 1 ? 's' : ''} out of {entry.totalBets}
                        </p>
                      </div>
                    </Link>

                    <LeaderboardProfitHover
                      investorId={entry.investor.id}
                      winningBets={entry.winningBets}
                      losingBets={entry.losingBets}
                      maxPercentage={entry.maxPercentage}
                      className={`text-base font-display font-bold tabular-nums ${profitClass}`}
                    >
                      {entry.totalProfit > 0 ? '+' : ''}{formatKwai(entry.totalProfit).replace(' KWAÏ', '')} KWAÏ
                    </LeaderboardProfitHover>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                No bettor found for &quot;{search}&quot;
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
