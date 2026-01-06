import request from "supertest";
import { createApp } from "../src/app.js";
import { pool } from "../src/db.js";

describe("GET /issues", () => {
  beforeAll(async () => {
    // Ensure schema exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'OPEN',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Reset data for a deterministic test
    await pool.query("TRUNCATE TABLE issues RESTART IDENTITY;");
    await pool.query(
      `INSERT INTO issues (title, status)
       VALUES ($1, $2), ($3, $4);`,
      ["Test issue 1", "OPEN", "Test issue 2", "IN_PROGRESS"]
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  it("returns issues", async () => {
    const app = createApp();
    const res = await request(app).get("/issues").expect(200);

    expect(res.body).toHaveProperty("issues");
    expect(Array.isArray(res.body.issues)).toBe(true);
    expect(res.body.issues).toHaveLength(2);

    expect(res.body.issues[0]).toEqual(
      expect.objectContaining({ title: "Test issue 1", status: "OPEN" })
    );
  });
});
