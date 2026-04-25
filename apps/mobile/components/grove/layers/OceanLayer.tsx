import React, { useMemo } from 'react';
import { Line, RoundedRect, Group } from '@shopify/react-native-skia';
import { GRID, cellToScreen } from '@/utils/gridMath';

interface OceanLayerProps {
  tileSize: number;
  gridOffsetX: number;
  gridOffsetY: number;
  panY?: number;
  tick?: number;
}

const TRASH_POSITIONS = [
  { col: 1, row: 10, offX: 0.5, offY: 0.3 },
  { col: 3, row: 11, offX: 0.2, offY: 0.6 },
  { col: 6, row: 10, offX: 0.7, offY: 0.4 },
  { col: 8, row: 12, offX: 0.3, offY: 0.5 },
  { col: 5, row: 11, offX: 0.6, offY: 0.25 },
  { col: 9, row: 10, offX: 0.4, offY: 0.7 },
  { col: 2, row: 12, offX: 0.75, offY: 0.4 },
];

export function OceanLayer({ tileSize, gridOffsetX, gridOffsetY, panY = 0, tick = 0 }: OceanLayerProps) {
  // Trash is static — memoized separately
  const trashElements = useMemo(() => {
    return TRASH_POSITIONS.map(({ col, row, offX, offY }, i) => {
      if (row >= GRID.ROWS) return null;
      const { x, y } = cellToScreen(col, row, tileSize, gridOffsetX, panY, gridOffsetY);
      const tx = x + tileSize * offX;
      const ty = y + tileSize * offY;
      const trashSize = tileSize * 0.12;
      return (
        <RoundedRect
          key={`trash-${i}`}
          x={tx - trashSize / 2}
          y={ty - trashSize / 2}
          width={trashSize}
          height={trashSize * 0.6}
          r={2}
          color="rgba(200,180,100,0.7)"
        />
      );
    });
  }, [tileSize, gridOffsetX, gridOffsetY, panY]);

  // Waves animate with tick
  const waveElements: React.ReactElement[] = [];
  for (let row = GRID.OCEAN_START_ROW; row < GRID.ROWS; row++) {
    for (let col = 0; col < GRID.COLS; col++) {
      const { x, y } = cellToScreen(col, row, tileSize, gridOffsetX, panY, gridOffsetY);
      const phase = col * 0.6 + row * 0.9;
      const bob = Math.sin(tick * 0.15 + phase) * tileSize * 0.09;
      const wave1Y = y + tileSize * 0.35 + bob;
      const wave2Y = y + tileSize * 0.65 - bob * 0.6;
      waveElements.push(
        <Line
          key={`w1-${col}-${row}`}
          p1={{ x: x + tileSize * 0.1, y: wave1Y }}
          p2={{ x: x + tileSize * 0.9, y: wave1Y }}
          color="rgba(255,255,255,0.18)"
          strokeWidth={1.5}
        />,
        <Line
          key={`w2-${col}-${row}`}
          p1={{ x: x + tileSize * 0.2, y: wave2Y }}
          p2={{ x: x + tileSize * 0.8, y: wave2Y }}
          color="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
      );
    }
  }

  return <>{trashElements}{waveElements}</>;
}
