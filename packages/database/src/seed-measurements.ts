import { db, measurementDefinitions } from "@repo/db";

async function seedMeasurements() {
  console.log("📏 Seeding measurement definitions...");

  try {
    // Check if table exists by trying to query it
    await db.select().from(measurementDefinitions).limit(1);
    console.log("✅ measurement_definitions table exists");
  } catch (error: any) {
    console.log(
      "❌ measurement_definitions table doesn't exist or error:",
      error.message,
    );
    console.log("Please run database migration first: npm run db:push");
    process.exit(1);
  }

  // Insert measurement definitions
  const result = await db
    .insert(measurementDefinitions)
    .values([
      {
        bodyPart: "height",
        displayName: "Height",
        description:
          "Stand straight with your back against a wall. Measure from the floor to the top of your head. Keep your heels together and look straight ahead.",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-measuring-height-against-a-wall-41506-large.mp4",
        displayOrder: 1,
      },
      {
        bodyPart: "chest",
        displayName: "Chest",
        description:
          "Measure around the fullest part of your chest. Keep the tape measure parallel to the floor and don't pull too tight. Breathe normally.",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-measuring-chest-circumference-41508-large.mp4",
        displayOrder: 2,
      },
      {
        bodyPart: "waist",
        displayName: "Waist",
        description:
          "Find your natural waistline (usually just above the belly button). Measure around this point without sucking in your stomach.",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-measuring-waist-circumference-41509-large.mp4",
        displayOrder: 3,
      },
      {
        bodyPart: "hips",
        displayName: "Seat/Hips",
        description:
          "Measure around the fullest part of your hips and seat. Stand with your feet together and ensure the tape is level all around.",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-measuring-hip-circumference-41510-large.mp4",
        displayOrder: 4,
      },
      {
        bodyPart: "shoulder",
        displayName: "Shoulder Width",
        description:
          "Measure from the edge of one shoulder to the other across your back. Keep your arms relaxed at your sides.",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-measuring-shoulder-width-41511-large.mp4",
        displayOrder: 5,
      },
      {
        bodyPart: "inseam",
        displayName: "Inseam",
        description:
          "Measure from your crotch down to your ankle bone along the inner leg. Stand with your legs slightly apart for accuracy.",
        videoUrl:
          "https://assets.mixkit.co/videos/preview/mixkit-measuring-inseam-length-41512-large.mp4",
        displayOrder: 6,
      },
    ])
    .onConflictDoNothing();

  console.log(`✅ Inserted ${result.rowCount} measurement definitions`);
  console.log("🎯 Sample data ready for testing Indochino-style video guides!");
}

seedMeasurements().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
