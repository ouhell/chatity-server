import { RequestHandler } from "express";
import { errorCatch } from "../../utils/errorCatch";
import { z } from "zod";
import prisma from "../../database/databaseClient";
import { ApiError } from "../../errors/ApiError";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";

const credentialLoginRequest = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().trim().min(0),
});

export const credentialLogin: RequestHandler = errorCatch(
  async (req, res, next) => {
    const loginRequest = credentialLoginRequest.parse(req.body);
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: loginRequest.identifier },
          { email: loginRequest.identifier },
        ],
      },
    });

    if (!user) {
      return next(ApiError.notFound("user not found"));
    }

    const isMatch = await bcrypt.compare(loginRequest.password, user.password);
    if (!isMatch) {
      return next(ApiError.unAuthorized("incorrect password"));
    }

    req.session.user = {
      id: user.id,
      role: user.role,
      username: user.username,
      email: user.email ?? undefined,
    };

    res.json({ ...req.session.user });
    return;
  }
);

const credentialSigninRequest = z.object({
  username: z.string().trim().min(1),
  email: z.string().trim().email().optional(),
  password: z.string().trim().min(8),
});

export const credentialSignUp: RequestHandler = errorCatch(
  async (req, res, next) => {
    const body = credentialSigninRequest.parse(req.body);

    const existUsername = await prisma.user.findFirst({
      where: {
        username: body.username,
      },
      select: {
        id: true,
      },
    });

    if (existUsername) {
      return next(ApiError.forbidden("username already used"));
    }

    if (body.email) {
      const existsEmail = await prisma.user.findFirst({
        where: {
          email: body.email,
        },
        select: {
          id: true,
        },
      });

      if (existsEmail) {
        return next(ApiError.forbidden("email already exists"));
      }
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
        role: UserRole.BASIC,
      },
    });
    req.session.user = {
      id: newUser.id,
      role: newUser.role,
      username: newUser.username,
      email: newUser.email ?? undefined,
    };
    res.status(201).json(req.session.user);
    return;
  }
);
