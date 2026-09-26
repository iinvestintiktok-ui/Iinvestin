import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const SOLANA_ICON = 'https://show-me-the-money.fr/wp-content/uploads/2022/02/solana.png';

function useCountdown(targetDate: string | undefined) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export default function SponsorBanner() {
  const sponsor = useQuery(api.platform.getSponsor);
  const { days, hours, minutes, seconds } = useCountdown(sponsor?.endDate);

  if (sponsor === undefined) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#13131a] via-[#16121f] to-[#13131a] p-6 sm:p-8 h-[180px] animate-pulse" />
    );
  }

  if (sponsor === null) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#13131a] via-[#16121f] to-[#13131a] p-6 sm:p-8">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold tracking-wider text-indigo-400">
              Sponsored contest
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-xs font-medium">
              This week
            </span>
          </div>

          <p className="text-sm text-gray-400 mb-1">Sponsored by</p>
          <p className="font-display font-bold text-xl text-white mb-4">{sponsor.name}</p>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Prize pool</span>
            <div className="flex items-center gap-2">
              <img
                src={SOLANA_ICON}
                alt="Solana"
                className="w-8 h-8"
              />
              <span className="font-display font-bold text-3xl text-amber-400 tracking-tight">
                1 Solana
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center lg:items-end gap-2">
          <span className="text-xs text-gray-500 tracking-wider font-medium">
            Contest ends in
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <CountdownUnit value={days} label="d" />
            <CountdownSeparator />
            <CountdownUnit value={hours} label="h" />
            <CountdownSeparator />
            <CountdownUnit value={minutes} label="min" />
            <CountdownSeparator />
            <CountdownUnit value={seconds} label="s" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-16 sm:w-16 sm:h-18 rounded-xl bg-[#0a0a0c] flex items-center justify-center">
        <span className="font-display font-bold text-2xl sm:text-3xl text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] text-gray-500 mt-1 tracking-wide">{label}</span>
    </div>
  );
}

function CountdownSeparator() {
  return <span className="font-display font-bold text-2xl text-gray-600 -mt-4">:</span>;
}
