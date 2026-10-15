export interface SkillCount { skill: string; job_count: number; }
export interface SkillsListResponse {
  data_type: "sample"; total_skills: number; total_jobs: number;
  jobs_with_skills: number; skill_coverage_percentage: number;
  skills: SkillCount[];
}
export interface RoleSkillCount extends SkillCount { percentage: number; }
export interface SkillsByRoleResponse {
  data_type: "sample"; role: string; total_jobs: number;
  skills: RoleSkillCount[];
}
export interface SkillDetailResponse {
  data_type: "sample"; skill: string; total_jobs: number;
  role_distribution: { role: string; count: number }[];
  city_distribution: { city: string; count: number }[];
}
export interface RolesListResponse {
  data_type: "sample"; total_jobs: number;
  roles: { role: string; count: number; percentage: number }[];
}
