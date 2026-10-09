"use client";

import { useMemo } from "react";
import { colors } from "../../Configurator";
import { resolveMeshName } from "./meshMapping";

interface PlaceholderSuitProps {
  fabricColorId: string;
  lapelCode?: string;
  pocketCode?: string;
  buttonCode?: string;
}

/**
 * A primitive-geometry stand-in for the real GLB (see meshMapping.ts for why
 * this exists). It honours the exact same selection state a real model
 * would: lapel/pocket/button sub-meshes swap visibility by name, and the
 * jacket's material recolors with the chosen fabric swatch. Not meant to be
 * photoreal — meant to make the feature fully clickable before a 3D artist's
 * asset exists.
 */
export function PlaceholderSuit({
  fabricColorId,
  lapelCode,
  pocketCode,
  buttonCode,
}: PlaceholderSuitProps) {
  const fabricHex = useMemo(
    () => colors.find((c) => c.id === fabricColorId)?.hex ?? "#1a2744",
    [fabricColorId],
  );

  const visibleLapel = resolveMeshName("lapel", lapelCode);
  const visiblePocket = resolveMeshName("pocket", pocketCode);
  const visibleButton = resolveMeshName("button", buttonCode);

  const buttonCount = buttonCode === "1 Button" || buttonCode === "BUTTON_1B" ? 1 : buttonCode === "Double Breasted 6 Button" || buttonCode === "BUTTON_DB6" ? 6 : 2;

  return (
    <group position={[0, -0.1, 0]}>
      {/* Torso / jacket body */}
      <mesh name="mesh_torso" position={[0, 0.55, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.42, 0.75, 8, 16]} />
        <meshStandardMaterial color={fabricHex} roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Shoulders */}
      <mesh name="mesh_shoulders" position={[0, 1.02, 0]} castShadow>
        <boxGeometry args={[1.0, 0.16, 0.42]} />
        <meshStandardMaterial color={fabricHex} roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Lapels — only the one matching the active selection is visible */}
      <mesh
        name="mesh_lapel_notch"
        visible={visibleLapel === "mesh_lapel_notch"}
        position={[-0.14, 0.8, 0.36]}
        rotation={[0.1, 0.3, 0.15]}
        castShadow
      >
        <boxGeometry args={[0.16, 0.42, 0.03]} />
        <meshStandardMaterial color={fabricHex} roughness={0.7} />
      </mesh>
      <mesh
        name="mesh_lapel_peak"
        visible={visibleLapel === "mesh_lapel_peak"}
        position={[-0.14, 0.82, 0.36]}
        rotation={[0.1, 0.5, 0.3]}
        castShadow
      >
        <coneGeometry args={[0.14, 0.4, 3]} />
        <meshStandardMaterial color={fabricHex} roughness={0.7} />
      </mesh>
      <mesh
        name="mesh_lapel_shawl"
        visible={visibleLapel === "mesh_lapel_shawl"}
        position={[-0.14, 0.8, 0.36]}
        rotation={[0.1, 0.2, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.08, 0.1, 0.42, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={fabricHex} roughness={0.7} />
      </mesh>

      {/* Buttons — count driven by the selected button group */}
      {Array.from({ length: buttonCount }).map((_, i) => (
        <mesh
          key={i}
          name={visibleButton}
          position={[0, 0.65 - i * 0.14, 0.44]}
          castShadow
        >
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.4} />
        </mesh>
      ))}

      {/* Pockets — only the active style is visible */}
      <mesh
        name="mesh_pocket_flap"
        visible={visiblePocket === "mesh_pocket_flap"}
        position={[0.22, 0.3, 0.41]}
        castShadow
      >
        <boxGeometry args={[0.18, 0.07, 0.015]} />
        <meshStandardMaterial color={fabricHex} roughness={0.8} />
      </mesh>
      <mesh
        name="mesh_pocket_piped"
        visible={visiblePocket === "mesh_pocket_piped"}
        position={[0.22, 0.3, 0.41]}
        castShadow
      >
        <boxGeometry args={[0.18, 0.015, 0.015]} />
        <meshStandardMaterial color="#0f0f0f" roughness={0.6} />
      </mesh>
      <mesh
        name="mesh_pocket_ticket"
        visible={visiblePocket === "mesh_pocket_ticket"}
        position={[0.34, 0.34, 0.41]}
        castShadow
      >
        <boxGeometry args={[0.08, 0.05, 0.015]} />
        <meshStandardMaterial color={fabricHex} roughness={0.8} />
      </mesh>

      {/* Trousers */}
      <mesh name="mesh_trouser_left" position={[-0.14, -0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.13, 0.9, 16]} />
        <meshStandardMaterial color={fabricHex} roughness={0.8} />
      </mesh>
      <mesh name="mesh_trouser_right" position={[0.14, -0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.13, 0.9, 16]} />
        <meshStandardMaterial color={fabricHex} roughness={0.8} />
      </mesh>
    </group>
  );
}
