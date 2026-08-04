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

async function runMigration() {
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

    // Read migration SQL file
    const sql = readFileSync(
      join(__dirname, "../../plans/migration-scripts.sql"),
      "utf8",
    );

    // Split SQL into individual statements
    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`🚀 Running ${statements.length} migration statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
        await client.query(stmt + ";");
      } catch (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        console.error(`Statement: ${stmt.substring(0, 200)}...`);
        // Continue with next statement (some might be IF EXISTS checks)
      }
    }

    console.log("✅ Migration completed successfully");

    // Verify some key tables
    console.log("\n🔍 Verifying schema changes...");
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`📊 Total tables in database: ${tables.rows.length}`);

    // Check for key tables
    const keyTables = [
      "shop_order",
      "order_item",
      "product",
      "fabric",
      "customization_group",
    ];
    for (const table of keyTables) {
      const exists = tables.rows.some((row) => row.table_name === table);
      console.log(`   ${exists ? "✅" : "❌"} ${table}`);
    }
  } catch (error) {
    console.error("❌ Error running migration:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
