import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import { issuesRouter } from "./routes/issues.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: "http://localhost:5173" }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));

    // "server + db are alive"
  app.get("/health/db", async (_req, res) => {
    try {
      const result = await pool.query("SELECT 1 AS ok");
      res.json({ ok: true, db: result.rows[0]?.ok === 1 });
    } catch (err) {
      res.status(500).json({
        ok: false,
        db: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  app.use("/issues", issuesRouter);

  return app;
}
