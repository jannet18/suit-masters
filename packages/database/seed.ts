// // // import { eq } from "drizzle-orm";
// // // import { usersTable } from "../db/schema";
// // // import { db } from "../db";
// // import { eq } from "drizzle-orm";
// // import { createDb,  } from "../database/src/index";
// // import {
// //   customizationGroup,
// //   customizationOption,
// //   product,
// //   usersTable,
// // } from "./src";
// // import db from "../database/src/index"

// import { product } from "./src";

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

// // async function main() {
// //   const db = createDb(process.env.DATABASE_URL!);

// //   // 1. Create a Base Suit Product
// //   const [suit] = await db
// //     .insert(product)
// //     .values({
// //       name: "The Executive Italian Suit",
// //       productType: "CUSTOM",
// //       basePrice: "799.00",
// //     })
// //     .returning();

// //   // 2. Create Customization Groups
// //   const [lapelGroup] = await db
// //     .insert(customizationGroup)
// //     .values({
// //       product_id: suit.id,
// //       name: "Lapel Style",
// //     })
// //     .returning();

// //   // 3. Add Options
// //   await db.insert(customizationOption).values([
// //     { groupId: lapelGroup.id, name: "Notch Lapel", priceDelta: "0" },
// //     { groupId: lapelGroup.id, name: "Peak Lapel", priceDelta: "50.00" },
// //     { groupId: lapelGroup.id, name: "Shawl Lapel", priceDelta: "75.00" },
// //   ]);

// //   console.log("Seed finished successfully!");
// // }

// // main();
// // Example Seed Data
// async function seed() {
//   // 1. Create a "Standard" Suit (No customization allowed)
//   await db.insert(product).values({
//     name: "The Essential Navy Suit",
//     type: "READY_MADE",
//     basePrice: 450,
//   });

//   // 2. Create a "Custom" Suit Template
//   const [customSuit] = await db
//     .insert(product)
//     .values({
//       name: "Design Your Own Italian Wool Suit",
//       type: "BESPOKE",
//       basePrice: 600,
//     })
//     .returning();

//   // 3. Add Customization Options for the Bespoke Journey
//   await db.insert(customizationOptions).values([
//     { productId: customSuit.id, name: "Peak Lapel", extraCost: 0 },
//     { productId: customSuit.id, name: "Notch Lapel", extraCost: 0 },
//     { productId: customSuit.id, name: "Premium Silk Lining", extraCost: 50 },
//   ]);
// }
