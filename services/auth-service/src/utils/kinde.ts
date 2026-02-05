// import { create } from "domain";
// import dotenv from "dotenv";
// // import { createRemoteJWKSet } from "jose";

// dotenv.config();

// export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
// export const NODE_ENV = process.env.NODE_ENV || "development";
// export const SESSION_SECRET = process.env.SESSION_SECRET || "defaultsecret";

// export const KINDE_CLIENT_ID = process.env.KINDE_CLIENT_ID || "";
// export const KINDE_DOMAIN = process.env.KINDE_DOMAIN || "";
// export const KINDE_REDIRECT_URI = process.env.KINDE_REDIRECT_URI || "";
// export const KINDE_ISSUER_URL = process.env.KINDE_ISSUER_URL || "";
// export const KINDE_JWKS_URL = process.env.KINDE_JWKS_URL || "";
// export const KINDE_AUDIENCE = process.env.KINDE_AUDIENCE || "";
// export const DATABASE_URL = process.env.DATABASE_URL || "";

// if (!KINDE_ISSUER_URL || !KINDE_AUDIENCE) {
//   throw new Error("Kinde configuration variables are missing");
// }

// // export const jwks = createRemoteJWKSet(new URL(KINDE_JWKS_URL));

// // export async function
import dotenv from "dotenv";
dotenv.config();

export const PORT = Number(process.env.PORT) || 4000;

export const KINDE_ISSUER = process.env.KINDE_ISSUER!;
export const KINDE_AUDIENCE = process.env.KINDE_AUDIENCE!;
export const KINDE_JWKS_URL = process.env.KINDE_JWKS_URL!;
export const DATABASE_URL = process.env.DATABASE_URL!;

if (!KINDE_ISSUER || !KINDE_AUDIENCE || !KINDE_JWKS_URL) {
  throw new Error("Missing Kinde configuration");
}
