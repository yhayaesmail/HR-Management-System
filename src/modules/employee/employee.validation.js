import Joi from "joi";

export const createEmployeeSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(3).required(),
  department: Joi.string().required(),
  salary: Joi.number().positive().required(),
  title: Joi.string().required(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
});

export const updateEmployeeSchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().min(3).optional(),
  department: Joi.string().optional(),
  salary: Joi.number().positive().optional(),
  title: Joi.string().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
});
