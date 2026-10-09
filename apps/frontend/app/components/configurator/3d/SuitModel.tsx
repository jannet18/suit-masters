"use client";

import { useEffect, useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  ALL_MESH_NAMES,
  FABRIC_TEXTURE_MAPS,
  FABRIC_TEXTURE_REPEAT,
  resolveMeshName,
} from "./meshMapping";

const MODEL_PATH = "/models/suit/suit_base.glb";

interface SuitModelProps {
  fabricHex: string;
  lapelCode?: string;
  pocketCode?: string;
  buttonCode?: string;
}

/**
 * Loads the real GLB (see meshMapping.ts for the expected mesh names) and
 * swaps sub-mesh visibility + the jacket material's fabric texture to match
 * the shopper's selection. Throws (via useGLTF/useTexture's suspense) if the
 * asset is missing — SuitViewer's ErrorBoundary catches that and renders
 * PlaceholderSuit instead, so this component can assume the file is real.
 */
export function SuitModel({ fabricHex, lapelCode, pocketCode, buttonCode }: SuitModelProps) {
  const { scene, nodes } = useGLTF(MODEL_PATH);
  const [diffuseMap, normalMap, roughnessMap] = useTexture([
    FABRIC_TEXTURE_MAPS.diffuse,
    FABRIC_TEXTURE_MAPS.normal,
    FABRIC_TEXTURE_MAPS.roughness,
  ]);

  const fabricMaterial = useMemo(() => {
    [diffuseMap, normalMap, roughnessMap].forEach((map) => {
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(...FABRIC_TEXTURE_REPEAT);
    });
    return new THREE.MeshStandardMaterial({
      map: diffuseMap,
      normalMap,
      roughnessMap,
      color: fabricHex,
    });
  }, [diffuseMap, normalMap, roughnessMap, fabricHex]);

  const visibleLapel = resolveMeshName("lapel", lapelCode);
  const visiblePocket = resolveMeshName("pocket", pocketCode);
  const visibleButton = resolveMeshName("button", buttonCode);
  const visible = new Set([visibleLapel, visiblePocket, visibleButton]);

  useEffect(() => {
    for (const name of ALL_MESH_NAMES) {
      const node = nodes[name] as THREE.Mesh | undefined;
      if (!node) continue;
      node.visible = visible.has(name);
    }
  }, [nodes, visibleLapel, visiblePocket, visibleButton]);

  useEffect(() => {
    scene.traverse((child) => {
      if (
        (child as THREE.Mesh).isMesh &&
        child.name.startsWith("mesh_torso") // jacket + trouser shell, not hardware like buttons
      ) {
        (child as THREE.Mesh).material = fabricMaterial;
      }
    });
  }, [scene, fabricMaterial]);

  return <primitive object={scene} position={[0, -0.1, 0]} />;
}

// Not preloaded: until a real suit_base.glb exists, eagerly preloading would
// fire a failing request the moment this module is imported. Call
// `useGLTF.preload("/models/suit/suit_base.glb")` once the asset is real.
