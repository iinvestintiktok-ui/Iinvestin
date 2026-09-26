import {
  BET_MILESTONE_HOURS,
  formatRelativeTime,
  formatPreciseDateTime,
  formatMilestoneSlotLabel,
  findSnapshotForMilestone,
} from '../lib/relativeTime';
import { formatNumber } from '../lib/format';

interface SnapshotPoint {
  recordedAt: number;
  percentage: number;
  views: number;
  likes: number | null;
}

interface Props {
  snapshots: SnapshotPoint[];
  startTime: number;
  now: number;
  percentageColor: (value: number) => string;
}

export default function BetReadingSlots({
  snapshots,
  startTime,
  now,
  percentageColor,
}: Props) {
  const slots = BET_MILESTONE_HOURS.map((hours) => {
    const snapshot = findSnapshotForMilestone(snapshots, startTime, hours);
    return {
      hours,
      label: formatMilestoneSlotLabel(hours),
      snapshot,
    };
  });

  return (
    <div className="flex flex-col justify-between flex-shrink-0 w-[80px] sm:w-[88px] h-[260px] sm:h-[300px] overflow-y-auto scrollbar-thin">
      {slots.map((slot) => (
        <div
          key={slot.hours}
          className="rounded-lg bg-white/5 border border-white/10 px-1.5 py-1.5 text-center flex flex-col justify-center min-h-[36px] sm:min-h-[38px]"
          title={slot.snapshot ? formatPreciseDateTime(slot.snapshot.recordedAt) : undefined}
        >
          <p className="text-[8px] text-gray-500 uppercase tracking-wide leading-tight">
            {slot.label}
          </p>
          {slot.snapshot ? (
            <>
              <p
                className={`font-display font-bold text-sm tabular-nums leading-tight mt-0.5 ${percentageColor(
                  slot.snapshot.percentage,
                )}`}
              >
                {slot.snapshot.percentage > 0 ? '+' : ''}
                {slot.snapshot.percentage}%
              </p>
              <p className="text-[7px] text-gray-500 leading-tight mt-0.5">
                {formatNumber(slot.snapshot.views)}v
                {slot.snapshot.likes !== null ? ` · ${formatNumber(slot.snapshot.likes)}♥` : ''}
              </p>
              <p className="text-[7px] text-gray-600 leading-tight">
                {formatRelativeTime(slot.snapshot.recordedAt, now)}
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-600 mt-0.5">—</p>
          )}
        </div>
      ))}
    </div>
  );
}
