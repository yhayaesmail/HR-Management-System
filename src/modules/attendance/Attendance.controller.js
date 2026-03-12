import * as attendanceService from "./Attendance.service.js";
import ApiError from "../../utils/ApiError.js";

export const checkInController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const attendance = await attendanceService.checkIn(userId);
    res.json({ success: true, attendance });
  } catch (err) {
    next(err);
  }
};

export const checkOutController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const attendance = await attendanceService.checkOut(userId);
    res.json({ success: true, attendance });
  } catch (err) {
    next(err);
  }
};

export const getEmployeeAttendanceController = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const query = req.query;
    const attendance = await attendanceService.getEmployeeAttendance(
      userId,
      query,
    );
    res.json({ success: true, ...attendance });
  } catch (err) {
    next(err);
  }
};

export const getTodayAttendanceController = async (req, res, next) => {
  try {
    const records = await attendanceService.getTodayAttendance();
    res.json({ success: true, records });
  } catch (err) {
    next(err);
  }
};
