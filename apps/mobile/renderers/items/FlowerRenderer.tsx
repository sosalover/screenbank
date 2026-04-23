import React from 'react';
import { Circle, Group } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';
import { BaseItemRenderer } from './BaseItemRenderer';

export function FlowerRenderer(props: ItemRendererProps) {
  const { x, y, size } = props;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const baseR = size * 0.38;
  const petalR = size * 0.1;
  const petalDist = size * 0.2;
  const petals = [0, 72, 144, 216, 288].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { px: cx + Math.cos(rad) * petalDist, py: cy + Math.sin(rad) * petalDist };
  });

  return (
    <BaseItemRenderer {...props}>
      <Group>
        <Circle cx={cx} cy={cy} r={baseR} color="#1a5c1a" />
        {petals.map(({ px, py }, i) => (
          <Circle key={i} cx={px} cy={py} r={petalR} color={i % 2 === 0 ? '#e8a0d0' : '#c75da8'} />
        ))}
        <Circle cx={cx} cy={cy} r={petalR * 0.7} color="#f5d547" />
      </Group>
    </BaseItemRenderer>
  );
}
