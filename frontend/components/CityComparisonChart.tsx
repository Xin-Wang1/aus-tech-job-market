
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

import type { LocationData } from "@/types/location";

type Props = {
  data: LocationData[];
  selectedCity: string;
};

export default function CityComparisonChart({
  data,
  selectedCity,
}: Props) {
  const chartData = data.map((item) => ({
    city: item.city,
    jobs: item.jobPostings,
  }));

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">
        Total Job Postings by City
      </h2>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="city" />
            <YAxis />

            <Tooltip />

            <Bar
              dataKey="jobs"
              name="Job Postings"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Selected city: {selectedCity}
      </p>
    </div>
  );
}
