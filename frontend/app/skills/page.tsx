
"use client";

import { useState } from "react";
import { roleData } from "@/data/roleData";
import { skillData } from "@/data/skillData";
import type { SkillDemand } from "@/types/skill";
import SkillsChart from "@/components/SkillsChart";
import SkillsGapAnalysis from "@/components/SkillsGapAnalysis";

export default function SkillsPage() {
  const [selectedRoleId, setSelectedRoleId] =
    useState("all");

  // Aggregate skill counts across all roles
  const allSkills = skillData.flatMap(
    (role) => role.skills
  );

  const aggregatedSkills = Object.values(
    allSkills.reduce<Record<string, SkillDemand>>(
      (acc, item) => {
        if (!acc[item.skill]) {
          acc[item.skill] = {
            skill: item.skill,
            count: 0,
          };
        }

        acc[item.skill].count += item.count;
        return acc;
      },
      {}
    )
  );

  // Select data based on the chosen role
  const selectedSkills =
    selectedRoleId === "all"
      ? aggregatedSkills
      : skillData.find(
          (role) => role.roleId === selectedRoleId
        )?.skills ?? [];

  const sortedSkills = [...selectedSkills].sort(
    (a, b) => b.count - a.count
  );

  const topSkills = sortedSkills.slice(0, 10);

  const mostDemandedSkill = topSkills[0]?.skill ?? "N/A";

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Skills Analytics
      </h1>

      <p className="mt-3 text-slate-600">
        Explore in-demand technical skills across IT roles.
      </p>

      {/* Role Filter */}
      <div className="mt-8">
        <label
          htmlFor="role-filter"
          className="mb-2 block font-semibold text-slate-900"
        >
          Job Role
        </label>

        <select
          id="role-filter"
          value={selectedRoleId}
          onChange={(e) =>
            setSelectedRoleId(e.target.value)
          }
          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
        >
          <option value="all">All Roles</option>

          {roleData.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Skills Tracked
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {sortedSkills.length}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Most Mentioned Skill
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {mostDemandedSkill}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-8">
        <SkillsChart data={topSkills} />
      </div>

      {/* Skills Gap Analysis */}
      {selectedRoleId !== "all" && (
        <SkillsGapAnalysis
          key={selectedRoleId}
          roleName={
            roleData.find((role) => role.id === selectedRoleId)
              ?.name ?? "Unknown Role"
          }
          skills={sortedSkills}
        />
      )}
      
      <p className="mt-4 text-xs text-slate-500">
        Demo data — not actual job market statistics.
      </p>
    </main>
  );
}
