// Shared helpers for the interactive SVG figures embedded in posts.

export type Vec = { x: number; y: number };

export function rotate(v: Vec, a: number): Vec {
  return {
    x: v.x * Math.cos(a) - v.y * Math.sin(a),
    y: v.x * Math.sin(a) + v.y * Math.cos(a),
  };
}

export function angleBetween(v1: Vec, v2: Vec): number {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const cross = v1.x * v2.y - v1.y * v2.x;
  return Math.atan2(cross, dot);
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  width = 1.4,
  opacity = 1,
  dashed = false,
  head = 6,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
  opacity?: number;
  dashed?: boolean;
  head?: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const tipX = x2 - ux * (head * 0.35);
  const tipY = y2 - uy * (head * 0.35);
  const lX = x2 - ux * head + uy * head * 0.5;
  const lY = y2 - uy * head - ux * head * 0.5;
  const rX = x2 - ux * head - uy * head * 0.5;
  const rY = y2 - uy * head + ux * head * 0.5;
  return (
    <g opacity={opacity}>
      <line
        x1={x1.toFixed(2)}
        y1={y1.toFixed(2)}
        x2={tipX.toFixed(2)}
        y2={tipY.toFixed(2)}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        {...(dashed ? { strokeDasharray: "3 3" } : {})}
      />
      <path
        d={`M ${x2.toFixed(2)} ${y2.toFixed(2)} L ${lX.toFixed(2)} ${lY.toFixed(2)} L ${rX.toFixed(2)} ${rY.toFixed(2)} Z`}
        fill={color}
      />
    </g>
  );
}

// Pie-slice wedge between two direction vectors, drawn from (cx, cy).
export function wedgePath(
  cx: number,
  cy: number,
  r: number,
  v1: Vec,
  v2: Vec,
): string {
  const a1 = Math.atan2(v1.y, v1.x);
  const a2 = Math.atan2(v2.y, v2.x);
  const x1 = cx + Math.cos(a1) * r;
  const y1 = cy - Math.sin(a1) * r;
  const x2 = cx + Math.cos(a2) * r;
  const y2 = cy - Math.sin(a2) * r;
  let diff = a2 - a1;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  const largeArc = Math.abs(diff) > Math.PI ? 1 : 0;
  const sweep = diff > 0 ? 0 : 1;
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

// Maps a pointer event to viewBox coordinates of a square svg.
export function svgPoint(
  svg: SVGSVGElement,
  e: React.PointerEvent,
  viewSize: number,
) {
  const rect = svg.getBoundingClientRect();
  return {
    sx: ((e.clientX - rect.left) * viewSize) / rect.width,
    sy: ((e.clientY - rect.top) * viewSize) / rect.height,
  };
}
