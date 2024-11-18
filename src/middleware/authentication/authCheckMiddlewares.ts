import { RequestHandler } from "express";
import { User, UserRole } from "@prisma/client";
import { ApiError } from "../../errors/ApiError";

export const isAuthenticated: (...roles: UserRole[]) => RequestHandler =
  (roles) => (req, res, next) => {
    const user = req.session.user;
    if (!user) {
      return next(ApiError.unAuthorized("user not authenticated"));
    }

    if (roles.length && !roles.includes(user.role)) {
      return next(ApiError.forbidden("unsufficient authorization"));
    }

    return next();
  };
