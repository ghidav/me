"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { svgPoint } from "@/components/mdx/viz-utils";

// Sinusoidal positional encodings: a D×N heatmap of the PE matrix plus the
// PE vector at the scrubbed position p. Ported from a standalone widget.

const DISK_CX = 80;
const DISK_CY = 80;
const DISK_R = 62;
const N = 96; // number of positions displayed

type Stop = { t: number; r: number; g: number; b: number };

const LIGHT_STOPS: Stop[] = [
  { t: 0.0, r: 25, g: 130, b: 196 }, // accent-blue
  { t: 0.5, r: 244, g: 244, b: 244 }, // paper
  { t: 1.0, r: 255, g: 89, b: 94 }, // accent-red
];
const DARK_STOPS: Stop[] = [
  { t: 0.0, r: 85, g: 168, b: 224 },
  { t: 0.5, r: 32, g: 32, b: 32 },
  { t: 1.0, r: 255, g: 123, b: 128 },
];

function colorFor(v: number, stops: Stop[]): [number, number, number] {
  const t = (v + 1) / 2;
  let a = stops[0];
  let b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t <= stops[i + 1].t) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const lt = (t - a.t) / (b.t - a.t || 1);
  return [
    Math.round(a.r + (b.r - a.r) * lt),
    Math.round(a.g + (b.g - a.g) * lt),
    Math.round(a.b + (b.b - a.b) * lt),
  ];
}

function peValue(p: number, d: number, D: number) {
  const pair = Math.floor(d / 2);
  const angle = p / Math.pow(10000, (2 * pair) / D);
  return d % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
}

export function YarnSinusoidalPe() {
  const [D, setD] = useState(64);
  const [pos, setPos] = useState(28);
  const diskRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingRef = useRef(false);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = D;
    canvas.height = N;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(D, N);
    const stops = dark ? DARK_STOPS : LIGHT_STOPS;
    for (let p = 0; p < N; p++) {
      for (let d = 0; d < D; d++) {
        const [r, g, b] = colorFor(peValue(p, d, D), stops);
        const idx = (p * D + d) * 4;
        img.data[idx] = r;
        img.data[idx + 1] = g;
        img.data[idx + 2] = b;
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [D, dark]);

  function setPosFromPointer(sx: number, sy: number) {
    let frac = (Math.atan2(sy - DISK_CY, sx - DISK_CX) + Math.PI / 2) / (2 * Math.PI);
    if (frac < 0) frac += 1;
    if (frac >= 1) frac -= 1;
    setPos(Math.round(frac * (N - 1)));
  }

  function onPointerDown(e: React.PointerEvent) {
    draggingRef.current = true;
    try {
      diskRef.current?.setPointerCapture(e.pointerId);
    } catch {}
    const p = svgPoint(diskRef.current!, e, 160);
    setPosFromPointer(p.sx, p.sy);
    e.preventDefault();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const p = svgPoint(diskRef.current!, e, 160);
    setPosFromPointer(p.sx, p.sy);
    e.preventDefault();
  }

  // --- dial geometry ---
  const frac = pos / (N - 1);
  const ang = -Math.PI / 2 + frac * 2 * Math.PI;
  const sx = DISK_CX + Math.cos(ang) * DISK_R;
  const sy = DISK_CY + Math.sin(ang) * DISK_R;
  const ticks: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < N; i += Math.floor(N / 12)) {
    const a = -Math.PI / 2 + (i / (N - 1)) * 2 * Math.PI;
    ticks.push({
      x1: DISK_CX + Math.cos(a) * (DISK_R - 3),
      y1: DISK_CY + Math.sin(a) * (DISK_R - 3),
      x2: DISK_CX + Math.cos(a) * (DISK_R + 2),
      y2: DISK_CY + Math.sin(a) * (DISK_R + 2),
    });
  }

  // --- overlay geometry ---
  const rowY = (pos / N) * 200;
  const rowH = Math.max(200 / N, 2);

  // --- PE vector curve ---
  const vals: number[] = [];
  for (let d = 0; d < D; d++) vals.push(peValue(pos, d, D));
  const cW = 480;
  const cH = 110;
  const padL = 28;
  const padR = 8;
  const padT = 18;
  const padB = 20;
  const plotW = cW - padL - padR;
  const plotH = cH - padT - padB;
  const xOf = (d: number) => padL + (d / (D - 1)) * plotW;
  const yOf = (v: number) => padT + (1 - (v + 1) / 2) * plotH;
  let curvePath = "";
  vals.forEach((v, d) => {
    curvePath += (d === 0 ? "M" : "L") + xOf(d).toFixed(2) + " " + yOf(v).toFixed(2) + " ";
  });

  return (
    <figure className="my-6 rounded-lg border border-border p-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="w-32 shrink-0">
          <svg
            ref={diskRef}
            viewBox="0 0 160 160"
            className="block w-full touch-none select-none"
            role="img"
            aria-label="Token position on a cyclic dial"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (draggingRef.current = false)}
            onPointerCancel={() => (draggingRef.current = false)}
          >
            <circle cx={DISK_CX} cy={DISK_CY} r={DISK_R} fill="none" stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
            {ticks.map((t, i) => (
              <line key={i} x1={t.x1.toFixed(2)} y1={t.y1.toFixed(2)} x2={t.x2.toFixed(2)} y2={t.y2.toFixed(2)} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="0.8" />
            ))}
            <line x1={DISK_CX} y1={DISK_CY} x2={sx.toFixed(2)} y2={sy.toFixed(2)} stroke="var(--accent-purple)" strokeWidth="1.5" />
            <circle cx={sx.toFixed(2)} cy={sy.toFixed(2)} r="9" fill="var(--accent-purple)" className="cursor-grab active:cursor-grabbing" />
            <text x={DISK_CX} y={DISK_CY + 4} fontSize="14" fontWeight="500" fill="var(--foreground)" textAnchor="middle" style={{ pointerEvents: "none" }}>
              {pos}
            </text>
          </svg>
          <p className="mt-1 text-center text-xs leading-4 text-muted">
            Current position p
            <br />
            Drag to scrub
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative" style={{ aspectRatio: "480 / 200" }}>
            <canvas ref={canvasRef} className="block h-full w-full" style={{ imageRendering: "pixelated" }} />
            <svg viewBox="0 0 480 200" className="pointer-events-none absolute inset-0 h-full w-full">
              <rect x="0" y={rowY.toFixed(2)} width="480" height={rowH.toFixed(2)} fill="none" stroke="var(--accent-red)" strokeWidth="1.5" />
              <text x="4" y="12" fontSize="10" fill="var(--muted)">
                position 0
              </text>
              <text x="4" y="195" fontSize="10" fill="var(--muted)">
                position {N - 1}
              </text>
              <text x="476" y="12" fontSize="10" fill="var(--muted)" textAnchor="end">
                low d · high freq
              </text>
              <text x="476" y="195" fontSize="10" fill="var(--muted)" textAnchor="end">
                high d · low freq
              </text>
              <text x="476" y={Math.max(rowY + 10, 24).toFixed(2)} fontSize="10" fill="var(--accent-red)" textAnchor="end" fontWeight="500">
                p = {pos}
              </text>
            </svg>
          </div>
          <svg viewBox={`0 0 ${cW} ${cH}`} className="mt-1 block w-full">
            <text x={padL} y="12" fontSize="11" fill="var(--muted)" fontWeight="500">
              PE vector at position p = {pos}
            </text>
            <line x1={padL} y1={(padT + plotH / 2).toFixed(2)} x2={padL + plotW} y2={(padT + plotH / 2).toFixed(2)} stroke="var(--border)" strokeWidth="0.8" strokeDasharray="2 3" />
            {vals.map((v, d) => (
              <line
                key={d}
                x1={xOf(d).toFixed(2)}
                y1={(padT + plotH / 2).toFixed(2)}
                x2={xOf(d).toFixed(2)}
                y2={yOf(v).toFixed(2)}
                stroke={v >= 0 ? "var(--accent-purple)" : "var(--accent-blue)"}
                strokeWidth="1.4"
                opacity="0.9"
              />
            ))}
            <path d={curvePath} fill="none" stroke="var(--muted)" strokeWidth="0.7" opacity="0.55" />
            <line x1={padL} y1={(padT + plotH).toFixed(2)} x2={padL + plotW} y2={(padT + plotH).toFixed(2)} stroke="var(--muted)" strokeOpacity="0.5" strokeWidth="1" />
            <text x={padL} y={cH - 4} fontSize="10" fill="var(--muted)">
              d = 0
            </text>
            <text x={padL + plotW} y={cH - 4} fontSize="10" fill="var(--muted)" textAnchor="end">
              d = {D - 1}
            </text>
            <text x={padL + plotW / 2} y={cH - 4} fontSize="10" fill="var(--muted)" textAnchor="middle">
              embedding dimension
            </text>
            <text x={padL - 4} y={padT + 4} fontSize="9" fill="var(--muted)" textAnchor="end">
              +1
            </text>
            <text x={padL - 4} y={padT + plotH} fontSize="9" fill="var(--muted)" textAnchor="end">
              −1
            </text>
          </svg>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
        <label htmlFor="yarn-pe-d">embedding dim D</label>
        <input
          id="yarn-pe-d"
          type="range"
          min={16}
          max={128}
          step={4}
          value={D}
          onChange={(e) => setD(Number(e.target.value))}
          className="min-w-30 flex-1 accent-foreground"
        />
        <span className="w-16 text-right text-xs tabular-nums">D = {D}</span>
      </div>
    </figure>
  );
}
