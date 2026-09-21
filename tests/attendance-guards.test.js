import { checkIn, checkOut } from "../src/modules/attendance/Attendance.service.js";
import { makeUser, makeEmployee, removeUser, disconnect } from "./helpers.js";

describe("attendance guards", () => {
  const ids = [];
  let noRecordId;
  let freshId;

  beforeAll(async () => {
    const a = await makeUser("EMPLOYEE");
    const b = await makeUser("EMPLOYEE");
    ids.push(a.user.id, b.user.id);
    noRecordId = a.user.id;
    freshId = b.user.id;
    await makeEmployee(freshId);
  });

  afterAll(async () => {
    for (const id of ids) await removeUser(id);
    await disconnect();
  });

  test("check-in without employee record fails with 404", async () => {
    await expect(checkIn(noRecordId)).rejects.toMatchObject({ statusCode: 404 });
  });

  test("check-out without check-in fails with 400", async () => {
    await expect(checkOut(freshId)).rejects.toMatchObject({ statusCode: 400 });
  });
});
