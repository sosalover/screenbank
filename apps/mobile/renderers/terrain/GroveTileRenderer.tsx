// Grove tile — placeable grass terrain.
// To replace with a sprite: swap the Rect fills for a Skia Image component.

import React from 'react';
import { Rect } from '@shopify/react-native-skia';
import { TileRendererProps } from '../types';
import { BaseTileRenderer } from './BaseTileRenderer';

// Subtle color variation gives the grove a natural, non-uniform look.
// Based on cell position so it's stable across renders.
const GRASS_COLORS = ['#4ade80', '#22c55e', '#4ade80', '#22c55e', '#34d399'];
function grassColor(col: number, row: number): string {
  return GRASS_COLORS[(col * 3 + row * 7) % GRASS_COLORS.length];
}

export function GroveTileRenderer({ x, y, size, ...rest }: TileRendererProps & { col?: number; row?: number }) {
  const col = rest.col ?? 0;
  const row = rest.row ?? 0;
  const fill = grassColor(col, row);

  return (
    <BaseTileRenderer x={x} y={y} size={size} {...rest}>
      {/* Grass fill */}
      <Rect x={x} y={y} width={size} height={size} color={fill} />
      {/* Grid line */}
      <Rect
        x={x}
        y={y}
        width={size}
        height={size}
        color="#16a34a"
        style="stroke"
        strokeWidth={0.5}
      />
    </BaseTileRenderer>
  );
}
