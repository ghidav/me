"use client";

import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";
import { useTheme } from "next-themes";
import type { Config, Data, Layout } from "plotly.js";

const PlotlyPlot = createPlotlyComponent(Plotly);

export type PlotProps = {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
};

export default function PlotlyChart({ data, layout, config }: PlotProps) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const foreground = dark ? "#ececec" : "#1b1b1b";
  const muted = dark ? "#9c9c9c" : "#6e6e6e";
  const grid = dark ? "#2c2c2c" : "#e4e4e4";

  return (
    <div className="my-6">
      <PlotlyPlot
        data={data}
        layout={{
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: {
            color: muted,
            family: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
            size: 12,
          },
          margin: { t: 24, r: 8, b: 48, l: 48 },
          colorway: dark
            ? ["#8ab4f8", "#f28b82", "#81c995", "#fdd663", "#d7aefb"]
            : ["#1a73e8", "#d93025", "#188038", "#e37400", "#9334e6"],
          legend: { font: { color: foreground } },
          ...layout,
          xaxis: { gridcolor: grid, zerolinecolor: grid, ...layout?.xaxis },
          yaxis: { gridcolor: grid, zerolinecolor: grid, ...layout?.yaxis },
        }}
        config={{ displayModeBar: false, responsive: true, ...config }}
        useResizeHandler
        style={{ width: "100%" }}
      />
    </div>
  );
}
