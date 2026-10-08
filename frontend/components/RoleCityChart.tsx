
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { City } from "@/types/role";

type Props = {
  data: Record<City, number>;
};

export default function RoleCityChart({ data }: Props) {
  const chartData = Object.entries(data).map(
    ([city, jobs]) => ({
      city,
      jobs,
    })
  );

  return (
    <div className="mt-8">
      <h3 className="mb-6 text-lg font-semibold text-slate-900">
        Job Postings by City
      </h3>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="city" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="jobs"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
