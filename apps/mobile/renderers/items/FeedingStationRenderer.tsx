import React from 'react';
import { RoundedRect, Rect, Group } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';
import { BaseItemRenderer } from './BaseItemRenderer';

export function FeedingStationRenderer(props: ItemRendererProps) {
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
        <RoundedRect x={bx + 2} y={by + 2} width={bw} height={bh} r={5} color="rgba(0,0,0,0.15)" />
        {/* Building */}
        <RoundedRect x={bx} y={by} width={bw} height={bh} r={5} color="#2a7db5" />
        {/* Roof band */}
        <Rect x={bx} y={by} width={bw} height={bh * 0.28} color="#1a5e8a" />
        {/* Left window */}
        <RoundedRect x={bx + bw * 0.12} y={by + bh * 0.38} width={bw * 0.28} height={bh * 0.28} r={3} color="#a8d4f0" />
        {/* Right window */}
        <RoundedRect x={bx + bw * 0.58} y={by + bh * 0.38} width={bw * 0.28} height={bh * 0.28} r={3} color="#a8d4f0" />
        {/* Door */}
        <RoundedRect x={bx + bw * 0.33} y={by + bh * 0.58} width={bw * 0.34} height={bh * 0.35} r={3} color="#0f3d5c" />
      </Group>
    </BaseItemRenderer>
  );
}
