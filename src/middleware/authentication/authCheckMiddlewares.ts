import { RequestHandler } from "express";

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    next("authentication failed");
  }
};
