import { Hono } from "hono";
import { db } from "@repo/db";
import { asc } from "drizzle-orm";

// Measurement definitions routes
// - GET /measurements/definitions -> returns all measurement definitions with video URLs

export const measurementsHandler = new Hono().get("/definitions", async (c) => {
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
});
