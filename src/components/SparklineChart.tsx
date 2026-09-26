interface Props {
  points: number[];
  width?: number;
  height?: number;
  stroke?: string;
  className?: string;
  showGradient?: boolean;
}

export default function SparklineChart({
  points,
  width = 320,
  height = 80,
  stroke = '#818cf8',
  className = '',
  showGradient = true,
}: Props) {
  const normalizedPoints = points.length === 0 ? [0] : points.length === 1 ? [points[0], points[0]] : points;
  const max = Math.max(...normalizedPoints);
  const min = Math.min(...normalizedPoints);
  const range = max - min || 1;
  const step = width / (normalizedPoints.length - 1);

  const path = normalizedPoints
    .map((point, index) => {
      const x = index * step;
      const y = height - ((point - min) / range) * (height - 8) - 4;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;
  const gradientId = `sparkline-${stroke.replace('#', '')}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      role="img"
      aria-label="Performance sparkline"
    >
      {showGradient && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {showGradient && <path d={areaPath} fill={`url(#${gradientId})`} />}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
