// src/api-server/src/middleware/idor.middleware.ts
import { NextFunction, Request, Response } from "express";

const protectUserId = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  const resourceUserId = req.params.userId;

  if (userId !== resourceUserId && !(req as any).user?.isAdmin) {
    return res.status(403).json({
      message: "Access forbidden. Unauthorized to access this resource.",
    });
  }

  next();
  return;
};

export default protectUserId;
