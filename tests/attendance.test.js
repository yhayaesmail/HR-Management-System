import { checkIn, checkOut } from "../src/modules/attendance/Attendance.service.js";
import { makeUser, makeEmployee, removeUser, disconnect } from "./helpers.js";

describe("attendance", () => {
  const ids = [];
  let userId;

  let companyId;
beforeAll(async () => {
    const created = await makeUser("EMPLOYEE");
    ids.push(created.user.id);
    userId = created.user.id;
    companyId = created.companyId;
    await makeEmployee(userId, companyId);
  });

  afterAll(async () => {
    for (const id of ids) await removeUser(id);
    await disconnect();
  });

  test("check-in creates record with valid status", async () => {
    const rec = await checkIn(userId, companyId);
    expect(rec.employeeId).toBeDefined();
    expect(["LATE", "ON_TIME"]).toContain(rec.status);
    expect(rec.checkIn).toBeDefined();
  });

  test("second check-in same day is rejected", async () => {
    await expect(checkIn(userId, companyId)).rejects.toMatchObject({ statusCode: 400 });
  });

  test("check-out closes the day record", async () => {
    const rec = await checkOut(userId, companyId);
    expect(rec.checkOut).toBeDefined();
    await expect(checkOut(userId, companyId)).rejects.toMatchObject({ statusCode: 400 });
  });
});
