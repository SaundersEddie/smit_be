import { Router } from "express";
import { pool } from "../db.js";

export const issuesRouter = Router();

issuesRouter.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, status, created_at FROM issues ORDER BY id ASC"
    );
    res.json({ issues: result.rows });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
