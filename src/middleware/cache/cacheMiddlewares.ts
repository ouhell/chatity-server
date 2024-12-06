import { extractCacheKey } from "@/utils/libs/cache/cacheKeys";
import { getJsonCache } from "@/utils/libs/cache/cacheOperations";
import { RequestHandler } from "express";

export const simpleCheckCache: () => RequestHandler =
  () => async (req, res, next) => {
    const cachekey = extractCacheKey(req);
    console.log("cache key is ", cachekey);

    const cacheJson = await getJsonCache(cachekey);
    if (!cacheJson) return next();
    res.json(cacheJson);
  };
