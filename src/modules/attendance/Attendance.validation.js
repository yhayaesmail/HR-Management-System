import Joi from "joi";

export const checkInSchema = Joi.object({});

export const checkOutSchema = Joi.object({});

export const getEmployeeAttendanceSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).optional(),
});
