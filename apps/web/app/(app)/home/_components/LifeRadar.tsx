type PillarStat = {
  id: string;
  name: string;
  level: number;
  is_priority: boolean;
};

const SIZE = 260;
const CX = SIZE / 2;
const CY = SIZE / 2;
const MAX_R = 90;
const LABEL_OFFSET = 22;
const MAX_LEVEL = 50;
const GRIDS = [0.25, 0.5, 0.75, 1] as const;

function xy(angle: number, r: number) {
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

function gridPoints(n: number, scale: number): string {
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    const { x, y } = xy(a, MAX_R * scale);
    return `${x},${y}`;
  }).join(' ');
}

export default function LifeRadar({ pillars }: { pillars: PillarStat[] }) {
  if (pillars.length < 3) return null;

  const n = pillars.length;

  const dataPoints = pillars.map((p, i) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    const r = (p.level / MAX_LEVEL) * MAX_R;
    return xy(a, r);
  });

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      style={{ maxWidth: SIZE }}
      aria-label="Radar de pilares de vida"
    >
      {GRIDS.map((s) => (
        <polygon
          key={s}
          points={gridPoints(n, s)}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}

      {pillars.map((_, i) => {
        const a = (2 * Math.PI * i) / n - Math.PI / 2;
        const { x, y } = xy(a, MAX_R);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />;
      })}

      <polygon
        points={dataPoints.map(({ x, y }) => `${x},${y}`).join(' ')}
        fill="var(--accent)"
        fillOpacity="0.18"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {dataPoints.map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="var(--accent)" />
      ))}

      {pillars.map((p, i) => {
        const a = (2 * Math.PI * i) / n - Math.PI / 2;
        const { x, y } = xy(a, MAX_R + LABEL_OFFSET);
        const anchor = Math.abs(x - CX) < 5 ? 'middle' : x < CX ? 'end' : 'start';
        return (
          <text
            key={p.id}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize="11"
            fill={p.is_priority ? 'var(--accent)' : 'var(--text-secondary)'}
          >
            {p.name}
          </text>
        );
      })}
    </svg>
  );
}
