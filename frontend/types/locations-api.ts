export interface LocationSummary {
  city: string;
  count: number;
  percentage: number;
}

export interface LocationsListResponse {
  data_type: "sample";
  total_jobs: number;
  locations: LocationSummary[];
}

export interface LocationRoleCount {
  role: string;
  count: number;
}

export interface LocationSkillCount {
  skill: string;
  count: number;
}

export interface LocationDetailResponse {
  data_type: "sample";
  city: string;
  total_jobs: number;
  role_distribution: LocationRoleCount[];
  top_skills: LocationSkillCount[];
}
