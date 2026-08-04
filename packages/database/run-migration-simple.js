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

    console.log("🚀 Running migration script...");

    // Execute the entire SQL file as one query
    // PostgreSQL can handle multiple statements in one query
    await client.query(sql);

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

    // Check shop_order columns
    console.log("\n🔍 Checking shop_order columns...");
    const shopOrderColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'shop_order' 
      ORDER BY ordinal_position;
    `);

    console.log(`📊 shop_order has ${shopOrderColumns.rows.length} columns`);
    const importantColumns = [
      "created_at",
      "updated_at",
      "estimated_delivery_date",
      "tailor_notes",
    ];
    for (const column of importantColumns) {
      const exists = shopOrderColumns.rows.some(
        (row) => row.column_name === column,
      );
      console.log(`   ${exists ? "✅" : "❌"} ${column}`);
    }
  } catch (error) {
    console.error("❌ Error running migration:", error.message);
    console.error("Error details:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
