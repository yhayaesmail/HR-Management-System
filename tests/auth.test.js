import { login } from "../src/modules/auth/auth.service.js";
import { makeUser, removeUser, disconnect } from "./helpers.js";

describe("auth", () => {
  const ids = [];
  let email;
  let password;

  beforeAll(async () => {
    const created = await makeUser("ADMIN");
    ids.push(created.user.id);
    email = created.email;
    password = created.password;
  });

  afterAll(async () => {
    for (const id of ids) await removeUser(id);
    await disconnect();
  });

  test("login returns token and role", async () => {
    const res = await login({ email, password });
    expect(res.success).toBe(true);
    expect(res.data.accessToken).toBeDefined();
    expect(res.data.user.role).toBe("ADMIN");
  });

  test("wrong password fails with 401", async () => {
    await expect(login({ email, password: "wrongpass1" })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  test("unknown email fails with 401", async () => {
    await expect(
      login({ email: "tst_missing@hrm.dev", password: "password123" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("inactive user is blocked", async () => {
    const created = await makeUser("EMPLOYEE", false);
    ids.push(created.user.id);
    await expect(
      login({ email: created.email, password: created.password }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
