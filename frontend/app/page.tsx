
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

import { getOverview } from "../lib/api";

import type { OverviewResponse } from "../types/api";


type DashboardData = {
  overview: OverviewResponse;
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
        const overview = await getOverview();

        if (!cancelled) {
          setData({ overview });
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


  const { overview } = data;

  const salaryCoverage = overview.salary_coverage_percentage.toFixed(1);

  const chartData = (overview.role_distribution ?? []).map((item) => ({
    role: item.role,
    jobs: item.count,
  }));

  const cityData = (overview.city_distribution ?? []).map((item) => ({
    city: item.city,
    jobs: item.count,
  }));

  const skillsData = (overview.top_skills ?? []).slice(0, 10).map((item) => ({
    skill: item.skill,
    jobs: item.count,
  }));

  const skillCoverage = overview.skill_coverage_percentage ?? 0;

  const cards = [
    {
      label: "Total Jobs",
      value: overview.total_jobs,
      description: "Sample job postings",
    },
    {
      label: "Cities",
      value: overview.known_cities,
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
          Sample Data · {overview.data_type}
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


      {/* City and skill charts */}
      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Job Distribution by City
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Includes postings with an unknown city.
          </p>
          {cityData.length === 0 ? (
            <p className="mt-6 text-gray-500">No city data available.</p>
          ) : (
            <div className="mt-6 h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cityData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="city"
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="jobs" fill="#0891b2" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Top Detected Skills
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Job postings mentioning each detected skill.
          </p>
          {skillsData.length === 0 ? (
            <p className="mt-6 text-gray-500">No skill data available.</p>
          ) : (
            <div className="mt-6 h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={skillsData}
                  layout="vertical"
                  margin={{ top: 10, right: 15, left: 15, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    width={95}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="jobs" fill="#7c3aed" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* Data quality */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Data Quality & Coverage
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Skill Coverage</p>
            <p className="mt-2 text-2xl font-bold">
              {skillCoverage.toFixed(1)}%
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${Math.max(0, Math.min(100, skillCoverage))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Jobs with at least one detected skill
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Salary Coverage</p>
            <p className="mt-2 text-2xl font-bold">
              {salaryCoverage}%
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${Math.max(0, Math.min(100, overview.salary_coverage_percentage))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Jobs with usable salary information
            </p>
          </div>
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
              {Math.round(
                (overview.salary_coverage_percentage / 100) *
                  overview.total_jobs
              )}
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
