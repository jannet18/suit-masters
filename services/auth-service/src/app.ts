// import Fastify from "fastify";
// import { verifyRoutes } from "./routes/verify";
// import { authPlugin } from "./plugins/auth";

// export function buildApp() {
//   const app = Fastify({ logger: true });

//   // Auth plugin (JWT verification + user sync)
//   app.register(authPlugin);

//   // Routes
//   app.register(verifyRoutes, { prefix: "/auth" });

//   return app;
// }
