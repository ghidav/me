"use client";

import { useState } from "react";
import { motion } from "motion/react";

// Example interactive component for MDX posts: an SVG sine wave that redraws
// as you drag the frequency slider.
export function SineExplorer() {
  const [frequency, setFrequency] = useState(2);

  const width = 600;
  const height = 120;
  const midY = height / 2;
  const amplitude = 44;

  const points = Array.from({ length: 200 }, (_, i) => {
    const t = i / 199;
    const y = Math.sin(2 * Math.PI * frequency * t);
    return `${(t * width).toFixed(1)},${(midY - y * amplitude).toFixed(1)}`;
  }).join(" ");

  return (
    <figure className="my-6 rounded-lg border border-border p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={`Sine wave with frequency ${frequency.toFixed(1)}`}>
        <line
          x1="0"
          y1={midY}
          x2={width}
          y2={midY}
          stroke="var(--border)"
          strokeWidth="1"
        />
        <motion.polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </svg>
      <figcaption className="mt-3 flex items-center gap-3 text-sm text-muted">
        <label htmlFor="sine-frequency">frequency</label>
        <input
          id="sine-frequency"
          type="range"
          min={0.5}
          max={8}
          step={0.1}
          value={frequency}
          onChange={(e) => setFrequency(Number(e.target.value))}
          className="flex-1 accent-foreground"
        />
        <span className="w-12 text-right tabular-nums">
          {frequency.toFixed(1)} Hz
        </span>
      </figcaption>
    </figure>
  );
}
