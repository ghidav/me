"use client";

import { useRef, useState } from "react";

// Interactive figure for the TriAttention post: every cached key is scored by
// reading the head's attention curve at its distance to the next query; the
// top-B survive, the rest are evicted. Ported from a standalone SVG widget.

const DISK_CX = 80;
const DISK_CY = 80;
const DISK_R = 62;
const FREQS = [0.08, 0.24, 0.55];
const AMPS = [1.0, 0.7, 0.45];
const N_KEYS = 16;
const KEY_DISTS = Array.from({ length: N_KEYS }, (_, i) => 96 - i * 6);

const W = 480;
const H = 340;
const padL = 28;
const padR = 44;
const queryX = W - padR;
const plotW = queryX - padL;
const maxDist = 100;
const curveTop = 22;
const curveBottom = 128;
const axisY = 146;
const barTop = 172;
const barBottom = 284;
const labelY = 300;

type Vec = { x: number; y: number };

function distToX(d: number) {
  return queryX - (d / maxDist) * plotW;
}

export function TriattScoring() {
  const [q, setQ] = useState<Vec>({ x: 0.8, y: -0.35 });
  const [budget, setBudget] = useState(6);
  const diskRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);

  function curveAt(d: number) {
    const qMag = Math.sqrt(q.x * q.x + q.y * q.y);
    const qPhase = Math.atan2(q.y, q.x);
    let v = 0;
    for (let f = 0; f < FREQS.length; f++) {
      v += qMag * 0.75 * AMPS[f] * Math.cos(FREQS[f] * d + qPhase);
    }
    return v;
  }

  function svgPoint(e: React.PointerEvent) {
    const rect = diskRef.current!.getBoundingClientRect();
    return {
      sx: ((e.clientX - rect.left) * 160) / rect.width,
      sy: ((e.clientY - rect.top) * 160) / rect.height,
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    const p = svgPoint(e);
    const qsx = DISK_CX + q.x * DISK_R;
    const qsy = DISK_CY - q.y * DISK_R;
    if (Math.hypot(p.sx - qsx, p.sy - qsy) < 20) {
      draggingRef.current = true;
      try {
        diskRef.current?.setPointerCapture(e.pointerId);
      } catch {}
      e.preventDefault();
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const p = svgPoint(e);
    let x = (p.sx - DISK_CX) / DISK_R;
    let y = -(p.sy - DISK_CY) / DISK_R;
    const r = Math.sqrt(x * x + y * y);
    if (r > 0.9) {
      x *= 0.9 / r;
      y *= 0.9 / r;
    }
    if (r < 0.25) {
      const s = 0.25 / Math.max(r, 0.01);
      x *= s;
      y *= s;
    }
    setQ({ x, y });
    e.preventDefault();
  }

  function endDrag() {
    draggingRef.current = false;
  }

  // --- geometry ---
  const qsx = DISK_CX + q.x * DISK_R;
  const qsy = DISK_CY - q.y * DISK_R;

  const curvePts: { d: number; v: number }[] = [];
  for (let i = 0; i <= 100; i++) curvePts.push({ d: i, v: curveAt(i) });
  const scores = KEY_DISTS.map((d, i) => ({ i, d, v: curveAt(d) }));
  const sorted = scores.slice().sort((a, b) => b.v - a.v);
  const threshold = sorted[budget - 1].v;
  const kept = new Set(sorted.slice(0, budget).map((s) => s.i));

  let cMin = Math.min(...curvePts.map((p) => p.v));
  let cMax = Math.max(...curvePts.map((p) => p.v));
  if (cMax - cMin < 0.1) {
    cMin = -1;
    cMax = 1;
  }
  const cRange = cMax - cMin;
  const curveY = (v: number) => curveBottom - ((v - cMin) / cRange) * (curveBottom - curveTop);
  const curveZeroY = cMin < 0 && cMax > 0 ? curveY(0) : null;
  const thresholdY = curveY(threshold);
  const barRange = barBottom - barTop;
  const barH = (v: number) => ((v - cMin) / cRange) * barRange;
  const barY = (v: number) => barBottom - barH(v);

  let curvePath = "";
  curvePts.forEach((p, i) => {
    curvePath += (i === 0 ? "M" : "L") + distToX(p.d).toFixed(2) + " " + curveY(p.v).toFixed(2) + " ";
  });

  return (
    <figure className="my-6 rounded-lg border border-border p-4">
      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_3fr]">
        <div className="mx-auto w-full max-w-40 sm:max-w-none">
          <svg
            ref={diskRef}
            viewBox="0 0 160 160"
            className="block w-full touch-none select-none"
            role="img"
            aria-label="Q center for this attention head"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <line x1={DISK_CX} y1={DISK_CY - DISK_R - 6} x2={DISK_CX} y2={DISK_CY + DISK_R + 6} stroke="var(--border)" strokeWidth="1" />
            <line x1={DISK_CX - DISK_R - 6} y1={DISK_CY} x2={DISK_CX + DISK_R + 6} y2={DISK_CY} stroke="var(--border)" strokeWidth="1" />
            <circle cx={DISK_CX} cy={DISK_CY} r={DISK_R} fill="none" stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
            <line x1={DISK_CX} y1={DISK_CY} x2={qsx.toFixed(2)} y2={qsy.toFixed(2)} stroke="var(--accent-purple)" strokeWidth="1.5" />
            <circle cx={qsx.toFixed(2)} cy={qsy.toFixed(2)} r="9" fill="var(--accent-purple)" className="cursor-grab active:cursor-grabbing" />
            <text x={(qsx + 12).toFixed(2)} y={(qsy - 4).toFixed(2)} fontSize="12" fontWeight="500" fill="var(--accent-purple)" style={{ pointerEvents: "none" }}>
              q̄
            </text>
          </svg>
          <p className="mt-1 text-center text-xs leading-4 text-muted">
            This head&apos;s Q center
            <br />
            Drag to switch heads
          </p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Key scoring visualization">
          <text x={padL} y={curveTop - 6} fontSize="11" fill="var(--muted)" fontWeight="500">
            Head&apos;s attention curve
          </text>
          <text x={queryX} y={curveTop - 6} fontSize="11" fill="var(--muted)" textAnchor="end">
            higher = more attention ↑
          </text>
          {curveZeroY !== null && (
            <line x1={padL} y1={curveZeroY} x2={queryX} y2={curveZeroY} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 3" />
          )}
          <line x1={padL} y1={thresholdY} x2={queryX} y2={thresholdY} stroke="var(--accent-red)" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.75" />
          <text x={queryX + 3} y={thresholdY + 3} fontSize="10" fill="var(--accent-green)" fontWeight="500">
            keep
          </text>
          <text x={queryX + 3} y={thresholdY + 15} fontSize="10" fill="var(--muted)">
            evict
          </text>
          <path d={curvePath} fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinejoin="round" />
          <line x1={padL} y1={axisY} x2={queryX} y2={axisY} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
          {[100, 75, 50, 25, 0].map((d) => (
            <g key={d}>
              <line x1={distToX(d)} y1={axisY} x2={distToX(d)} y2={axisY + 3} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
              <text x={distToX(d)} y={axisY + 14} fontSize="10" textAnchor="middle" fill="var(--muted)">
                {d}
              </text>
            </g>
          ))}
          <text x={(padL + queryX) / 2} y={axisY + 28} fontSize="11" textAnchor="middle" fill="var(--muted)">
            distance Δ from future query
          </text>
          <line x1={queryX} y1={curveTop - 2} x2={queryX} y2={labelY + 4} stroke="var(--accent-red)" strokeWidth="1" strokeDasharray="3 2" opacity="0.55" />
          <text x={queryX} y={labelY + 4} fontSize="11" textAnchor="middle" fill="var(--accent-red)" fontWeight="500">
            q
          </text>
          <line x1={padL} y1={barBottom} x2={queryX} y2={barBottom} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
          <line x1={padL} y1={barY(threshold)} x2={queryX} y2={barY(threshold)} stroke="var(--accent-red)" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.75" />
          {scores.map((s, idx) => {
            const x = distToX(s.d);
            const cy = curveY(s.v);
            const isKept = kept.has(s.i);
            const color = isKept ? "var(--accent-green)" : "var(--muted)";
            const op = isKept ? 1 : 0.42;
            return (
              <g key={s.i}>
                <line x1={x} y1={cy + 3} x2={x} y2={barY(s.v) - 2} stroke={color} strokeWidth="0.5" strokeDasharray="2 2" opacity={op * 0.55} />
                <circle cx={x.toFixed(2)} cy={cy.toFixed(2)} r="3" fill={color} opacity={op} />
                <rect x={(x - 7).toFixed(2)} y={barY(s.v).toFixed(2)} width="14" height={barH(s.v).toFixed(2)} rx="2" fill={color} opacity={op} />
                <text x={x.toFixed(2)} y={labelY} fontSize="10" textAnchor="middle" fill={isKept ? "var(--foreground)" : "var(--muted)"} fontWeight={isKept ? 600 : 400}>
                  k{idx + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
        <label htmlFor="triatt-budget">KV budget B</label>
        <input
          id="triatt-budget"
          type="range"
          min={1}
          max={15}
          step={1}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="min-w-30 flex-1 accent-foreground"
        />
        <span className="w-32 text-right text-xs tabular-nums">
          {budget} / {N_KEYS} keys retained
        </span>
      </div>
    </figure>
  );
}
