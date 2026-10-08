
"use client";

import { useState } from "react";
import { roleData } from "@/data/roleData";
import RoleComparisonChart from "@/components/RoleComparisonChart";
import type { Role } from "@/types/role";

function getTotalJobs(role: Role) {
  return Object.values(role.jobPostingsByCity).reduce(
    (sum, count) => sum + count,
    0
  );
}

export default function ComparePage() {
  const [roleAId, setRoleAId] =
    useState("frontend-developer");

  const [roleBId, setRoleBId] =
    useState("data-analyst");

  const roleA = roleData.find(
    (role) => role.id === roleAId
  )!;

  const roleB = roleData.find(
    (role) => role.id === roleBId
  )!;

  const totalA = getTotalJobs(roleA);
  const totalB = getTotalJobs(roleB);

  function handleRoleAChange(newId: string) {
    if (newId === roleBId) {
      setRoleBId(roleAId);
    }
    setRoleAId(newId);
  }

  function handleRoleBChange(newId: string) {
    if (newId === roleAId) {
      setRoleAId(roleBId);
    }
    setRoleBId(newId);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Compare IT Roles
      </h1>

      <p className="mt-3 text-slate-600">
        Compare job demand and skills across Australian cities.
      </p>

      {/* Role Selectors */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="role-a"
            className="mb-2 block font-semibold text-slate-900"
          >
            Role A
          </label>

          <select
            id="role-a"
            value={roleAId}
            onChange={(e) =>
              handleRoleAChange(e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
          >
            {roleData.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="role-b"
            className="mb-2 block font-semibold text-slate-900"
          >
            Role B
          </label>

          <select
            id="role-b"
            value={roleBId}
            onChange={(e) =>
              handleRoleBChange(e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
          >
            {roleData.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {[roleA, roleB].map((role) => (
          <div
            key={role.id}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {role.name}
            </p>

            <p className="mt-3 text-3xl font-bold text-blue-600">
              {getTotalJobs(role).toLocaleString("en-AU")}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Job Postings
            </p>
          </div>
        ))}
      </div>

      {/* Comparison Summary */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">
          Comparison Summary
        </h2>

        <p className="mt-2 text-slate-600">
          {totalA === totalB
            ? "Both roles have the same number of demo job postings."
            : `${
                totalA > totalB ? roleA.name : roleB.name
              } has ${Math.abs(totalA - totalB).toLocaleString(
                "en-AU"
              )} more demo job postings across the three cities.`}
        </p>
      </div>

      {/* Comparison Chart */}
      <RoleComparisonChart
        roleA={roleA}
        roleB={roleB}
      />

      {/* Skills Comparison */}
      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">
          Example Skills Comparison
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {[roleA, roleB].map((role) => (
            <div key={role.id}>
              <h3 className="mb-4 font-semibold text-slate-900">
                {role.name}
              </h3>

              <div className="flex flex-wrap gap-2">
                {role.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-4 text-xs text-slate-500">
        Demo data — not actual job market statistics.
      </p>
    </main>
  );
}
