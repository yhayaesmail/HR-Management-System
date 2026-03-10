import Joi from "joi";

export const createEmployeeSchema = Joi.object({
  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),

  name: Joi.string().min(3).max(100).required(),

  department: Joi.string().min(2).required(),

  title: Joi.string().min(2).required(),

  salary: Joi.number().positive().required(),

  phone: Joi.string().optional(),

  address: Joi.string().optional(),
});
