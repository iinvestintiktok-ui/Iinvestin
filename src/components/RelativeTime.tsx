import { useEffect, useState } from 'react';
import { formatPreciseDateTime, formatRelativeTime } from '../lib/relativeTime';

interface Props {
  timestamp: number | string;
  className?: string;
}

export default function RelativeTime({ timestamp, className = '' }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const ts = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;

  return (
    <span className={className} title={formatPreciseDateTime(ts)}>
      {formatRelativeTime(ts, now)}
    </span>
  );
}
