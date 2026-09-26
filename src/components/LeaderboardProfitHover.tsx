import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  investorId: string;
  winningBets: number;
  losingBets: number;
  maxPercentage: number;
  className?: string;
  children: ReactNode;
}

function StatCell({
  to,
  value,
  label,
  valueClass,
}: {
  to: string;
  value: string;
  label: string;
  valueClass: string;
}) {
  return (
    <Link
      to={to}
      onClick={(e) => e.stopPropagation()}
      className="p-3 flex flex-col items-center justify-center text-center min-h-[72px] hover:bg-white/5 transition-colors"
    >
      <span className={`font-display font-bold text-lg tabular-nums leading-none mb-1 ${valueClass}`}>
        {value}
      </span>
      <span className="text-[10px] text-gray-500 leading-tight">{label}</span>
    </Link>
  );
}

export default function LeaderboardProfitHover({
  investorId,
  winningBets,
  losingBets,
  maxPercentage,
  className = '',
  children,
}: Props) {
  const maxLabel = `${maxPercentage > 0 ? '+' : ''}${maxPercentage}%`;
  const basePath = `/investor/${investorId}`;

  return (
    <div className="relative group/profit inline-flex flex-shrink-0 justify-center">
      <span className={`cursor-default whitespace-nowrap ${className}`}>{children}</span>

      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 invisible translate-y-1 group-hover/profit:opacity-100 group-hover/profit:visible group-hover/profit:translate-y-0 group-hover/profit:pointer-events-auto pointer-events-none transition-all duration-150"
        role="tooltip"
      >
        <div className="w-[220px] rounded-xl bg-[#0d0d10] shadow-xl shadow-black/60 overflow-hidden">
          <div className="grid grid-cols-2">
            <StatCell
              to={`${basePath}?winnings`}
              value={String(winningBets)}
              label="Winning bets"
              valueClass="text-emerald-400"
            />
            <StatCell
              to={`${basePath}?losses`}
              value={String(losingBets)}
              label="Losing bets"
              valueClass="text-rose-400"
            />
          </div>
          <div>
            <StatCell
              to={`${basePath}?best`}
              value={maxLabel}
              label="Max %"
              valueClass="text-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
