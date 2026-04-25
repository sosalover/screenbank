// PlacementOverlay — animated placement highlights rendered inside the Skia Canvas.
// Kept separate from TerrainLayer so the 143-tile memo doesn't recompute every frame.

import React, { useEffect, useState } from 'react';
import { Group, Rect } from '@shopify/react-native-skia';
import { GRID, cellToScreen, isCauseValidForTile } from '@/utils/gridMath';

interface PlacementOverlayProps {
  pendingCauseId: string;
  selectedCell: { col: number; row: number } | null;
  occupiedCells: Set<string>;
  tileSize: number;
  gridOffsetX: number;
  gridOffsetY: number;
  panY?: number;
}

export function PlacementOverlay({
  pendingCauseId,
  selectedCell,
  occupiedCells,
  tileSize,
  gridOffsetX,
  gridOffsetY,
  panY = 0,
}: PlacementOverlayProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  const pulse = (Math.sin(tick * 0.18) + 1) / 2; // 0–1, ~1.7s cycle
  const borderOpacity = 0.35 + pulse * 0.65;       // 0.35–1.0

  const elements: React.ReactElement[] = [];

  for (let row = 0; row < GRID.ROWS; row++) {
    if (!isCauseValidForTile(pendingCauseId, row)) continue;
    for (let col = 0; col < GRID.COLS; col++) {
      const { x, y } = cellToScreen(col, row, tileSize, gridOffsetX, panY, gridOffsetY);
      const cellKey = `${col},${row}`;
      const isOccupied = occupiedCells.has(cellKey);
      const isSelected =
        selectedCell?.col === col && selectedCell?.row === row;

      if (isSelected) {
        // Solid bright border + subtle fill for selected cell
        elements.push(
          <Group key={`sel-${col}-${row}`}>
            <Rect x={x} y={y} width={tileSize} height={tileSize} color="rgba(34,197,94,0.2)" />
            <Rect
              x={x + 1.5} y={y + 1.5}
              width={tileSize - 3} height={tileSize - 3}
              color="#22c55e"
              style="stroke"
              strokeWidth={2.5}
            />
          </Group>
        );
      } else if (isOccupied) {
        // Red overlay for occupied tiles
        elements.push(
          <Rect
            key={`occ-${col}-${row}`}
            x={x} y={y}
            width={tileSize} height={tileSize}
            color="rgba(252,165,165,0.35)"
          />
        );
      } else {
        // Pulsing green border for valid empty tiles
        elements.push(
          <Group key={`hl-${col}-${row}`} opacity={borderOpacity}>
            <Rect
              x={x + 1.5} y={y + 1.5}
              width={tileSize - 3} height={tileSize - 3}
              color="#4ade80"
              style="stroke"
              strokeWidth={2}
            />
          </Group>
        );
      }
    }
  }

  return <>{elements}</>;
}
