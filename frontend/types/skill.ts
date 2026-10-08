
export interface SkillDemand {
  skill: string;
  count: number;
}

export interface RoleSkillDemand {
  roleId: string;
  skills: SkillDemand[];
}
