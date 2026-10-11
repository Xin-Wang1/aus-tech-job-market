
"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getOverview, getRoles } from "../lib/api";

import type {
  OverviewResponse,
  RoleCount,
} from "../types/api";


type DashboardData = {
  overview: OverviewResponse;
  roles: RoleCount[];
};


export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const [overview, rolesResponse] = await Promise.all([
          getOverview(),
          getRoles(),
        ]);

        if (!cancelled) {
          setData({
            overview,
            roles: rolesResponse.data,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard data."
          );
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [retryKey]);


  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-6 md:p-10">
        <h1 className="mb-6 text-3xl font-bold">
          Australian Tech Job Market
        </h1>
        <p role="status" className="text-gray-500">
          Loading job market data...
        </p>
      </main>
    );
  }


  if (error || !data) {
    return (
      <main className="mx-auto max-w-6xl p-6 md:p-10">
        <h1 className="mb-6 text-3xl font-bold">
          Australian Tech Job Market
        </h1>

        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-6"
        >
          <h2 className="font-semibold text-red-700">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error ?? "No data returned."}
          </p>

          <button
            onClick={() => setRetryKey((value) => value + 1)}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }


  const { overview, roles } = data;

  const salaryCoverage =
    overview.total_jobs > 0
      ? (
          (overview.usable_salary_jobs /
            overview.total_jobs) *
          100
        ).toFixed(1)
      : "0.0";

  const chartData = roles.map((role) => ({
    role: role.role_category,
    jobs: role.job_count,
  }));

  const cards = [
    {
      label: "Total Jobs",
      value: overview.total_jobs,
      description: "Sample job postings",
    },
    {
      label: "Cities",
      value: overview.total_cities,
      description: "Known Australian cities",
    },
    {
      label: "Detected Skills",
      value: overview.total_skills,
      description: "Unique extracted skills",
    },
    {
      label: "Salary Coverage",
      value: `${salaryCoverage}%`,
      description: "Jobs with usable salary data",
    },
  ];


  return (
    <main className="mx-auto max-w-6xl p-6 md:p-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Australian Tech Job Market
        </h1>

        <p className="mt-2 text-gray-500">
          Explore Australian technology job postings
          using data from our PostgreSQL database.
        </p>

        <span className="mt-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Sample Data · {overview.source}
        </span>
      </div>


      {/* Summary cards */}
      <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-gray-500">
              {card.label}
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {card.value}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              {card.description}
            </p>
          </div>
        ))}
      </section>


      {/* Role distribution */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Job Distribution by Role
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Number of job postings in each classified role.
        </p>

        {chartData.length === 0 ? (
          <p className="mt-6 text-gray-500">
            No role data available.
          </p>
        ) : (
          <div className="mt-6 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="role"
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 11 }}
                />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="jobs"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>


      {/* Data quality */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Data Quality & Coverage
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Unknown City
            </p>

            <p className="mt-2 text-2xl font-bold">
              {overview.unknown_city_jobs}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Postings without a recognised city
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Usable Salary Records
            </p>

            <p className="mt-2 text-2xl font-bold">
              {overview.usable_salary_jobs}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Records suitable for salary analysis
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-gray-500">
          This dashboard currently uses a small sample
          of job postings collected through the Adzuna API.
          The results should not be interpreted as
          representative of the entire Australian job market.
          Skills are extracted using rule-based matching,
          and salary coverage is currently insufficient
          for reliable salary analysis.
        </p>
      </section>
    </main>
  );
}
