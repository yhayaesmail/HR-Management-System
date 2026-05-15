import Joi from "joi";

export const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(3).max(500).required(),
  employeeId: Joi.string().uuid().required(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").required(),
  runningTaskDeadline: Joi.date().iso().required(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().min(3).max(500),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH"),
  runningTaskDeadline: Joi.date().iso(),
}).min(1);

export const changeStatusSchema = Joi.object({
  status: Joi.string()
    .valid("TODO", "IN_PROGRESS", "DONE", "PENDING", "COMPLETED")
    .required(),
});
