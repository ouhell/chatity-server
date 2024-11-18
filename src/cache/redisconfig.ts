import { RedisClientType } from "redis";
import Redis from "redis";

type RedisConfig = {
  client: ReturnType<(typeof Redis)["createClient"]> | null;
};

export const redisConfig = {
  client: null,
};

// export const getRedisClient = async () : RedisConfig["client"]! => {
//       let client = redisConfig.client;
//       if(!redisConfig.client) {
//        client = Redis.createClient();
//       }
// }
