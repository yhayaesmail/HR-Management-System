import Joi from "joi";

const statuses = ["WAITING", "INTERVIEWED", "PASSED", "REJECTED"];

export const receiveApplicationSchema = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  education: Joi.string().required(),
  coverLetter: Joi.string().optional(),
  graduateYear: Joi.string().required(),
  experience: Joi.string().required(),
  position: Joi.string().required(),
});

export const proccessApplicationSchema = Joi.object({
  status: Joi.string().valid(...statuses).required(),
});

export const applicationParamsSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const getApplicationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...statuses),
});
