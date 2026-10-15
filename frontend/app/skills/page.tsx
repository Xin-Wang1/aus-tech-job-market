"use client";

import { useEffect, useState } from "react";
import SkillsChart from "@/components/SkillsChart";
import SkillsGapAnalysis from "@/components/SkillsGapAnalysis";
import type { SkillDemand } from "@/types/skill";
import type {
  SkillsListResponse, SkillsByRoleResponse, SkillDetailResponse,
  RolesListResponse,
} from "@/types/skills-api";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

async function requestJSON<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(`API request failed (HTTP ${response.status})`);
  return (await response.json()) as T;
}

export default function SkillsPage() {
  const [role, setRole] = useState("all");
  const [roles, setRoles] = useState<string[]>([]);
  const [skills, setSkills] = useState<SkillDemand[]>([]);
  const [overview, setOverview] = useState<SkillsListResponse | null>(null);
  const [roleJobs, setRoleJobs] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [detail, setDetail] = useState<SkillDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    requestJSON<RolesListResponse>("/api/roles", controller.signal)
      .then((data) => setRoles(data.roles.map((item) => item.role)))
      .catch((err: unknown) => {
        if (!controller.signal.aborted) console.error("Could not load roles", err);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setSelectedSkill(null);
    setDetail(null);
    const path = role === "all"
      ? "/api/skills"
      : `/api/skills/by-role?role=${encodeURIComponent(role)}`;

    const load = async () => {
      try {
        if (role === "all") {
          const data = await requestJSON<SkillsListResponse>(path, controller.signal);
          if (controller.signal.aborted) return;
          setOverview(data);
          setRoleJobs(null);
          setSkills(data.skills.map((item) => ({ skill: item.skill, count: item.job_count })));
        } else {
          const data = await requestJSON<SkillsByRoleResponse>(path, controller.signal);
          if (controller.signal.aborted) return;
          setRoleJobs(data.total_jobs);
          setSkills(data.skills.map((item) => ({ skill: item.skill, count: item.job_count })));
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unable to load skills");
        setSkills([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [role, retryKey]);

  useEffect(() => {
    if (!selectedSkill) return;
    const controller = new AbortController();
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    requestJSON<SkillDetailResponse>(`/api/skills/${encodeURIComponent(selectedSkill)}`, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setDetail(data); })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setDetailError(err instanceof Error ? err.message : "Unable to load skill details");
      })
      .finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [selectedSkill]);

  const sortedSkills = [...skills].sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill));
  const topSkills = sortedSkills.slice(0, 10);
  const mostMentioned = topSkills[0]?.skill ?? "N/A";

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <h1 className="text-3xl font-bold">Skills Analytics</h1>
      <p className="mt-3 text-slate-600">Explore technical skills detected in our Australian IT job advertisement sample.</p>

      <div className="mt-8">
        <label htmlFor="role-filter" className="mb-2 block font-semibold">Job Role</label>
        <select id="role-filter" value={role} onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white p-3">
          <option value="all">All Roles</option>
          {roles.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </div>

      {loading && <p role="status" className="mt-8 text-slate-600">Loading skills...</p>}
      {error && <div role="alert" className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p>{error}</p><button type="button" className="mt-2 underline" onClick={() => setRetryKey((n) => n + 1)}>Retry</button>
      </div>}

      {!loading && !error && <>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Skills Tracked</p><p className="mt-2 text-3xl font-bold text-blue-600">{sortedSkills.length}</p></div>
          <div className="rounded-xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Most Mentioned Skill</p><p className="mt-2 text-3xl font-bold text-blue-600">{mostMentioned}</p></div>
          <div className="rounded-xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Jobs in Selection</p><p className="mt-2 text-3xl font-bold text-blue-600">{role === "all" ? overview?.total_jobs ?? "—" : roleJobs ?? "—"}</p></div>
          <div className="rounded-xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Overall Skill Detection Coverage</p><p className="mt-2 text-3xl font-bold text-blue-600">{overview ? `${overview.skill_coverage_percentage}%` : "—"}</p></div>
        </div>

        {sortedSkills.length === 0 ? <p className="mt-8 rounded-xl bg-white p-6">No skills detected for this selection.</p> : <>
          <div className="mt-8"><SkillsChart data={topSkills} /></div>
          <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Skill Details</h2>
            <p className="mt-2 text-sm text-slate-600">Select a skill to view its distribution by role and city.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {sortedSkills.map((item) => <button type="button" key={item.skill}
                onClick={() => setSelectedSkill(item.skill)}
                aria-pressed={selectedSkill === item.skill}
                className={`rounded-lg border px-3 py-2 text-sm ${selectedSkill === item.skill ? "border-blue-600 bg-blue-50 text-blue-800" : "border-slate-300 hover:bg-slate-50"}`}>
                {item.skill} ({item.count})
              </button>)}
            </div>
            {detailLoading && <p className="mt-4" role="status">Loading skill details...</p>}
            {detailError && <p role="alert" className="mt-4 text-red-700">{detailError}</p>}
            {detail && <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div><h3 className="font-semibold">{detail.skill}: Role Distribution</h3><p className="mt-1 text-sm text-slate-500">{detail.total_jobs} job advertisements</p>
                <ul className="mt-3 space-y-2">{detail.role_distribution.map((item) => <li key={item.role} className="flex justify-between border-b pb-2"><span>{item.role}</span><strong>{item.count}</strong></li>)}</ul>
              </div>
              <div><h3 className="font-semibold">City Distribution</h3><ul className="mt-3 space-y-2">{detail.city_distribution.map((item) => <li key={item.city} className="flex justify-between border-b pb-2"><span>{item.city}</span><strong>{item.count}</strong></li>)}</ul></div>
            </div>}
          </section>
        </>}

        {role !== "all" && sortedSkills.length > 0 && <SkillsGapAnalysis key={role} roleName={role} skills={sortedSkills} />}
        <p className="mt-6 text-xs text-slate-500">Sample dataset only. Skill detection is based on rule-based extraction from job titles and descriptions. These results are not representative of the Australian IT job market. A skill not detected in an advertisement is not necessarily absent from its requirements.</p>
      </>}
    </main>
  );
}
