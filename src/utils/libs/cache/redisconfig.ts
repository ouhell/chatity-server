import logger from "@/utils/logger";
import { RedisClientType } from "redis";
import { createClient } from "redis";

type RedisConfig = {
  client: ReturnType<typeof createClient> | null;
};

const redisConfig: RedisConfig = {
  client: null,
};

export const getRedisClient = async () => {
  let client = redisConfig.client;
  if (!redisConfig.client) {
    client = await createClient()
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect()
      .then((res) => {
        logger.info("REDIS CACH DB CONNECTED");
        return res;
      });
    redisConfig.client = client;
  }
  return client;
};
