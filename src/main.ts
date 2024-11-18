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
import prisma from "./database/databaseClient";
import session from "express-session";
import { applicationBootEnv } from "./env/environmentProvider";
const app = express();

const initApp = async () => {
  if (process.env.NODE_ENV === "development") {
    const morgan = (await import("morgan")).default;

    app.use(morgan("dev"));
    logger.info("ENGAGED MORGAN");
  }

  console.log();
  const redisClient = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect()
    .then((res) => {
      console.log("connected to redis");
      return res;
    });

  let redisStore = new RedisStore({
    client: redisClient,
    prefix: "next-chat-store:",
  });

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

  const signinRequestTemplate = z.object({
    username: z.string(),
    password: z.string(),
    email: z.string().optional(),
  });

  app.post("/api/signin", async (req, res) => {
    const body = signinRequestTemplate.parse(req.body);

    const hashedPwd = await bcrypt.hash(body.password, 12);
    const newUser = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPwd,
        email: body.email,
        role: "BASIC",
      },
    });

    res.status(201).json(newUser);
    return;
  });

  const loginRequestTemplate = z.object({
    username: z.string(),
    password: z.string(),
  });

  app.get("/api/isLoged", (req, res) => {
    res.json(req.session?.user);
  });
  app.post("/api/login", async (req, res, next) => {
    const loginBody = loginRequestTemplate.parse(req.body);
    const user = await prisma.user.findUnique({
      where: {
        username: loginBody.username,
      },
    });

    if (!user) {
      return next("username does not exist");
    }
    const password = user.password;

    const isMatch = await bcrypt.compare(loginBody.password, password);

    if (!isMatch) {
      return next("incorrect password");
    }
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email ?? undefined,
      role: user.role,
    };

    res.json(user);
  });

  const PORT = process.env.PORT ?? 4000;

  const HOST = "localhost";

  await prisma.$connect();
  logger.info("PRISMA DATABASE (POSTGRESS) CONNECTED");
  app.listen(PORT, () => {
    logger.info(`SERVER STARTED AT ${HOST}:${PORT}`);
  });
};

initApp();
