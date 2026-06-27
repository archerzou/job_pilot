"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const axisStyle = { fill: "var(--color-chart-axis)", fontSize: 12 };
const gridProps = { vertical: false, stroke: "var(--color-border)", strokeDasharray: "4 4" };
const tooltipStyle = { borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12, boxShadow: "var(--shadow-card)" };

type Props = {
  data: Array<{ day: string; jobs: number }>;
};

export function JobsOverTimeChart({ data }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-base font-semibold leading-6 text-text-primary">
        Jobs Found Over Time
      </h2>
      <div className="mt-4 h-55">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--color-accent)", strokeWidth: 1 }} />
            <Area type="monotone" dataKey="jobs" stroke="var(--color-accent)" strokeWidth={3} fill="url(#jobsGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
