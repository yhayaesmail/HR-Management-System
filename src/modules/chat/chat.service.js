import prisma from "../../config/prisma.js";
import ApiError, { forbidden, notFound } from "../../utils/ApiError.js";

const conversationInclude = {
  participants: {
    include: {
      user: {
        select: { id: true, email: true, role: true, employee: { select: { id: true, name: true } } },
      },
    },
  },
  messages: {
    orderBy: { createdAt: "desc" },
    take: 1,
    include: { sender: { select: { id: true, email: true } } },
  },
};

export const isParticipant = async (conversationId, userId) => {
  const p = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  return !!p;
};

export const createConversation = async (data, currentUser, companyId) => {
  const uniqueIds = [...new Set(data.participantIds)];
  if (uniqueIds.includes(currentUser.id)) {
    throw new ApiError("Do not include yourself in participantIds", 400);
  }
  const users = await prisma.user.findMany({
    where: { id: { in: uniqueIds }, isActive: true, companyId },
    select: { id: true },
  });
  if (users.length !== uniqueIds.length) {
    throw new ApiError("One or more users not found or inactive", 404);
  }
  if (data.isGroup && currentUser.role !== "COMPANY_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
    throw forbidden("Only HR/Admin can create group chats");
  }
  if (!data.isGroup && uniqueIds.length !== 1) {
    throw new ApiError("1-1 chat needs exactly 1 participant", 400);
  }

  if (!data.isGroup) {
    const otherId = uniqueIds[0];
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        companyId,
        participants: { some: { userId: currentUser.id } },
        AND: { participants: { some: { userId: otherId } } },
      },
      include: conversationInclude,
    });
    if (existing) {
      const count = await prisma.conversationParticipant.count({
        where: { conversationId: existing.id },
      });
      if (count === 2) return existing;
    }
  }

return await prisma.conversation.create({
    data: {
      title: data.title || null,
      isGroup: !!data.isGroup,
      companyId,
      createdBy: currentUser.id,
      participants: {
        create: [{ userId: currentUser.id, companyId }, ...uniqueIds.map((userId) => ({ userId, companyId }))],
      },
    },
    include: conversationInclude,
  });
};

export const getMyConversations = async (userId, companyId) => {
  return await prisma.conversation.findMany({
    where: { participants: { some: { userId } }, companyId },
    include: conversationInclude,
    orderBy: { updatedAt: "desc" },
  });
};

export const getMessages = async (conversationId, currentUser, companyId) => {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId, companyId } });
  if (!conversation) throw notFound("Conversation not found");
  if (!(await isParticipant(conversationId, currentUser.id))) {
    throw forbidden("You are not in this conversation");
  }
  return await prisma.message.findMany({
    where: { conversationId, companyId },
    include: { sender: { select: { id: true, email: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
};

export const sendMessage = async (conversationId, data, currentUser, companyId) => {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId, companyId } });
  if (!conversation) throw notFound("Conversation not found");
  if (!(await isParticipant(conversationId, currentUser.id))) {
    throw forbidden("You are not in this conversation");
  }
  if (data.type === "MEETING" && currentUser.role !== "COMPANY_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
    throw forbidden("Only HR/Admin can send meeting notices");
  }
  const message = await prisma.message.create({
    data: {
      conversationId,
      companyId,
      senderId: currentUser.id,
      body: data.body,
      type: data.type || "TEXT",
    },
    include: { sender: { select: { id: true, email: true } } },
  });
  await prisma.conversation.update({
    where: { id: conversationId, companyId },
    data: { updatedAt: new Date() },
  });
  return message;
};

export const getChatUsers = async (currentUser, companyId) => {
  const users = await prisma.user.findMany({
    where: { isActive: true, NOT: { id: currentUser.id }, companyId },
    select: {
      id: true,
      email: true,
      role: true,
      employee: { select: { id: true, name: true, department: true, title: true } },
    },
    orderBy: { email: "asc" },
  });
  return users;
};
