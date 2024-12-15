import express from "express";
import { User } from "@prisma/client";
import prisma from "../../database/databaseClient";
import UserController from "@/controllers/v1/UserController";
import { simpleCheckCache } from "../../middleware/cache/cacheMiddlewares";

export const UserRouter = express.Router();

UserRouter.get("/api/v1/users", simpleCheckCache(), UserController.fetchUsers);

UserRouter.get("/api/v1/users/:userId", async (req, res) => {
  const user = prisma.user.findUnique({
    where: { id: req.params.userId },
  });

  if (!user) {
    res.sendStatus(404);
    return;
  }
  req.session;
  res.json(user);
  return;
});

UserRouter.post(
  "/api/v1/users/:receiverId/friend-request",
  UserController.postFriendRequest
);
