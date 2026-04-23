import React, { useMemo } from 'react';
import { Line, Circle, RoundedRect, Group } from '@shopify/react-native-skia';
import { GRID, cellToScreen } from '@/utils/gridMath';

interface OceanLayerProps {
  tileSize: number;
  gridOffsetX: number;
  gridOffsetY: number;
  panY?: number;
}

export function OceanLayer({ tileSize, gridOffsetX, gridOffsetY, panY = 0 }: OceanLayerProps) {
  const elements = useMemo(() => {
    const result: React.ReactElement[] = [];

    // Wave lines across ocean rows
    for (let row = GRID.OCEAN_START_ROW; row < GRID.ROWS; row++) {
      for (let col = 0; col < GRID.COLS; col++) {
        const { x, y } = cellToScreen(col, row, tileSize, gridOffsetX, panY, gridOffsetY);
        const waveY = y + tileSize * 0.35;
        const wave2Y = y + tileSize * 0.65;
        result.push(
          <Line
            key={`w1-${col}-${row}`}
            p1={{ x: x + tileSize * 0.1, y: waveY }}
            p2={{ x: x + tileSize * 0.9, y: waveY }}
            color="rgba(255,255,255,0.15)"
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

    // Floating trash pieces — scattered fixed positions
    const trashPositions = [
      { col: 1, row: 10, offX: 0.5, offY: 0.3 },
      { col: 3, row: 11, offX: 0.2, offY: 0.6 },
      { col: 6, row: 10, offX: 0.7, offY: 0.4 },
      { col: 8, row: 12, offX: 0.3, offY: 0.5 },
      { col: 5, row: 11, offX: 0.6, offY: 0.25 },
      { col: 9, row: 10, offX: 0.4, offY: 0.7 },
      { col: 2, row: 12, offX: 0.75, offY: 0.4 },
    ];

    trashPositions.forEach(({ col, row, offX, offY }, i) => {
      if (row >= GRID.ROWS) return;
      const { x, y } = cellToScreen(col, row, tileSize, gridOffsetX, panY, gridOffsetY);
      const tx = x + tileSize * offX;
      const ty = y + tileSize * offY;
      const trashSize = tileSize * 0.12;
      result.push(
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

    return result;
  }, [tileSize, gridOffsetX, gridOffsetY, panY]);

  return <>{elements}</>;
}
