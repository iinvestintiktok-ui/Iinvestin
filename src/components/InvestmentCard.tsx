import { Link, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { InvestmentWithRelations } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatNumber, formatKwai } from '../lib/format';
import RelativeTime from './RelativeTime';

interface Props {
  investment: InvestmentWithRelations;
  hideInvestor?: boolean;
}

export default function InvestmentCard({ investment, hideInvestor = false }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const investor = investment.investor;
  const creator = investment.creator;

  const isGain = investment.status === 'gain';
  const isLoss = investment.status === 'loss';
  const isPending = investment.status === 'pending';
  const isCurrentUser = user?.investorSlug === investor?.id;
  const displayPercentage = investment.percentage ?? 0;

  const badgeColor = isGain
    ? 'text-emerald-400'
    : isLoss
    ? 'text-rose-400'
    : 'text-amber-400';

  const badgeBg = isGain
    ? 'bg-emerald-500/10'
    : isLoss
    ? 'bg-rose-500/10'
    : 'bg-amber-500/10';

  const goToBet = () => {
    navigate(`/bet/${investment.id}`);
  };

  return (
    <div
      className="card card-hover overflow-hidden group cursor-pointer"
      onClick={goToBet}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          goToBet();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`View bet on ${investment.videoTitle}`}
    >
      <div className="flex flex-row gap-4 p-4">
        <div className="relative w-[88px] sm:w-[100px] flex-shrink-0">
          <div className="block relative aspect-[9/16] rounded-xl overflow-hidden bg-[#1a1a1f]">
            <img
              src={investment.thumbnail}
              alt={investment.videoTitle}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/70" />

            {creator && (
              <div className="absolute bottom-1.5 left-1.5 right-1.5 z-10 pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <img
                    src={creator.avatar}
                    alt={creator.pseudo}
                    className="w-4 h-4 rounded-full object-cover ring-1 ring-white/40 flex-shrink-0"
                  />
                  <span className="text-white text-[10px] font-semibold truncate drop-shadow-lg">
                    {creator.pseudo.replace(/^@/, '')}
                  </span>
                </div>
                <p className="mt-0.5 pl-5 text-[9px] text-white/80 drop-shadow-lg">
                  {formatNumber(creator.followers)} followers
                </p>
              </div>
            )}

            {isPending && (
              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-amber-400 text-[9px] font-semibold flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                Pending
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
          <div className="space-y-1.5">
            {hideInvestor ? (
              <div className="flex justify-end">
                <RelativeTime
                  timestamp={investment.timestamp}
                  className="text-xs text-gray-500 flex-shrink-0 cursor-default"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                {investor ? (
                  <Link
                    to={`/investor/${investor.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${investor.avatarColor} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                      {investor.tag}
                    </div>
                    <span className="text-sm truncate group-hover:text-white transition-colors">
                      {isCurrentUser ? (
                        <>
                          <span className="font-bold text-white">Me</span>
                          <span className="text-gray-400 font-normal"> ({investor.pseudo})</span>
                        </>
                      ) : (
                        <span className="text-gray-300 font-medium">{investor.pseudo}</span>
                      )}
                    </span>
                  </Link>
                ) : null}
                <RelativeTime
                  timestamp={investment.timestamp}
                  className="text-xs text-gray-500 flex-shrink-0 cursor-default"
                />
              </div>
            )}

            <p className="text-sm text-gray-200 font-medium line-clamp-2">
              {investment.videoTitle}
            </p>
          </div>

          <div className="space-y-2">
            <div className={`inline-flex items-center px-3 py-1.5 rounded-lg ${badgeBg}`}>
              <span className={`font-display font-bold text-2xl ${badgeColor} tracking-tight`}>
                {displayPercentage > 0 ? '+' : ''}{displayPercentage}%
              </span>
            </div>

            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {investment.videoDescription}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400">
              <span className="text-gray-500">Baseline:</span>
              <span>{formatNumber(investment.viewsAtInvestment)} views</span>
              <span className="text-gray-600">·</span>
              <span>{formatNumber(investment.followersAtInvestment)} followers</span>
              {investment.amountInvested > 0 ? (
                <>
                  <span className="text-gray-600">·</span>
                  <span className="text-gray-300 font-medium">{formatKwai(investment.amountInvested)}</span>
                </>
              ) : null}
            </div>
            {!isPending && investment.viewsAfter48h !== null ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400">
                <span className="text-gray-500">48h:</span>
                <span>{formatNumber(investment.viewsAfter48h)} views</span>
                {investment.valueAfter48h !== null && investment.amountInvested > 0 ? (
                  <>
                    <span className="text-gray-600">·</span>
                    <span className={`font-medium ${isGain ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-amber-400'}`}>
                      value {formatKwai(investment.valueAfter48h)}
                    </span>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
