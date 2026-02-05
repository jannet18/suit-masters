// import fp from "fastify-plugin";
// import { jwtVerify, createRemoteJWKSet } from "jose";
// import { KINDE_AUDIENCE, KINDE_ISSUER, KINDE_JWKS_URL } from "../utils/kinde";
// import { eq } from "drizzle-orm";
// import { usersTable } from "../../../../packages/db/schema/user";

// const JWKS = createRemoteJWKSet(new URL(KINDE_JWKS_URL));

// export const authPlugin = fp(async (app) => {
//   // Declare request.user
//   app.decorateRequest("user", null);

//   app.addHook("preHandler", async (request, reply) => {
//     const authHeader = request.headers.authorization;

//     if (!authHeader) {
//       reply.code(401).send({ error: "Missing token" });
//       return;
//     }

//     const token = authHeader.split(" ")[1];

//     try {
//       // 🔐 Verify JWT (same as before)
//       const { payload } = await jwtVerify(token, JWKS, {
//         issuer: KINDE_ISSUER,
//         audience: KINDE_AUDIENCE,
//       });

//       const email = payload.email as string;
//       const sub = payload.sub as string;
//       const permissions = (payload.permissions ?? []) as string[];

//       // 🧠 Find user in DB
//       const rows = await db
//         .select()
//         .from(usersTable)
//         .where(eq(usersTable.email, email))
//         .limit(1);

//       let user = rows[0];

//       // 👤 Auto-provision user
//       if (!user) {
//         const inserted = await db
//           .insert(usersTable)
//           .values({
//             kinde_user_id: sub,
//             email,
//             name: payload.given_name as string,
//             picture: payload.picture as string,
//             roles: permissions.includes("ADMIN") ? "ADMIN" : "CUSTOMER",
//           })
//           .returning();

//         user = inserted[0];
//       }

//       // ✅ NORMALIZED identity (important improvement)
//       request.user = {
//         id: user.id,
//         kindeUserId: sub,
//         email: user.email,
//         role: user.roles,
//       };
//     } catch (err) {
//       app.log.error(err);
//       reply.code(401).send({ error: "Invalid token" });
//     }
//   });
// });

// // Type safety
// declare module "fastify" {
//   interface FastifyRequest {
//     user: {
//       id: string;
//       kindeUserId: string;
//       email: string;
//       role: string;
//     } | null;
//   }
// }
