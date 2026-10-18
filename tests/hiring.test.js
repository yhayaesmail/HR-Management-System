import {
  receiveApplications,
  getApplications,
  getApplicationById,
  getApplicationProgress,
  proccessApplication,
  deleteApplication,
} from "../src/modules/Hiring/hiring.service.js";
import { makeUser, removeUser, disconnect } from "./helpers.js";

describe("hiring", () => {
  const ids = [];
  let admin;
  let adminUser;

  beforeAll(async () => {
    adminUser = await makeUser("COMPANY_ADMIN");
    admin = adminUser.user;
    ids.push(admin.id);
  });

  afterAll(async () => {
    for (const id of ids) await removeUser(id);
    await disconnect();
  });

  const appData = {
    firstName: "Omar",
    lastName: "Sayed",
    email: `omar_${Date.now()}@hrm.dev`,
    education: "Bachelor",
    graduateYear: "2020",
    experience: "3 years",
    position: "Frontend Developer",
    coverLetter: "I love building UIs",
  };

  test("public submits an application", async () => {
    const app = await receiveApplications(appData, admin.companyId);
    expect(app.id).toBeDefined();
    expect(app.email).toBe(appData.email);
    expect(app.status).toBe("WAITING");
  });

  test("duplicate email throws 400", async () => {
    await expect(receiveApplications(appData, admin.companyId)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test("getApplicationProgress returns public info", async () => {
    const progress = await getApplicationProgress(appData.email, admin.companyId);
    expect(progress.email).toBe(appData.email);
    expect(progress.status).toBe("WAITING");
    expect(progress.position).toBe(appData.position);
  });

  test("getApplicationProgress throws 404 for unknown email", async () => {
    await expect(
      getApplicationProgress("nonexistent@hrm.dev", admin.companyId),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("ADMIN lists applications", async () => {
    const result = await getApplications({ page: 1, limit: 10 }, admin, admin.companyId);
    expect(result.applications).toBeDefined();
    expect(Array.isArray(result.applications)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.totalPages).toBeDefined();
  });

  test("ADMIN filters applications by status", async () => {
    const result = await getApplications(
      { page: 1, limit: 10, status: "WAITING" },
      admin,
      admin.companyId,
    );
    expect(
      result.applications.every((a) => a.status === "WAITING"),
    ).toBe(true);
  });

  test("non-ADMIN cannot list applications", async () => {
    const employee = await makeUser("EMPLOYEE");
    ids.push(employee.user.id);
    await expect(
      getApplications({ page: 1, limit: 10 }, employee.user),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("ADMIN gets application by email", async () => {
    const app = await getApplicationById(appData.email, admin, admin.companyId);
    expect(app.email).toBe(appData.email);
  });

  test("non-ADMIN cannot get application by email", async () => {
    const employee = await makeUser("EMPLOYEE");
    ids.push(employee.user.id);
    await expect(
      getApplicationById(appData.email, employee.user),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("ADMIN updates application status", async () => {
    const updated = await proccessApplication(
      appData.email,
      "INTERVIEWED",
      admin,
      admin.companyId,
    );
    expect(updated.status).toBe("INTERVIEWED");
  });

  test("non-ADMIN cannot process application", async () => {
    const employee = await makeUser("EMPLOYEE");
    ids.push(employee.user.id);
    await expect(
      proccessApplication(appData.email, "REJECTED", employee.user),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("proccessApplication throws 404 for unknown email", async () => {
    await expect(
      proccessApplication("nonexistent@hrm.dev", "REJECTED", admin, admin.companyId),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("ADMIN deletes application", async () => {
    await receiveApplications({
      firstName: "Delete",
      lastName: "Me",
      email: `delete_${Date.now()}@hrm.dev`,
      education: "High School",
      graduateYear: "2018",
      experience: "1 year",
      position: "Intern",
    }, admin.companyId);
    // use a fresh email for delete test
    const delData = {
      firstName: "Delete",
      lastName: "Me",
      email: `del2_${Date.now()}@hrm.dev`,
      education: "High School",
      graduateYear: "2018",
      experience: "1 year",
      position: "Intern",
    };
    await receiveApplications(delData, admin.companyId);
    const result = await deleteApplication(delData.email, admin, admin.companyId);
    expect(result.email).toBe(delData.email);
  });

  test("deleteApplication throws 404 for unknown email", async () => {
    await expect(
      deleteApplication("nonexistent@hrm.dev", admin, admin.companyId),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
