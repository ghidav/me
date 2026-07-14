"use client";

import { useState } from "react";

// Interactive figure for the TriAttention post: pre-RoPE, Q and K vectors
// cluster tightly around fixed directions (high mean resultant length R);
// post-RoPE, the position-dependent rotation smears them across the circle.
// Ported from a standalone SVG widget; the seeded RNG keeps the scatter
// deterministic (and identical between server and client render).

const CX = 130;
const CY = 130;
const R = 100;
// Q concentrated near the upper-Im axis, K near the Re axis — mirrors the
// pre-RoPE panel in the TriAttention paper.
const Q_BASE = { ang: (Math.PI / 2) * 0.95, rad: 0.72, noiseA: 0.18, noiseR: 0.1 };
const K_BASE = { ang: 0.04, rad: 0.55, noiseA: 0.22, noiseR: 0.12 };
const OMEGA = 0.19; // per-position rotation from RoPE

type Pt = { x: number; y: number; mag: number };

function seededRand(seed: number) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function sampleCluster(base: typeof Q_BASE, n: number, seedOffset: number) {
  const pre: Pt[] = [];
  const post: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const nA = (seededRand(i * 7 + seedOffset * 131 + 11) - 0.5) * base.noiseA;
    const nR = (seededRand(i * 13 + seedOffset * 233 + 29) - 0.5) * base.noiseR;
    const ang = base.ang + nA;
    const mag = base.rad + nR;
    pre.push({ x: mag * Math.cos(ang), y: mag * Math.sin(ang), mag });
    const rot = ang + OMEGA * i;
    post.push({ x: mag * Math.cos(rot), y: mag * Math.sin(rot), mag });
  }
  return { pre, post };
}

function meanOf(points: Pt[]) {
  let sx = 0;
  let sy = 0;
  let sm = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
    sm += p.mag;
  }
  const mx = sx / points.length;
  const my = sy / points.length;
  const r = Math.sqrt(mx * mx + my * my) / (sm / points.length);
  return { mx, my, r };
}

function Panel({ q, k }: { q: Pt[]; k: Pt[] }) {
  const qm = meanOf(q);
  const km = meanOf(k);
  return (
    <svg viewBox="0 0 260 260" className="block w-full" role="img" aria-label="Q and K scatter on the unit disk">
      <line x1={CX} y1={CY - R - 6} x2={CX} y2={CY + R + 6} stroke="var(--border)" strokeWidth="1" />
      <line x1={CX - R - 6} y1={CY} x2={CX + R + 6} y2={CY} stroke="var(--border)" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
      <text x={CX + R + 6} y={CY + 4} fontSize="10" fill="var(--muted)">
        Re
      </text>
      <text x={CX - 4} y={CY - R - 4} fontSize="10" fill="var(--muted)" textAnchor="end">
        Im
      </text>
      {k.map((p, i) => (
        <circle key={`k${i}`} cx={(CX + p.x * R).toFixed(2)} cy={(CY - p.y * R).toFixed(2)} r="2.4" fill="var(--accent-yellow)" opacity="0.55" />
      ))}
      {q.map((p, i) => (
        <circle key={`q${i}`} cx={(CX + p.x * R).toFixed(2)} cy={(CY - p.y * R).toFixed(2)} r="2.4" fill="var(--accent-purple)" opacity="0.55" />
      ))}
      <line x1={CX} y1={CY} x2={(CX + km.mx * R).toFixed(2)} y2={(CY - km.my * R).toFixed(2)} stroke="var(--foreground)" strokeWidth="2" />
      <circle cx={(CX + km.mx * R).toFixed(2)} cy={(CY - km.my * R).toFixed(2)} r="3.5" fill="var(--foreground)" />
      <line x1={CX} y1={CY} x2={(CX + qm.mx * R).toFixed(2)} y2={(CY - qm.my * R).toFixed(2)} stroke="var(--foreground)" strokeWidth="2" />
      <circle cx={(CX + qm.mx * R).toFixed(2)} cy={(CY - qm.my * R).toFixed(2)} r="3.5" fill="var(--foreground)" />
    </svg>
  );
}

function PanelHead({ title, rq, rk }: { title: string; rq: number; rk: number }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2 border-b border-border pb-1">
      <span className="text-xs font-medium">{title}</span>
      <span className="flex gap-2.5 text-[11px] tabular-nums text-muted">
        <span style={{ color: "var(--accent-purple)" }}>
          R<sub>Q</sub>=<span className="ml-0.5 font-medium text-foreground">{rq.toFixed(2)}</span>
        </span>
        <span style={{ color: "var(--accent-yellow)" }}>
          R<sub>K</sub>=<span className="ml-0.5 font-medium text-foreground">{rk.toFixed(2)}</span>
        </span>
      </span>
    </div>
  );
}

export function TriattConcentration() {
  const [seqLen, setSeqLen] = useState(80);

  const qPts = sampleCluster(Q_BASE, seqLen, 1);
  const kPts = sampleCluster(K_BASE, seqLen, 2);

  return (
    <figure className="my-6 rounded-lg border border-border p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <PanelHead title="Pre-RoPE" rq={meanOf(qPts.pre).r} rk={meanOf(kPts.pre).r} />
          <Panel q={qPts.pre} k={kPts.pre} />
        </div>
        <div>
          <PanelHead title="Post-RoPE" rq={meanOf(qPts.post).r} rk={meanOf(kPts.post).r} />
          <Panel q={qPts.post} k={kPts.post} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
        <label htmlFor="triatt-seqlen">Sequence length</label>
        <input
          id="triatt-seqlen"
          type="range"
          min={10}
          max={300}
          step={1}
          value={seqLen}
          onChange={(e) => setSeqLen(Number(e.target.value))}
          className="min-w-30 flex-1 accent-foreground"
        />
        <span className="w-20 text-right text-xs tabular-nums">{seqLen} tokens</span>
      </div>
      <div className="mt-2 flex justify-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full" style={{ background: "var(--accent-purple)" }} />
          Q
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full" style={{ background: "var(--accent-yellow)" }} />
          K
        </span>
      </div>
    </figure>
  );
}
