
import { jobData } from "@/data/jobData";
import type { City } from "@/types/role";
import type { LocationData } from "@/types/location";

export const cities: City[] = [
  "Melbourne",
  "Sydney",
  "Brisbane",
];

export const locationData: LocationData[] = cities.map(
  (city) => {
    const cityData = jobData[city];

    const roles = [...cityData.roles].sort(
      (a, b) => b.jobs - a.jobs
    );

    return {
      city,
      jobPostings: roles.reduce(
        (sum, role) => sum + role.jobs,
        0
      ),
      topRole: roles[0]?.role ?? "N/A",
      roles,
    };
  }
);
