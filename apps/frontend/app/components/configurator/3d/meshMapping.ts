/**
 * The contract between this 3D viewer and the GLB asset it loads.
 *
 * Expects `/public/models/suit/suit_base.glb` to contain a base torso +
 * trouser mesh plus one sub-mesh per selectable option below, each hidden by
 * default except the first in its group. The viewer toggles `mesh.visible`
 * per group based on the shopper's selection — it never mutates geometry.
 *
 * Until that file exists, `SuitModel` falls back to `PlaceholderSuit`, a
 * primitive-geometry stand-in that honours the exact same selection state
 * (same mesh keys, same visibility swapping, same camera-focus behaviour) so
 * the feature is fully interactive today and becomes photoreal the moment a
 * real GLB matching this mapping is dropped in — no code changes required.
 *
 * Mesh keys here key off `customizationOption.factoryCode` (see
 * packages/database/src/schema/products.ts) falling back to `.value` when a
 * catalogue option has no factory code set yet.
 */

export type MeshGroup = "lapel" | "pocket" | "button";

export const LAPEL_MESH_BY_CODE: Record<string, string> = {
  LAPEL_NOTCH: "mesh_lapel_notch",
  LAPEL_PEAK: "mesh_lapel_peak",
  LAPEL_SHAWL: "mesh_lapel_shawl",
  // Fallback for catalogue rows that only have a human label, no code yet.
  "Notch Lapel": "mesh_lapel_notch",
  "Peak Lapel": "mesh_lapel_peak",
  "Shawl Lapel": "mesh_lapel_shawl",
};

export const POCKET_MESH_BY_CODE: Record<string, string> = {
  POCKET_FLAP: "mesh_pocket_flap",
  POCKET_PIPED: "mesh_pocket_piped",
  POCKET_TICKET: "mesh_pocket_ticket",
  "Flap Pocket": "mesh_pocket_flap",
  "Piped Pocket": "mesh_pocket_piped",
  "Ticket Pocket": "mesh_pocket_ticket",
};

export const BUTTON_MESH_BY_CODE: Record<string, string> = {
  BUTTON_1B: "mesh_button_1b",
  BUTTON_2B: "mesh_button_2b",
  BUTTON_DB6: "mesh_button_db",
  "1 Button": "mesh_button_1b",
  "2 Button": "mesh_button_2b",
  "Double Breasted 6 Button": "mesh_button_db",
};

export const MESH_MAPS: Record<MeshGroup, Record<string, string>> = {
  lapel: LAPEL_MESH_BY_CODE,
  pocket: POCKET_MESH_BY_CODE,
  button: BUTTON_MESH_BY_CODE,
};

/** All mesh names the GLB is expected to contain (used to drive the placeholder too). */
export const ALL_MESH_NAMES = Object.values(MESH_MAPS).flatMap((map) =>
  Array.from(new Set(Object.values(map))),
);

/**
 * Resolves a shopper's selection (factoryCode or raw label) to the GLB mesh
 * name that should be visible for a given group. Returns the group's first
 * known mesh as a safe default when nothing matches yet.
 */
export function resolveMeshName(group: MeshGroup, codeOrLabel: string | undefined): string {
  const map = MESH_MAPS[group];
  const names = Object.values(map);
  if (!codeOrLabel) return names[0]!;
  return map[codeOrLabel] ?? names[0]!;
}

export const FABRIC_TEXTURE_MAPS = {
  diffuse: "/textures/fabrics/diffuse.jpg",
  normal: "/textures/fabrics/normal.jpg",
  roughness: "/textures/fabrics/roughness.jpg",
} as const;

/** Realistic fabric-weave scale for a 1x1m UV-unwrapped suit mesh. */
export const FABRIC_TEXTURE_REPEAT: [number, number] = [8, 8];
