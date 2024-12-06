import { NextFunction, Request, Response } from "express";

export const errorCatch = <R extends Request, S extends Response>(
  fun: (req: R, res: S, next: NextFunction) => Promise<any>
) => {
  return async (req: R, res: S, next: NextFunction) => {
    try {
      await fun(req, res, next);
    } catch (e) {
      next(e);
      return;
    }
  };
};
