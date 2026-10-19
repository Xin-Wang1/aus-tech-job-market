
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import type { RoleDetailResponse } from "@/types/roles-api";

type Props = {
  roleA: RoleDetailResponse;
  roleB: RoleDetailResponse;
};

export default function RoleComparisonChart({
  roleA,
  roleB,
}: Props) {
  const cities = Array.from(
    new Set([
      ...roleA.city_distribution.map((item) => item.city),
      ...roleB.city_distribution.map((item) => item.city),
    ])
  ).sort((a, b) => {
    if (a === "Unknown") return 1;
    if (b === "Unknown") return -1;
    return a.localeCompare(b);
  });

  const chartData = cities.map((city) => ({
    city,
    roleA:
      roleA.city_distribution.find((item) => item.city === city)
        ?.count ?? 0,
    roleB:
      roleB.city_distribution.find((item) => item.city === city)
        ?.count ?? 0,
  }));

  return (
    <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-slate-900">
        Job Postings by City
      </h2>

      <p className="mb-6 text-sm text-slate-500">
        Distribution within the collected job advertisement sample.
      </p>

      {chartData.length === 0 ? (
        <p className="text-slate-500">
          No location data available.
        </p>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />

              <Bar
                dataKey="roleA"
                name={roleA.role}
                fill="#2563eb"
                radius={[5, 5, 0, 0]}
              />

              <Bar
                dataKey="roleB"
                name={roleB.role}
                fill="#10b981"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {cities.includes("Unknown") && (
        <p className="mt-4 text-xs text-slate-500">
          Unknown represents advertisements without a reliably
          identified city.
        </p>
      )}
    </section>
  );
}
