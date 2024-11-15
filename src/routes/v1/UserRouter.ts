import express from "express";
import { User } from "@prisma/client";
import prisma from "../../database/databaseClient";
import { fetchUsers } from "../../controllers/v1/UserController";

const UserRouter = express.Router();

UserRouter.get("/api/v1/users", fetchUsers);

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

UserRouter.post("/api/v1/users", (req, res, next) => {});
