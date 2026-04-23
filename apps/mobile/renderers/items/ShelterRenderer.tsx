import React from 'react';
import { RoundedRect, Rect, Circle, Group } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';
import { BaseItemRenderer } from './BaseItemRenderer';

export function ShelterRenderer(props: ItemRendererProps) {
  const { x, y, size } = props;
  const pad = size * 0.1;
  const bx = x + pad;
  const by = y + pad;
  const bw = size - pad * 2;
  const bh = size - pad * 2;

  return (
    <BaseItemRenderer {...props}>
      <Group>
        {/* Shadow */}
        <RoundedRect x={bx + 2} y={by + 2} width={bw} height={bh} r={6} color="rgba(0,0,0,0.15)" />
        {/* Building */}
        <RoundedRect x={bx} y={by} width={bw} height={bh} r={6} color="#c8924a" />
        {/* Roof line */}
        <Rect x={bx} y={by} width={bw} height={bh * 0.25} color="#a0702e" />
        {/* Door */}
        <RoundedRect
          x={bx + bw * 0.35}
          y={by + bh * 0.5}
          width={bw * 0.3}
          height={bh * 0.4}
          r={4}
          color="#7a4f1a"
        />
        {/* Window */}
        <Circle cx={bx + bw * 0.25} cy={by + bh * 0.55} r={bw * 0.08} color="#d4b896" />
      </Group>
    </BaseItemRenderer>
  );
}
