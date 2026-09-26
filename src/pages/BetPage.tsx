import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { ArrowLeft, Clock, ExternalLink, Eye, Heart } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import Navbar from '../components/Navbar';
import BetPerformanceChart from '../components/BetPerformanceChart';
import BetReadingSlots from '../components/BetReadingSlots';
import { useAuth } from '../context/AuthContext';
import { formatNumber } from '../lib/format';

function formatResolutionDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPlacedDate(timestamp: string | number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Resolving soon';
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h remaining`;
  }
  return `${hours}h ${minutes}m remaining`;
}

function percentageColor(value: number): string {
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-rose-400';
  return 'text-amber-400';
}

export default function BetPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [now, setNow] = useState(() => Date.now());

  const bet = useQuery(api.investments.getBySlug, id ? { slug: id } : 'skip');
  const snapshots = useQuery(
    api.viewTracking.listSnapshotsByInvestmentSlug,
    id ? { investmentSlug: id } : 'skip',
  );

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const percentage = bet?.percentage ?? 0;
  const settleAt = bet?.settleAt ?? null;
  const strokeColor = percentage > 0 ? '#34d399' : percentage < 0 ? '#fb7185' : '#fbbf24';

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {bet === undefined ? (
          <div className="card h-96 animate-pulse bg-[#131316]" />
        ) : bet === null ? (
          <div className="card p-8 text-center text-gray-400">Bet not found.</div>
        ) : (
          <>
            <div className="card overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-5 p-5 sm:p-6">
                <div className="relative w-full sm:w-[120px] flex-shrink-0 aspect-[9/16] rounded-xl overflow-hidden bg-[#1a1a1f]">
                  <img
                    src={bet.thumbnail}
                    alt={bet.videoTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/70" />

                  {bet.creator && (
                    <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={bet.creator.avatar}
                          alt={bet.creator.pseudo}
                          className="w-4 h-4 rounded-full object-cover ring-1 ring-white/40 flex-shrink-0"
                        />
                        <span className="text-white text-[10px] font-semibold truncate drop-shadow-lg">
                          {bet.creator.pseudo.startsWith('@')
                            ? bet.creator.pseudo
                            : `@${bet.creator.pseudo.replace(/^@/, '')}`}
                        </span>
                      </div>
                      <p className="mt-0.5 pl-5 text-[9px] text-white/80 drop-shadow-lg">
                        {formatNumber(bet.creator.followers)} followers
                      </p>
                    </div>
                  )}

                  {bet.status === 'pending' && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-amber-400 text-[10px] font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-3 min-w-0">
                    {bet.investor && (
                      <Link
                        to={`/investor/${bet.investor.id}`}
                        className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        <div
                          className={`w-7 h-7 rounded-full bg-gradient-to-br ${bet.investor.avatarColor} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}
                        >
                          {bet.investor.tag}
                        </div>
                        <span className="text-sm">
                          {user?.investorSlug === bet.investor.id ? (
                            <>
                              <span className="font-bold text-white">Me</span>
                              <span className="text-gray-400 font-normal">
                                {' '}
                                ({bet.investor.pseudo})
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-300 font-medium">{bet.investor.pseudo}</span>
                          )}
                        </span>
                      </Link>
                    )}

                    {bet.investor && (
                      <p className="text-xs text-gray-500">
                        {user?.investorSlug === bet.investor.id ? (
                          <>You placed a bet on this video on {formatPlacedDate(bet.timestamp)}</>
                        ) : (
                          <>
                            {bet.investor.pseudo} placed a bet on this video on{' '}
                            {formatPlacedDate(bet.timestamp)}
                          </>
                        )}
                      </p>
                    )}

                    <h1 className="font-display font-bold text-xl text-white leading-snug">
                      {bet.videoTitle}
                    </h1>

                    <a
                      href={bet.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Open on TikTok
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 self-start">
                    <span className={`font-display font-bold text-3xl tabular-nums ${percentageColor(percentage)}`}>
                      {percentage > 0 ? '+' : ''}{percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display font-bold text-lg text-white">Hourly performance</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Position evolution based on view and like growth every 8 hours.
                  </p>
                </div>
                {settleAt && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Resolution</p>
                    <p className="text-sm text-white font-medium">{formatResolutionDate(settleAt)}</p>
                    {bet.status === 'pending' && (
                      <p className="text-xs text-amber-400 mt-0.5">
                        {formatCountdown(settleAt - now)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-[#0a0a0c] border border-white/5 p-3 sm:p-4">
                <div className="flex gap-3 items-stretch">
                  <div className="flex-1 min-w-0">
                    {snapshots === undefined || !settleAt ? (
                      <div className="h-[260px] sm:h-[300px] animate-pulse bg-white/5 rounded-lg" />
                    ) : (
                      <BetPerformanceChart
                        snapshots={snapshots}
                        startTime={new Date(bet.timestamp).getTime()}
                        settleAt={settleAt}
                        now={now}
                        stroke={strokeColor}
                        className="w-full h-[260px] sm:h-[300px]"
                      />
                    )}
                  </div>

                  {snapshots && settleAt && (
                    <BetReadingSlots
                      snapshots={snapshots}
                      startTime={new Date(bet.timestamp).getTime()}
                      now={now}
                      percentageColor={percentageColor}
                    />
                  )}
                </div>

                {snapshots && snapshots.length <= 1 && (
                  <p className="mt-3 text-xs text-gray-500">
                    Baseline recorded at 0%. Readings every 8h will extend the curve.
                  </p>
                )}
              </div>
            </div>

            <div className="card p-5 sm:p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-white">Stats</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-white/5 p-4 space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Baseline</p>
                  <p className="inline-flex items-center gap-2 text-gray-300">
                    <Eye className="w-4 h-4 text-gray-500" />
                    {formatNumber(bet.viewsAtInvestment)} views
                  </p>
                  {bet.likesAtInvestment !== null && (
                    <p className="inline-flex items-center gap-2 text-gray-300">
                      <Heart className="w-4 h-4 text-gray-500" />
                      {formatNumber(bet.likesAtInvestment)} likes
                    </p>
                  )}
                  <p className="text-gray-400">{formatNumber(bet.followersAtInvestment)} followers</p>
                </div>

                <div className="rounded-xl bg-white/5 p-4 space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Current</p>
                  <p className="inline-flex items-center gap-2 text-gray-300">
                    <Eye className="w-4 h-4 text-gray-500" />
                    {formatNumber(bet.currentViews ?? bet.viewsAtInvestment)} views
                  </p>
                  {bet.currentLikes !== null && (
                    <p className="inline-flex items-center gap-2 text-gray-300">
                      <Heart className="w-4 h-4 text-gray-500" />
                      {formatNumber(bet.currentLikes)} likes
                    </p>
                  )}
                  <p className="text-gray-400">
                    Placed {new Date(bet.timestamp).toLocaleString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
