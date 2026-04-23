import React from 'react';
import { Circle, Rect, Group } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';
import { BaseItemRenderer } from './BaseItemRenderer';

export function TreeRenderer(props: ItemRendererProps) {
  const { x, y, size } = props;
  const cx = x + size / 2;
  const cy = y + size / 2 - size * 0.05;
  const canopyR = size * 0.35;
  const trunkW = size * 0.12;
  const trunkH = size * 0.18;

  return (
    <BaseItemRenderer {...props}>
      <Group>
        {/* Canopy shadow */}
        <Circle cx={cx + 2} cy={cy + 2} r={canopyR} color="rgba(0,0,0,0.15)" />
        {/* Canopy */}
        <Circle cx={cx} cy={cy} r={canopyR} color="#2d7a2d" />
        {/* Highlight */}
        <Circle cx={cx - canopyR * 0.3} cy={cy - canopyR * 0.3} r={canopyR * 0.35} color="#3fa33f" />
        {/* Trunk */}
        <Rect
          x={cx - trunkW / 2}
          y={cy + canopyR - 4}
          width={trunkW}
          height={trunkH}
          color="#7a4f2d"
        />
      </Group>
    </BaseItemRenderer>
  );
}
