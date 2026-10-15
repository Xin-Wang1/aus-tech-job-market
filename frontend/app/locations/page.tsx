"use client";

import { useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type {
  LocationsListResponse, LocationDetailResponse,
} from "@/types/locations-api";

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

async function fetchJSON<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    signal,
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Request failed: HTTP ${response.status}`);
  return (await response.json()) as T;
}

export default function LocationsPage() {
  const [list, setList] = useState<LocationsListResponse | null>(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [detail, setDetail] = useState<LocationDetailResponse | null>(null);
  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [listRetry, setListRetry] = useState(0);
  const [detailRetry, setDetailRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setListLoading(true);
      setListError("");
      try {
        const data = await fetchJSON<LocationsListResponse>("/api/locations", controller.signal);
        if (controller.signal.aborted) return;
        setList(data);
        setSelectedCity((current) => {
          if (data.locations.some((loc) => loc.city === current)) return current;
          return data.locations.find((loc) => loc.city !== "Unknown")?.city ?? data.locations[0]?.city ?? "";
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setListError(error instanceof Error ? error.message : "Unable to load locations");
        }
      } finally {
        if (!controller.signal.aborted) setListLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [listRetry]);

  useEffect(() => {
    if (!selectedCity) return;
    const controller = new AbortController();
    async function load() {
      setDetail(null);
      setDetailLoading(true);
      setDetailError("");
      try {
        const data = await fetchJSON<LocationDetailResponse>(
          `/api/locations/${encodeURIComponent(selectedCity)}`, controller.signal
        );
        if (!controller.signal.aborted) setDetail(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setDetailError(error instanceof Error ? error.message : "Unable to load city details");
        }
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [selectedCity, detailRetry]);

  const locations = list?.locations ?? [];
  const knownCities = locations.filter((loc) => loc.city !== "Unknown");
  const unknownCount = locations.find((loc) => loc.city === "Unknown")?.count ?? 0;
  const selectedSummary = locations.find((loc) => loc.city === selectedCity);
  const topRole = detail?.role_distribution[0]?.role ?? "Not available";

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <h1 className="text-3xl font-bold text-slate-900">Locations Analytics</h1>
      <p className="mt-3 text-slate-600">Explore job advertisements by city in our Australian technology jobs sample.</p>

      {listLoading && <p className="mt-8 text-slate-600" role="status">Loading locations...</p>}
      {listError && (
        <div role="alert" className="mt-8 rounded-xl bg-red-50 p-5 text-red-800">
          <p>Unable to load locations: {listError}</p>
          <button className="mt-3 rounded bg-red-700 px-4 py-2 text-white" onClick={() => setListRetry((n) => n + 1)}>Try Again</button>
        </div>
      )}

      {list && !listLoading && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Total Jobs", list.total_jobs.toLocaleString("en-AU")],
              ["Known Cities", String(knownCities.length)],
              ["Top Known City", knownCities[0]?.city ?? "N/A"],
              ["Unknown City Jobs", String(unknownCount)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-3 text-2xl font-bold text-blue-600">{value}</p>
              </div>
            ))}
          </div>

          <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">City Distribution</h2>
            <p className="mt-1 text-sm text-slate-500">Unknown is shown for data transparency, but is not a city.</p>
            <div className="mt-5 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locations} margin={{ top: 8, right: 10, left: -20, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="city" interval={0} angle={-15} textAnchor="end" height={55} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Job postings" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="mt-8">
            <label htmlFor="city-filter" className="mb-2 block font-semibold text-slate-900">Choose a City</label>
            <select id="city-filter" value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900">
              {locations.map((loc) => <option key={loc.city} value={loc.city}>{loc.city}</option>)}
            </select>
          </section>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">{selectedCity} Job Postings</p>
              <p className="mt-3 text-3xl font-bold text-blue-600">{selectedSummary?.count ?? 0}</p>
              <p className="mt-1 text-sm text-slate-500">{selectedSummary?.percentage ?? 0}% of sample</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Top Role</p>
              <p className="mt-3 text-2xl font-bold text-blue-600">{detailLoading ? "Loading..." : detailError ? "Unavailable" : topRole}</p>
            </div>
          </div>

          {detailLoading && <p className="mt-8 text-slate-600" role="status">Loading {selectedCity} details...</p>}
          {detailError && (
            <div role="alert" className="mt-8 rounded-xl bg-red-50 p-5 text-red-800">
              <p>Unable to load {selectedCity} details: {detailError}</p>
              <button className="mt-3 rounded bg-red-700 px-4 py-2 text-white" onClick={() => setDetailRetry((n) => n + 1)}>Try Again</button>
            </div>
          )}
          {detail && !detailLoading && !detailError && (
            <>
              <div className="mt-8 grid gap-6 xl:grid-cols-2">
                <section className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">Role Distribution — {detail.city}</h2>
                  <div className="mt-5 h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={detail.role_distribution} layout="vertical" margin={{ left: 38, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis type="category" dataKey="role" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="Job postings" fill="#2563eb" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
                <section className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">Top Detected Skills — {detail.city}</h2>
                  {detail.top_skills.length === 0 ? (
                    <p className="mt-5 text-slate-500">No skills detected in the available job descriptions.</p>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {detail.top_skills.map((skill) => (
                        <div key={skill.skill} className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-700">{skill.skill}</span>
                          <span className="font-semibold text-slate-900">{skill.count} jobs</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
              <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">{detail.city} — Job Market Breakdown</h2>
                {detail.role_distribution.length === 0 ? (
                  <p className="mt-4 text-slate-500">No roles available.</p>
                ) : (
                  <div className="mt-6 space-y-4">
                    {detail.role_distribution.map((role) => (
                      <div key={role.role} className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-slate-700">{role.role}</span>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">{role.count.toLocaleString("en-AU")}</p>
                          <p className="text-sm text-slate-500">{detail.total_jobs ? (role.count / detail.total_jobs * 100).toFixed(1) : "0.0"}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
          <p className="mt-6 text-xs text-slate-500">
            Sample data only ({list.total_jobs} job advertisements). Results are not representative of the entire Australian technology job market. Skill counts reflect detected mentions in available descriptions.
          </p>
        </>
      )}
    </main>
  );
}
