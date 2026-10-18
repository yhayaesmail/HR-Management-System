import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(7).required(),
});

export const registerCompanySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(7).required(),
  companyName: Joi.string().min(2).max(100).required(),
  companySlug: Joi.string().alphanum().min(2).max(50).required(),
});

export const registerEmployeeSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(7).required(),
  inviteToken: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(7).required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(7).required(),
});
