
"use client";

import { useState } from "react";
import JobTrendsChart from "@/components/JobTrendsChart";
import JobDistributionChart from "@/components/JobDistributionChart";
import { jobData, type Location } from "@/data/jobData";

export default function Home() {
  const [location, setLocation] = useState<Location>("Australia");

  const currentData = jobData[location];

  const kpis = [
    {
      title: "Job Postings",
      value: currentData.jobPostings.toLocaleString("en-AU"),
    },
    {
      title: "Median Salary",
      value: "$" + currentData.medianSalary.toLocaleString("en-AU"),
    },
    {
      title: "Companies",
      value: currentData.companies.toLocaleString("en-AU"),
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Australian Tech Job Market
          </h1>

          <p className="mt-3 text-slate-600">
            Explore technology job trends, salaries,
            and skills across Australia.
          </p>
        </div>

        {/* Location Filter */}
        <select
          value={location}
          onChange={(e) =>
            setLocation(e.target.value as Location)
          }
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900"
        >
          {(Object.keys(jobData) as Location[]).map((city) => (
            <option key={city} value={city}>
              {city === "Australia" ? "All Australia" : city}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {kpis.map((item) => (
          <div
            key={item.title}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {item.title}
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JobTrendsChart data={currentData.trends} />
        <JobDistributionChart data={currentData.roles} />
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Demo data — not actual job market statistics.
      </p>
    </main>
  );
}
