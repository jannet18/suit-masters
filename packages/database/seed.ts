// // import { eq } from "drizzle-orm";
// // import { usersTable } from "../db/schema";
// // import { db } from "../db";
// import { createDb } from "./src";

// // const seed = async () => {
// //   console.log("🌱 Starting database seed...");

// //   const users = [
// //     {
// //       kinde_user_id: "kp_1234567890",
// //       email: "john@example.com",
// //       name: "John Doe",
// //       picture: "https://example.com/avatars/john.jpg",
// //       roles: "ADMIN",
// //     },
// //     {
// //       kinde_user_id: "kp_0987654321",
// //       email: "jane@example.com",
// //       name: "Jane Smith",
// //       picture: "https://example.com/avatars/jane.jpg",
// //       roles: "CUSTOMER",
// //     },
// //   ];

// //   for (const user of users) {
// //     const existingUser = await db
// //       .select()
// //       .from(usersTable)
// //       .where(eq(usersTable.email, user.email))
// //       .limit(1);
// //     if (existingUser.length === 0) {
// //       await db.insert(usersTable).values(user);
// //       console.log(`✅ Inserted user: ${user.email}`);
// //     } else {
// //       console.log(`ℹ️ User already exists: ${user.email}`);
// //     }
// //   }

// //   console.log("🌱 Database seed completed.");
// //   process.exit(0);
// // };

// // seed().catch((error) => {
// //   console.error("❌ Seed failed:", error);
// //   process.exit(1);
// // });

// // import { createDb } from "./index";
// // import { customizationGroup, customizationOption, product } from "./schema";

// async function main() {
//   const db = createDb(process.env.DATABASE_URL!);

//   // 1. Create a Base Suit Product
//   const [suit] = await db
//     .insert(product)
//     .values({
//       name: "The Executive Italian Suit",
//       productType: "CUSTOM",
//       basePrice: "799.00",
//     })
//     .returning();

//   // 2. Create Customization Groups
//   const [lapelGroup] = await db
//     .insert(customizationGroup)
//     .values({
//       productId: suit.id,
//       name: "Lapel Style",
//     })
//     .returning();

//   // 3. Add Options
//   await db.insert(customizationOption).values([
//     { groupId: lapelGroup.id, name: "Notch Lapel", priceDelta: "0" },
//     { groupId: lapelGroup.id, name: "Peak Lapel", priceDelta: "50.00" },
//     { groupId: lapelGroup.id, name: "Shawl Lapel", priceDelta: "75.00" },
//   ]);

//   console.log("Seed finished successfully!");
// }

// main();
