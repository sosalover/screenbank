// Beach tile — decorative sand strip between grove and ocean.
// Not placeable. To replace with a sprite: swap Rect fills for Skia Image.

import React from 'react';
import { Rect, Circle } from '@shopify/react-native-skia';
import { TileRendererProps } from '../types';
import { BaseTileRenderer } from './BaseTileRenderer';

// Subtle pebble/speckle positions (relative to tile, repeating pattern)
const SPECKLES = [
  { rx: 0.2, ry: 0.3, r: 1.2 },
  { rx: 0.6, ry: 0.6, r: 0.9 },
  { rx: 0.8, ry: 0.25, r: 1.1 },
  { rx: 0.35, ry: 0.7, r: 0.8 },
];

export function BeachTileRenderer({ x, y, size, ...rest }: TileRendererProps) {
  return (
    <BaseTileRenderer x={x} y={y} size={size} {...rest}>
      {/* Sandy fill */}
      <Rect x={x} y={y} width={size} height={size} color="#f5deb3" />
      {/* Decorative pebble speckles */}
      {SPECKLES.map((s, i) => (
        <Circle
          key={i}
          cx={x + s.rx * size}
          cy={y + s.ry * size}
          r={s.r}
          color="#c8a050"
          opacity={0.5}
        />
      ))}
    </BaseTileRenderer>
  );
}
