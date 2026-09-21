import * as chatService from "./chat.service.js";

export const createConversation = async (req, res, next) => {
  try {
    const conversation = await chatService.createConversation(req.body, req.user);
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

export const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getMyConversations(req.user.id);
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const messages = await chatService.getMessages(req.params.id, req.user);
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const message = await chatService.sendMessage(req.params.id, req.body, req.user);
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${req.params.id}`).emit("message:new", message);
    }
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

export const getChatUsers = async (req, res, next) => {
  try {
    const users = await chatService.getChatUsers(req.user);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};
