
import type { City } from "@/types/role";

export interface LocationRole {
  role: string;
  jobs: number;
}

export interface LocationData {
  city: City;
  jobPostings: number;
  topRole: string;
  roles: LocationRole[];
}
