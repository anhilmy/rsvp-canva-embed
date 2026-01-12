import { Request, Response, NextFunction } from "express";
import { createError } from "./errorHandler";

export const apiKeyAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers["x-api-key"] as string;
  const expectedApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== expectedApiKey) {
    return next(createError("Unauthorized: Invalid API key", 401));
  }

  next();
};
