import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../src/modules/employee/employee.service.js";
import { makeUser, removeUser, disconnect } from "./helpers.js";

describe("employee", () => {
  const ids = [];
  let admin;

  beforeAll(async () => {
    const adminUser = await makeUser("ADMIN");
    admin = adminUser.user;
    ids.push(admin.id);
  });

  afterAll(async () => {
    for (const id of ids) await removeUser(id);
    await disconnect();
  });

  const empData = {
    email: `emp_${Date.now()}@hrm.dev`,
    password: "password123",
    name: "Ahmed Ali",
    department: "Engineering",
    salary: 5000,
    title: "Software Engineer",
    phone: "+1234567890",
    address: "Cairo, Egypt",
  };

  test("ADMIN creates an employee", async () => {
    const emp = await createEmployee(empData, admin.id);
    expect(emp.id).toBeDefined();
    expect(emp.name).toBe(empData.name);
    expect(emp.department).toBe(empData.department);
    expect(emp.user.email).toBe(empData.email);
    ids.push(emp.user.id);
  });

  test("creating employee with existing email throws 400", async () => {
    await expect(createEmployee(empData, admin.id)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test("ADMIN lists employees", async () => {
    const result = await getEmployees({ page: 1, limit: 10 }, admin);
    expect(result.employees).toBeDefined();
    expect(Array.isArray(result.employees)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.totalPages).toBeDefined();
  });

  test("ADMIN gets employee by id", async () => {
    const all = await getEmployees({ page: 1, limit: 10 }, admin);
    const emp = await getEmployeeById(all.employees[0].id, admin);
    expect(emp.id).toBe(all.employees[0].id);
  });

  test("getEmployeeById throws 404 for missing id", async () => {
    await expect(
      getEmployeeById("00000000-0000-0000-0000-000000000000", admin),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("non-ADMIN cannot access another employee's profile", async () => {
    const employee = await makeUser("EMPLOYEE");
    ids.push(employee.user.id);
    await expect(
      getEmployeeById("00000000-0000-0000-0000-000000000001", employee.user),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("ADMIN updates an employee", async () => {
    const all = await getEmployees({ page: 1, limit: 10 }, admin);
    const target = all.employees.find((e) => e.user.email === empData.email);
    const updated = await updateEmployee(
      target.id,
      { title: "Senior Software Engineer", salary: 7000 },
      admin.id,
    );
    expect(updated.title).toBe("Senior Software Engineer");
    expect(updated.salary).toBe(7000);
  });

  test("updateEmployee throws 404 for missing id", async () => {
    await expect(
      updateEmployee(
        "00000000-0000-0000-0000-000000000000",
        { title: "x" },
        admin.id,
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("ADMIN soft-deletes an employee", async () => {
    const all = await getEmployees({ page: 1, limit: 10 }, admin);
    const target = all.employees.find((e) => e.user.email === empData.email);
    const deleted = await deleteEmployee(target.id);
    expect(deleted.isActive).toBe(false);
    const check = await getEmployeeById(target.id, admin);
    expect(check.user.isActive).toBe(false);
  });

  test("deleteEmployee throws 404 for missing id", async () => {
    await expect(
      deleteEmployee("00000000-0000-0000-0000-000000000000"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
