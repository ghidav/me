"use client";

import dynamic from "next/dynamic";
import type { PlotProps } from "@/components/mdx/plotly-chart";

// Plotly needs `window` and is heavy — load it client-side only, and only on
// pages that render a <Plot />.
const PlotlyChart = dynamic(() => import("@/components/mdx/plotly-chart"), {
  ssr: false,
  loading: () => (
    <div className="my-6 flex h-90 items-center justify-center rounded-lg bg-surface text-sm text-muted">
      Loading plot…
    </div>
  ),
});

export function Plot(props: PlotProps) {
  return <PlotlyChart {...props} />;
}
