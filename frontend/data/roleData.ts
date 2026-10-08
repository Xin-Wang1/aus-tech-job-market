
import { jobData } from "@/data/jobData";
import type { City, Role } from "@/types/role";

const cities: City[] = [
  "Melbourne",
  "Sydney",
  "Brisbane",
];

const roleDefinitions = [
  {
    id: "software-engineer",
    name: "Software Engineer",
    chartLabel: "Software Eng.",
    description: "Designs, builds and maintains software applications.",
    skills: ["Python", "Java", "AWS"],
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    chartLabel: "Data Analyst",
    description: "Analyses data to support business decisions.",
    skills: ["SQL", "Python", "Power BI"],
  },
  {
    id: "frontend-developer",
    name: "Frontend Developer",
    chartLabel: "Frontend Dev.",
    description: "Builds interactive and responsive web interfaces.",
    skills: ["React", "TypeScript", "CSS"],
  },
  {
    id: "full-stack-developer",
    name: "Full Stack Developer",
    chartLabel: "Full Stack Dev.",
    description: "Develops frontend and backend applications.",
    skills: ["React", "Node.js", "SQL"],
  },
  {
    id: "it-support",
    name: "IT Support",
    chartLabel: "IT Support",
    description: "Troubleshoots hardware, software and network issues.",
    skills: ["Microsoft 365", "Windows", "Networking"],
  },
];

export const roleData: Role[] = roleDefinitions.map((role) => {
  const jobPostingsByCity = {} as Record<City, number>;

  cities.forEach((city) => {
    const matchingRole = jobData[city].roles.find(
      (item) => item.role === role.chartLabel
    );

    jobPostingsByCity[city] = matchingRole?.jobs ?? 0;
  });

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    skills: role.skills,
    jobPostingsByCity,
  };
});
