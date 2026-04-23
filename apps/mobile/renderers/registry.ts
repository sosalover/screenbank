// Renderer registry — maps cause IDs to their React/Skia components.
//
// To swap a shape renderer for a sprite renderer:
//   1. Create MySpriteRenderer implementing ItemRendererProps
//   2. Replace the entry below: tree: MySpriteRenderer
//   3. Done — no other files need to change.
//
// Item renderers are registered in Phase 2.
// Terrain renderers are used directly by TerrainLayer (no registry needed — terrain type is known from row).

import React from 'react';
import { ItemRendererProps } from './types';

export const ITEM_RENDERERS: Record<string, React.FC<ItemRendererProps>> = {
  // Populated in Phase 2:
  // tree: TreeRenderer,
  // flower: FlowerRenderer,
  // coral: CoralRenderer,
  // shelter: ShelterRenderer,
  // family: FeedingStationRenderer,
  // ocean: CleanupBoatRenderer,
};
