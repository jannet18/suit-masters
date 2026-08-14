import { Hono } from "hono";
import type { AuthContext } from "@repo/auth";
import { db, usersTable, eq } from "@repo/db";

const requireAdmin = async (c: any, next: () => Promise<void>) => {
  const user = c.get("user");
  if (!user || (user as { roles?: string })?.roles !== "ADMIN") {
    return c.json({ error: "Access Denied: Unauthorised" }, 403);
  }
  await next();
};

export const usersHandler = new Hono<AuthContext>()
  /**
   * GET /users
   * Admin: list all site users.
   */
  .get("/", requireAdmin, async (c) => {
    try {
      const users = await db.query.usersTable.findMany({
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      });

      return c.json({
        success: true,
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          picture: u.picture,
          roles: u.roles,
          phone: u.phone,
          address: u.address,
          created_at: u.createdAt,
        })),
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return c.json({ success: false, users: [], error: "Failed to fetch users" }, 500);
    }
  })

  /**
   * GET /users/:id
   * Admin: fetch a single user.
   */
  .get("/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      const user = await db.query.usersTable.findFirst({
        where: (table, { eq: eqFn }) => eqFn(table.id, id),
      });

      if (!user) {
        return c.json({ success: false, error: "User not found" }, 404);
      }

      return c.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          roles: user.roles,
          phone: user.phone,
          address: user.address,
          created_at: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return c.json({ success: false, error: "Failed to fetch user" }, 500);
    }
  })

  /**
   * PUT /users/:id
   * Admin: update a user's profile fields.
   */
  .put("/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json<{
        name?: string;
        phone?: string;
        address?: string;
        roles?: string;
      }>();

      const updates: Record<string, any> = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.phone !== undefined) updates.phone = body.phone;
      if (body.address !== undefined) updates.address = body.address;
      if (body.roles !== undefined) updates.roles = body.roles;

      if (Object.keys(updates).length === 0) {
        return c.json({ success: false, error: "Nothing to update" }, 400);
      }

      const [updated] = await db
        .update(usersTable)
        .set(updates)
        .where(eq(usersTable.id, id))
        .returning();

      if (!updated) {
        return c.json({ success: false, error: "User not found" }, 404);
      }

      return c.json({ success: true, user: updated });
    } catch (error) {
      console.error("Failed to update user:", error);
      return c.json({ success: false, error: "Failed to update user" }, 500);
    }
  });
