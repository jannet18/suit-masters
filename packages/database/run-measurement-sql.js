// import { readFileSync } from "fs";
// import { Client } from "pg";
// import { fileURLToPath } from "url";
// import { dirname, join } from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Read DATABASE_URL from .env
// const envPath = join(__dirname, "../../.env");
// const envContent = readFileSync(envPath, "utf8");
// const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
// if (!dbUrlMatch) {
//   console.error("DATABASE_URL not found in .env");
//   process.exit(1);
// }

// const DATABASE_URL = dbUrlMatch[1].trim();
// console.log("Connecting to database...");

// const client = new Client({
//   connectionString: DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// async function run() {
//   try {
//     await client.connect();
//     console.log("✅ Connected to database");

//     // Read SQL file
//     const sqlPath = join(__dirname, "create-measurement-table.sql");
//     const sql = readFileSync(sqlPath, "utf8");

//     // Execute SQL
//     const result = await client.query(sql);
//     console.log("✅ SQL executed successfully");

//     // Test the table exists
//     const testResult = await client.query(
//       "SELECT COUNT(*) as count FROM measurement_definitions",
//     );
//     console.log(
//       `📊 measurement_definitions table now has ${testResult.rows[0].count} rows`,
//     );

//     // Test API endpoint would return data
//     console.log("\n🎯 Sample data ready for testing:");
//     console.log("- Height measurement with video guide");
//     console.log("- Chest measurement with video guide");
//     console.log("- Waist measurement with video guide");
//     console.log("- Hips/Seat measurement with video guide");
//     console.log("- Shoulder Width measurement with video guide");
//     console.log("- Inseam measurement with video guide");
//     console.log("\n🔗 API endpoint: GET /measurements/definitions");
//     console.log(
//       "🎨 Frontend: StepMeasurement component with responsive video guides",
//     );
//   } catch (error) {
//     console.error("❌ Error:", error.message);
//     process.exit(1);
//   } finally {
//     await client.end();
//   }
// }

// run();
