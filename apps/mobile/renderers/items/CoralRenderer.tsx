import React from 'react';
import { Circle, Group } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';
import { BaseItemRenderer } from './BaseItemRenderer';

export function CoralRenderer(props: ItemRendererProps) {
  const { x, y, size } = props;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const s = size;

  return (
    <BaseItemRenderer {...props}>
      <Group>
        {/* Base shadow */}
        <Circle cx={cx + 1} cy={cy + 2} r={s * 0.32} color="rgba(0,0,0,0.12)" />
        {/* Main body */}
        <Circle cx={cx} cy={cy} r={s * 0.3} color="#e8826a" />
        {/* Branches */}
        <Circle cx={cx - s * 0.18} cy={cy - s * 0.2} r={s * 0.14} color="#f0a090" />
        <Circle cx={cx + s * 0.2} cy={cy - s * 0.15} r={s * 0.12} color="#e06050" />
        <Circle cx={cx + s * 0.15} cy={cy + s * 0.2} r={s * 0.13} color="#f0a090" />
        <Circle cx={cx - s * 0.1} cy={cy + s * 0.22} r={s * 0.1} color="#e8826a" />
        {/* Highlight */}
        <Circle cx={cx - s * 0.08} cy={cy - s * 0.08} r={s * 0.07} color="#ffc0b0" />
      </Group>
    </BaseItemRenderer>
  );
}
