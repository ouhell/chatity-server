import { NextFunction, Request, RequestHandler, Response } from "express";
import { ApiError } from "../errors/ApiError";
import { ServerError } from "../types/responses/error";

const getApiResponse = (
  err: ApiError<unknown>,
  req: Request,
  res: Response
): ServerError<unknown> => {
  return {
    isServerServed: true,
    body: "",
    status: err.status,
  };
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    const respData = getApiResponse(err, req, res);
    res.status(err.status).json(respData ?? "error");
  }
};
