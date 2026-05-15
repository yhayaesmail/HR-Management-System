import prisma from "../../config/prisma.js";
import ApiError, { forbidden } from "../../utils/ApiError.js";

const normalizeTaskStatus = (status) => {
  const aliases = {
    PENDING: "TODO",
    COMPLETED: "DONE",
  };

  return aliases[status] || status;
};

export const createTask = async (data, userId) => {
  const employee = await prisma.employee.findUnique({
    where: { id: data.employeeId },
  });
  if (!employee) {
    throw new ApiError("Employee not found", 404);
  }
  return await prisma.tasks.create({
    data: {
      title: data.title ?? data.description.slice(0, 100),
      description: data.description,
      priority: data.priority,
      runningTaskDeadline: data.runningTaskDeadline,
      employeeId: data.employeeId,
      createdBy: userId,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
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
    orderBy: [
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  });
};

export const getTaskById = async (taskId, currentUser) => {
  const task = await prisma.tasks.findUnique({
    where: { id: taskId },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
  });
  if (!task) {
    throw new ApiError("Task not found", 404);
  }
  if (
    currentUser.role !== "ADMIN" &&
    task.employeeId !== currentUser.employee?.id
  ) {
    throw forbidden("You can only access tasks assigned to you");
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
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
  });
};

export const changeTaskStatus = async (taskId, status, currentUser) => {
  const task = await prisma.tasks.findUnique({
    where: { id: taskId },
  });
  if (!task) {
    throw new ApiError("Task not found", 404);
  }
  if (
    currentUser.role !== "ADMIN" &&
    task.employeeId !== currentUser.employee?.id
  ) {
    throw forbidden("You can only update tasks assigned to you");
  }
  return await prisma.tasks.update({
    where: { id: taskId },
    data: {
      status: normalizeTaskStatus(status),
      updatedBy: currentUser.id,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
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
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
    orderBy: [
      { priority: "desc" },
      { runningTaskDeadline: "asc" },
    ],
  });
};

export const getEmployeeTasks = async (employeeId) => {
  return await prisma.tasks.findMany({
    where: { employeeId },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  });
};
