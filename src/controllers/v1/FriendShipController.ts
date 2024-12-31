import prisma from "@/database/databaseClient";
import { ApiError } from "@/utils/libs/errors/ApiError";
import { errorCatch } from "@/utils/libs/errors/errorCatch";
import { FriendShip, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { userSelectArgs } from "./args/selectArgs";
import { Request } from "express";
import { getParamStr } from "@/utils/libs/params/paramsOperations";

const getfetchFriendsFilter = (req: Request) => {
  const user = req.session.user!;
  const query = req.query;
  const username = getParamStr(query.username);

  const whereQuery: Prisma.FriendShipWhereInput = {
    OR: [{ friendAId: user.id }, { friendBId: user.id }],
  };

  if (username) {
    const usernameWhereQuery: Prisma.FriendShipWhereInput = {
      AND: [
        {
          OR: [
            { friendA: { id: user.id } },
            { friendA: { username: { contains: username } } },
          ],
        },
        {
          OR: [
            { friendB: { id: user.id } },
            { friendB: { username: { contains: username } } },
          ],
        },
      ],
    };
    whereQuery.AND = [usernameWhereQuery];
  }
  return whereQuery;
};

// * exportable
const fetchFriends = errorCatch(async (req, res, next) => {
  const whereQuery = getfetchFriendsFilter(req);
  const friends = await prisma.friendShip.findMany({
    where: whereQuery,
    include: {
      // conversation: true,
      friendA: true,
      friendB: true,
    },
  });

  res.status(200).json(friends);
});

// * exportable
const fetchFriendRequests = errorCatch(async (req, res, next) => {
  const user = req.session.user!;

  const requests = await prisma.friendRequest.findMany({
    where: {
      OR: [{ receiverId: user.id }, { senderId: user.id }],
    },
    include: {
      sender: userSelectArgs,
      receiver: userSelectArgs,
    },
  });

  res.status(200).json(requests);
});

// * exportable
const fetchFriendRequestById = errorCatch(async (req, res, next) => {
  const { first, second } = req.params;
  const user = req.session.user!;
  if (user.id !== first && user.id !== second) {
    return next(ApiError.forbidden("can't access this ressource"));
  }

  const request = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: first, receiverId: second },
        { senderId: second, receiverId: first },
      ],
    },
    include: {
      receiver: userSelectArgs,
      sender: userSelectArgs,
    },
  });

  if (!request) {
    return next(ApiError.notFound("request not found"));
  }

  res.status(200).json(request);
});

// * exported
const postFriendRequest = errorCatch(async (req, res, next) => {
  const user = req.session.user!;
  const receiverId = req.params.receiverId;
  const receiver = await prisma.user.findFirst({
    where: { id: receiverId },
    include: { blackListed: true },
  });
  const blackListed = receiver?.blackListed.find((b) => {
    b.blackListedId === user.id;
  });
  if (!!blackListed) {
    return next(ApiError.forbidden("user is blacklisted"));
  }
  const request = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: user.id, receiverId: receiverId },
        { senderId: receiverId, receiverId: user.id },
      ],
    },
  });

  if (request) {
    return next(ApiError.forbidden("request already exists"));
  }

  const newRequest = await prisma.friendRequest.create({
    data: {
      senderId: user.id,
      receiverId: receiverId,
    },
    include: {
      receiver: userSelectArgs,
      sender: userSelectArgs,
    },
  });

  return res.status(201).json(newRequest);
});

// * exportable
const acceptRequest = errorCatch(async (req, res, next) => {
  const user = req.session.user!;
  const senderId = req.params.senderId;
  const receiverId = req.params.receiverId;

  console.log("data", {
    senderId,
    receiverId,
    userId: user.id,
  });

  if (receiverId !== user.id) {
    return next(
      ApiError.forbidden(
        "only the requested user can accept the friend request"
      )
    );
  }

  const request = await prisma.friendRequest.findFirst({
    where: {
      senderId: senderId,
      receiverId: receiverId,
    },
  });

  if (!request) {
    return next(ApiError.notFound("request does not exist"));
  }

  const friendShip = await prisma.friendShip.findFirst({
    where: {
      OR: [
        { friendAId: user.id, friendBId: senderId },
        {
          friendAId: senderId,
          friendBId: user.id,
        },
      ],
    },
  });

  if (friendShip) {
    await prisma.friendRequest.delete({
      where: {
        senderId_receiverId: {
          receiverId: receiverId,
          senderId: senderId,
        },
      },
    });
    return next(ApiError.forbidden("the users are already friends"));
  }

  const newFriendShip = await prisma.$transaction(async () => {
    const newConversation = await prisma.conversation.create({
      data: {},
    });
    const newFriendShip = await prisma.friendShip.create({
      data: {
        friendAId: senderId,
        friendBId: user.id,
        conversationId: newConversation.id,
      },
      include: {
        friendA: userSelectArgs,
        friendB: userSelectArgs,
      },
    });

    await prisma.friendRequest.delete({
      where: {
        senderId_receiverId: { senderId: senderId, receiverId: receiverId },
      },
    });

    return newFriendShip;
  });

  return res.status(201).json(newFriendShip);
});

const deleteRequest = errorCatch(async (req, res, next) => {
  const user = req.session.user!;
  const senderId = req.params.senderId;
  const receiverId = req.params.receiverId;

  if (user.id !== receiverId && user.id !== senderId) {
    return next(ApiError.forbidden("user is not related to the request"));
  }
  const request = await prisma.friendRequest.findFirst({
    where: {
      senderId: senderId,
      receiverId: receiverId,
    },
  });

  if (!request) {
    return next(ApiError.notFound("request does not exist"));
  }

  await prisma.friendRequest.delete({
    where: {
      senderId_receiverId: {
        senderId: request.senderId,
        receiverId: request.receiverId,
      },
    },
  });

  res.sendStatus(204);
});

export default {
  postFriendRequest,
  acceptRequest,
  deleteRequest,
  fetchFriendRequests,
  fetchFriends,
  fetchFriendRequestById,
};
