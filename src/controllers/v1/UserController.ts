import express, { RequestHandler } from "express";
import prisma from "../../database/databaseClient";
import { errorCatch } from "../../utils/libs/errors/errorCatch";
import { z } from "zod";
import { ApiError } from "../../utils/libs/errors/ApiError";
import { extractCacheKey } from "../../utils/libs/cache/cacheKeys";
import { setJsonCache } from "../../utils/libs/cache/cacheOperations";

// * exported
const fetchUsers: RequestHandler = errorCatch(async (req, res, next) => {
  const users = await prisma.user.findMany();

  const cacheKey = extractCacheKey(req);
  setJsonCache(cacheKey, users);
  res.status(200).json(users);
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
      receiver: {
        select: {
          username: true,
          imageUrl: true,
          role: true,
          email: true,
          id: true,
        },
      },
      sender: {
        select: {
          username: true,
          imageUrl: true,
          role: true,
          email: true,
          id: true,
        },
      },
    },
  });

  return res.status(201).json(newRequest);
});

// * exported
const acceptFriendRequest = errorCatch(async (req, res, next) => {
  const user = req.session.user!;
  const senderId = req.params.senderId;
  const request = await prisma.friendRequest.findFirst({
    where: {
      senderId: senderId,
      receiverId: user.id,
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
        id: request.id,
      },
    });
    return next(ApiError.forbidden("the users are already friends"));
  }
  const newFriendShip = await prisma.friendShip.create({
    data: {
      friendAId: senderId,
      friendBId: user.id,
    },
  });

  return res.status(201).json(newFriendShip);
});

export default {
  fetchUsers,
  postFriendRequest,
  acceptFriendRequest,
};
