import prisma from "../../config/prisma.js";
import ApiError from "../../utils/ApiError.js";

export const createTask = async (data, userId) => {
  const employee = await prisma.employee.findUnique({
    where: { id: data.employeeId },
  });
  if (!employee) {
    throw new ApiError("Employee not found", 404);
  }
  return await prisma.tasks.create({
    data: {
      description: data.description,
      priority: data.priority,
      runningTaskDeadline: data.runningTaskDeadline,
      employeeId: data.employeeId,
      createdBy: userId,
    },
  });
};

export const getAllTasks = async () => {
  return await prisma.tasks.findMany({
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
};

export const getTaskById = async (taskId) => {
  const task = await prisma.tasks.findUnique({
    where: { id: taskId },
    include: {
      employee: true,
    },
  });
  if (!task) {
    throw new ApiError("Task not found", 404);
  }
  return task;
};

export const updateTask = async (taskId, data, userId) => {
  const task = await prisma.tasks.findUnique({
    where: { id: taskId },
  });
  if (!task) {
    throw new ApiError("Task not found", 404);
  }
  return await prisma.tasks.update({
    where: { id: taskId },
    data: {
      ...data,
      updatedBy: userId,
    },
  });
};

export const changeTaskStatus = async (taskId, status, userId) => {
  const task = await prisma.tasks.findUnique({
    where: { id: taskId },
  });
  if (!task) {
    throw new ApiError("Task not found", 404);
  }
  return await prisma.tasks.update({
    where: { id: taskId },
    data: {
      status,
      updatedBy: userId,
    },
  });
};


export const deleteTask = async (taskId) => {
  const task = await prisma.tasks.findUnique({
    where: { id: taskId },
  });
  if (!task) {
    throw new ApiError("Task not found", 404);
  }
  await prisma.tasks.delete({
    where: { id: taskId },
  });

  return { message: "Task deleted successfully" };
};

export const getMyTasks = async (employeeId) => {
  return await prisma.tasks.findMany({
    where: { employeeId },
    orderBy: [{ priority: "desc" }, { runningTaskDeadline: "asc" }],
  });
};

export const getEmployeeTasks = async (employeeId) => {
  return await prisma.tasks.findMany({
    where: { employeeId },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
};
