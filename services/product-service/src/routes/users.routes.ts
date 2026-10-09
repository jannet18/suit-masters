import { Hono } from "hono";
import { db, usersTable, desc } from "@repo/db";
import { getUser, requireRole, type AuthEnv } from "@repo/auth";

export const usersHandler = new Hono<AuthEnv>();

/**
 * GET /users
 * Admin: list all site users.
 */
usersHandler.get("/", getUser, requireRole("ADMIN"), async (c) => {
  try {
    const users = await db.query.usersTable.findMany({
      orderBy: [desc(usersTable.createdAt)],
      columns: {
        id: true,
        email: true,
        name: true,
        picture: true,
        roles: true,
        createdAt: true,
      },
    });

    return c.json({ success: true, users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return c.json(
      { success: false, users: [], error: "Failed to fetch users" },
      500,
    );
  }
});
