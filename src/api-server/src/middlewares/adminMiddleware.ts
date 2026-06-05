import type { Request, Response, NextFunction } from "express";

export type {};

import { getAuth } from "@clerk/express";
import { routeParam } from "../lib/routeParams";

import { logger } from "../lib/logger";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const role = (auth.sessionClaims?.metadata as { role?: string } | undefined)
    ?.role;

  if (role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
}

export function logAdminActivity(action: string, entityType?: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const auth = getAuth(req);

    try {
      const { db } = await import("../lib/db");

      const { activityLogsTable } = await import("@workspace/db");

      await db.insert(activityLogsTable).values({
        userId: auth.userId ?? "unknown",
        action,
        entityType: entityType ?? null,
        entityId: req.params.id ? routeParam(req.params.id) : null,
        details: req.body ? { body: req.body } : null,
        ipAddress: req.ip ?? null,
      });
    } catch (err) {
      logger.error(err, "Failed to log admin activity");
    }

    next();
  };
}
