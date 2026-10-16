import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  changeTaskStatus,
  deleteTask,
  getMyTasks,
  getEmployeeTasks,
} from "../src/modules/tasks/tasks.service.js";
import {
  makeUser,
  makeEmployee,
  removeUser,
  disconnect,
} from "./helpers.js";

describe("tasks", () => {
  const ids = [];
  let adminUser;
  let employeeUser;
  let employee;

  beforeAll(async () => {
    adminUser = await makeUser("ADMIN");
    ids.push(adminUser.user.id);

    employeeUser = await makeUser("EMPLOYEE");
    ids.push(employeeUser.user.id);
    employee = await makeEmployee(employeeUser.user.id);
  });

  afterAll(async () => {
    for (const id of ids) await removeUser(id);
    await disconnect();
  });

  const deadline = new Date(Date.now() + 86400000).toISOString();

  test("ADMIN creates a task", async () => {
    const task = await createTask(
      {
        title: "Fix login bug",
        description: "Resolve the login redirect loop",
        employeeId: employee.id,
        priority: "HIGH",
        runningTaskDeadline: deadline,
      },
      adminUser.user.id,
    );
    expect(task.id).toBeDefined();
    expect(task.employeeId).toBe(employee.id);
    expect(task.status).toBe("TODO");
    expect(task.priority).toBe("HIGH");
  });

  test("creating task for non-existent employee throws 404", async () => {
    await expect(
      createTask(
        {
          description: "No employee",
          employeeId: "00000000-0000-0000-0000-000000000000",
          priority: "LOW",
          runningTaskDeadline: deadline,
        },
        adminUser.user.id,
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("getAllTasks returns tasks", async () => {
    const tasks = await getAllTasks();
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThanOrEqual(1);
  });

  test("getMyTasks returns tasks assigned to the employee", async () => {
    const tasks = await getMyTasks(employee.id);
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.every((t) => t.employeeId === employee.id)).toBe(true);
  });

  test("getEmployeeTasks returns tasks for an employee", async () => {
    const tasks = await getEmployeeTasks(employee.id);
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThanOrEqual(1);
  });

  test("getTaskById returns the task", async () => {
    const all = await getAllTasks();
    const task = await getTaskById(all[0].id, {
      id: adminUser.user.id,
      role: "ADMIN",
    });
    expect(task.id).toBe(all[0].id);
  });

  test("getTaskById throws 404 for missing task", async () => {
    await expect(
      getTaskById("00000000-0000-0000-0000-000000000000", {
        id: adminUser.user.id,
        role: "ADMIN",
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("employee cannot access another employee's task", async () => {
    const all = await getAllTasks();
    await expect(
      getTaskById(all[0].id, {
        id: employeeUser.user.id,
        role: "EMPLOYEE",
        employee: { id: "some-other-id" },
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("changeTaskStatus updates status", async () => {
    const all = await getAllTasks();
    const updated = await changeTaskStatus(
      all[0].id,
      "DONE",
      { id: adminUser.user.id, role: "ADMIN" },
    );
    expect(updated.status).toBe("DONE");
  });

  test("changeTaskStatus accepts PENDING alias to TODO", async () => {
    const task = await createTask(
      {
        description: "Alias test",
        employeeId: employee.id,
        priority: "LOW",
        runningTaskDeadline: deadline,
      },
      adminUser.user.id,
    );
    const updated = await changeTaskStatus(
      task.id,
      "PENDING",
      { id: adminUser.user.id, role: "ADMIN" },
    );
    expect(updated.status).toBe("TODO");
  });

  test("employee cannot change status of task not assigned to them", async () => {
    const all = await getAllTasks();
    await expect(
      changeTaskStatus(
        all[0].id,
        "DONE",
        { id: employeeUser.user.id, role: "EMPLOYEE", employee: { id: "other" } },
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("updateTask modifies task fields", async () => {
    const all = await getAllTasks();
    const updated = await updateTask(
      all[all.length - 1].id,
      { title: "Updated title", priority: "MEDIUM" },
      adminUser.user.id,
    );
    expect(updated.title).toBe("Updated title");
    expect(updated.priority).toBe("MEDIUM");
  });

  test("updateTask throws 404 for missing task", async () => {
    await expect(
      updateTask(
        "00000000-0000-0000-0000-000000000000",
        { title: "x" },
        adminUser.user.id,
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("deleteTask removes the task", async () => {
    const task = await createTask(
      {
        description: "To be deleted",
        employeeId: employee.id,
        priority: "LOW",
        runningTaskDeadline: deadline,
      },
      adminUser.user.id,
    );
    const result = await deleteTask(task.id);
    expect(result.message).toBe("Task deleted successfully");
  });

  test("deleteTask throws 404 for missing task", async () => {
    await expect(
      deleteTask("00000000-0000-0000-0000-000000000000"),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
