import express from "express";
import helmet from "helmet";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { env } from "./config/env";
import { globalRateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";
import webhooksRouter from "./routes/webhooks";

export function createApp() {
  const app = express();

  // 1. Security headers first
  app.use(helmet());
  app.set("trust proxy", 1);
  app.use(clerkMiddleware());
  // 2. CORS — whitelist only
  app.use(
    cors({
      origin: env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // 3. Webhook route — must be BEFORE body parsers to get raw body
  // Only apply express.raw() to the specific webhook path, not all /api routes
  app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), webhooksRouter);

  // 4. Body parsing
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // 4. Global rate limiter (lenient — per-route can be stricter)
  app.use(globalRateLimiter);

  // 5. Routes
  app.use("/api", routes);

  // 6. 404 handler
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  // 7. Central error handler — MUST be last
  app.use(errorHandler);

  return app;
}

export default createApp();
