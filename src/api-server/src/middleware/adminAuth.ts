import type { RequestHandler } from "express";
import { getAuth } from "@clerk/express";
import { AppError } from "./errorHandler";

export const requireAdmin: RequestHandler = (req, _res, next) => {
  const auth = getAuth(req);
  if (!auth.userId) return next(new AppError(401, "Unauthorized"));

  const role = (auth.sessionClaims?.metadata as { role?: string } | undefined)
    ?.role;

  if (role !== "admin") return next(new AppError(403, "Forbidden"));

  return next();
};
