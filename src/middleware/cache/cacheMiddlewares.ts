import { RequestHandler } from "express";
import { extractCacheKey } from "../../cache/cacheKeys";
import { getRedisClient } from "../../cache/redisconfig";
import { getJsonCache } from "../../cache/cacheOperations";

export const simpleCheckCache: () => RequestHandler =
  () => async (req, res, next) => {
    const cachekey = extractCacheKey(req);
    console.log("cache key is ", cachekey);

    const cacheJson = await getJsonCache(cachekey);
    if (!cacheJson) return next();
    res.json(cacheJson);
  };
