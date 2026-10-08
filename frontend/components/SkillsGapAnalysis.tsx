
"use client";

import { useState } from "react";
import type { SkillDemand } from "@/types/skill";

type Props = {
  roleName: string;
  skills: SkillDemand[];
};

export default function SkillsGapAnalysis({
  roleName,
  skills,
}: Props) {
  // Store the skills selected by the user
  const [userSkills, setUserSkills] = useState<string[]>([]);

  // Extract the skills required by the selected role
  const requiredSkills = skills.map((item) => item.skill);

  // Find matched skills
  const matchedSkills = requiredSkills.filter((skill) =>
    userSkills.includes(skill)
  );

  // Find missing skills
  const missingSkills = requiredSkills.filter(
    (skill) => !userSkills.includes(skill)
  );

  // Calculate skill coverage percentage
  const coverage =
    requiredSkills.length > 0
      ? Math.round(
          (matchedSkills.length / requiredSkills.length) * 100
        )
      : 0;

  // Handle checkbox changes
  function toggleSkill(skill: string) {
    setUserSkills((previous) =>
      previous.includes(skill)
        ? previous.filter((item) => item !== skill)
        : [...previous, skill]
    );
  }

  return (
    <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">
        Skills Gap Analysis
      </h2>

      <p className="mt-2 text-slate-600">
        Select the skills you already have to identify
        areas for improvement.
      </p>

      {/* Target Role */}
      <div className="mt-6 rounded-lg bg-slate-50 p-4">
        <p className="text-sm text-slate-500">
          Target Role
        </p>

        <p className="mt-1 font-semibold text-slate-900">
          {roleName}
        </p>
      </div>

      {/* Skill Selection */}
      <h3 className="mt-8 text-lg font-semibold text-slate-900">
        Select Your Current Skills
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {requiredSkills.map((skill) => (
          <label
            key={skill}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={userSkills.includes(skill)}
              onChange={() => toggleSkill(skill)}
              className="h-4 w-4 accent-blue-600"
            />

            <span className="text-slate-700">
              {skill}
            </span>
          </label>
        ))}
      </div>

      {/* Skill Coverage */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Skill Coverage
          </h3>

          <span className="text-2xl font-bold text-blue-600">
            {coverage}%
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          {matchedSkills.length} of {requiredSkills.length} skills covered
        </p>

        <div
          role="progressbar"
          aria-label="Skill coverage"
          aria-valuenow={coverage}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${coverage}%` }}
          />
        </div>
      </div>

      {/* Matched and Missing Skills */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-green-50 p-5">
          <h3 className="font-semibold text-green-800">
            Matched Skills ({matchedSkills.length})
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {matchedSkills.length > 0 ? (
              matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-green-100 px-3 py-2 text-sm text-green-800"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-green-700">
                No matched skills yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-amber-50 p-5">
          <h3 className="font-semibold text-amber-800">
            Missing Skills ({missingSkills.length})
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-amber-100 px-3 py-2 text-sm text-amber-800"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-green-700">
                All listed skills covered!
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-500">
        Skill coverage is based on the demo skill list,
        not an actual recruitment match score.
      </p>
    </section>
  );
}
