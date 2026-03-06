import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env
config({ path: join(__dirname, "../../.env") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in environment variables");
  process.exit(1);
}

async function runSql() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Read SQL file
    const sql = readFileSync(
      join(__dirname, "create-collection-table.sql"),
      "utf8",
    );

    // Execute SQL
    console.log("🚀 Creating collection tables...");
    await client.query(sql);

    console.log("✅ Collection tables created successfully");
  } catch (error) {
    console.error("❌ Error creating collection tables:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSql();
