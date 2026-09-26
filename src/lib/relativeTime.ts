export const BET_READING_INTERVAL_HOURS = 8;
export const BET_DURATION_HOURS = 48;
export const BET_MILESTONE_HOURS = [0, 8, 16, 24, 32, 40, 48] as const;

const HOUR_MS = 60 * 60 * 1000;

export function formatPreciseDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatRelativeTime(timestamp: number, now: number): string {
  const diffMs = timestamp - now;
  const absMs = Math.abs(diffMs);

  if (absMs < 1000) {
    return 'now';
  }

  const seconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let value: string;
  if (days > 0) {
    value = `${days}d`;
  } else if (hours > 0) {
    value = `${hours}h`;
  } else if (minutes > 0) {
    value = `${minutes}m`;
  } else {
    value = `${seconds}s`;
  }

  if (diffMs > 0) {
    return `in ${value}`;
  }

  return `${value} ago`;
}

/** e.g. 8 → "8h", 24 → "1d", 32 → "1d8h" */
export function formatHoursFromStart(hours: number): string {
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (days === 0) {
    return `${hours}h`;
  }
  if (remHours === 0) {
    return `${days}d`;
  }
  return `${days}d${remHours}h`;
}

export function formatMilestoneSlotLabel(hoursFromStart: number): string {
  if (hoursFromStart === 0) {
    return 'Start';
  }
  return `+${formatHoursFromStart(hoursFromStart)}`;
}

export function formatBetMilestoneTick(
  hoursFromStart: number,
  timestamp: number,
  now: number,
): string {
  if (hoursFromStart === 0) {
    const relative = formatRelativeTime(timestamp, now);
    return relative === 'now' ? 'Start' : relative;
  }

  const milestone = formatHoursFromStart(hoursFromStart);
  if (timestamp > now) {
    return `in ${milestone}`;
  }

  return formatRelativeTime(timestamp, now);
}

export function getBetMilestoneTimes(startTime: number): number[] {
  return BET_MILESTONE_HOURS.map((hours) => startTime + hours * HOUR_MS);
}

export function findSnapshotForMilestone(
  snapshots: { recordedAt: number; percentage: number }[],
  startTime: number,
  hoursFromStart: number,
): { recordedAt: number; percentage: number } | undefined {
  if (hoursFromStart === 0) {
    return snapshots[0];
  }

  const target = startTime + hoursFromStart * HOUR_MS;
  let best: { recordedAt: number; percentage: number } | undefined;
  let bestDistance = Infinity;

  for (const snapshot of snapshots) {
    const distance = Math.abs(snapshot.recordedAt - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = snapshot;
    }
  }

  // Match within 2 hours of the 8h milestone
  if (best && bestDistance <= 2 * HOUR_MS) {
    return best;
  }

  return undefined;
}
