import logger from "../utils/logger";
import { getRedisClient } from "./redisconfig";

export const getJsonCache = async (cacheKey: string) => {
  logger.info("checking cache for key :" + cacheKey);
  const redisClient = await getRedisClient();
  if (!redisClient) return null;

  const exists = await redisClient.exists(cacheKey);
  if (!exists) return null;

  const cache = await redisClient.get(cacheKey);
  if (!cache) return null;
  const jsonCache = JSON.parse(cache);
  logger.info("cache found for key :" + cacheKey);
  return jsonCache;
};

export const setJsonCache = async (
  cacheKey: string,
  data: any,
  ttl = 10 // 10 sec
) => {
  logger.info("cashing data for key : " + cacheKey);
  if (!data) return;
  const redisClient = await getRedisClient();
  if (!redisClient) return;
  const stringData = JSON.stringify(data);

  await redisClient.set(cacheKey, stringData, {
    EX: ttl,
  });

  logger.info("successfully cashed data for key : " + cacheKey);
};
