import prisma from "./src/config/prisma.js";
import { hashPassword } from "./src/utils/hashing.js";

const PASSWORD = "employee123";

const EMPLOYEES = [
  {
    name: "Omar Khaled",
    email: "omar@hrm.dev",
    department: "Engineering",
    title: "Senior Developer",
    salary: 3500,
    phone: "0100-111-0001",
    address: "Cairo, Egypt",
  },
  {
    name: "Mona Said",
    email: "mona@hrm.dev",
    department: "Marketing",
    title: "Marketing Lead",
    salary: 3000,
    phone: "0100-111-0002",
    address: "Giza, Egypt",
  },
  {
    name: "Youssef Tarek",
    email: "youssef@hrm.dev",
    department: "Finance",
    title: "Accountant",
    salary: 2800,
    phone: "0100-111-0003",
    address: "Cairo, Egypt",
  },
  {
    name: "Layla Hassan",
    email: "layla@hrm.dev",
    department: "Engineering",
    title: "QA Engineer",
    salary: 2600,
    phone: "0100-111-0004",
    address: "Alexandria, Egypt",
  },
  {
    name: "Karim Adel",
    email: "karim@hrm.dev",
    department: "Sales",
    title: "Sales Manager",
    salary: 3200,
    phone: "0100-111-0005",
    address: "Mansoura, Egypt",
  },
  {
    name: "Nour Mohamed",
    email: "nour@hrm.dev",
    department: "HR",
    title: "HR Specialist",
    salary: 2400,
    phone: "0100-111-0006",
    address: "Cairo, Egypt",
  },
  {
    name: "Hana Ibrahim",
    email: "hana@hrm.dev",
    department: "Operations",
    title: "Operations Analyst",
    salary: 2700,
    phone: "0100-111-0007",
    address: "Zagazig, Egypt",
  },
  {
    name: "Tamer Fathy",
    email: "tamer@hrm.dev",
    department: "Engineering",
    title: "DevOps Engineer",
    salary: 3300,
    phone: "0100-111-0008",
    address: "Cairo, Egypt",
  },
];

const TASKS = [
  { title: "Implement password reset flow", description: "Build the reset password API and email notification.", priority: "HIGH", status: "IN_PROGRESS" },
  { title: "Fix attendance timezone bug", description: "Check-in times are off by one hour for some users.", priority: "HIGH", status: "TODO" },
  { title: "Write payroll report tests", description: "Add unit tests for the monthly payroll helper.", priority: "MEDIUM", status: "DONE" },
  { title: "Update onboarding docs", description: "Refresh the README with the new hiring flow.", priority: "LOW", status: "DONE" },
  { title: "Review Q3 hiring pipeline", description: "Summarize interviewed candidates for the team.", priority: "MEDIUM", status: "IN_PROGRESS" },
  { title: "Audit deduction rules", description: "Check payroll deductions against policy.", priority: "MEDIUM", status: "TODO" },
  { title: "Design dashboard KPI layout", description: "Prototype the new overview cards.", priority: "LOW", status: "TODO" },
  { title: "Setup staging environment", description: "Provision staging DB and deploy pipeline.", priority: "HIGH", status: "IN_PROGRESS" },
];

const HIRING = [
  {
    firstName: "Salma",
    lastName: "Fouad",
    email: "salma.fouad@mail.com",
    education: "BSc Computer Science",
    graduateYear: "2023",
    experience: "2 years as frontend developer",
    position: "Frontend Developer",
    coverLetter: "I have strong experience building admin dashboards with modern frameworks.",
    status: "WAITING",
  },
  {
    firstName: "Adel",
    lastName: "Nabil",
    email: "adel.nabil@mail.com",
    education: "MBA",
    graduateYear: "2020",
    experience: "5 years in sales leadership",
    position: "Sales Manager",
    coverLetter: "Led a team of 12 and grew regional revenue by 40%.",
    status: "INTERVIEWED",
  },
  {
    firstName: "Rania",
    lastName: "Mostafa",
    email: "rania.mostafa@mail.com",
    education: "MSc Data Science",
    graduateYear: "2022",
    experience: "3 years in analytics",
    position: "Data Analyst",
    coverLetter: "Comfortable with SQL, Python and reporting tools.",
    status: "PASSED",
  },
  {
    firstName: "Sherif",
    lastName: "Adel",
    email: "sherif.adel@mail.com",
    education: "BEng Electronics",
    graduateYear: "2018",
    experience: "6 years as DevOps engineer",
    position: "DevOps Engineer",
    coverLetter: "Experience with Docker, Kubernetes and CI/CD pipelines.",
    status: "REJECTED",
  },
  {
    firstName: "Dina",
    lastName: "Emad",
    email: "dina.emad@mail.com",
    education: "BSc Accounting",
    graduateYear: "2021",
    experience: "2 years in accounting",
    position: "Accountant",
    coverLetter: "Detail oriented and familiar with payroll processing.",
    status: "WAITING",
  },
];

async function main() {
  const hashedPassword = await hashPassword(PASSWORD);

  await prisma.user.upsert({
    where: { email: "admin@hrm.dev" },
    update: { role: "ADMIN", isActive: true },
    create: {
      email: "admin@hrm.dev",
      password: await hashPassword("admin123"),
      role: "ADMIN",
    },
  });

  const created = [];
  for (const emp of EMPLOYEES) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: { isActive: true },
      create: {
        email: emp.email,
        password: hashedPassword,
        role: "EMPLOYEE",
      },
    });
    const user = await prisma.user.findUnique({ where: { email: emp.email } });
    const record = await prisma.employee.upsert({
      where: { userId: user.id },
      update: {
        name: emp.name,
        department: emp.department,
        title: emp.title,
        salary: emp.salary,
        phone: emp.phone,
        address: emp.address,
        isActive: true,
      },
      create: {
        name: emp.name,
        department: emp.department,
        title: emp.title,
        salary: emp.salary,
        phone: emp.phone,
        address: emp.address,
        userId: user.id,
      },
    });
    created.push(record);
  }

  await prisma.attendance.deleteMany({});
  await prisma.tasks.deleteMany({});
  await prisma.payroll.deleteMany({});
  await prisma.hiring.deleteMany({});
  await prisma.employee.deleteMany({
    where: { user: { email: { endsWith: "@example.com" } } },
  });
  await prisma.user.deleteMany({
    where: { email: { endsWith: "@example.com" } },
  });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const statuses = ["PRESENT", "LATE", "ABSENT", "PRESENT", "ON_TIME", "PRESENT", "LATE", "ABSENT"];
  for (let i = 0; i < created.length; i++) {
    const emp = created[i];
    const status = statuses[i % statuses.length];
    const checkIn = status === "ABSENT" ? null : new Date(today.getTime() + (8 * 60 + (i % 30)) * 60000);
    const checkOut = status === "ABSENT" ? null : new Date(today.getTime() + (16 * 60 + (i % 40)) * 60000);
    await prisma.attendance.create({
      data: {
        employeeId: emp.id,
        date: today,
        status,
        checkIn,
        checkOut,
      },
    });
  }

  for (let i = 0; i < created.length; i++) {
    const emp = created[i];
    const bonus = (i % 3 === 0 ? 150 : 0) + (i % 2 === 0 ? 100 : 0);
    const deduction = i % 4 === 0 ? 50 : 0;
    await prisma.payroll.create({
      data: {
        employeeId: emp.id,
        baseSalary: emp.salary,
        bonus,
        deduction,
        finalSalary: emp.salary + bonus - deduction,
        month,
        year,
      },
    });
  }

  for (let i = 0; i < TASKS.length; i++) {
    const t = TASKS[i];
    const emp = created[i % created.length];
    await prisma.tasks.create({
      data: {
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        employeeId: emp.id,
        runningTaskDeadline: new Date(
          today.getTime() + ((i % 14) + 1) * 24 * 60 * 60 * 1000,
        ),
      },
    });
  }

  for (const h of HIRING) {
    await prisma.hiring.create({
      data: {
        firstName: h.firstName,
        lastName: h.lastName,
        email: h.email,
        education: h.education,
        graduateYear: h.graduateYear,
        experience: h.experience,
        position: h.position,
        coverLetter: h.coverLetter,
        dateApplied: new Date(today.getTime() - (h.status === "WAITING" ? 1 : 12) * 24 * 60 * 60 * 1000),
        status: h.status,
      },
    });
  }

  console.log(`Seeded ${created.length} employees`);
  console.log(`Seeded attendance, payroll (${month}/${year}), tasks, and hiring applications`);
  console.log("Admin: admin@hrm.dev / admin123");
  console.log("Employee logins (password: employee123):");
  for (const e of EMPLOYEES) console.log(`  ${e.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());