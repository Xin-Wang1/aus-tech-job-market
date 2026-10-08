
export type City = "Melbourne" | "Sydney" | "Brisbane";

export interface Role {
  id: string;
  name: string;
  description: string;
  skills: string[];
  jobPostingsByCity: Record<City, number>;
}
