"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const axisStyle = { fill: "var(--color-chart-axis)", fontSize: 12 };
const gridProps = { vertical: false, stroke: "var(--color-border)", strokeDasharray: "4 4" };
const tooltipStyle = { borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12, boxShadow: "var(--shadow-card)" };

type Props = {
  data: Array<{ day: string; count: number }>;
};

export function CompanyResearchChart({ data }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-base font-semibold leading-6 text-text-primary">
        Company Research Activity
      </h2>
      <div className="mt-4 h-55">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-surface-secondary)" }} />
            <Bar dataKey="count" fill="var(--color-info)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
