import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { isParticipant, sendMessage as saveMessage } from "../modules/chat/chat.service.js";

export const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, isActive: true },
      });
      if (!user || !user.isActive) return next(new Error("Inactive user"));
      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);

    socket.on("join", async (conversationId, ack) => {
      try {
        if (await isParticipant(conversationId, userId)) {
          socket.join(`conversation:${conversationId}`);
          if (ack) ack({ success: true });
        } else if (ack) {
          ack({ success: false, message: "Not a participant" });
        }
      } catch {
        if (ack) ack({ success: false });
      }
    });

    socket.on("message:send", async (payload, ack) => {
      try {
        const { conversationId, body, type } = payload || {};
        if (!conversationId || !body) {
          if (ack) ack({ success: false, message: "conversationId and body required" });
          return;
        }
        const message = await saveMessage(
          conversationId,
          { body: String(body).slice(0, 2000), type: type === "MEETING" ? "MEETING" : "TEXT" },
          socket.user,
        );
        io.to(`conversation:${conversationId}`).emit("message:new", message);
        if (ack) ack({ success: true, data: message });
      } catch (err) {
        if (ack) ack({ success: false, message: err.message || "Send failed" });
      }
    });

    socket.on("typing", async ({ conversationId, isTyping }) => {
      if (!conversationId) return;
      if (!(await isParticipant(conversationId, userId))) return;
      socket.to(`conversation:${conversationId}`).emit("typing", {
        conversationId,
        userId,
        email: socket.user.email,
        isTyping: !!isTyping,
      });
    });
  });
};
