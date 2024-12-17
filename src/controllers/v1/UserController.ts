import express, { Request, RequestHandler } from "express";
import prisma from "../../database/databaseClient";
import { errorCatch } from "../../utils/libs/errors/errorCatch";
import { z } from "zod";
import { ApiError } from "../../utils/libs/errors/ApiError";
import { extractCacheKey } from "../../utils/libs/cache/cacheKeys";
import { setJsonCache } from "../../utils/libs/cache/cacheOperations";
import { Prisma } from "@prisma/client/";

const getFetchUsersFilterQuery = (req: Request) => {
  const { username } = req.query;
  const whereQuery: Prisma.UserWhereInput = {};
  let appliedFilters = 0;
  if (username && typeof username === "string" && username.trim()) {
    whereQuery.username = {
      contains: username,
    };
    appliedFilters++;
  }

  return appliedFilters ? whereQuery : undefined;
};

// * exported
const fetchUsers: RequestHandler = errorCatch(async (req, res, next) => {
  const whereQuery = getFetchUsersFilterQuery(req);
  const users = await prisma.user.findMany({
    where: whereQuery,
  });
  const cacheKey = extractCacheKey(req);
  setJsonCache(cacheKey, users);
  res.status(200).json(users);
});

// * exported
// send a friend request to another user , if there is no friend request and is no blacklisted
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

export default {
  fetchUsers,
  postFriendRequest,
};
