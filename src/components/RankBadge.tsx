interface Props {
  rank: number;
  size?: 'sm' | 'md';
}

const rankStyles: Record<number, string> = {
  1: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-amber-950 shadow-lg shadow-amber-500/30',
  2: 'bg-gradient-to-br from-slate-100 via-gray-300 to-slate-400 text-gray-900 shadow-lg shadow-gray-400/20',
  3: 'bg-gradient-to-br from-orange-400 via-amber-700 to-orange-800 text-amber-50 shadow-lg shadow-orange-500/20',
};

export default function RankBadge({ rank, size = 'sm' }: Props) {
  const sizeClass = size === 'md' ? 'w-8 h-8 text-sm' : 'w-7 h-7 text-xs';

  if (rank <= 3) {
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-bold tabular-nums flex-shrink-0 ${rankStyles[rank]}`}
      >
        {rank}
      </div>
    );
  }

  return (
    <span className={`${size === 'md' ? 'text-sm' : 'text-xs'} text-gray-500 font-medium tabular-nums text-center ${size === 'md' ? 'w-8' : 'w-7'}`}>
      {rank}
    </span>
  );
}
