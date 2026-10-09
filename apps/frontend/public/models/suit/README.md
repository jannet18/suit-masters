# Suit 3D model

Drop a real `suit_base.glb` in this folder to replace the procedural
placeholder the configurator renders today (see `PlaceholderSuit.tsx`).

## Required mesh names

The viewer toggles `mesh.visible` by name — it never swaps geometry — so
these exact names must exist in the GLB (hidden by default except the first
per group):

| Group  | Mesh names                                                  |
| ------ | ------------------------------------------------------------ |
| Lapel  | `mesh_lapel_notch`, `mesh_lapel_peak`, `mesh_lapel_shawl`     |
| Pocket | `mesh_pocket_flap`, `mesh_pocket_piped`, `mesh_pocket_ticket` |
| Button | `mesh_button_1b`, `mesh_button_2b`, `mesh_button_db`          |

Plus a base jacket/trouser shell mesh named `mesh_torso*` (any mesh whose
name starts with `mesh_torso`) — that's the one the fabric material gets
applied to.

These names are the single source of truth in
`app/components/configurator/3d/meshMapping.ts`; update that file if the
asset pipeline settles on different names, rather than renaming meshes to
match this doc.

## Once the file exists

Uncomment the `useGLTF.preload(...)` line noted at the bottom of
`SuitModel.tsx` so the model starts fetching as soon as the configurator
route is requested, instead of waiting for the viewer to mount.
