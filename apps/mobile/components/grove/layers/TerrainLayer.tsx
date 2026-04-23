// Terrain layer — renders all grid tiles in row-major order.
// Placement highlights and cell selection state are applied via tile props.
// Phase 3 will wire placementMode from the game store into this layer.

import React, { useMemo } from 'react';
import { GRID, cellToScreen, isGroveTile, isBeachTile } from '@/utils/gridMath';
import { GroveTileRenderer } from '@/renderers/terrain/GroveTileRenderer';
import { BeachTileRenderer } from '@/renderers/terrain/BeachTileRenderer';
import { OceanTileRenderer } from '@/renderers/terrain/OceanTileRenderer';
import { TileRendererProps } from '@/renderers/types';

interface PlacementModeState {
  active: boolean;
  pendingCauseId?: string | null;
  selectedCell?: { col: number; row: number } | null;
  occupiedCells?: Set<string>;
}

interface TerrainLayerProps {
  tileSize: number;
  gridOffsetX: number;
  gridOffsetY?: number;
  panY?: number;
  placementMode?: PlacementModeState;
  algorithmActive?: boolean;
}

export function TerrainLayer({
  tileSize,
  gridOffsetX,
  gridOffsetY,
  panY = 0,
  placementMode,
  algorithmActive = false,
}: TerrainLayerProps) {
  const tiles = useMemo(() => {
    const result: React.ReactElement[] = [];

    for (let row = 0; row < GRID.ROWS; row++) {
      for (let col = 0; col < GRID.COLS; col++) {
        const { x, y } = cellToScreen(col, row, tileSize, gridOffsetX, panY, gridOffsetY);
        const key = `${col}-${row}`;

        let highlighted = false;
        let invalid = false;
        let selected = false;

        if (placementMode?.active) {
          const cellKey = `${col},${row}`;
          const isOccupied = placementMode.occupiedCells?.has(cellKey) ?? false;
          selected =
            placementMode.selectedCell?.col === col &&
            placementMode.selectedCell?.row === row;
          // Terrain validity added in Phase 3 with isCauseValidForTile
          highlighted = !isOccupied && !selected;
          invalid = isOccupied;
        }

        const tileProps: TileRendererProps & { col: number; row: number } = {
          x,
          y,
          size: tileSize,
          col,
          row,
          highlighted,
          invalid,
          selected,
        };

        if (isGroveTile(row)) {
          result.push(<GroveTileRenderer key={key} {...tileProps} />);
        } else if (isBeachTile(row)) {
          result.push(<BeachTileRenderer key={key} {...tileProps} />);
        } else {
          result.push(<OceanTileRenderer key={key} {...tileProps} />);
        }
      }
    }

    return result;
  }, [tileSize, gridOffsetX, panY, placementMode, algorithmActive]);

  return <>{tiles}</>;
}
