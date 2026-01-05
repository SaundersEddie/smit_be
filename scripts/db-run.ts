import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

function usageAndExit(): never {
  console.error("Usage: tsx scripts/db-run.ts <relative-path-to-sql-file-or-folder>");
  console.error("Example: tsx scripts/db-run.ts db/sql/001_init.sql");
  console.error("Example: tsx scripts/db-run.ts db/sql");
  process.exit(1);
}

function listSqlFiles(targetPath: string): string[] {
  const stat = fs.statSync(targetPath);

  if (stat.isFile()) {
    if (!targetPath.toLowerCase().endsWith(".sql")) {
      throw new Error(`Not a .sql file: ${targetPath}`);
    }
    return [targetPath];
  }

  if (stat.isDirectory()) {
    return fs
      .readdirSync(targetPath)
      .filter((f) => f.toLowerCase().endsWith(".sql"))
      .sort()
      .map((f) => path.join(targetPath, f));
  }

  throw new Error(`Not a file or directory: ${targetPath}`);
}

async function main() {
  const arg = process.argv[2];
  if (!arg) usageAndExit();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Add it to .env");
  }

  const target = path.resolve(process.cwd(), arg);
  const files = listSqlFiles(target);

  const pool = new pg.Pool({ connectionString: databaseUrl });

  try {
    // Run in a transaction so partial failures don't leave junk behind
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const file of files) {
        const sql = fs.readFileSync(file, "utf8").trim();
        if (!sql) continue;

        console.log(`Running: ${path.relative(process.cwd(), file)}`);
        await client.query(sql);
      }

      await client.query("COMMIT");
      console.log("Done.");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("DB script failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
