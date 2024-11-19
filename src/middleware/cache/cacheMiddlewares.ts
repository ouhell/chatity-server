import { RequestHandler } from "express";
import { extractCacheKey } from "../../cache/cacheKeys";
import { getRedisClient } from "../../cache/redisconfig";
import { getJsonCache } from "../../cache/cacheOperations";

export const simpleCheckCache: () => RequestHandler =
  () => async (req, res, next) => {
    const cachekey = req.cacheKey ?? extractCacheKey(req);

    const cacheJson = await getJsonCache(cachekey);
    if (!cacheJson) return next();
    res.json(cacheJson);
  };
