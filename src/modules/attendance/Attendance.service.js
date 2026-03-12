import logger from "../../utils/logger.js";
import prisma from "../../config/prisma.js";
import ApiError from "../../utils/ApiError.js";

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const checkIn = async (userId) => {
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) throw new ApiError("Employee record not found", 404);
  const employeeId = employee.id;
  const { start, end } = getTodayRange();
  const isAttended = await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });
  if (isAttended) throw new ApiError("You already checked in today", 400);
  const now = new Date();
  const workStart = new Date();
  workStart.setHours(9, 0, 0, 0);
  const status = now > workStart ? "LATE" : "ON_TIME";
  const attendance = await prisma.attendance.create({
    data: {
      employeeId,
      date: start,
      checkIn: now,
      status,
    },
  });
  logger.info(`Employee ${employeeId} checked IN`);
  return attendance;
};

export const checkOut = async (userId) => {
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) throw new ApiError("Employee record not found", 404);
  const employeeId = employee.id;
  const { start, end } = getTodayRange();
  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });
  if (!attendance) throw new ApiError("You did not check in today", 400);
  if (attendance.checkOut) throw new ApiError("You already checked out", 400);
  const updated = await prisma.attendance.update({
    where: { id: attendance.id },
    data: { checkOut: new Date() },
  });
  logger.info(`Employee ${employeeId} checked OUT`);
  return updated;
};

export const getEmployeeAttendance = async (employeeId, query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.attendance.count({ where: { employeeId } }),
  ]);
  return {
    records,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getTodayAttendance = async () => {
  const { start, end } = getTodayRange();
  return prisma.attendance.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    include: { employee: true },
  });
};
