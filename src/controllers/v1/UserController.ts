import express, { RequestHandler } from "express";
import prisma from "../../database/databaseClient";
import { errorCatch } from "../../utils/errorCatch";

export const fetchUsers: RequestHandler = errorCatch(async (req, res, next) => {
  const users = await prisma.user.findMany();
  res.status(200).json(users);
});
