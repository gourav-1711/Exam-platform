import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { supportMessagesTable } from "@workspace/db";
import { AppError } from "../middleware/errorHandler";

const SendSupportMessageBody = z.object({
  message: z.string().min(1).max(2000),
});

const router = Router();

router.get("/support/messages", async (req, res, next) => {
  try {
    const messages = await db.select().from(supportMessagesTable);
    return res.json(
      messages.map((m) => ({
        id: m.id,
        message: m.message,
        sender: m.sender,
        createdAt: m.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    return next(err);
  }
});

router.post("/support/messages", async (req, res, next) => {
  try {
    const parse = SendSupportMessageBody.safeParse(req.body);
    if (!parse.success) {
      return next(new AppError(400, "Invalid body"));
    }

    const [msg] = await db
      .insert(supportMessagesTable)
      .values({
        message: parse.data.message,
        sender: "user",
      })
      .returning();

    return res.status(201).json({
      id: msg.id,
      message: msg.message,
      sender: msg.sender,
      createdAt: msg.createdAt.toISOString(),
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
