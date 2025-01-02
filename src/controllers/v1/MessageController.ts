import { Request, RequestHandler } from "express";
import { errorCatch } from "../../utils/libs/errors/errorCatch";
import prisma from "../../database/databaseClient";
import { getParamStr } from "../../utils/libs/params/paramsOperations";
import { ApiError } from "@/utils/libs/errors/ApiError";
import { z } from "zod";

type FriendShipId = {
  friendAId: string;
  friendBId: string;
};

const checkPrivateMessagesGetAccess = async (
  req: Request,
  friendshipId: FriendShipId
) => {
  const user = req.session.user!;
  const friendship = await prisma.friendShip.findFirst({
    where: {
      friendAId: friendshipId.friendAId,
      friendBId: friendshipId.friendBId,
    },
  });

  if (!friendship) return false;

  const isFriend =
    friendship.friendAId === user.id || friendship.friendBId === user.id;

  if (!isFriend) return false;

  const isBlocked =
    (friendship.blockedFriendA && user.id === friendship.friendAId) ||
    (friendship.blockedFriendB && user.id === friendship.friendBId);

  if (isBlocked) return false;

  return true;
};

const checkMessagesGetAccess = async (req: Request) => {
  const query = req.query;
  const friendAId = getParamStr(query.friendAId);
  const friendBId = getParamStr(query.friendBId);
  const friendShipId: FriendShipId | undefined =
    friendAId && friendBId ? { friendAId, friendBId } : undefined;

  if (friendShipId) {
    return await checkPrivateMessagesGetAccess(req, friendShipId);
  }
  return false;
};

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

    const allowedAccess = await checkMessagesGetAccess(req);
    if (!allowedAccess) {
      return next(
        ApiError.forbidden(
          "user is not allowed access to the messages of this conversation"
        )
      );
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

const checkPrivateMessagePostAccess = async (
  req: Request,
  friendshipId: FriendShipId
) => {
  const user = req.session.user!;
  const friendship = await prisma.friendShip.findFirst({
    where: {
      friendAId: friendshipId.friendAId,
      friendBId: friendshipId.friendBId,
    },
  });

  if (!friendship) return false;

  const isFriend =
    friendship.friendAId === user.id || friendship.friendBId === user.id;

  if (!isFriend) return false;

  const isBlocked =
    (friendship.blockedFriendA && user.id === friendship.friendAId) ||
    (friendship.blockedFriendB && user.id === friendship.friendBId);

  if (isBlocked) return false;

  return true;
};

const checkMessagePostAccess = async (req: Request) => {
  const query = req.query;
  const friendAId = getParamStr(query.friendAId);
  const friendBId = getParamStr(query.friendBId);
  const friendShipId: FriendShipId | undefined =
    friendAId && friendBId ? { friendAId, friendBId } : undefined;

  if (friendShipId) {
    return await checkPrivateMessagePostAccess(req, friendShipId);
  }

  return false;
};

const postMessageBodyTemplate = z.object({
  conversationId: z.string().trim().min(1),
  content: z.string().trim().min(1),
});

export const postMessage = errorCatch(async (req, res, next) => {
  const user = req.session.user!;
  //   const conversationId = getParamStr(req.query.conversationId) ?? req.params.conversationId;

  const body = postMessageBodyTemplate.parse(req.body);

  const allowedAccess = checkMessagePostAccess(req);

  if (!allowedAccess) {
    return next(
      ApiError.forbidden("user not allowed access to message creation")
    );
  }

  const newMessage = await prisma.message.create({
    data: {
      conversationId: body.conversationId,
      content: body.content,
      senderId: user.id,
    },
  });

  res.status(201).json(newMessage);
});
