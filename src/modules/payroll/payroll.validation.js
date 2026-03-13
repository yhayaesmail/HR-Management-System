import Joi from "joi";

export const createPayrollSchema = Joi.object({
  employeeId: Joi.string().uuid().required(),
  baseSalary: Joi.number().min(0).optional(),
  bonus: Joi.number().min(0).optional(),
  deduction: Joi.number().min(0).optional(),
  month: Joi.number().min(1).max(12).required(),
  year: Joi.number().min(2000).required(),
});

export const updatePayrollSchema = Joi.object({
  baseSalary: Joi.number().min(0).optional(),
  bonus: Joi.number().min(0).optional(),
  deduction: Joi.number().min(0).optional(),
});
