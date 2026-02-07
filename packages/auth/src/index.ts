// import { Hono } from "hono";
// import { jwk } from "hono/jwk";
// import { createDb, usersTable, eq } from "@repo/db";

// // 1. Define your Context types (variables you want to access in routes)
// type Variables = {
//   jwtPayload: any;
//   user: {
//     id: string;
//     kinde_user_id: string;
//     role: string;
//     sub?: string;
//   };
// };

// const app = new Hono<{ Variables: Variables }>();
// const db = createDb(process.env.DATABASE_URL!);

// // 2. The Middleware (Verifies the Token and finds the local DB User)
// app.use(
//   "/api/*",
//   jwk({
//     jwks_uri: process.env.KINDE_JWKS_URL!,
//     alg: ["RS256"],
//   }),
//   async (c, next) => {
//     const payload = c.get("jwtPayload");
//     if (!payload || !payload.sub) {
//       return c.json({ error: "Invalid token" }, 401);
//     }
//     // Find the user in YOUR database using the Kinde ID (sub)
//     const [user] = await db
//       .select()
//       .from(usersTable)
//       .where(eq(usersTable.kinde_user_id, payload.sub))
//       .limit(1);

//     if (!user) {
//       return c.json({ error: "User not synced" }, 404);
//     }

//     // Set the user in context so all routes can use it
//     c.set("user", {
//       id: user.id,
//       kinde_user_id: payload.sub,
//       role: user.roles,
//     });

//     await next();
//   },
// );

// // 3. Example of a Protected Route
// app.get("/api/verify", (c) => {
//   const user = c.var.user; // Fully typed!
//   return c.json({ user });
// });
// import { Hono } from "hono";
// import { authMiddleware } from "./middleware/authMiddleware";
// // import { authMiddleware } from "./middleware/auth";

// const app = new Hono();

// app.get("/whoami", authMiddleware, (c) => {
//   return c.json({
//     user: c.get("user"),
//     token: c.get("kinde"),
//   });
// });

// export default app;
