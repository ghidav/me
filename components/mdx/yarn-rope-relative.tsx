"use client";

import { useRef, useState } from "react";
import { Arrow, angleBetween, rotate, svgPoint, wedgePath, type Vec } from "@/components/mdx/viz-utils";

// RoPE's key property: the angle between the rotated k (at position n) and
// the rotated q (at position n+k) differs from the base angle only by k·θ_d.
// Scrub n — the rotated wedge keeps its size.

const DISK_CX = 80;
const DISK_CY = 80;
const DISK_R = 62;
const D_TOT = 64;
const K_BASE: Vec = { x: 0.9, y: 0.0 };

export function YarnRopeRelative() {
  const [qBase, setQBase] = useState<Vec>({ x: 0.55, y: 0.66 });
  const [n, setN] = useState(8);
  const [k, setK] = useState(6);
  const [d, setD] = useState(2);
  const diskRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    const p = svgPoint(diskRef.current!, e, 160);
    const qs = { x: DISK_CX + qBase.x * DISK_R, y: DISK_CY - qBase.y * DISK_R };
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
    const x = (p.sx - DISK_CX) / DISK_R;
    const y = -(p.sy - DISK_CY) / DISK_R;
    const r = Math.hypot(x, y);
    const s = 0.86 / Math.max(r, 0.01);
    setQBase({ x: x * s, y: y * s });
    e.preventDefault();
  }

  const theta = Math.pow(10000, (-2 * d) / D_TOT);
  const kRot = rotate(K_BASE, n * theta);
  const qRot = rotate(qBase, (n + k) * theta);

  const cx = 235;
  const cy = 140;
  const R = 110;

  const baseAngle = angleBetween(K_BASE, qBase);
  const rotAngle = angleBetween(kRot, qRot);
  const diffAngle = k * theta;

  const dqx = DISK_CX + qBase.x * DISK_R;
  const dqy = DISK_CY - qBase.y * DISK_R;
  const dkx = DISK_CX + K_BASE.x * DISK_R;
  const dky = DISK_CY - K_BASE.y * DISK_R;

  return (
    <figure className="my-6 rounded-lg border border-border p-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="w-32 shrink-0">
          <svg
            ref={diskRef}
            viewBox="0 0 160 160"
            className="block w-full touch-none select-none"
            role="img"
            aria-label="Base angle between q and k templates"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (draggingRef.current = false)}
            onPointerCancel={() => (draggingRef.current = false)}
          >
            <circle cx={DISK_CX} cy={DISK_CY} r={DISK_R} fill="none" stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
            <path d={wedgePath(DISK_CX, DISK_CY, DISK_R * 0.34, K_BASE, qBase)} fill="var(--muted)" opacity="0.32" />
            <line x1={DISK_CX} y1={DISK_CY} x2={dkx.toFixed(2)} y2={dky.toFixed(2)} stroke="var(--foreground)" strokeWidth="1.5" />
            <circle cx={dkx.toFixed(2)} cy={dky.toFixed(2)} r="5" fill="var(--foreground)" />
            <text x={dkx + 6} y={dky - 4} fontSize="10" fontWeight="500" fill="var(--foreground)">
              k
            </text>
            <line x1={DISK_CX} y1={DISK_CY} x2={dqx.toFixed(2)} y2={dqy.toFixed(2)} stroke="var(--accent-purple)" strokeWidth="1.5" />
            <circle cx={dqx.toFixed(2)} cy={dqy.toFixed(2)} r="9" fill="var(--accent-purple)" className="cursor-grab active:cursor-grabbing" />
            <text x={dqx + 10} y={dqy - 4} fontSize="10" fontWeight="500" fill="var(--accent-purple)">
              q
            </text>
          </svg>
          <p className="mt-1 text-center text-xs leading-4 text-muted">
            Base q direction
            <br />
            Drag to change q · k
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <svg viewBox="0 0 480 270" className="block w-full" role="img" aria-label="Rotated q and k on the complex plane">
            <line x1={cx - R - 20} y1={cy} x2={cx + R + 20} y2={cy} stroke="var(--border)" strokeWidth="1" />
            <line x1={cx} y1={cy - R - 20} x2={cx} y2={cy + R + 20} stroke="var(--border)" strokeWidth="1" />
            <text x={cx + R + 22} y={cy + 4} fontSize="10" fill="var(--muted)">
              Re
            </text>
            <text x={cx + 5} y={cy - R - 18} fontSize="10" fill="var(--muted)">
              Im
            </text>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="0.8" strokeDasharray="3 3" />

            <path d={wedgePath(cx, cy, R * 0.32, K_BASE, qBase)} fill="var(--muted)" opacity="0.28" />
            <path d={wedgePath(cx, cy, R * 0.46, kRot, qRot)} fill="var(--accent-yellow)" opacity="0.4" />

            <Arrow x1={cx} y1={cy} x2={cx + K_BASE.x * R} y2={cy - K_BASE.y * R} color="var(--muted)" width={1.1} opacity={0.55} head={7} />
            <text x={cx + K_BASE.x * R + 5} y={cy - K_BASE.y * R + 14} fontSize="10" fill="var(--muted)">
              k
            </text>
            <Arrow x1={cx} y1={cy} x2={cx + qBase.x * R} y2={cy - qBase.y * R} color="var(--muted)" width={1.1} opacity={0.55} head={7} />
            <text x={cx + qBase.x * R + 5} y={cy - qBase.y * R - 4} fontSize="10" fill="var(--muted)">
              q
            </text>

            <Arrow x1={cx} y1={cy} x2={cx + kRot.x * R} y2={cy - kRot.y * R} color="var(--foreground)" width={2} head={7} />
            <text x={cx + kRot.x * R + 7} y={cy - kRot.y * R + 14} fontSize="11" fill="var(--foreground)" fontWeight="500">
              kₙ · eⁱⁿᶿ
            </text>
            <Arrow x1={cx} y1={cy} x2={cx + qRot.x * R} y2={cy - qRot.y * R} color="var(--accent-green)" width={2} head={7} />
            <text x={cx + qRot.x * R - 8} y={cy - qRot.y * R - 6} fontSize="11" fill="var(--accent-green)" fontWeight="500" textAnchor="end">
              qₙ₊ₖ · eⁱ⁽ⁿ⁺ᵏ⁾ᶿ
            </text>

            <text x="10" y="16" fontSize="11" fill="var(--muted)" fontWeight="500">
              complex plane
            </text>
            <text x="470" y="16" fontSize="11" fill="var(--muted)" textAnchor="end" fontWeight="500">
              angle(kₙ, qₙ₊ₖ) = angle(k, q) + k·θ_d
            </text>
            <text x="470" y="32" fontSize="10.5" fill="var(--muted)" textAnchor="end" fontStyle="italic">
              scrub n — yellow wedge stays fixed
            </text>
          </svg>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <div className="border-l-2 border-muted/50 py-1 pl-2">
          <div className="text-[10px] tracking-wide text-muted uppercase">base angle q·k</div>
          <div className="mt-0.5 text-base font-medium tabular-nums">{((Math.abs(baseAngle) * 180) / Math.PI).toFixed(1)}°</div>
        </div>
        <div className="border-l-2 border-accent-yellow py-1 pl-2">
          <div className="text-[10px] tracking-wide text-muted uppercase">rotated angle</div>
          <div className="mt-0.5 text-base font-medium text-accent-yellow tabular-nums">{((Math.abs(rotAngle) * 180) / Math.PI).toFixed(1)}°</div>
        </div>
        <div className="border-l-2 border-accent-red py-1 pl-2">
          <div className="text-[10px] tracking-wide text-muted uppercase">difference = k·θ_d</div>
          <div className="mt-0.5 text-base font-medium text-accent-red tabular-nums">{((diffAngle * 180) / Math.PI).toFixed(1)}°</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
        <label htmlFor="yarn-rel-n">n</label>
        <input id="yarn-rel-n" type="range" min={0} max={60} value={n} onChange={(e) => setN(Number(e.target.value))} className="min-w-20 flex-1 accent-foreground" />
        <span className="w-11 text-right text-xs tabular-nums">n = {n}</span>
        <label htmlFor="yarn-rel-k">k</label>
        <input id="yarn-rel-k" type="range" min={0} max={30} value={k} onChange={(e) => setK(Number(e.target.value))} className="min-w-20 flex-1 accent-foreground" />
        <span className="w-11 text-right text-xs tabular-nums">k = {k}</span>
        <label htmlFor="yarn-rel-d">d</label>
        <input id="yarn-rel-d" type="range" min={0} max={16} value={d} onChange={(e) => setD(Number(e.target.value))} className="min-w-20 flex-1 accent-foreground" />
        <span className="w-11 text-right text-xs tabular-nums">d = {d}</span>
      </div>
    </figure>
  );
}
