
"use client";

import { useState } from "react";
import { roleData } from "@/data/roleData";
import type { Role } from "@/types/role";

import RoleCityChart from "@/components/RoleCityChart";

export default function RolesPage() {
  const [search, setSearch] = useState("");
  const [selectedRoleId, setSelectedRoleId] =
    useState("frontend-developer");

  const filteredRoles = roleData.filter((role) =>
    role.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedRole: Role =
    roleData.find((role) => role.id === selectedRoleId) ??
    roleData[0];

  const cityEntries = Object.entries(
    selectedRole.jobPostingsByCity
  );

  const totalJobs = cityEntries.reduce(
    (sum, [, count]) => sum + count,
    0
  );

  const topCity = cityEntries.reduce((highest, current) =>
    current[1] > highest[1] ? current : highest
  )[0];

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Explore IT Roles
      </h1>

      <p className="mt-3 text-slate-600">
        Explore job demand across different IT roles.
      </p>

      {/* Search */}
      <input
        type="text"
        placeholder="Search roles..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-8 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
      />

      {/* Role Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.map((role) => {
          const total = Object.values(
            role.jobPostingsByCity
          ).reduce((sum, count) => sum + count, 0);

          const isSelected = role.id === selectedRoleId;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(role.id)}
              aria-pressed={isSelected}
              className={`rounded-xl border p-5 text-left transition hover:shadow-md ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {role.name}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {role.description}
              </p>

              <p className="mt-4 font-semibold text-blue-600">
                {total.toLocaleString("en-AU")} postings
              </p>
            </button>
          );
        })}
      </div>

      {filteredRoles.length === 0 && (
        <p className="mt-4 text-slate-500">
          No roles found.
        </p>
      )}

      {/* Selected Role Details */}
      <section className="mt-10 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">
          {selectedRole.name}
        </h2>

        <p className="mt-2 text-slate-600">
          {selectedRole.description}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Job Postings
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {totalJobs.toLocaleString("en-AU")}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Top Location
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {topCity}
            </p>
          </div>
        </div>

        {/* City Distribution Chart */}
        <RoleCityChart data={selectedRole.jobPostingsByCity} />
        
        {/* Skills */}
        <h3 className="mt-8 text-lg font-semibold text-slate-900">
          Example Skills
        </h3>

        <div className="mt-4 flex flex-wrap gap-3">
          {selectedRole.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      <p className="mt-4 text-xs text-slate-500">
        Demo data — not actual job market statistics.
      </p>
    </main>
  );
}
