// Sky layer — gradient sky, clouds, sun.
// To replace with a sprite background: accept a backgroundImage prop and draw it instead.
// Algorithm active: sky shifts to dark/stormy colours.

import React from 'react';
import { Circle, Group, LinearGradient, Rect, vec } from '@shopify/react-native-skia';

interface SkyLayerProps {
  width: number;
  height: number;          // sky height (SKY_HEIGHT constant)
  algorithmActive?: boolean;
}

const CLOUDS: Array<{ cx: number; cy: number }> = [
  { cx: 0.15, cy: 0.35 },
  { cx: 0.55, cy: 0.25 },
  { cx: 0.82, cy: 0.5 },
];

function Cloud({ cx, cy, width, height }: { cx: number; cy: number; width: number; height: number }) {
  const x = cx * width;
  const y = cy * height;
  const r = width * 0.04;
  return (
    <Group opacity={0.92}>
      <Circle cx={x} cy={y} r={r * 1.2} color="white" />
      <Circle cx={x + r * 1.4} cy={y + r * 0.3} color="white" r={r} />
      <Circle cx={x - r * 1.4} cy={y + r * 0.3} color="white" r={r} />
      <Circle cx={x + r * 0.7} cy={y - r * 0.5} color="white" r={r * 0.9} />
    </Group>
  );
}

export function SkyLayer({ width, height, algorithmActive = false }: SkyLayerProps) {
  const skyColors = algorithmActive
    ? ['#1a1a2e', '#16213e']
    : ['#87CEEB', '#c5e8f5'];

  const sunColor = algorithmActive ? '#6b21a8' : '#FDB813';
  const sunGlowColor = algorithmActive ? '#7c3aed' : '#FDE68A';

  return (
    <Group>
      {/* Sky gradient */}
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={skyColors}
        />
      </Rect>

      {/* Sun / moon */}
      <Circle cx={width - 36} cy={28} r={16} color={sunGlowColor} opacity={0.4} />
      <Circle cx={width - 36} cy={28} r={11} color={sunColor} />

      {/* Clouds (hidden during Algorithm raid) */}
      {!algorithmActive &&
        CLOUDS.map((c, i) => (
          <Cloud key={i} cx={c.cx} cy={c.cy} width={width} height={height} />
        ))}
    </Group>
  );
}
