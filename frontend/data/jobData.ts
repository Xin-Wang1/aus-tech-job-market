
export const jobData = {
  Australia: {
    jobPostings: 7500,
    medianSalary: 95000,
    companies: 1200,
    trends: [
      { month: "Jan", jobs: 820 },
      { month: "Feb", jobs: 940 },
      { month: "Mar", jobs: 1100 },
      { month: "Apr", jobs: 1050 },
      { month: "May", jobs: 1280 },
      { month: "Jun", jobs: 1420 },
    ],
    roles: [
      { role: "Software Eng.", jobs: 2400 },
      { role: "Data Analyst", jobs: 1850 },
      { role: "Frontend Dev.", jobs: 1280 },
      { role: "Full Stack Dev.", jobs: 1050 },
      { role: "IT Support", jobs: 920 },
    ],
  },

  Melbourne: {
    jobPostings: 2800,
    medianSalary: 98000,
    companies: 450,
    trends: [
      { month: "Jan", jobs: 300 },
      { month: "Feb", jobs: 360 },
      { month: "Mar", jobs: 420 },
      { month: "Apr", jobs: 400 },
      { month: "May", jobs: 480 },
      { month: "Jun", jobs: 530 },
    ],
    roles: [
      { role: "Software Eng.", jobs: 900 },
      { role: "Data Analyst", jobs: 700 },
      { role: "Frontend Dev.", jobs: 480 },
      { role: "Full Stack Dev.", jobs: 390 },
      { role: "IT Support", jobs: 330 },
    ],
  },

  Sydney: {
    jobPostings: 3300,
    medianSalary: 105000,
    companies: 520,
    trends: [
      { month: "Jan", jobs: 350 },
      { month: "Feb", jobs: 400 },
      { month: "Mar", jobs: 470 },
      { month: "Apr", jobs: 450 },
      { month: "May", jobs: 560 },
      { month: "Jun", jobs: 620 },
    ],
    roles: [
      { role: "Software Eng.", jobs: 1100 },
      { role: "Data Analyst", jobs: 800 },
      { role: "Frontend Dev.", jobs: 550 },
      { role: "Full Stack Dev.", jobs: 460 },
      { role: "IT Support", jobs: 390 },
    ],
  },

  Brisbane: {
    jobPostings: 1400,
    medianSalary: 88000,
    companies: 230,
    trends: [
      { month: "Jan", jobs: 170 },
      { month: "Feb", jobs: 180 },
      { month: "Mar", jobs: 210 },
      { month: "Apr", jobs: 200 },
      { month: "May", jobs: 240 },
      { month: "Jun", jobs: 270 },
    ],
    roles: [
      { role: "Software Eng.", jobs: 400 },
      { role: "Data Analyst", jobs: 350 },
      { role: "Frontend Dev.", jobs: 250 },
      { role: "Full Stack Dev.", jobs: 200 },
      { role: "IT Support", jobs: 200 },
    ],
  },
};

export type Location = keyof typeof jobData;
