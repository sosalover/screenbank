// Grid coordinate system and math utilities.
// All game logic uses grid coords (col, row). Screen coords are derived here.
// Pure functions — no React, fully testable.

export const GRID = {
  COLS: 11,
  ROWS: 13,
  GROVE_END_ROW: 8,    // rows 0–8: grove (placeable)
  BEACH_ROW: 9,        // row  9:   beach (decorative)
  OCEAN_START_ROW: 10, // rows 10–12: ocean (ocean causes only)
} as const;

// Cause IDs that belong on ocean tiles
export const OCEAN_CAUSE_IDS = new Set(['ocean', 'coral']);

// Fixed sky header above the grid
export const SKY_HEIGHT = 110;

// Grover's permanent home cell — always occupied, never placeable
export const HOME_COL = 5;
export const HOME_ROW = 4;

// ─── Tile sizing ───────────────────────────────────────────────────────────────

/** Tile size derived from screen width so the grid fills edge-to-edge. */
export function getTileSize(screenWidth: number): number {
  return Math.floor(screenWidth / GRID.COLS);
}

/** Horizontal offset to center the grid (usually 0 if tiles fill width exactly). */
export function getGridOffsetX(screenWidth: number, tileSize: number): number {
  return Math.floor((screenWidth - tileSize * GRID.COLS) / 2);
}

/** Total pixel height of the grid (excludes sky). */
export function getGridHeight(tileSize: number): number {
  return GRID.ROWS * tileSize;
}

// ─── Coordinate conversion ────────────────────────────────────────────────────

/** Canvas-space top-left corner of a grid cell. */
export function cellToScreen(
  col: number,
  row: number,
  tileSize: number,
  gridOffsetX: number = 0,
  panY: number = 0,
  gridOffsetY: number = SKY_HEIGHT,
): { x: number; y: number } {
  return {
    x: gridOffsetX + col * tileSize,
    y: gridOffsetY + row * tileSize - panY,
  };
}

/** Canvas tap position → grid cell. Returns null if out of bounds. */
export function screenToCell(
  tapX: number,
  tapY: number,
  tileSize: number,
  gridOffsetX: number = 0,
  panY: number = 0,
  gridOffsetY: number = SKY_HEIGHT,
): { col: number; row: number } | null {
  const col = Math.floor((tapX - gridOffsetX) / tileSize);
  const row = Math.floor((tapY - gridOffsetY + panY) / tileSize);
  if (col < 0 || col >= GRID.COLS || row < 0 || row >= GRID.ROWS) return null;
  return { col, row };
}

// ─── Terrain classification ───────────────────────────────────────────────────

export function isGroveTile(row: number): boolean {
  return row <= GRID.GROVE_END_ROW;
}

export function isBeachTile(row: number): boolean {
  return row === GRID.BEACH_ROW;
}

export function isOceanTile(row: number): boolean {
  return row >= GRID.OCEAN_START_ROW;
}

/** Whether a given cause can be placed on a given terrain row. */
export function isCauseValidForTile(causeId: string, row: number): boolean {
  if (OCEAN_CAUSE_IDS.has(causeId)) return isOceanTile(row);
  return isGroveTile(row);
}

// ─── Build helpers ────────────────────────────────────────────────────────────

/** O(n) occupied-cell check. For Phase 1 n is always ≤ 1. */
export function isCellOccupied(
  col: number,
  row: number,
  builds: Array<{ gridPos: { col: number; row: number } }>,
): boolean {
  return builds.some((b) => b.gridPos.col === col && b.gridPos.row === row);
}

/** Build a Set of "col,row" strings for O(1) lookup across many tiles. Always includes home cell. */
export function buildOccupiedSet(
  builds: Array<{ gridPos: { col: number; row: number } }>,
): Set<string> {
  const set = new Set(builds.map((b) => `${b.gridPos.col},${b.gridPos.row}`));
  set.add(`${HOME_COL},${HOME_ROW}`);
  return set;
}
