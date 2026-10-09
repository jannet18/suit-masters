/**
 * One-off seed: populates customization_group/customization_option for the
 * suit categories so the bespoke configurator (2D steps + 3D viewer) has
 * real data to render instead of empty sections. Idempotent — safe to re-run,
 * skips any group/option that already exists (matched by name+category or
 * factory_code).
 *
 *   npm run db:seed:customization -w @repo/db
 *
 * factory_code values here are what the 3D viewer's meshMapping.ts keys off
 * to decide which GLB sub-mesh to show (see
 * apps/frontend/app/components/configurator/3d/meshMapping.ts).
 */
import { db, customizationGroup, customizationOption, eq, and } from "../src/index.js";

const SUIT_CATEGORY_IDS = [5, 6, 7]; // Business, Wedding, Boardroom suits

const LAPEL_OPTIONS = [
  { value: "Notch Lapel", factoryCode: "LAPEL_NOTCH", priceDelta: 0 },
  { value: "Peak Lapel", factoryCode: "LAPEL_PEAK", priceDelta: 1500 },
  { value: "Shawl Lapel", factoryCode: "LAPEL_SHAWL", priceDelta: 2000 },
];

const POCKET_OPTIONS = [
  { value: "Flap Pocket", factoryCode: "POCKET_FLAP", priceDelta: 0 },
  { value: "Piped Pocket", factoryCode: "POCKET_PIPED", priceDelta: 1000 },
  { value: "Ticket Pocket", factoryCode: "POCKET_TICKET", priceDelta: 1500 },
];

const BUTTON_OPTIONS = [
  { value: "1 Button", factoryCode: "BUTTON_1B", priceDelta: 0 },
  { value: "2 Button", factoryCode: "BUTTON_2B", priceDelta: 0 },
  { value: "Double Breasted 6 Button", factoryCode: "BUTTON_DB6", priceDelta: 3000 },
];

const LINING_OPTIONS = [
  { value: "Navy Cotton", priceDelta: 0 },
  { value: "Burgundy Silk", priceDelta: 4500 },
  { value: "Silver Jacquard", priceDelta: 6000 },
];

const FABRIC_OPTIONS = [
  {
    name: "Navy Super 120s",
    value: "Navy Super 120s",
    texture: "bg-gradient-to-br from-blue-950 to-blue-900",
    priceDelta: 0,
    metadata: { origin: "Italy", composition: "100% Wool", weight: "Super 120s" },
  },
  {
    name: "Charcoal Tweed",
    value: "Charcoal Tweed",
    texture: "bg-gradient-to-br from-zinc-700 to-zinc-800",
    priceDelta: 2500,
    metadata: { origin: "Scotland", composition: "Wool Blend", weight: "Heavy" },
  },
  {
    name: "Midnight Black",
    value: "Midnight Black",
    texture: "bg-gradient-to-br from-neutral-950 to-black",
    priceDelta: 5000,
    metadata: { origin: "England", composition: "100% Wool", weight: "Super 150s" },
  },
];

async function upsertGroup(categoryId: number, name: string, displayOrder: number) {
  const existing = await db.query.customizationGroup.findFirst({
    where: and(
      eq(customizationGroup.categoryId, categoryId),
      eq(customizationGroup.name, name),
    ),
  });
  if (existing) return existing;

  const [created] = await db
    .insert(customizationGroup)
    .values({ categoryId, name, isRequired: true, displayOrder })
    .returning();
  return created!;
}

async function upsertOption(
  groupId: number,
  opt: {
    value: string;
    name?: string;
    priceDelta: number;
    factoryCode?: string;
    texture?: string;
    metadata?: Record<string, string>;
  },
) {
  const existing = await db.query.customizationOption.findFirst({
    where: and(
      eq(customizationOption.groupId, groupId),
      eq(customizationOption.value, opt.value),
    ),
  });
  if (existing) return existing;

  const [created] = await db
    .insert(customizationOption)
    .values({
      groupId,
      name: opt.name ?? opt.value,
      value: opt.value,
      priceDelta: opt.priceDelta,
      factoryCode: opt.factoryCode,
      texture: opt.texture,
      metadata: opt.metadata,
    })
    .returning();
  return created!;
}

async function main() {
  for (const categoryId of SUIT_CATEGORY_IDS) {
    const lapelGroup = await upsertGroup(categoryId, "Lapel Style", 1);
    for (const opt of LAPEL_OPTIONS) await upsertOption(lapelGroup.id, opt);

    const pocketGroup = await upsertGroup(categoryId, "Pocket Style", 2);
    for (const opt of POCKET_OPTIONS) await upsertOption(pocketGroup.id, opt);

    const buttonGroup = await upsertGroup(categoryId, "Button Configuration", 3);
    for (const opt of BUTTON_OPTIONS) await upsertOption(buttonGroup.id, opt);

    const liningGroup = await upsertGroup(categoryId, "Lining", 4);
    for (const opt of LINING_OPTIONS) await upsertOption(liningGroup.id, opt);

    const fabricGroup = await upsertGroup(categoryId, "Fabric", 0);
    for (const opt of FABRIC_OPTIONS) await upsertOption(fabricGroup.id, opt);

    console.log(`Seeded customization options for category ${categoryId}`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
