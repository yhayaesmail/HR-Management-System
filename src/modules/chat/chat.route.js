import express from "express";
import * as chatController from "./chat.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { createConversationSchema, sendMessageSchema } from "./chat.validation.js";

const router = express.Router();

router.get("/users", authMiddleware, chatController.getChatUsers);
router.post(
  "/conversations",
  authMiddleware,
  validateBody(createConversationSchema),
  chatController.createConversation,
);
router.get("/conversations/my", authMiddleware, chatController.getMyConversations);
router.get("/conversations/:id/messages", authMiddleware, chatController.getMessages);
router.post(
  "/conversations/:id/messages",
  authMiddleware,
  validateBody(sendMessageSchema),
  chatController.sendMessage,
);

export default router;
