import path from "path";
import { execSync } from "child_process";
import app from "./app";
import { logger } from "./lib/logger";

// Automatically sync database schema on startup in development
try {
  logger.info("Checking and syncing database schema...");
  const dbPath = path.resolve(__dirname, "../../../lib/db");
  execSync("pnpm run push", {
    cwd: dbPath,
    stdio: "inherit",
    env: { ...process.env }
  });
  logger.info("Database schema synced successfully!");
} catch (err) {
  logger.error({ err }, "Database sync failed. Please ensure your PostgreSQL connection is active and DATABASE_URL is set correctly.");
}

const rawPort =
  process.env["API_PORT"] ??
  (process.env.NODE_ENV === "production" ? process.env["PORT"] : undefined) ??
  "4000";

if (!rawPort) {
  throw new Error(
    "API_PORT or PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});