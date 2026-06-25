import { Hono } from "hono";
import { db } from "@repo/db";
import { userMeasurements } from "@repo/db/schema";
import { asc, eq, and } from "@repo/db";

type AuthUser = { id: string };

type Variables = {
  user: AuthUser;
};

// Measurement definitions routes
// - GET /measurements/definitions -> returns all measurement definitions with video URLs

export const measurementsHandler = new Hono<{ Variables: Variables }>()
  // --- Public: measurement definitions (video guides) ---
  .get("/definitions", async (c) => {
    try {
      const definitions = await db.query.measurementDefinitions.findMany({
        orderBy: (def: any, { asc }: any) => [asc(def.displayOrder), asc(def.id)],
      });

      // Format the response
      const formattedDefinitions = definitions.map((def: any) => ({
        id: def.id,
        bodyPart: def.bodyPart,
        displayName: def.displayName,
        description: def.description || "",
        videoUrl: def.videoUrl || "",
        displayOrder: def.displayOrder,
      }));

      return c.json({ success: true, definitions: formattedDefinitions });
    } catch (error) {
      console.error("Error fetching measurement definitions", error);
      return c.json(
        {
          success: false,
          definitions: [],
          error: "Failed to fetch measurement definitions",
        },
        500,
      );
    }
  })

  // --- Protected: get all measurement profiles for the current user ---
  .get("/profiles", async (c) => {
    try {
      const user = c.get("user") as AuthUser | undefined;
      const userId = user?.id;
      if (!userId) {
        return c.json({ success: false, profiles: [], error: "Unauthorized" }, 401);
      }

      const profiles = await db
        .select()
        .from(userMeasurements)
        .where(eq(userMeasurements.userId, userId))
        .orderBy(asc(userMeasurements.createdAt));

      return c.json({ success: true, profiles });
    } catch (error) {
      console.error("Error fetching measurement profiles", error);
      return c.json({ success: false, profiles: [], error: "Failed to fetch profiles" }, 500);
    }
  })

  // --- Protected: create a new measurement profile ---
  .post("/profiles", async (c) => {
    try {
      const user = c.get("user") as AuthUser | undefined;
      const userId = user?.id;
      if (!userId) {
        return c.json({ success: false, error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const { profileName, unit, height, chest, waist, hips, inseam, shoulder, isDefault } = body;

      if (!profileName || !unit) {
        return c.json({ success: false, error: "profileName and unit are required" }, 400);
      }

      // If setting as default, unset any existing default first
      if (isDefault) {
        await db
          .update(userMeasurements)
          .set({ isDefault: false })
          .where(and(eq(userMeasurements.userId, userId), eq(userMeasurements.isDefault, true)));
      }

      const [profile] = await db
        .insert(userMeasurements)
        .values({
          userId,
          profileName,
          unit,
          height: height.toString(),
          chest: chest.toString(),
          waist: waist.toString(),
          hips: hips.toString(),
          inseam: inseam.toString(),
          shoulder: shoulder.toString(),
          isDefault: isDefault || false,
        })
        .returning();

      return c.json({ success: true, profile }, 201);
    } catch (error) {
      console.error("Error creating measurement profile", error);
      return c.json({ success: false, error: "Failed to create profile" }, 500);
    }
  })

  // --- Protected: update a measurement profile ---
  .put("/profiles/:id", async (c) => {
    try {
      const user = c.get("user") as AuthUser | undefined;
      const userId = user?.id;
      if (!userId) {
        return c.json({ success: false, error: "Unauthorized" }, 401);
      }

      const profileId = c.req.param("id");
      const body = await c.req.json();

      // Verify ownership
      const existing = await db
        .select()
        .from(userMeasurements)
        .where(and(eq(userMeasurements.id, profileId), eq(userMeasurements.userId, userId)))
        .limit(1);

      if (existing.length === 0) {
        return c.json({ success: false, error: "Profile not found" }, 404);
      }

      // If setting as default, unset any existing default first
      if (body.isDefault) {
        await db
          .update(userMeasurements)
          .set({ isDefault: false })
          .where(and(eq(userMeasurements.userId, userId), eq(userMeasurements.isDefault, true)));
      }

      const updateData: Record<string, any> = {};
      const fields = ["profileName", "unit", "height", "chest", "waist", "hips", "inseam", "shoulder", "isDefault"];
      for (const field of fields) {
        if (body[field] !== undefined) {
          updateData[field] = field === "isDefault" ? body[field] : String(body[field]);
        }
      }

      const [updated] = await db
        .update(userMeasurements)
        .set(updateData)
        .where(eq(userMeasurements.id, profileId))
        .returning();

      return c.json({ success: true, profile: updated });
    } catch (error) {
      console.error("Error updating measurement profile", error);
      return c.json({ success: false, error: "Failed to update profile" }, 500);
    }
  })

  // --- Protected: delete a measurement profile ---
  .delete("/profiles/:id", async (c) => {
    try {
      const user = c.get("user") as AuthUser | undefined;
      const userId = user?.id;
      if (!userId) {
        return c.json({ success: false, error: "Unauthorized" }, 401);
      }

      const profileId = c.req.param("id");

      // Verify ownership
      const existing = await db
        .select()
        .from(userMeasurements)
        .where(and(eq(userMeasurements.id, profileId), eq(userMeasurements.userId, userId)))
        .limit(1);

      if (existing.length === 0) {
        return c.json({ success: false, error: "Profile not found" }, 404);
      }

      await db.delete(userMeasurements).where(eq(userMeasurements.id, profileId));

      return c.json({ success: true, message: "Profile deleted" });
    } catch (error) {
      console.error("Error deleting measurement profile", error);
      return c.json({ success: false, error: "Failed to delete profile" }, 500);
    }
  });
