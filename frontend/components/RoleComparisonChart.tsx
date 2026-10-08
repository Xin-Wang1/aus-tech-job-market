
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

import type { Role, City } from "@/types/role";

type Props = {
  roleA: Role;
  roleB: Role;
};

const cities: City[] = [
  "Melbourne",
  "Sydney",
  "Brisbane",
];

export default function RoleComparisonChart({
  roleA,
  roleB,
}: Props) {
  const chartData = cities.map((city) => ({
    city,
    roleA: roleA.jobPostingsByCity[city],
    roleB: roleB.jobPostingsByCity[city],
  }));

  return (
    <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">
        Job Demand by City
      </h2>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="city" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar
              dataKey="roleA"
              name={roleA.name}
              fill="#2563eb"
              radius={[5, 5, 0, 0]}
            />

            <Bar
              dataKey="roleB"
              name={roleB.name}
              fill="#10b981"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
