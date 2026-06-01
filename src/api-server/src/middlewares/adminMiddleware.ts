import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { routeParam } from "../lib/routeParams";

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
  console.log("Admin access attempt by user:", auth);
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
      const { db, activityLogsTable } = await import("@workspace/db");
      await db.insert(activityLogsTable).values({
        userId: auth.userId ?? "unknown",
        action,
        entityType: entityType ?? null,
        entityId: req.params.id ? routeParam(req.params.id) : null,
        details: req.body ? { body: req.body } : null,
        ipAddress: req.ip ?? null,
      });
    } catch {}
    next();
  };
}
