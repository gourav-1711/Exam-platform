import { Router } from "express";
import { db, supportMessagesTable } from "@workspace/db";
import { SendSupportMessageBody } from "@workspace/api-zod";

const router = Router();

router.get("/support/messages", async (req, res) => {
  try {
    const messages = await db.select().from(supportMessagesTable);
    res.json(messages.map(m => ({
      id: m.id,
      message: m.message,
      sender: m.sender,
      createdAt: m.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/support/messages", async (req, res) => {
  try {
    const parse = SendSupportMessageBody.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Invalid body" });

    const [msg] = await db.insert(supportMessagesTable).values({
      message: parse.data.message,
      sender: "user",
    }).returning();

    res.status(201).json({
      id: msg.id,
      message: msg.message,
      sender: msg.sender,
      createdAt: msg.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
