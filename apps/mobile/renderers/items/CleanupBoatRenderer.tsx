import React from 'react';
import { RoundedRect, Rect, Line, Group } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';
import { BaseItemRenderer } from './BaseItemRenderer';

export function CleanupBoatRenderer(props: ItemRendererProps) {
  const { x, y, size } = props;
  const cx = x + size / 2;
  const cy = y + size / 2;

  const hullW = size * 0.65;
  const hullH = size * 0.32;
  const hullX = cx - hullW / 2;
  const hullY = cy - hullH / 2 + size * 0.05;

  const cabinW = hullW * 0.42;
  const cabinH = hullH * 0.75;
  const cabinX = cx - cabinW / 2;
  const cabinY = hullY - cabinH + hullH * 0.3;

  return (
    <BaseItemRenderer {...props}>
      <Group>
        {/* Hull shadow */}
        <RoundedRect x={hullX + 2} y={hullY + 2} width={hullW} height={hullH} r={hullH / 2} color="rgba(0,0,0,0.15)" />
        {/* Hull */}
        <RoundedRect x={hullX} y={hullY} width={hullW} height={hullH} r={hullH / 2} color="#1a8a7a" />
        {/* Hull stripe */}
        <RoundedRect x={hullX} y={hullY + hullH * 0.6} width={hullW} height={hullH * 0.4} r={hullH / 2} color="#126858" />
        {/* Cabin */}
        <RoundedRect x={cabinX} y={cabinY} width={cabinW} height={cabinH} r={3} color="#e8e0cc" />
        {/* Mast */}
        <Line
          p1={{ x: cx, y: cabinY }}
          p2={{ x: cx, y: cabinY - size * 0.22 }}
          color="#8a7a5a"
          strokeWidth={2}
        />
      </Group>
    </BaseItemRenderer>
  );
}
