
"use client";

import { useState } from "react";

import {
  cities,
  locationData,
} from "@/data/locationData";

import type { City } from "@/types/role";

import CityComparisonChart from "@/components/CityComparisonChart";
import LocationRoleChart from "@/components/LocationRoleChart";

export default function LocationsPage() {
  const [selectedCity, setSelectedCity] =
    useState<City>("Melbourne");

  const currentLocation = locationData.find(
    (item) => item.city === selectedCity
  );

  if (!currentLocation) {
    return <p>Location not found.</p>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Locations Analytics
      </h1>

      <p className="mt-3 text-slate-600">
        Explore IT job demand across Australian cities.
      </p>

      {/* City Selector */}
      <div className="mt-8">
        <label
          htmlFor="city-filter"
          className="mb-2 block font-semibold text-slate-900"
        >
          Choose a City
        </label>

        <select
          id="city-filter"
          value={selectedCity}
          onChange={(e) =>
            setSelectedCity(e.target.value as City)
          }
          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
        >
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Job Postings
          </p>

          <p className="mt-3 text-3xl font-bold text-blue-600">
            {currentLocation.jobPostings.toLocaleString(
              "en-AU"
            )}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Top Role
          </p>

          <p className="mt-3 text-2xl font-bold text-blue-600">
            {currentLocation.topRole}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <LocationRoleChart
          data={currentLocation.roles}
        />

        <CityComparisonChart
          data={locationData}
          selectedCity={selectedCity}
        />
      </div>

      {/* City Role Details */}
      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          {selectedCity} — Job Market Breakdown
        </h2>

        <div className="mt-6 space-y-4">
          {currentLocation.roles.map((role) => {
            const percentage =
              currentLocation.jobPostings > 0
                ? (
                    (role.jobs /
                      currentLocation.jobPostings) *
                    100
                  ).toFixed(1)
                : "0.0";

            return (
              <div
                key={role.role}
                className="flex items-center justify-between border-b border-slate-100 pb-3"
              >
                <span className="text-slate-700">
                  {role.role}
                </span>

                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    {role.jobs.toLocaleString("en-AU")}
                  </p>

                  <p className="text-sm text-slate-500">
                    {percentage}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <p className="mt-6 text-xs text-slate-500">
        Demo data — not actual job market statistics.
      </p>
    </main>
  );
}
