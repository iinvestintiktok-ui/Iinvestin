import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Navbar from '../components/Navbar';
import InvestmentCard from '../components/InvestmentCard';
import { CreatorProfileSkeleton, InvestmentListSkeleton } from '../components/ProfilePageSkeleton';
import { formatJoinedDate, formatNumber, formatKwai } from '../lib/format';

export default function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const creatorArgs = useMemo(() => (id ? { slug: id } : 'skip'), [id]);
  const creatorBetsArgs = useMemo(() => (id ? { creatorSlug: id } : 'skip'), [id]);
  const creator = useQuery(api.creators.getBySlug, creatorArgs);
  const stats = useQuery(api.creators.getStats, creatorArgs);
  const creatorBets = useQuery(api.investments.listByCreator, creatorBetsArgs);

  if (creator === undefined || stats === undefined) {
    return <CreatorProfileSkeleton />;
  }

  if (!creator || !stats) {
    return (
      <div className="min-h-screen bg-[#0a0a0c]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-400 text-lg">Creator not found</p>
          <Link to="/" className="link-brand mt-4 inline-block">← Back to home</Link>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Videos bet on', value: `${stats.timesBet}`, color: 'text-indigo-400' },
    {
      label: 'Total payout generated',
      value: `${stats.totalGain > 0 ? '+' : ''}${formatKwai(stats.totalGain)}`,
      color: stats.totalGain > 0 ? 'text-emerald-400' : 'text-rose-400',
    },
    { label: 'Best gain', value: `+${Math.round((stats.bestMultiplier - 1) * 100)}%`, color: 'text-amber-400' },
    { label: 'TikTok followers', value: formatNumber(creator.followers), color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="card overflow-hidden">
          <div className="h-28 sm:h-32 bg-gradient-to-r from-[#1a1a2f] via-[#1a1220] to-[#1a1a2f] relative">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.15), transparent 50%), radial-gradient(circle at 80% 50%, rgba(244,63,94,0.15), transparent 50%)'
            }} />
          </div>
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-14">
              <div className="relative">
                <img
                  src={creator.avatar}
                  alt={creator.pseudo}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-xl"
                />
              </div>
              <div className="flex-1 sm:pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
                    {creator.pseudo}
                  </h1>
                  <a
                    href={creator.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View on TikTok
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-gray-400 text-sm mt-1">{creator.bio}</p>
                <p className="text-gray-500 text-sm mt-1">
                  Joined on {formatJoinedDate(creator.joinedAt)}
                </p>
                <p className="text-sm text-gray-300 font-medium mt-1">
                  {formatNumber(creator.followers)} followers
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

            {stats.mostProfitableVideo && (
              <div className="mt-4 p-3 rounded-lg bg-[#0a0a0c]">
                <p className="text-xs text-gray-500 mb-1">Most profitable video</p>
                <p className="text-sm text-gray-200 font-medium">{stats.mostProfitableVideo}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display font-bold text-xl text-white mb-4">
            Bet videos
          </h2>
          {creatorBets === undefined ? (
            <InvestmentListSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {creatorBets.length > 0 ? (
                creatorBets.map((inv) => (
                  <InvestmentCard key={inv.id} investment={inv} />
                ))
              ) : (
                <div className="card p-6 text-center text-sm text-gray-500">
                  No bets on this creator yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
