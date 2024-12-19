import prisma from "@/database/databaseClient";
import { ApiError } from "@/utils/libs/errors/ApiError";
import { errorCatch } from "@/utils/libs/errors/errorCatch";

// * exportable
const fetchFriends = errorCatch(async (req, res, next) => {
  const user = req.session.user!;
  const friends = await prisma.friendShip.findMany({
    where: {
      OR: [{ friendAId: user.id }, { friendBId: user.id }],
    },
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
      sender: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isEmailVerified: true,
          imageUrl: true,
        },
      },
      receiver: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isEmailVerified: true,
          imageUrl: true,
        },
      },
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
  });

  if (!request) {
    return next(ApiError.notFound("request not found"));
  }

  res.status(200).json(request);
});

// * exportable
const acceptRequest = errorCatch(async (req, res, next) => {
  const user = req.session.user!;
  const senderId = req.params.senderId;
  const receiverId = req.params.receiverId;

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
    // include: {
    //   sender: { select: { id: true } },
    //   receiver: { select: { id: true } },
    // },
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
      data: {
        users: {
          createMany: {
            data: [
              { role: "ADMIN", userId: senderId, isBlocked: false },
              { role: "ADMIN", userId: receiverId, isBlocked: false },
            ],
          },
        },
      },
    });
    const newFriendShip = await prisma.friendShip.create({
      data: {
        friendAId: senderId,
        friendBId: user.id,
        conversationId: newConversation.id,
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

  if (user.id !== receiverId || user.id !== senderId) {
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
  acceptRequest,
  deleteRequest,
  fetchFriendRequests,
  fetchFriends,
  fetchFriendRequestById,
};
