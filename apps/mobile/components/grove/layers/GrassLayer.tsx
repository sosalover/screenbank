import React from 'react';
import { Group, RoundedRect } from '@shopify/react-native-skia';
import { GRID, cellToScreen } from '@/utils/gridMath';

interface GrassLayerProps {
  tileSize: number;
  gridOffsetX: number;
  gridOffsetY: number;
  tick?: number;
  panY?: number;
}

// 1 tuft per grove cell, placed in a pseudo-random corner
const CORNERS = [
  { fx: 0.10, fy: 0.28 },
  { fx: 0.78, fy: 0.28 },
  { fx: 0.10, fy: 0.80 },
  { fx: 0.78, fy: 0.80 },
];

const TUFTS = (() => {
  const result: { col: number; row: number; fx: number; fy: number; phase: number }[] = [];
  for (let row = 0; row <= GRID.GROVE_END_ROW; row++) {
    for (let col = 0; col < GRID.COLS; col++) {
      const corner = CORNERS[(col * 7 + row * 3) % 4];
      result.push({
        col,
        row,
        fx: corner.fx,
        fy: corner.fy,
        phase: (col * 1.7 + row * 2.3) % (Math.PI * 2),
      });
    }
  }
  return result;
})();

export function GrassLayer({ tileSize, gridOffsetX, gridOffsetY, tick = 0, panY = 0 }: GrassLayerProps) {
  const bladeH = tileSize * 0.26;
  const bladeW = Math.max(2, tileSize * 0.06);

  return (
    <>
      {TUFTS.map((t, i) => {
        const { x, y } = cellToScreen(t.col, t.row, tileSize, gridOffsetX, panY, gridOffsetY);
        const tx = x + tileSize * t.fx;
        const ty = y + tileSize * t.fy;
        const sway = Math.sin(tick * 0.12 + t.phase) * 0.32;

        return (
          <Group
            key={i}
            transform={[
              { translateX: tx },
              { translateY: ty },
              { rotate: sway },
            ]}
          >
            <RoundedRect
              x={-bladeW * 2}
              y={-bladeH * 0.85}
              width={bladeW}
              height={bladeH * 0.85}
              r={bladeW / 2}
              color="#16a34a"
            />
            <RoundedRect
              x={-bladeW / 2}
              y={-bladeH}
              width={bladeW}
              height={bladeH}
              r={bladeW / 2}
              color="#22c55e"
            />
            <RoundedRect
              x={bladeW}
              y={-bladeH * 0.9}
              width={bladeW}
              height={bladeH * 0.9}
              r={bladeW / 2}
              color="#4ade80"
            />
          </Group>
        );
      })}
    </>
  );
}
