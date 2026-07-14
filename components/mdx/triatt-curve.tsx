"use client";

import { useRef, useState } from "react";

// Interactive figure for the TriAttention post: drag the q̄/k̄ centers on the
// unit disk and watch the trigonometric attention curve they induce over
// distance Δ. Ported from a standalone SVG widget; logic unchanged.

const CX = 110;
const CY = 110;
const R = 85;
const FREQS = [0.08, 0.24, 0.55];
const AMPS = [1.0, 0.75, 0.55];

type Vec = { x: number; y: number };

const PRESETS: Record<string, { q: Vec; k: Vec; label: string }> = {
  local: { q: { x: 0.8, y: 0.1 }, k: { x: 0.78, y: 0.08 }, label: "Local head" },
  sink: { q: { x: 0.7, y: 0.4 }, k: { x: -0.55, y: -0.35 }, label: "Attention sink" },
  multi: { q: { x: 0.3, y: 0.8 }, k: { x: 0.75, y: -0.3 }, label: "Multi-peak" },
};

function toScreen(u: Vec) {
  return { x: CX + u.x * R, y: CY - u.y * R };
}

function fromScreen(sx: number, sy: number): Vec {
  let x = (sx - CX) / R;
  let y = -(sy - CY) / R;
  const r = Math.sqrt(x * x + y * y);
  if (r > 0.9) {
    x *= 0.9 / r;
    y *= 0.9 / r;
  }
  if (r < 0.2) {
    const s = 0.2 / Math.max(r, 0.01);
    x *= s;
    y *= s;
  }
  return { x, y };
}

export function TriattCurve() {
  const [q, setQ] = useState<Vec>({ x: 0.72, y: 0.22 });
  const [k, setK] = useState<Vec>({ x: 0.6, y: -0.18 });
  const diskRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef<"q" | "k" | null>(null);

  function svgPoint(e: React.PointerEvent) {
    const svg = diskRef.current!;
    const rect = svg.getBoundingClientRect();
    return {
      sx: ((e.clientX - rect.left) * 220) / rect.width,
      sy: ((e.clientY - rect.top) * 220) / rect.height,
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    const p = svgPoint(e);
    const qs = toScreen(q);
    const ks = toScreen(k);
    const dq = Math.hypot(p.sx - qs.x, p.sy - qs.y);
    const dk = Math.hypot(p.sx - ks.x, p.sy - ks.y);
    if (dq < 18 && dq <= dk) draggingRef.current = "q";
    else if (dk < 18) draggingRef.current = "k";
    else return;
    try {
      diskRef.current?.setPointerCapture(e.pointerId);
    } catch {}
    e.preventDefault();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const p = svgPoint(e);
    const pt = fromScreen(p.sx, p.sy);
    if (draggingRef.current === "q") setQ(pt);
    else setK(pt);
    e.preventDefault();
  }

  function endDrag() {
    draggingRef.current = null;
  }

  // --- disk geometry ---
  const qs = toScreen(q);
  const ks = toScreen(k);
  const aq = Math.atan2(q.y, q.x);
  const ak = Math.atan2(k.y, k.x);
  let phi = aq - ak;
  while (phi > Math.PI) phi -= 2 * Math.PI;
  while (phi < -Math.PI) phi += 2 * Math.PI;
  const angleDeg = Math.abs(Math.round((phi * 180) / Math.PI));

  const arcR = 24;
  let arcPath = "";
  for (let i = 0; i <= 40; i++) {
    const a = ak + phi * (i / 40);
    arcPath +=
      (i === 0 ? "M " : "L ") +
      (CX + arcR * Math.cos(a)).toFixed(2) +
      " " +
      (CY - arcR * Math.sin(a)).toFixed(2) +
      " ";
  }
  const midA = ak + phi / 2;
  const labelR = arcR + 16;
  const alx = CX + labelR * Math.cos(midA);
  const aly = CY - labelR * Math.sin(midA) + 3;

  // --- curve geometry ---
  const W = 480;
  const H = 220;
  const padL = 22;
  const padR2 = 18;
  const padT = 16;
  const padB = 24;
  const plotW = W - padL - padR2;
  const plotH = H - padT - padB;
  const maxD = 120;

  const qMag = Math.sqrt(q.x * q.x + q.y * q.y);
  const kMag = Math.sqrt(k.x * k.x + k.y * k.y);
  const pts: { d: number; y: number }[] = [];
  for (let i = 0; i < 240; i++) {
    const d = (i / 239) * maxD;
    let s = 0;
    for (let f = 0; f < FREQS.length; f++) {
      s += qMag * kMag * AMPS[f] * Math.cos(FREQS[f] * d + phi);
    }
    pts.push({ d, y: s });
  }
  let ymin = Math.min(...pts.map((p) => p.y));
  let ymax = Math.max(...pts.map((p) => p.y));
  if (ymax - ymin < 0.1) {
    ymin -= 0.5;
    ymax += 0.5;
  }
  const pad = (ymax - ymin) * 0.12;
  ymin -= pad;
  ymax += pad;
  const sx = (d: number) => padL + (d / maxD) * plotW;
  const sy = (y: number) => padT + (1 - (y - ymin) / (ymax - ymin)) * plotH;

  let curvePath = "";
  pts.forEach((p, i) => {
    curvePath += (i === 0 ? "M" : "L") + sx(p.d).toFixed(2) + " " + sy(p.y).toFixed(2) + " ";
  });

  let pi = 0;
  for (let i = 1; i < pts.length; i++) if (pts[i].y > pts[pi].y) pi = i;
  const pk = pts[pi];
  const pkX = sx(pk.d);
  const pkY = sy(pk.y);
  const peakLabelRight = pkX + 8 < padL + plotW - 40;

  return (
    <figure className="my-6 rounded-lg border border-border p-4">
      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[180px_1fr]">
        <div className="mx-auto w-full max-w-55 sm:max-w-none">
          <svg
            ref={diskRef}
            viewBox="0 0 220 220"
            className="block w-full touch-none select-none"
            role="img"
            aria-label="Q and K centers on the unit disk"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <line x1={CX} y1={CY - R - 6} x2={CX} y2={CY + R + 6} stroke="var(--border)" strokeWidth="1" />
            <line x1={CX - R - 6} y1={CY} x2={CX + R + 6} y2={CY} stroke="var(--border)" strokeWidth="1" />
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
            <path d={arcPath} fill="none" stroke="var(--muted)" strokeWidth="1.2" strokeDasharray="3 2" />
            <text x={alx.toFixed(2)} y={aly.toFixed(2)} fontSize="11" fontWeight="500" fill="var(--muted)" textAnchor="middle" style={{ pointerEvents: "none" }}>
              {angleDeg}°
            </text>
            <line x1={CX} y1={CY} x2={qs.x.toFixed(2)} y2={qs.y.toFixed(2)} stroke="var(--accent-purple)" strokeWidth="1.5" />
            <line x1={CX} y1={CY} x2={ks.x.toFixed(2)} y2={ks.y.toFixed(2)} stroke="var(--accent-yellow)" strokeWidth="1.5" />
            <circle cx={qs.x.toFixed(2)} cy={qs.y.toFixed(2)} r="9" fill="var(--accent-purple)" className="cursor-grab active:cursor-grabbing" />
            <circle cx={ks.x.toFixed(2)} cy={ks.y.toFixed(2)} r="9" fill="var(--accent-yellow)" className="cursor-grab active:cursor-grabbing" />
            <text x={(qs.x + 13).toFixed(2)} y={(qs.y - 4).toFixed(2)} fontSize="12" fontWeight="500" fill="var(--accent-purple)" style={{ pointerEvents: "none" }}>
              q̄
            </text>
            <text x={(ks.x + 10).toFixed(2)} y={(ks.y + 16).toFixed(2)} fontSize="12" fontWeight="500" fill="var(--accent-yellow)" style={{ pointerEvents: "none" }}>
              k̄
            </text>
          </svg>
          <p className="mt-1 text-center text-xs text-muted">
            Q and K centers · drag to reshape
          </p>
        </div>
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Attention logit versus Q-K distance">
            {ymin < 0 && ymax > 0 && (
              <line x1={padL} y1={sy(0)} x2={padL + plotW} y2={sy(0)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
            )}
            <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
            <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
            {[0, 30, 60, 90, 120].map((d) => (
              <g key={d}>
                <line x1={sx(d)} y1={padT + plotH} x2={sx(d)} y2={padT + plotH + 3} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
                <text x={sx(d)} y={padT + plotH + 15} fontSize="10" textAnchor="middle" fill="var(--muted)">
                  {d}
                </text>
              </g>
            ))}
            <path d={curvePath} fill="none" stroke="var(--foreground)" strokeWidth="2.2" strokeLinejoin="round" />
            <line x1={pkX} y1={pkY} x2={pkX} y2={padT + plotH} stroke="var(--accent-red)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
            <circle cx={pkX.toFixed(2)} cy={pkY.toFixed(2)} r="4" fill="var(--accent-red)" />
            <text
              x={(peakLabelRight ? pkX + 8 : pkX - 8).toFixed(2)}
              y={(pkY - 6).toFixed(2)}
              fontSize="11"
              fontWeight="500"
              fill="var(--accent-red)"
              textAnchor={peakLabelRight ? "start" : "end"}
            >
              Δ = {Math.round(pk.d)}
            </text>
          </svg>
          <p className="mt-1 text-center text-xs text-muted">
            Attention logit vs Q–K distance Δ
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setQ({ ...preset.q });
              setK({ ...preset.k });
            }}
            className="cursor-pointer rounded-md border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent-blue hover:text-accent-blue"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </figure>
  );
}
