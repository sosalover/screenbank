// Ocean tile — deep water where ocean causes are placed.
// Wave animation added in Phase 5. To replace with sprite: swap fills for Skia Image.

import React from 'react';
import { Rect } from '@shopify/react-native-skia';
import { TileRendererProps } from '../types';
import { BaseTileRenderer } from './BaseTileRenderer';

// Two-tone ocean: alternating slightly lighter tiles for depth feel
const OCEAN_COLORS = ['#0284c7', '#0369a1'];
function oceanColor(col: number, row: number): string {
  return OCEAN_COLORS[(col + row) % 2];
}

export function OceanTileRenderer({ x, y, size, ...rest }: TileRendererProps & { col?: number; row?: number }) {
  const col = rest.col ?? 0;
  const row = rest.row ?? 0;
  const fill = oceanColor(col, row);

  return (
    <BaseTileRenderer x={x} y={y} size={size} {...rest}>
      {/* Ocean fill */}
      <Rect x={x} y={y} width={size} height={size} color={fill} />
      {/* Subtle grid line */}
      <Rect
        x={x}
        y={y}
        width={size}
        height={size}
        color="#075985"
        style="stroke"
        strokeWidth={0.4}
      />
    </BaseTileRenderer>
  );
}
