import { useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Navbar from '../components/Navbar';
import InvestmentCard from '../components/InvestmentCard';
import { InvestmentListSkeleton, InvestorProfileSkeleton } from '../components/ProfilePageSkeleton';
import { formatJoinedDate, formatKwai } from '../lib/format';
import type { InvestmentWithRelations } from '../types';

type BetFilter = 'winnings' | 'losses' | 'best';

function getActiveFilter(searchParams: URLSearchParams): BetFilter | null {
  if (searchParams.has('winnings')) return 'winnings';
  if (searchParams.has('losses')) return 'losses';
  if (searchParams.has('best')) return 'best';
  return null;
}

function filterInvestments(bets: InvestmentWithRelations[], filter: BetFilter | null): InvestmentWithRelations[] {
  if (!filter) return bets;

  if (filter === 'winnings') {
    return bets.filter((bet) => bet.status === 'gain');
  }

  if (filter === 'losses') {
    return bets.filter((bet) => bet.status === 'loss');
  }

  const maxPercentage = bets.reduce((max, bet) => Math.max(max, bet.percentage ?? -Infinity), -Infinity);
  if (!Number.isFinite(maxPercentage)) return [];

  return bets.filter((bet) => bet.percentage === maxPercentage);
}

const filterLabels: Record<BetFilter, string> = {
  winnings: 'Winning bets',
  losses: 'Losing bets',
  best: 'Best bet',
};

export default function InvestorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const investorArgs = useMemo(() => (id ? { slug: id } : 'skip'), [id]);
  const investorBetsArgs = useMemo(() => (id ? { investorSlug: id } : 'skip'), [id]);
  const investor = useQuery(api.investors.getBySlug, investorArgs);
  const stats = useQuery(api.investors.getStats, investorArgs);
  const investorBets = useQuery(api.investments.listByInvestor, investorBetsArgs);
  const activeFilter = getActiveFilter(searchParams);
  const historyTitle = activeFilter ? filterLabels[activeFilter] : 'Investment history';

  if (investor === undefined || stats === undefined) {
    return <InvestorProfileSkeleton />;
  }

  if (!investor || !stats) {
    return (
      <div className="min-h-screen bg-[#0a0a0c]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-400 text-lg">Investor not found</p>
          <Link to="/" className="link-brand mt-4 inline-block">← Back to home</Link>
        </div>
      </div>
    );
  }

  const filteredBets = investorBets === undefined
    ? []
    : filterInvestments(investorBets, activeFilter);

  const statCards = [
    { label: 'Current rank', value: `#${stats.rank}`, color: 'text-amber-400' },
    {
      label: 'Total profit',
      value: `${stats.totalProfit > 0 ? '+' : ''}${formatKwai(stats.totalProfit)}`,
      color: stats.totalProfit > 0 ? 'text-emerald-400' : 'text-rose-400',
    },
    { label: 'Win rate', value: `${stats.winRate}%`, color: 'text-indigo-400' },
    { label: 'Best hit', value: `+${Math.round((stats.bestMultiplier - 1) * 100)}%`, color: 'text-emerald-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <Link to="/leaderboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to leaderboard
        </Link>

        <div className="card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {investor.avatarUrl ? (
              <img
                src={investor.avatarUrl}
                alt={investor.pseudo}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-xl flex-shrink-0"
              />
            ) : (
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${investor.avatarColor} flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-xl flex-shrink-0`}>
                {investor.tag}
              </div>
            )}
            <div className="flex-1">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
                {investor.pseudo}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Joined on {formatJoinedDate(investor.joinedAt)}
              </p>
              <p className="text-gray-500 text-sm mt-0.5">
                {stats.totalBets} total bet{stats.totalBets !== 1 ? 's' : ''} · {stats.winningBets} won
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            {statCards.map((stat) => (
              <div key={stat.label} className="p-5 rounded-xl bg-[#0a0a0c]">
                <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
                <p className={`font-display font-bold text-2xl sm:text-3xl tabular-nums tracking-tight leading-none ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-display font-bold text-xl text-white">
              {historyTitle}
            </h2>
            {activeFilter && (
              <Link
                to={`/investor/${investor.id}`}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Show all
              </Link>
            )}
          </div>
          {investorBets === undefined ? (
            <InvestmentListSkeleton />
          ) : (
            <div className="space-y-3">
              {filteredBets.length > 0 ? (
                filteredBets.map((inv) => (
                  <InvestmentCard key={inv.id} investment={inv} hideInvestor />
                ))
              ) : (
                <div className="card p-6 text-center text-sm text-gray-500">
                  No bets match this filter.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
