import { RequestHandler } from "express";
import { errorCatch } from "../../utils/libs/errors/errorCatch";
import prisma from "../../database/databaseClient";
import { getParamStr } from "../../utils/libs/params/paramsOperations";
import { ApiError } from "@/utils/libs/errors/ApiError";
import { z } from "zod";

export const fetchMessages: RequestHandler = errorCatch(
  async (req, res, next) => {
    const user = req.session.user!;
    const query = req.query;
    const cursorId = getParamStr(query.cursorId);
    const conversationId =
      getParamStr(query.conversationId) ?? req.params.conversationId;

    if (conversationId) {
      return next(ApiError.badRequest("no conversation id provided"));
    }
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      take: 50,

      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: true,
        recording: true,
      },
    });

    res.status(200).json(messages);
  }
);

const postMessageBodyTemplate = z.object({
  conversationId: z.string().trim().min(1),
  content: z.string().trim().min(1),
});

export const postMessage = errorCatch(async (req, res, next) => {
  const user = req.session.user!;
  //   const conversationId = getParamStr(req.query.conversationId) ?? req.params.conversationId;

  const body = postMessageBodyTemplate.parse(req.body);

  const newMessage = await prisma.message.create({
    data: {
      conversationId: body.conversationId,
      content: body.content,
      senderId: user.id,
    },
  });

  res.status(201).json(newMessage);
});
