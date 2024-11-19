import express, { RequestHandler } from "express";
import prisma from "../../database/databaseClient";
import { errorCatch } from "../../utils/errorCatch";
import { setJsonCache } from "../../cache/cacheOperations";
import { extractCacheKey } from "../../cache/cacheKeys";

export const fetchUsers: RequestHandler = errorCatch(async (req, res, next) => {
  const users = await prisma.user.findMany();
  const cacheKey = extractCacheKey(req);
  setJsonCache(cacheKey, users);
  res.status(200).json(users);
});
