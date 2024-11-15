if (process.env.ENV === "development") {
  const dotenv = require("dotenv");
  dotenv.config();
}
import express from "express";

import path from "path";
import bcrypt from "bcrypt";
import logger from "./utils/logger";
import cookieParser from "cookie-parser";
import { z } from "zod";
import prisma from "./database/databaseClient";
import session from "express-session";
const app = express();

const initApp = async () => {
  if (process.env.NODE_ENV === "development") {
    const morgan = (await import("morgan")).default;

    app.use(morgan("dev"));
    logger.info("ENGAGED MORGAN");
  }

  console.log("databaseurl", process.env.DATABASE_URL);

  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
      },
    })
  );

  app.get("/api/test", async (req, res) => {
    res.cookie("auth-v1", "hello", {
      httpOnly: true,
      secure: true,
      maxAge: 8000000,
    });
    req.session;
    logger.info(req.body);
    res.json({ apiMsg: "hello from ts" });
  });

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
      },
    });

    res.status(201).json(newUser);
    return;
  });

  const loginRequestTemplate = z.object({
    username: z.string(),
    password: z.string(),
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

    res.json(user);
  });

  app.get("/api/users", async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
  });

  // app.get("*", (req, res) => {
  //   res.sendFile(path.join(__dirname, "..", "public", "hello.html"));
  // });

  const PORT = process.env.PORT ?? 4000;

  const HOST = "localhost";

  await prisma.$connect();
  logger.info("PRISMA DATABASE (POSTGRESS) CONNECTED");
  app.listen(PORT, () => {
    logger.info(`SERVER STARTED AT ${HOST}:${PORT}`);
  });
};

initApp();
