
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import RoleComparisonChart from "@/components/RoleComparisonChart";

import type {
  RolesListResponse,
  RoleDetailResponse,
} from "@/types/roles-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000";

async function fetchApi<T>(
  endpoint: string,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    signal,
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export default function ComparePage() {
  const [rolesData, setRolesData] =
    useState<RolesListResponse | null>(null);

  const [roleAName, setRoleAName] = useState("");
  const [roleBName, setRoleBName] = useState("");

  const [roleA, setRoleA] =
    useState<RoleDetailResponse | null>(null);

  const [roleB, setRoleB] =
    useState<RoleDetailResponse | null>(null);

  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [rolesError, setRolesError] = useState("");
  const [detailsError, setDetailsError] = useState("");

  const [retryCount, setRetryCount] = useState(0);

  // Load available roles.
  useEffect(() => {
    const controller = new AbortController();

    async function loadRoles() {
      setLoadingRoles(true);
      setRolesError("");

      try {
        const data = await fetchApi<RolesListResponse>(
          "/api/roles",
          controller.signal
        );

        if (controller.signal.aborted) return;

        setRolesData(data);

        const names = data.roles.map((item) => item.role);

        setRoleAName((current) =>
          names.includes(current)
            ? current
            : names.includes("Frontend Developer")
              ? "Frontend Developer"
              : names[0] ?? ""
        );

        setRoleBName((current) =>
          names.includes(current)
            ? current
            : names.includes("IT Support")
              ? "IT Support"
              : names[1] ?? ""
        );
      } catch (error) {
        if (controller.signal.aborted) return;

        setRolesError(
          error instanceof Error
            ? error.message
            : "Unable to load roles."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingRoles(false);
        }
      }
    }

    void loadRoles();

    return () => controller.abort();
  }, [retryCount]);

  // Load details whenever either role changes.
  useEffect(() => {
    if (!roleAName || !roleBName || roleAName === roleBName) {
      setRoleA(null);
      setRoleB(null);
      return;
    }

    const controller = new AbortController();

    async function loadDetails() {
      setLoadingDetails(true);
      setDetailsError("");
      setRoleA(null);
      setRoleB(null);

      try {
        const [dataA, dataB] = await Promise.all([
          fetchApi<RoleDetailResponse>(
            `/api/roles/${encodeURIComponent(roleAName)}`,
            controller.signal
          ),
          fetchApi<RoleDetailResponse>(
            `/api/roles/${encodeURIComponent(roleBName)}`,
            controller.signal
          ),
        ]);

        if (controller.signal.aborted) return;

        setRoleA(dataA);
        setRoleB(dataB);
      } catch (error) {
        if (controller.signal.aborted) return;

        setDetailsError(
          error instanceof Error
            ? error.message
            : "Unable to load role details."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingDetails(false);
        }
      }
    }

    void loadDetails();

    return () => controller.abort();
  }, [roleAName, roleBName, retryCount]);

  const roleNames = rolesData?.roles.map((item) => item.role) ?? [];

  const handleRoleAChange = useCallback(
    (newName: string) => {
      if (newName === roleBName) {
        setRoleBName(roleAName);
      }
      setRoleAName(newName);
    },
    [roleAName, roleBName]
  );

  const handleRoleBChange = useCallback(
    (newName: string) => {
      if (newName === roleAName) {
        setRoleAName(roleBName);
      }
      setRoleBName(newName);
    },
    [roleAName, roleBName]
  );

  const skillsComparison = useMemo(() => {
    if (!roleA || !roleB) return null;

    const skillsA = new Set(
      roleA.top_skills.map((item) => item.skill)
    );

    const skillsB = new Set(
      roleB.top_skills.map((item) => item.skill)
    );

    return {
      shared: [...skillsA].filter((skill) => skillsB.has(skill)),
      onlyA: [...skillsA].filter((skill) => !skillsB.has(skill)),
      onlyB: [...skillsB].filter((skill) => !skillsA.has(skill)),
    };
  }, [roleA, roleB]);

  const retry = () => setRetryCount((count) => count + 1);

  const ready =
    roleA !== null &&
    roleB !== null &&
    !loadingDetails &&
    !detailsError;

  const totalJobs = rolesData?.total_jobs ?? 0;

  const percentage = (count: number) =>
    totalJobs > 0
      ? ((count / totalJobs) * 100).toFixed(1)
      : "0.0";

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Compare IT Roles
        </h1>

        <p className="mt-3 text-slate-600">
          Compare job postings, locations and detected skills
          in our Australian technology job advertisement sample.
        </p>

        <p className="mt-3 text-sm font-medium text-blue-700">
          Sample Data
        </p>

        {loadingRoles && (
          <p className="mt-8 text-slate-600">
            Loading available roles...
          </p>
        )}

        {rolesError && (
          <div
            role="alert"
            className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700"
          >
            <p>{rolesError}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loadingRoles && !rolesError && roleNames.length < 2 && (
          <p className="mt-8 text-slate-600">
            At least two roles are required for comparison.
          </p>
        )}

        {!loadingRoles && !rolesError && roleNames.length >= 2 && (
          <>
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
                  value={roleAName}
                  onChange={(event) =>
                    handleRoleAChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
                >
                  {roleNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
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
                  value={roleBName}
                  onChange={(event) =>
                    handleRoleBChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
                >
                  {roleNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingDetails && (
              <p className="mt-8 text-slate-600">
                Loading comparison data...
              </p>
            )}

            {detailsError && (
              <div
                role="alert"
                className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700"
              >
                <p>{detailsError}</p>
                <button
                  type="button"
                  onClick={retry}
                  className="mt-3 underline"
                >
                  Retry
                </button>
              </div>
            )}

            {ready && (
              <>
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {[roleA, roleB].map((role) => (
                    <div
                      key={role.role}
                      className="rounded-xl bg-white p-6 shadow-sm"
                    >
                      <p className="text-sm text-slate-500">
                        {role.role}
                      </p>

                      <p className="mt-3 text-3xl font-bold text-blue-600">
                        {role.total_jobs.toLocaleString("en-AU")}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Job Postings · {percentage(role.total_jobs)}%
                        of sample
                      </p>
                    </div>
                  ))}
                </div>

                <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                  <h2 className="font-semibold text-slate-900">
                    Comparison Summary
                  </h2>

                  <p className="mt-2 text-slate-600">
                    {roleA.total_jobs === roleB.total_jobs
                      ? "Both roles have the same number of job postings in this sample."
                      : `${
                          roleA.total_jobs > roleB.total_jobs
                            ? roleA.role
                            : roleB.role
                        } has ${Math.abs(
                          roleA.total_jobs - roleB.total_jobs
                        )} more job postings in this sample.`}
                  </p>
                </section>

                <RoleComparisonChart
                  roleA={roleA}
                  roleB={roleB}
                />

                <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="mb-2 text-xl font-semibold text-slate-900">
                    Detected Skills Comparison
                  </h2>

                  <p className="mb-6 text-sm text-slate-500">
                    Skill mentions extracted from job titles and
                    available description snippets.
                  </p>

                  <div className="grid gap-6 md:grid-cols-2">
                    {[roleA, roleB].map((role) => (
                      <div key={role.role}>
                        <h3 className="mb-4 font-semibold text-slate-900">
                          {role.role}
                        </h3>

                        {role.top_skills.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            No skills detected in this sample.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {role.top_skills.map((item) => (
                              <span
                                key={item.skill}
                                className="rounded-full bg-blue-100 px-3 py-2 text-sm text-blue-700"
                              >
                                {item.skill} · {item.count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {skillsComparison && (
                  <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-xl font-semibold text-slate-900">
                      Shared & Unique Detected Skills
                    </h2>

                    {[
                      {
                        title: "Shared Skills",
                        items: skillsComparison.shared,
                      },
                      {
                        title: `${roleA.role} Only`,
                        items: skillsComparison.onlyA,
                      },
                      {
                        title: `${roleB.role} Only`,
                        items: skillsComparison.onlyB,
                      },
                    ].map((group) => (
                      <div key={group.title} className="mb-5">
                        <h3 className="mb-2 font-medium text-slate-800">
                          {group.title}
                        </h3>

                        <p className="text-sm text-slate-600">
                          {group.items.length > 0
                            ? group.items.join(", ")
                            : "None detected"}
                        </p>
                      </div>
                    ))}

                    <p className="text-xs text-slate-500">
                      Unique means detected in only one of the
                      selected roles within this sample.
                    </p>
                  </section>
                )}
              </>
            )}
          </>
        )}

        <p className="mt-8 text-xs text-slate-500">
          Sample dataset only. Results are not representative
          of the entire Australian technology job market.
          Salary comparison is unavailable due to insufficient
          reliable salary data.
        </p>
      </div>
    </main>
  );
}
