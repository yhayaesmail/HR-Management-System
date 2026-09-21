import { checkIn, checkOut } from "../src/modules/attendance/Attendance.service.js";
import { makeUser, makeEmployee, removeUser, disconnect } from "./helpers.js";

describe("attendance", () => {
  const ids = [];
  let userId;

  beforeAll(async () => {
    const created = await makeUser("EMPLOYEE");
    ids.push(created.user.id);
    userId = created.user.id;
    await makeEmployee(userId);
  });

  afterAll(async () => {
    for (const id of ids) await removeUser(id);
    await disconnect();
  });

  test("check-in creates record with valid status", async () => {
    const rec = await checkIn(userId);
    expect(rec.employeeId).toBeDefined();
    expect(["LATE", "ON_TIME"]).toContain(rec.status);
    expect(rec.checkIn).toBeDefined();
  });

  test("second check-in same day is rejected", async () => {
    await expect(checkIn(userId)).rejects.toMatchObject({ statusCode: 400 });
  });

  test("check-out closes the day record", async () => {
    const rec = await checkOut(userId);
    expect(rec.checkOut).toBeDefined();
    await expect(checkOut(userId)).rejects.toMatchObject({ statusCode: 400 });
  });
});
