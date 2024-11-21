if (process.env.ENV === "development") {
  const dotenv = require("dotenv");
  dotenv.config();
}
import express from "express";
import { createClient } from "redis";
import RedisStore from "connect-redis";
import path from "path";
import bcrypt from "bcrypt";
import logger from "./utils/logger";
import cookieParser from "cookie-parser";
import { z } from "zod";
import cors from "cors";
import prisma from "./database/databaseClient";
import session from "express-session";
import { applicationBootEnv } from "./env/environmentProvider";
import { getRedisClient } from "./cache/redisconfig";
import { AuthRouter } from "./routes/v1/AuthRouter";
import { UserRouter } from "./routes/v1/UserRouter";
import { errorHandler } from "./middleware/errorHandler";
import { ConversationRouter } from "./routes/v1/ConservationRouter";
const app = express();

const initApp = async () => {
  if (process.env.NODE_ENV === "development") {
    const morgan = (await import("morgan")).default;

    app.use(morgan("dev"));
    logger.info("ENGAGED MORGAN");
  }

  console.log();
  const redisClient = await getRedisClient();

  let redisStore = new RedisStore({
    client: redisClient,
    prefix: "next-chat-store:",
  });
  app.use(cors());
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    session({
      secret: applicationBootEnv.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
      },
      name: "next-chat-session",
      store: redisStore,
    })
  );

  // routers setup

  app.use(AuthRouter);
  app.use(UserRouter);
  app.use(ConversationRouter);

  app.get("/api/isLoged", (req, res) => {
    res.json(req.session?.user);
  });

  app.use(errorHandler);

  const PORT = process.env.PORT ?? 4000;

  const HOST = "localhost";

  await prisma.$connect();
  logger.info("PRISMA DATABASE (POSTGRESS) CONNECTED");
  app.listen(PORT, () => {
    logger.info(`SERVER STARTED AT ${HOST}:${PORT}`);
  });
};

initApp();
