import { useState } from 'react';
import {
  BET_MILESTONE_HOURS,
  formatPreciseDateTime,
  formatBetMilestoneTick,
} from '../lib/relativeTime';

interface SnapshotPoint {
  recordedAt: number;
  percentage: number;
}

interface Props {
  snapshots: SnapshotPoint[];
  startTime: number;
  settleAt: number;
  now: number;
  stroke?: string;
  className?: string;
}

const PADDING = { top: 16, right: 8, bottom: 40, left: 36 };
const WIDTH = 800;
const HEIGHT = 280;

function buildYTicks(min: number, max: number): number[] {
  const span = Math.max(10, Math.ceil(Math.max(Math.abs(min), Math.abs(max), 5) / 5) * 5);
  const ticks: number[] = [];
  for (let value = -span; value <= span; value += span / 2) {
    ticks.push(value);
  }
  if (!ticks.includes(0)) {
    ticks.push(0);
  }
  return ticks.sort((a, b) => a - b);
}

function findNearestPoint(points: SnapshotPoint[], time: number): SnapshotPoint {
  let nearest = points[0];
  let minDist = Infinity;
  for (const point of points) {
    const dist = Math.abs(point.recordedAt - time);
    if (dist < minDist) {
      minDist = dist;
      nearest = point;
    }
  }
  return nearest;
}

export default function BetPerformanceChart({
  snapshots,
  startTime,
  settleAt,
  now,
  stroke = '#fbbf24',
  className = '',
}: Props) {
  const [hoveredTick, setHoveredTick] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<SnapshotPoint | null>(null);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const points =
    snapshots.length > 0
      ? snapshots
      : [{ recordedAt: startTime, percentage: 0 }];

  const percentages = points.map((point) => point.percentage);
  const yTicks = buildYTicks(Math.min(...percentages), Math.max(...percentages));
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];
  const yRange = yMax - yMin || 1;

  const timeSpan = Math.max(settleAt - startTime, 1);

  const xForTime = (time: number) =>
    PADDING.left + ((time - startTime) / timeSpan) * plotWidth;

  const yForValue = (value: number) =>
    PADDING.top + plotHeight - ((value - yMin) / yRange) * plotHeight;

  const linePath = points
    .map((point, index) => {
      const x = xForTime(point.recordedAt);
      const y = yForValue(point.percentage);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const xTicks = BET_MILESTONE_HOURS.map((hours, index) => ({
    time: startTime + hours * 60 * 60 * 1000,
    hoursFromStart: hours,
    anchor:
      index === 0
        ? ('start' as const)
        : index === BET_MILESTONE_HOURS.length - 1
          ? ('end' as const)
          : ('middle' as const),
  }));

  const handlePlotMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * WIDTH;

    if (mouseX < PADDING.left || mouseX > WIDTH - PADDING.right) {
      setHoveredPoint(null);
      return;
    }

    const time = startTime + ((mouseX - PADDING.left) / plotWidth) * timeSpan;
    setHoveredPoint(findNearestPoint(points, time));
  };

  const hoverX = hoveredPoint ? xForTime(hoveredPoint.recordedAt) : 0;
  const hoverY = hoveredPoint ? yForValue(hoveredPoint.percentage) : 0;
  const tooltipWidth = 56;
  const tooltipHeight = 28;
  const tooltipX = Math.min(
    Math.max(hoverX - tooltipWidth / 2, PADDING.left),
    WIDTH - PADDING.right - tooltipWidth,
  );
  const tooltipY = Math.max(hoverY - 40, PADDING.top);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={className}
      role="img"
      aria-label="Bet performance chart"
    >
      {yTicks.map((tick) => {
        const y = yForValue(tick);
        return (
          <g key={tick}>
            <line
              x1={PADDING.left}
              y1={y}
              x2={WIDTH - PADDING.right}
              y2={y}
              stroke={tick === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'}
              strokeWidth={tick === 0 ? 1.5 : 1}
              strokeDasharray={tick === 0 ? undefined : '4 4'}
            />
            <text
              x={PADDING.left - 4}
              y={y + 3}
              textAnchor="end"
              fill="rgba(156,163,175,0.9)"
              fontSize="10"
            >
              {tick > 0 ? `+${tick}` : tick}%
            </text>
          </g>
        );
      })}

      <line
        x1={PADDING.left}
        y1={HEIGHT - PADDING.bottom}
        x2={WIDTH - PADDING.right}
        y2={HEIGHT - PADDING.bottom}
        stroke="rgba(255,255,255,0.12)"
      />

      {xTicks.map((tick) => {
        const x = xForTime(tick.time);
        const displayLabel = formatBetMilestoneTick(tick.hoursFromStart, tick.time, now);
        const preciseLabel = formatPreciseDateTime(tick.time);
        const isHovered = hoveredTick === tick.time;

        return (
          <g key={tick.time}>
            <line
              x1={x}
              y1={PADDING.top}
              x2={x}
              y2={HEIGHT - PADDING.bottom}
              stroke="rgba(255,255,255,0.04)"
            />
            <rect
              x={tick.anchor === 'start' ? x : tick.anchor === 'end' ? x - 48 : x - 24}
              y={HEIGHT - PADDING.bottom + 2}
              width={tick.anchor === 'middle' ? 48 : 52}
              height={32}
              fill="transparent"
              className="cursor-default"
              onMouseEnter={() => setHoveredTick(tick.time)}
              onMouseLeave={() => setHoveredTick(null)}
            />
            <text
              x={x}
              y={HEIGHT - 8}
              textAnchor={tick.anchor}
              fill={isHovered ? '#fff' : 'rgba(156,163,175,0.9)'}
              fontSize="9"
              className="pointer-events-none select-none"
            >
              {displayLabel}
            </text>
            {isHovered && (
              <text
                x={x}
                y={HEIGHT - 20}
                textAnchor={tick.anchor}
                fill="rgba(156,163,175,0.7)"
                fontSize="7"
                className="pointer-events-none select-none"
              >
                {preciseLabel}
              </text>
            )}
          </g>
        );
      })}

      {points.length > 1 && (
        <path
          d={linePath}
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none"
        />
      )}

      <rect
        x={PADDING.left}
        y={PADDING.top}
        width={plotWidth}
        height={plotHeight}
        fill="transparent"
        className="cursor-crosshair"
        onMouseMove={handlePlotMouseMove}
        onMouseLeave={() => setHoveredPoint(null)}
      />

      {hoveredPoint && (
        <g className="pointer-events-none">
          <line
            x1={hoverX}
            y1={PADDING.top}
            x2={hoverX}
            y2={HEIGHT - PADDING.bottom}
            stroke={stroke}
            strokeWidth="1"
            strokeOpacity="0.4"
            strokeDasharray="4 3"
          />
          <circle cx={hoverX} cy={hoverY} r="5" fill={stroke} fillOpacity="0.2" />
          <circle cx={hoverX} cy={hoverY} r="3.5" fill={stroke} stroke="#0a0a0c" strokeWidth="1.5" />

          <rect
            x={tooltipX}
            y={tooltipY}
            width={tooltipWidth}
            height={tooltipHeight}
            rx="6"
            fill="#1a1a1f"
            stroke="rgba(255,255,255,0.12)"
          />
          <text
            x={tooltipX + tooltipWidth / 2}
            y={tooltipY + 18}
            textAnchor="middle"
            fill={stroke}
            fontSize="13"
            fontWeight="bold"
          >
            {hoveredPoint.percentage > 0 ? '+' : ''}
            {hoveredPoint.percentage}%
          </text>
        </g>
      )}
    </svg>
  );
}
