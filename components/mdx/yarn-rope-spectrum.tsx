"use client";

import { useState } from "react";
import { Arrow } from "@/components/mdx/viz-utils";

// RoPE frequency spectrum: six dimension pairs spinning at θ_d, plus the
// θ(d) curve on a log scale. Low dims race, high dims barely move.

const D_TOT = 64;
const DIMS = [0, 2, 4, 8, 16, 32];

export function YarnRopeSpectrum() {
  const [n, setN] = useState(20);

  const slotW = 480 / DIMS.length;
  const dialR = 28;
  const dialCY = 60;

  const sepY = 142;
  const curveTop = 162;
  const curveBot = 292;
  const plotL = 36;
  const plotR = 460;
  const plotW = plotR - plotL;
  const plotH = curveBot - curveTop;

  const dMax = D_TOT / 2 - 1;
  const logThetaAt = (d: number) => Math.log10(Math.pow(10000, (-2 * d) / D_TOT));
  const yMin = logThetaAt(dMax);
  const yMax = logThetaAt(0);
  const yOf = (logt: number) => curveTop + (1 - (logt - yMin) / (yMax - yMin)) * plotH;
  const xOf = (dv: number) => plotL + (dv / dMax) * plotW;

  let curvePath = "";
  for (let dv = 0; dv <= dMax; dv++) {
    curvePath += (dv === 0 ? "M" : "L") + xOf(dv).toFixed(2) + " " + yOf(logThetaAt(dv)).toFixed(2) + " ";
  }

  const superscripts: Record<number, string> = { 0: "⁰", [-1]: "⁻¹", [-2]: "⁻²", [-3]: "⁻³" };

  return (
    <figure className="my-6 rounded-lg border border-border p-4">
      <svg viewBox="0 0 480 320" className="block w-full" role="img" aria-label="Six dials at different dimensions, rotating at different rates">
        <text x="6" y="14" fontSize="11" fill="var(--muted)" fontWeight="500">
          same n, different dims → different angular speeds
        </text>

        {DIMS.map((d, i) => {
          const cx = slotW * i + slotW / 2;
          const theta = Math.pow(10000, (-2 * d) / D_TOT);
          const angle = n * theta;
          const turns = angle / (2 * Math.PI);

          let trail: React.ReactNode;
          if (angle < 2 * Math.PI * 1.2) {
            const steps = 36;
            let p = "";
            for (let s = 0; s <= steps; s++) {
              const a = (s / steps) * angle;
              p += (s === 0 ? "M" : "L") + (cx + Math.cos(a) * dialR * 0.92).toFixed(2) + " " + (dialCY - Math.sin(a) * dialR * 0.92).toFixed(2) + " ";
            }
            trail = <path d={p} fill="none" stroke="var(--accent-yellow)" strokeWidth="1.2" opacity="0.55" />;
          } else {
            trail = <circle cx={cx.toFixed(2)} cy={dialCY} r={(dialR * 0.92).toFixed(2)} fill="none" stroke="var(--accent-yellow)" strokeWidth="1" opacity="0.35" />;
          }

          return (
            <g key={d}>
              <circle cx={cx.toFixed(2)} cy={dialCY} r={dialR} fill="none" stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="0.8" strokeDasharray="2 2" />
              <circle cx={cx.toFixed(2)} cy={dialCY} r="1.5" fill="var(--foreground)" />
              {trail}
              <Arrow x1={cx} y1={dialCY} x2={cx + Math.cos(angle) * dialR} y2={dialCY - Math.sin(angle) * dialR} color="var(--accent-purple)" width={1.6} head={5} />
              <text x={cx.toFixed(2)} y="105" fontSize="10.5" fill="var(--foreground)" textAnchor="middle" fontWeight="500">
                d = {d}
              </text>
              <text x={cx.toFixed(2)} y="118" fontSize="9.5" fill="var(--muted)" textAnchor="middle" className="tabular-nums">
                {turns.toFixed(2)} turns
              </text>
            </g>
          );
        })}

        <line x1="0" y1={sepY} x2="480" y2={sepY} stroke="var(--border)" strokeWidth="0.8" />

        <line x1={plotL} y1={curveBot} x2={plotR} y2={curveBot} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
        <line x1={plotL} y1={curveTop} x2={plotL} y2={curveBot} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
        {[0, -1, -2, -3].map((p) => (
          <g key={p}>
            <line x1={plotL - 3} y1={yOf(p).toFixed(2)} x2={plotL} y2={yOf(p).toFixed(2)} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
            <text x={plotL - 5} y={(yOf(p) + 3).toFixed(2)} fontSize="9" fill="var(--muted)" textAnchor="end" className="tabular-nums">
              10{superscripts[p]}
            </text>
          </g>
        ))}

        <path d={curvePath} fill="none" stroke="var(--foreground)" strokeWidth="2" />

        {DIMS.map((d) => (
          <g key={d}>
            <line x1={xOf(d).toFixed(2)} y1={curveBot} x2={xOf(d).toFixed(2)} y2={curveBot + 3} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
            <circle cx={xOf(d).toFixed(2)} cy={yOf(logThetaAt(d)).toFixed(2)} r="2.5" fill="var(--accent-red)" />
            <text x={xOf(d).toFixed(2)} y={curveBot + 14} fontSize="9" fill="var(--muted)" textAnchor="middle" className="tabular-nums">
              {d}
            </text>
          </g>
        ))}
        <text x={(plotL + plotR) / 2} y={curveBot + 26} fontSize="10.5" fill="var(--muted)" textAnchor="middle">
          dimension d
        </text>
        <text x={plotL + 4} y={curveTop - 4} fontSize="11" fill="var(--muted)" fontWeight="500">
          θ_d = 10000^(−2d/D) (log scale)
        </text>
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
        <label htmlFor="yarn-spec-n">position n</label>
        <input id="yarn-spec-n" type="range" min={0} max={128} value={n} onChange={(e) => setN(Number(e.target.value))} className="min-w-30 flex-1 accent-foreground" />
        <span className="w-14 text-right text-xs tabular-nums">n = {n}</span>
      </div>
    </figure>
  );
}
