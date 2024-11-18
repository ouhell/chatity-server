import { RequestHandler } from "express";
import { errorCatch } from "../../utils/errorCatch";
import prisma from "../../database/databaseClient";
import { Page } from "../../types/responses/wrapper";
import { z } from "zod";
import { ApiError } from "../../errors/ApiError";
const fetchConversationsQuery = z.object({
  cursor: z.string().optional(),
  pageSize: z.number().lt(200).gt(0).default(20),
});
export const fetchConversations: RequestHandler = errorCatch(
  async (req, res, next) => {
    const { cursor, pageSize } = fetchConversationsQuery.parse(req.params);
    const user = req.session.user!;
    let query: Parameters<typeof prisma.conversation.findMany>[0] = {
      where: {
        users: {
          some: {
            userId: user.id,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },

      take: pageSize + 1,
    };

    if (cursor) {
      query = {
        ...query,
        cursor: {
          id: cursor,
        },
        skip: 1,
      };
    }
    const conversations = await prisma.conversation.findMany(query);

    const pageContent = conversations.slice(0, 100);

    const conversationPage: Page<(typeof conversations)[number]> = {
      content: conversations.slice(0, pageSize),
      isFirst: !cursor,
      isLast: conversations.length <= pageSize,
      pageSize: pageSize,
      size: pageContent.length,
    };

    res.json(conversationPage);
  }
);

const fetchConvoMessagesStringQuery = z.object({
  cursor: z.string().optional(),
  pageSize: z.number().lt(200).gt(0).default(30),
});

export const fetchConversationMessages: RequestHandler = errorCatch(
  async (req, res, next) => {
    const { cursor, pageSize } = fetchConvoMessagesStringQuery.parse(req.query);
    const user = req.session.user!;
    const conversationId = req.params.conversationId!;
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        users: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    if (!conversation) {
      return next(
        ApiError.notFound(
          "conversation doesn't exists or user not a member of conversation"
        )
      );
    }

    const query: Parameters<typeof prisma.message.findMany>[0] = {
      take: pageSize + 1,
      include: {
        sender: true,
      },
    };

    if (cursor) {
      query.cursor = {
        id: cursor,
      };
      query.skip = 1;
    }

    const messages = await prisma.message.findMany(query);
    res.json(messages);
    return;
  }
);
