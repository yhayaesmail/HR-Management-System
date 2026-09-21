import Joi from "joi";

export const createConversationSchema = Joi.object({
  title: Joi.string().max(100).allow("", null).optional(),
  isGroup: Joi.boolean().optional(),
  participantIds: Joi.array().items(Joi.string().uuid()).min(1).max(50).required(),
});

export const sendMessageSchema = Joi.object({
  body: Joi.string().min(1).max(2000).required(),
  type: Joi.string().valid("TEXT", "MEETING").optional(),
});
