
import type { RoleSkillDemand } from "@/types/skill";

export const skillData: RoleSkillDemand[] = [
  {
    roleId: "software-engineer",
    skills: [
      { skill: "Python", count: 850 },
      { skill: "AWS", count: 720 },
      { skill: "Java", count: 650 },
      { skill: "SQL", count: 610 },
      { skill: "Docker", count: 490 },
    ],
  },
  {
    roleId: "data-analyst",
    skills: [
      { skill: "SQL", count: 760 },
      { skill: "Excel", count: 680 },
      { skill: "Python", count: 570 },
      { skill: "Power BI", count: 520 },
      { skill: "Tableau", count: 310 },
    ],
  },
  {
    roleId: "frontend-developer",
    skills: [
      { skill: "JavaScript", count: 720 },
      { skill: "React", count: 640 },
      { skill: "TypeScript", count: 530 },
      { skill: "CSS", count: 490 },
      { skill: "Next.js", count: 280 },
    ],
  },
  {
    roleId: "full-stack-developer",
    skills: [
      { skill: "JavaScript", count: 650 },
      { skill: "React", count: 540 },
      { skill: "Node.js", count: 510 },
      { skill: "SQL", count: 460 },
      { skill: "AWS", count: 390 },
    ],
  },
  {
    roleId: "it-support",
    skills: [
      { skill: "Windows", count: 520 },
      { skill: "Microsoft 365", count: 470 },
      { skill: "Networking", count: 410 },
      { skill: "Active Directory", count: 330 },
      { skill: "Azure", count: 210 },
    ],
  },
];
