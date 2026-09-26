import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { formatKwai, formatNumber } from '../lib/format';

function Sparkline() {
  const points = [8, 12, 10, 16, 14, 20, 18, 24, 22, 28, 26, 32];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const width = 100;
  const height = 32;
  const step = width / (points.length - 1);

  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 right-0 w-full h-10 opacity-30 pointer-events-none"
    >
      <defs>
        <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkline-grad)" />
      <path d={path} fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatAveragePercentage(value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return `${value > 0 ? '+' : ''}${value}%`;
}

function percentageClass(value: number | null | undefined) {
  if (value === null || value === undefined) return 'text-gray-400';
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-rose-400';
  return 'text-white';
}

export default function KpiRow() {
  const { token, user } = useAuth();
  const [now, setNow] = useState(() => Date.now());
  const kpiData = useQuery(api.platform.getKpis, {});
  const myPositions = useQuery(api.investments.getMyPositions, { token, now });

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  if (kpiData === undefined || myPositions === undefined) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card p-5 sm:p-6 h-[104px] animate-pulse bg-[#131316]" />
        ))}
      </div>
    );
  }

  const positionsSubtitle = !user
    ? 'Sign in to track'
    : myPositions.count === 0
      ? 'No open positions'
      : myPositions.count === 1
        ? '1 open position'
        : `${myPositions.count} open positions`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="card p-5 sm:p-6 bg-[#161310]">
        <p className="text-xs text-gray-500 mb-3">Total distributed</p>
        <p className="font-display font-bold text-2xl sm:text-3xl text-amber-400 tabular-nums tracking-tight leading-none whitespace-nowrap">
          {formatKwai(kpiData.totalDistributed)}
        </p>
        <p className="text-[11px] text-gray-500 mt-2">
          {formatNumber(kpiData.totalUsers)} users
        </p>
      </div>

      <div className="card p-5 sm:p-6 relative overflow-hidden">
        <p className="text-xs text-gray-500 mb-3">Investments (48h)</p>
        <p className="font-display font-bold text-3xl sm:text-4xl text-white tabular-nums tracking-tight leading-none">
          {formatNumber(kpiData.investmentsLast48h)}
        </p>
        <Sparkline />
      </div>

      <div className="card p-5 sm:p-6">
        <p className="text-xs text-gray-500 mb-3">Best gain</p>
        <p className="font-display font-bold text-3xl sm:text-4xl text-emerald-400 tabular-nums tracking-tight leading-none">
          +{Math.round((kpiData.bestMultiplier - 1) * 100)}%
        </p>
      </div>

      <div className="card p-5 sm:p-6" data-tour="my-positions">
        <p className="text-xs text-gray-500 mb-3">My positions</p>
        <p
          className={`font-display font-bold text-3xl sm:text-4xl tabular-nums tracking-tight leading-none ${percentageClass(
            myPositions.averagePercentage,
          )}`}
        >
          {formatAveragePercentage(myPositions.averagePercentage)}
        </p>
        <p className="text-[11px] text-gray-500 mt-2">{positionsSubtitle}</p>
      </div>
    </div>
  );
}
