// Shared renderer interfaces.
// Swapping shapes for sprites = implement these interfaces with a new class/component.

/** Props passed to every tile renderer. */
export interface TileRendererProps {
  x: number;       // canvas-space top-left x
  y: number;       // canvas-space top-left y
  size: number;    // tile size in pixels (square)
  highlighted?: boolean;  // valid placement target (green tint)
  invalid?: boolean;      // invalid/occupied placement target (red tint)
  selected?: boolean;     // user has tapped this cell, awaiting confirm (green border)
}

/** Props passed to every item renderer. */
export interface ItemRendererProps {
  x: number;
  y: number;
  size: number;
  state: 'in_progress' | 'complete';
  progress?: number;  // 0–1, fraction of build time elapsed
}
