"use client";

import { useState } from "react";

// RoPE context-extension methods compared: how each reshapes θ'(d) across
// dimensions (left) and the cumulative rotation at a chosen dim d* as a
// function of position (right). Toggle methods via the legend pills.

const D = 64;
const B = 10000;
const theta = (d: number) => Math.pow(B, (-2 * d) / D);

type MethodKey = "PI" | "NTK" | "PARTS" | "DYN";

const METHODS: { key: MethodKey; label: string; color: string }[] = [
  { key: "PI", label: "Position Interpolation", color: "var(--accent-blue)" },
  { key: "NTK", label: "NTK-aware", color: "var(--accent-purple)" },
  { key: "PARTS", label: "NTK-by-parts", color: "var(--accent-red)" },
  { key: "DYN", label: "Dynamic NTK", color: "var(--accent-green)" },
];

function thetaPrime(method: MethodKey, d: number, L: number, Lstar: number, nq: number): number {
  const s = L / Lstar;
  switch (method) {
    case "PI":
      return s * theta(d);
    case "NTK": {
      const bNew = B * Math.pow(1 / s, D / (D - 2));
      return Math.pow(bNew, (-2 * d) / D);
    }
    case "PARTS": {
      const lam = (2 * Math.PI) / theta(d);
      const lamLo = L / 32;
      const lamHi = L;
      if (lam < lamLo) return theta(d);
      if (lam > lamHi) return s * theta(d);
      const t = (lam - lamLo) / (lamHi - lamLo);
      return theta(d) * (1 - t + t * s);
    }
    case "DYN": {
      if (nq <= L) return theta(d);
      const sDyn = L / nq;
      const bNew = B * Math.pow(1 / sDyn, D / (D - 2));
      return Math.pow(bNew, (-2 * d) / D);
    }
  }
}

const SUPS: Record<number, string> = { 0: "⁰", [-1]: "⁻¹", [-2]: "⁻²", [-3]: "⁻³" };

export function YarnRopeExtensions() {
  const [L, setL] = useState(2048);
  const [LstarRaw, setLstarRaw] = useState(8192);
  const [dstar, setDstar] = useState(6);
  const [nqRaw, setNqRaw] = useState(6000);
  const [active, setActive] = useState<Record<MethodKey, boolean>>({
    PI: true,
    NTK: true,
    PARTS: true,
    DYN: true,
  });

  const Lstar = Math.max(LstarRaw, L + 256);
  const nq = Math.max(L, Math.min(nqRaw, Lstar));

  // ---- plot 1: θ'(d) vs d (log y) ----
  const p1L = 32;
  const p1R = 230;
  const p1T = 28;
  const p1B = 188;
  const dMax = D / 2 - 1;
  const logThetaMin = Math.log10(theta(dMax));
  const logThetaMax = Math.log10(theta(0));
  const xDimOf = (d: number) => p1L + (d / dMax) * (p1R - p1L);
  const yThOf = (v: number) =>
    p1T + (1 - (Math.log10(Math.max(v, 1e-6)) - logThetaMin) / (logThetaMax - logThetaMin)) * (p1B - p1T);

  const pathOf = (fn: (d: number) => number) => {
    let path = "";
    for (let d = 0; d <= dMax; d++) {
      path += (d === 0 ? "M" : "L") + xDimOf(d).toFixed(2) + " " + yThOf(fn(d)).toFixed(2) + " ";
    }
    return path;
  };

  // ---- plot 2: cumulative rotation at d* vs n ----
  const p2L = 272;
  const p2R = 468;
  const p2T = 28;
  const p2B = 188;
  const nSteps = 120;
  const ns = Array.from({ length: nSteps + 1 }, (_, i) => (i / nSteps) * Lstar);

  const baselineSeries = ns.map((n) => n * theta(dstar));
  const methodSeries: Record<MethodKey, number[]> = {
    PI: [],
    NTK: [],
    PARTS: [],
    DYN: [],
  };
  METHODS.forEach((m) => {
    methodSeries[m.key] = ns.map((n) => {
      if (m.key === "DYN") {
        // Dynamic NTK's θ' depends on the current position itself
        if (n <= L) return n * theta(dstar);
        const sDyn = L / n;
        const bNew = B * Math.pow(1 / sDyn, D / (D - 2));
        return n * Math.pow(bNew, (-2 * dstar) / D);
      }
      return n * thetaPrime(m.key, dstar, L, Lstar, nq);
    });
  });

  const yMax2 = Math.max(baselineSeries[nSteps], ...METHODS.map((m) => methodSeries[m.key][nSteps]));
  const xPosOf = (n: number) => p2L + (n / Lstar) * (p2R - p2L);
  const yRotOf = (v: number) => p2T + (1 - v / yMax2) * (p2B - p2T);

  const seriesPath = (series: number[]) => {
    let path = "";
    series.forEach((v, i) => {
      path += (i === 0 ? "M" : "L") + xPosOf(ns[i]).toFixed(2) + " " + yRotOf(v).toFixed(2) + " ";
    });
    return path;
  };

  const posLabel = (nv: number) => (nv >= 1000 ? `${(nv / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${nv}`);

  return (
    <figure className="my-6 rounded-lg border border-border p-4">
      <svg viewBox="0 0 480 230" className="block w-full" role="img" aria-label="Four extension methods compared">
        {/* plot 1 */}
        <text x={p1L} y="18" fontSize="11" fill="var(--muted)" fontWeight="500">
          θ&apos;(d) across dimensions (log y)
        </text>
        <line x1={p1L} y1={p1B} x2={p1R} y2={p1B} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
        <line x1={p1L} y1={p1T} x2={p1L} y2={p1B} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
        {[0, -1, -2, -3].map((p) => (
          <g key={p}>
            <line x1={p1L - 3} y1={yThOf(Math.pow(10, p)).toFixed(2)} x2={p1L} y2={yThOf(Math.pow(10, p)).toFixed(2)} stroke="var(--border)" strokeWidth="0.8" />
            <text x={p1L - 5} y={(yThOf(Math.pow(10, p)) + 3).toFixed(2)} fontSize="9" fill="var(--muted)" textAnchor="end" className="tabular-nums">
              10{SUPS[p]}
            </text>
          </g>
        ))}
        {[0, 8, 16, 24, 31].map((d) => (
          <g key={d}>
            <line x1={xDimOf(d).toFixed(2)} y1={p1B} x2={xDimOf(d).toFixed(2)} y2={p1B + 3} stroke="var(--border)" strokeWidth="0.8" />
            <text x={xDimOf(d).toFixed(2)} y={p1B + 14} fontSize="9" fill="var(--muted)" textAnchor="middle" className="tabular-nums">
              {d}
            </text>
          </g>
        ))}
        <text x={(p1L + p1R) / 2} y={p1B + 26} fontSize="10" fill="var(--muted)" textAnchor="middle">
          d
        </text>
        <path d={pathOf((d) => theta(d))} fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeDasharray="3 3" opacity="0.8" />
        {METHODS.filter((m) => active[m.key]).map((m) => (
          <path key={m.key} d={pathOf((d) => thetaPrime(m.key, d, L, Lstar, nq))} fill="none" stroke={m.color} strokeWidth="1.7" opacity="0.9" />
        ))}
        <line x1={xDimOf(dstar).toFixed(2)} y1={p1T} x2={xDimOf(dstar).toFixed(2)} y2={p1B} stroke="var(--accent-red)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.7" />
        <text x={(xDimOf(dstar) + 3).toFixed(2)} y={p1T + 10} fontSize="9" fill="var(--accent-red)" fontWeight="500">
          d*={dstar}
        </text>
        <text x={p1L + 2} y={p1T + 12} fontSize="9.5" fill="var(--muted)" className="tabular-nums">
          s = L/L* = {(L / Lstar).toFixed(3)}
        </text>

        {/* plot 2 */}
        <text x={p2L} y="18" fontSize="11" fill="var(--muted)" fontWeight="500">
          rotation at d* = {dstar} vs position n
        </text>
        <line x1={p2L} y1={p2B} x2={p2R} y2={p2B} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
        <line x1={p2L} y1={p2T} x2={p2L} y2={p2B} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
        <line x1={xPosOf(L).toFixed(2)} y1={p2T} x2={xPosOf(L).toFixed(2)} y2={p2B} stroke="var(--accent-red)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
        <text x={xPosOf(L).toFixed(2)} y={p2T - 3} fontSize="9" fill="var(--accent-red)" textAnchor="middle" fontWeight="500">
          L
        </text>
        {[0, L / 2, L, Lstar].map((nv, i) =>
          nv > Lstar ? null : (
            <g key={i}>
              <line x1={xPosOf(nv).toFixed(2)} y1={p2B} x2={xPosOf(nv).toFixed(2)} y2={p2B + 3} stroke="var(--border)" strokeWidth="0.8" />
              <text x={xPosOf(nv).toFixed(2)} y={p2B + 14} fontSize="9" fill="var(--muted)" textAnchor="middle" className="tabular-nums">
                {posLabel(nv)}
              </text>
            </g>
          ),
        )}
        <text x={(p2L + p2R) / 2} y={p2B + 26} fontSize="10" fill="var(--muted)" textAnchor="middle">
          position n
        </text>
        <text x={p2L + 2} y={p2T + 12} fontSize="9.5" fill="var(--muted)">
          n · θ&apos; (rad)
        </text>
        <path d={seriesPath(baselineSeries)} fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeDasharray="3 3" opacity="0.8" />
        {METHODS.filter((m) => active[m.key]).map((m) => (
          <path key={m.key} d={seriesPath(methodSeries[m.key])} fill="none" stroke={m.color} strokeWidth="1.7" opacity="0.9" />
        ))}
        {active.DYN && (
          <g>
            <line x1={xPosOf(nq).toFixed(2)} y1={p2T} x2={xPosOf(nq).toFixed(2)} y2={p2B} stroke="var(--accent-green)" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.5" />
            <text x={xPosOf(nq).toFixed(2)} y={p2T - 3} fontSize="8.5" fill="var(--accent-green)" textAnchor="middle">
              n_q
            </text>
          </g>
        )}
      </svg>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted">
          <span className="inline-block size-2 rounded-full" style={{ background: "var(--muted)" }} />
          baseline (at L)
        </span>
        {METHODS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setActive((a) => ({ ...a, [m.key]: !a[m.key] }))}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
              active[m.key]
                ? "border-muted/60 text-foreground"
                : "border-border text-muted opacity-45"
            }`}
          >
            <span className="inline-block size-2 rounded-full" style={{ background: m.color }} />
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 text-sm text-muted sm:grid-cols-[auto_1fr_auto_auto_1fr_auto]">
        <label htmlFor="yarn-ext-L">L</label>
        <input id="yarn-ext-L" type="range" min={512} max={4096} step={128} value={L} onChange={(e) => setL(Number(e.target.value))} className="min-w-20 accent-foreground" />
        <span className="text-right text-xs tabular-nums">{L}</span>
        <label htmlFor="yarn-ext-Lstar">L*</label>
        <input id="yarn-ext-Lstar" type="range" min={1024} max={32768} step={256} value={Lstar} onChange={(e) => setLstarRaw(Number(e.target.value))} className="min-w-20 accent-foreground" />
        <span className="text-right text-xs tabular-nums">{Lstar}</span>
        <label htmlFor="yarn-ext-dstar">dim d*</label>
        <input id="yarn-ext-dstar" type="range" min={0} max={24} value={dstar} onChange={(e) => setDstar(Number(e.target.value))} className="min-w-20 accent-foreground" />
        <span className="text-right text-xs tabular-nums">{dstar}</span>
        <label htmlFor="yarn-ext-nq">n_q (for Dyn)</label>
        <input id="yarn-ext-nq" type="range" min={L} max={Lstar} step={128} value={nq} onChange={(e) => setNqRaw(Number(e.target.value))} className="min-w-20 accent-foreground" />
        <span className="text-right text-xs tabular-nums">{nq}</span>
      </div>
    </figure>
  );
}
