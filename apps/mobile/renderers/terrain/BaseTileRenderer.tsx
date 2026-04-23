// Base tile wrapper — handles placement highlights and selection border.
// Every terrain renderer wraps its fill in this component.
// To swap for sprite backgrounds: replace the children, keep this wrapper.

import React from 'react';
import { Group, Rect } from '@shopify/react-native-skia';
import { TileRendererProps } from '../types';

interface BaseTileRendererProps extends TileRendererProps {
  children: React.ReactNode;
}

export function BaseTileRenderer({
  x,
  y,
  size,
  highlighted,
  invalid,
  selected,
  children,
}: BaseTileRendererProps) {
  return (
    <Group>
      {/* Tile-specific fill (grass, sand, water, or future sprite) */}
      {children}

      {/* Placement highlight overlay */}
      {highlighted && (
        <Group opacity={0.45}>
          <Rect x={x} y={y} width={size} height={size} color="#86efac" />
        </Group>
      )}

      {/* Invalid placement overlay */}
      {invalid && (
        <Group opacity={0.35}>
          <Rect x={x} y={y} width={size} height={size} color="#fca5a5" />
        </Group>
      )}

      {/* Selected cell border */}
      {selected && (
        <Rect
          x={x + 1}
          y={y + 1}
          width={size - 2}
          height={size - 2}
          color="#22c55e"
          style="stroke"
          strokeWidth={2.5}
        />
      )}
    </Group>
  );
}
