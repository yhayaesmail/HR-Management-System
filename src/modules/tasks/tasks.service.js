import prisma from "../../config/prisma.js";
import ApiError, { forbidden } from "../../utils/ApiError.js";

const normalizeTaskStatus = (status) => {
  const aliases = {
    PENDING: "TODO",
    COMPLETED: "DONE",
  };

  return aliases[status] || status;
};

export const createTask = async (data, userId, companyId) => {
  const employee = await prisma.employee.findUnique({
    where: { id: data.employeeId, companyId },
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
      companyId,
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

export const getAllTasks = async (companyId) => {
  return await prisma.tasks.findMany({
    where: { companyId },
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

export const getTaskById = async (taskId, currentUser, companyId) => {
  const task = await prisma.tasks.findUnique({
    where: { id: taskId, companyId },
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
    currentUser.role !== "COMPANY_ADMIN" &&
    currentUser.role !== "SUPER_ADMIN" &&
    task.employeeId !== currentUser.employee?.id
  ) {
    throw forbidden("You can only access tasks assigned to you");
  }
  return task;
};

export const updateTask = async (taskId, data, userId, companyId) => {
  const task = await prisma.tasks.findUnique({
    where: { id: taskId, companyId },
  });
  if (!task) {
    throw new ApiError("Task not found", 404);
  }
  return await prisma.tasks.update({
    where: { id: taskId, companyId },
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

export const changeTaskStatus = async (taskId, status, currentUser, companyId) => {
  const task = await prisma.tasks.findUnique({
    where: { id: taskId, companyId },
  });
  if (!task) {
    throw new ApiError("Task not found", 404);
  }
  if (
    currentUser.role !== "COMPANY_ADMIN" &&
    currentUser.role !== "SUPER_ADMIN" &&
    task.employeeId !== currentUser.employee?.id
  ) {
    throw forbidden("You can only update tasks assigned to you");
  }
  return await prisma.tasks.update({
    where: { id: taskId, companyId },
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

export const deleteTask = async (taskId, companyId) => {
  const task = await prisma.tasks.findUnique({
    where: { id: taskId, companyId },
  });
  if (!task) {
    throw new ApiError("Task not found", 404);
  }
  await prisma.tasks.delete({
    where: { id: taskId, companyId },
  });

  return { message: "Task deleted successfully" };
};

export const getMyTasks = async (employeeId, companyId) => {
  return await prisma.tasks.findMany({
    where: { employeeId, companyId },
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

export const getEmployeeTasks = async (employeeId, companyId) => {
  return await prisma.tasks.findMany({
    where: { employeeId, companyId },
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
