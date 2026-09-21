import { createPayroll } from "../src/modules/payroll/payroll.service.js";
import { makeUser, makeEmployee, removeUser, disconnect } from "./helpers.js";

describe("payroll", () => {
  const ids = [];
  let adminId;
  let employeeId;

  beforeAll(async () => {
    const admin = await makeUser("ADMIN");
    const emp = await makeUser("EMPLOYEE");
    ids.push(admin.user.id, emp.user.id);
    adminId = admin.user.id;
    const record = await makeEmployee(emp.user.id);
    employeeId = record.id;
  });

  afterAll(async () => {
    for (const id of ids) await removeUser(id);
    await disconnect();
  });

  test("final salary equals base plus bonus minus deduction", async () => {
    const p = await createPayroll(
      { employeeId, baseSalary: 3000, bonus: 200, deduction: 100, month: 3, year: 2031 },
      adminId,
    );
    expect(p.finalSalary).toBe(3100);
  });

  test("duplicate month is rejected", async () => {
    await expect(
      createPayroll(
        { employeeId, baseSalary: 3000, bonus: 0, deduction: 0, month: 3, year: 2031 },
        adminId,
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
