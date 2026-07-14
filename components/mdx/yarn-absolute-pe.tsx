"use client";

import { useRef, useState } from "react";
import { Arrow, svgPoint, wedgePath, type Vec } from "@/components/mdx/viz-utils";

// Absolute positional encoding: embedding space (token + position vectors)
// on the left, query/key space after the linear maps on the right. The
// attention angle mixes token content and absolute positions.

const DISK_CX = 80;
const DISK_CY = 80;
const DISK_R = 62;

const X_B: Vec = { x: -0.38, y: 0.82 };
const POS_BASE = 14;
const posVec = (p: number): Vec => ({
  x: 0.65 * Math.sin(p / POS_BASE),
  y: 0.65 * Math.cos(p / POS_BASE),
});

const Wq = [
  [0.85, -0.35],
  [0.42, 0.92],
];
const Wk = [
  [1.05, 0.22],
  [-0.28, 0.88],
];
const apply = (W: number[][], v: Vec): Vec => ({
  x: W[0][0] * v.x + W[0][1] * v.y,
  y: W[1][0] * v.x + W[1][1] * v.y,
});
const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });

function PanelAxes({ cx, cy, R, title }: { cx: number; cy: number; R: number; title: string }) {
  return (
    <g>
      <line x1={cx - R - 8} y1={cy} x2={cx + R + 8} y2={cy} stroke="var(--border)" strokeWidth="1" />
      <line x1={cx} y1={cy - R - 8} x2={cx} y2={cy + R + 8} stroke="var(--border)" strokeWidth="1" />
      <text x={cx - R - 6} y={cy - R - 10} fontSize="11" fill="var(--muted)" fontWeight="500">
        {title}
      </text>
    </g>
  );
}

export function YarnAbsolutePe() {
  const [xA, setXA] = useState<Vec>({ x: 0.72, y: 0.36 });
  const [n, setN] = useState(6);
  const [k, setK] = useState(5);
  const diskRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    const p = svgPoint(diskRef.current!, e, 160);
    const qs = { x: DISK_CX + xA.x * DISK_R, y: DISK_CY - xA.y * DISK_R };
    if (Math.hypot(p.sx - qs.x, p.sy - qs.y) < 22) {
      draggingRef.current = true;
      try {
        diskRef.current?.setPointerCapture(e.pointerId);
      } catch {}
      e.preventDefault();
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const p = svgPoint(diskRef.current!, e, 160);
    let x = (p.sx - DISK_CX) / DISK_R;
    let y = -(p.sy - DISK_CY) / DISK_R;
    const r = Math.hypot(x, y);
    if (r > 0.92) {
      x *= 0.92 / r;
      y *= 0.92 / r;
    }
    if (r < 0.2) {
      const s = 0.2 / Math.max(r, 0.001);
      x *= s;
      y *= s;
    }
    setXA({ x, y });
    e.preventDefault();
  }

  const pA = posVec(n);
  const pB = posVec(n + k);
  const sumA = add(xA, pA);
  const sumB = add(X_B, pB);
  const qA = apply(Wq, sumA);
  const kB = apply(Wk, sumB);

  const dot = qA.x * kB.x + qA.y * kB.y;
  const cross = qA.x * kB.y - qA.y * kB.x;
  const angle = Math.atan2(Math.abs(cross), dot);

  const L = { cx: 115, cy: 130, R: 88 };
  const Rp = { cx: 365, cy: 130, R: 76 };
  const P = (c: { cx: number; cy: number; R: number }, v: Vec) => ({
    x: c.cx + v.x * c.R,
    y: c.cy - v.y * c.R,
  });

  const dsx = DISK_CX + xA.x * DISK_R;
  const dsy = DISK_CY - xA.y * DISK_R;

  return (
    <figure className="my-6 rounded-lg border border-border p-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="w-32 shrink-0">
          <svg
            ref={diskRef}
            viewBox="0 0 160 160"
            className="block w-full touch-none select-none"
            role="img"
            aria-label="Query token direction"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (draggingRef.current = false)}
            onPointerCancel={() => (draggingRef.current = false)}
          >
            <line x1={DISK_CX} y1={DISK_CY - DISK_R - 6} x2={DISK_CX} y2={DISK_CY + DISK_R + 6} stroke="var(--border)" strokeWidth="1" />
            <line x1={DISK_CX - DISK_R - 6} y1={DISK_CY} x2={DISK_CX + DISK_R + 6} y2={DISK_CY} stroke="var(--border)" strokeWidth="1" />
            <circle cx={DISK_CX} cy={DISK_CY} r={DISK_R} fill="none" stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
            <line x1={DISK_CX} y1={DISK_CY} x2={dsx.toFixed(2)} y2={dsy.toFixed(2)} stroke="var(--accent-purple)" strokeWidth="1.5" />
            <circle cx={dsx.toFixed(2)} cy={dsy.toFixed(2)} r="9" fill="var(--accent-purple)" className="cursor-grab active:cursor-grabbing" />
            <text x={dsx + 12} y={dsy - 4} fontSize="11" fontWeight="500" fill="var(--accent-purple)" style={{ pointerEvents: "none" }}>
              xₐ
            </text>
          </svg>
          <p className="mt-1 text-center text-xs leading-4 text-muted">
            Query token xₐ
            <br />
            Drag to change token
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <svg viewBox="0 0 480 260" className="block w-full" role="img" aria-label="Embedding and query-key spaces">
            <PanelAxes cx={L.cx} cy={L.cy} R={L.R} title="embedding space" />
            <PanelAxes cx={Rp.cx} cy={Rp.cy} R={Rp.R} title="query / key space" />

            {/* token A */}
            <Arrow x1={L.cx} y1={L.cy} x2={P(L, xA).x} y2={P(L, xA).y} color="var(--foreground)" width={1.4} />
            <text x={P(L, xA).x + 6} y={P(L, xA).y - 2} fontSize="10.5" fill="var(--foreground)" fontWeight="500">
              xₐ
            </text>
            <Arrow x1={P(L, xA).x} y1={P(L, xA).y} x2={P(L, sumA).x} y2={P(L, sumA).y} color="var(--accent-blue)" width={1.2} dashed />
            <Arrow x1={L.cx} y1={L.cy} x2={P(L, sumA).x} y2={P(L, sumA).y} color="var(--accent-green)" width={2} />
            <text x={P(L, sumA).x + 6} y={P(L, sumA).y - 4} fontSize="10.5" fill="var(--accent-green)" fontWeight="500">
              xₐ+pₙ
            </text>

            {/* token B */}
            <Arrow x1={L.cx} y1={L.cy} x2={P(L, X_B).x} y2={P(L, X_B).y} color="var(--foreground)" width={1.2} opacity={0.65} />
            <text x={P(L, X_B).x - 24} y={P(L, X_B).y} fontSize="10.5" fill="var(--foreground)" fontWeight="500" opacity={0.65}>
              xᵦ
            </text>
            <Arrow x1={P(L, X_B).x} y1={P(L, X_B).y} x2={P(L, sumB).x} y2={P(L, sumB).y} color="var(--accent-blue)" width={1.2} opacity={0.6} dashed />
            <Arrow x1={L.cx} y1={L.cy} x2={P(L, sumB).x} y2={P(L, sumB).y} color="var(--accent-green)" width={2} opacity={0.7} />
            <text x={P(L, sumB).x - 62} y={P(L, sumB).y - 4} fontSize="10.5" fill="var(--accent-green)" fontWeight="500" opacity={0.7}>
              xᵦ+pₙ₊ₖ
            </text>

            {/* KQ space */}
            <path d={wedgePath(Rp.cx, Rp.cy, Rp.R * 0.3, qA, kB)} fill="var(--accent-yellow)" opacity="0.35" />
            <Arrow x1={Rp.cx} y1={Rp.cy} x2={P(Rp, qA).x} y2={P(Rp, qA).y} color="var(--accent-green)" width={2} />
            <text x={P(Rp, qA).x + 6} y={P(Rp, qA).y - 4} fontSize="10.5" fill="var(--accent-green)" fontWeight="500">
              q
            </text>
            <Arrow x1={Rp.cx} y1={Rp.cy} x2={P(Rp, kB).x} y2={P(Rp, kB).y} color="var(--accent-green)" width={2} opacity={0.75} />
            <text x={P(Rp, kB).x + 6} y={P(Rp, kB).y - 4} fontSize="10.5" fill="var(--accent-green)" fontWeight="500" opacity={0.75}>
              k
            </text>

            {/* Wq Wk bridge */}
            <line x1="215" y1="130" x2="265" y2="130" stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
            <polygon points="265,130 258,126 258,134" fill="var(--muted)" fillOpacity="0.5" />
            <text x="240" y="122" fontSize="10.5" fill="var(--muted)" textAnchor="middle" fontStyle="italic">
              Wq, Wk
            </text>
            <text x="365" y="236" fontSize="11" fill="var(--accent-yellow)" textAnchor="middle" fontWeight="500">
              ∠q, k = {((angle * 180) / Math.PI).toFixed(0)}°
            </text>
            <text x="365" y="250" fontSize="9.5" fill="var(--muted)" textAnchor="middle" fontStyle="italic">
              (moves with both n and k)
            </text>
          </svg>
          <div className="mt-1 flex flex-wrap justify-center gap-4 text-[11px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-3 rounded" style={{ background: "var(--foreground)" }} />
              token x
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-3 rounded" style={{ background: "var(--accent-blue)" }} />
              position p
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-3 rounded" style={{ background: "var(--accent-green)" }} />
              x + p
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-3 rounded" style={{ background: "var(--accent-yellow)" }} />
              attention angle
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
        <label htmlFor="yarn-abs-n">position n</label>
        <input id="yarn-abs-n" type="range" min={0} max={40} value={n} onChange={(e) => setN(Number(e.target.value))} className="min-w-24 flex-1 accent-foreground" />
        <span className="w-12 text-right text-xs tabular-nums">n = {n}</span>
        <label htmlFor="yarn-abs-k">offset k</label>
        <input id="yarn-abs-k" type="range" min={1} max={20} value={k} onChange={(e) => setK(Number(e.target.value))} className="min-w-24 flex-1 accent-foreground" />
        <span className="w-12 text-right text-xs tabular-nums">k = {k}</span>
      </div>
    </figure>
  );
}
