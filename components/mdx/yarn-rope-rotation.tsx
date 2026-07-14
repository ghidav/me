"use client";

import { useRef, useState } from "react";
import { Arrow, rotate, svgPoint, type Vec } from "@/components/mdx/viz-utils";

// RoPE as rotation: a token vector on the complex plane rotated by n·θ_d,
// with a ghost trail of intermediate positions and a spiral showing the
// accumulated angle.

const DISK_CX = 80;
const DISK_CY = 80;
const DISK_R = 62;
const D_TOT = 64;

function spiralPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  totalAngle: number,
) {
  const steps = Math.max(60, Math.round(Math.abs(totalAngle) * 20));
  let path = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = startAngle - totalAngle * t;
    const r = rInner + (rOuter - rInner) * t;
    path += (i === 0 ? "M" : "L") + (cx + Math.cos(a) * r).toFixed(2) + " " + (cy - Math.sin(a) * r).toFixed(2) + " ";
  }
  return path;
}

export function YarnRopeRotation() {
  const [xBase, setXBase] = useState<Vec>({ x: 0.86, y: 0.18 });
  const [n, setN] = useState(10);
  const [d, setD] = useState(3);
  const diskRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);

  function setX(sx: number, sy: number) {
    const x = (sx - DISK_CX) / DISK_R;
    const y = -(sy - DISK_CY) / DISK_R;
    const r = Math.hypot(x, y);
    // snap to a fixed radius — RoPE preserves the vector's length
    const s = 0.88 / Math.max(r, 0.01);
    setXBase({ x: x * s, y: y * s });
  }

  function onPointerDown(e: React.PointerEvent) {
    draggingRef.current = true;
    try {
      diskRef.current?.setPointerCapture(e.pointerId);
    } catch {}
    const p = svgPoint(diskRef.current!, e, 160);
    setX(p.sx, p.sy);
    e.preventDefault();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const p = svgPoint(diskRef.current!, e, 160);
    setX(p.sx, p.sy);
    e.preventDefault();
  }

  const theta = Math.pow(10000, (-2 * d) / D_TOT);
  const total = n * theta;

  const cx = 235;
  const cy = 140;
  const R = 108;

  const steps = Math.min(Math.max(Math.ceil(Math.abs(total) * 4), 2), 24);
  const ghosts: Vec[] = [];
  for (let i = 1; i < steps; i++) {
    ghosts.push(rotate(xBase, (i / steps) * n * theta));
  }
  const final = rotate(xBase, total);

  const dsx = DISK_CX + xBase.x * DISK_R;
  const dsy = DISK_CY - xBase.y * DISK_R;

  return (
    <figure className="my-6 rounded-lg border border-border p-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="w-32 shrink-0">
          <svg
            ref={diskRef}
            viewBox="0 0 160 160"
            className="block w-full touch-none select-none"
            role="img"
            aria-label="Base token direction"
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
              x
            </text>
          </svg>
          <p className="mt-1 text-center text-xs leading-4 text-muted">
            Base token x
            <br />
            Drag the tip
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <svg viewBox="0 0 480 270" className="block w-full" role="img" aria-label="Token on the complex plane, rotated by position">
            <line x1={cx - R - 20} y1={cy} x2={cx + R + 20} y2={cy} stroke="var(--border)" strokeWidth="1" />
            <line x1={cx} y1={cy - R - 20} x2={cx} y2={cy + R + 20} stroke="var(--border)" strokeWidth="1" />
            <text x={cx + R + 22} y={cy + 4} fontSize="10" fill="var(--muted)">
              Re
            </text>
            <text x={cx + 5} y={cy - R - 18} fontSize="10" fill="var(--muted)">
              Im
            </text>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="0.8" strokeDasharray="3 3" />

            {n > 0 && (
              <path
                d={spiralPath(cx, cy, R + 10, Math.max(R + 10 + Math.min(total * 1.2, 36), R + 12), Math.atan2(xBase.y, xBase.x), total)}
                fill="none"
                stroke="var(--accent-red)"
                strokeWidth="1.2"
                opacity="0.55"
                strokeDasharray="3 2"
              />
            )}

            {ghosts.map((g, i) => (
              <Arrow
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + g.x * R}
                y2={cy - g.y * R}
                color="var(--accent-green)"
                width={1.1}
                opacity={0.16 + 0.22 * (i / ghosts.length)}
                head={6.5}
              />
            ))}

            <Arrow x1={cx} y1={cy} x2={cx + xBase.x * R} y2={cy - xBase.y * R} color="var(--foreground)" width={1.6} head={6.5} />
            <text x={cx + xBase.x * R + 8} y={cy - xBase.y * R - 4} fontSize="11" fill="var(--foreground)" fontWeight="500">
              x
            </text>
            <Arrow x1={cx} y1={cy} x2={cx + final.x * R} y2={cy - final.y * R} color="var(--accent-green)" width={2.2} head={6.5} />
            <text x={cx + final.x * R + 8} y={cy - final.y * R + 12} fontSize="11" fill="var(--accent-green)" fontWeight="500">
              x · eⁱⁿᶿᵈ
            </text>

            <text x="10" y="16" fontSize="11" fill="var(--muted)" fontWeight="500">
              complex plane
            </text>
            <text x="10" y="32" fontSize="11" fill="var(--foreground)" className="tabular-nums">
              θ_d = 10000^(−2d/D) = {theta.toExponential(2)}
            </text>
            <text x="10" y="48" fontSize="11" fill="var(--foreground)" className="tabular-nums">
              n · θ_d = {total.toFixed(3)} rad ({(total / (2 * Math.PI)).toFixed(2)} turns)
            </text>
            <text x="470" y="16" fontSize="11" fill="var(--muted)" textAnchor="end" fontWeight="500">
              position becomes rotation
            </text>
            <text x="470" y="32" fontSize="10.5" fill="var(--muted)" textAnchor="end" fontStyle="italic">
              rotate x by nθ_d · length preserved
            </text>
          </svg>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
        <label htmlFor="yarn-rot-n">position n</label>
        <input id="yarn-rot-n" type="range" min={0} max={60} value={n} onChange={(e) => setN(Number(e.target.value))} className="min-w-24 flex-1 accent-foreground" />
        <span className="w-12 text-right text-xs tabular-nums">n = {n}</span>
        <label htmlFor="yarn-rot-d">dim d</label>
        <input id="yarn-rot-d" type="range" min={0} max={24} value={d} onChange={(e) => setD(Number(e.target.value))} className="min-w-24 flex-1 accent-foreground" />
        <span className="w-12 text-right text-xs tabular-nums">d = {d}</span>
      </div>
    </figure>
  );
}
