import { createPayroll } from "../src/modules/payroll/payroll.service.js";
import { makeUser, makeEmployee, removeUser, disconnect } from "./helpers.js";

describe("payroll", () => {
  const ids = [];
  let admin;
  let adminId;
  let companyId;
  let employeeId;

  beforeAll(async () => {
    const admin = await makeUser("COMPANY_ADMIN");
    const emp = await makeUser("EMPLOYEE");
    ids.push(admin.user.id, emp.user.id);
    adminId = admin.user.id;
    companyId = admin.companyId;
    const record = await makeEmployee(emp.user.id, companyId);
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
      companyId,
    );
    expect(p.finalSalary).toBe(3100);
  });

  test("duplicate month is rejected", async () => {
    await expect(
      createPayroll(
        { employeeId, baseSalary: 3000, bonus: 0, deduction: 0, month: 3, year: 2031 },
        adminId,
        companyId,
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
