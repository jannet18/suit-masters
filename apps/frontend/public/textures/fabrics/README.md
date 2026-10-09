# Fabric textures

Drop three seamless, tileable JPGs here to replace the solid-colour fabric
material the configurator uses today:

- `diffuse.jpg` — base colour/weave map
- `normal.jpg` — weave bump detail
- `roughness.jpg` — fabric sheen variation

Referenced by `app/components/configurator/3d/meshMapping.ts`
(`FABRIC_TEXTURE_MAPS`) and applied in `SuitModel.tsx` with a repeat of
`FABRIC_TEXTURE_REPEAT` (8×8) — tune that constant once a real texture's
physical scale is known.
