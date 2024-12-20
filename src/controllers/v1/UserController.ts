import express, { Request, RequestHandler } from "express";
import prisma from "../../database/databaseClient";
import { errorCatch } from "../../utils/libs/errors/errorCatch";
import { z } from "zod";
import { ApiError } from "../../utils/libs/errors/ApiError";
import { extractCacheKey } from "../../utils/libs/cache/cacheKeys";
import { setJsonCache } from "../../utils/libs/cache/cacheOperations";
import { Prisma } from "@prisma/client/";
import {
  getParamStr,
  getParamStrArray,
} from "@/utils/libs/params/paramsOperations";

const getFetchUsersFilterQuery = (req: Request) => {
  const query = req.query;
  console.log("query", query);
  const username = getParamStr(query.username);
  const exclude = getParamStrArray(query.exclude);
  const whereQuery: Prisma.UserWhereInput = {};
  console.log("exclude", exclude);
  let appliedFilters = 0;
  if (username && typeof username === "string" && username.trim()) {
    whereQuery.username = {
      contains: username,
    };
    appliedFilters++;
  }

  if (exclude.length) {
    whereQuery.id = {
      notIn: exclude,
    };
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

export default {
  fetchUsers,
};
