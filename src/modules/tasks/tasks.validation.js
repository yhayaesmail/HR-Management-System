import Joi from "joi";

export const createTaskSchema = Joi.object({
  description: Joi.string().min(3).max(500).required(),
  employeeId: Joi.string().uuid().required(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").required(),
  runningTaskDeadline: Joi.date().iso().required(),
});

export const updateTaskSchema = Joi.object({
  description: Joi.string().min(3).max(500),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH"),
  runningTaskDeadline: Joi.date().iso(),
});

export const changeStatusSchema = Joi.object({
  status: Joi.string().valid("TODO", "IN_PROGRESS", "DONE").required(),
});
