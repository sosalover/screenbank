import React from 'react';
import { Circle, Group, LinearGradient, Path, Rect, Skia, vec } from '@shopify/react-native-skia';

interface SkyLayerProps {
  width: number;
  height: number;
  algorithmActive?: boolean;
  tick?: number;
}

const CLOUDS = [
  { cx: 0.15, cy: 0.38, phase: 0.0, scale: 1.0 },
  { cx: 0.55, cy: 0.28, phase: 2.1, scale: 0.8 },
  { cx: 0.82, cy: 0.52, phase: 4.3, scale: 1.1 },
];

function Cloud({ x, y, width, scale }: { x: number; y: number; width: number; scale: number }) {
  const r = width * 0.04 * scale;
  return (
    <Group opacity={0.92}>
      <Circle cx={x} cy={y} r={r * 1.2} color="white" />
      <Circle cx={x + r * 1.4} cy={y + r * 0.3} color="white" r={r} />
      <Circle cx={x - r * 1.4} cy={y + r * 0.3} color="white" r={r} />
      <Circle cx={x + r * 0.7} cy={y - r * 0.5} color="white" r={r * 0.9} />
    </Group>
  );
}

export function SkyLayer({ width, height, algorithmActive = false, tick = 0 }: SkyLayerProps) {
  const skyColors = algorithmActive ? ['#1a1a2e', '#16213e'] : ['#87CEEB', '#c5e8f5'];
  const sunColor = algorithmActive ? '#6b21a8' : '#FDB813';
  const sunGlowColor = algorithmActive ? '#7c3aed' : '#FDE68A';

  const sunR = 11 + Math.sin(tick * 0.13) * 3;
  const glowR = 16 + Math.sin(tick * 0.09) * 6;

  return (
    <Group>
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient start={vec(0, 0)} end={vec(0, height)} colors={skyColors} />
      </Rect>

      {/* Sun / moon */}
      <Circle cx={width - 36} cy={28} r={glowR} color={sunGlowColor} opacity={0.4} />
      <Circle cx={width - 36} cy={28} r={sunR} color={sunColor} />

      {/* Clouds — gently float with sin offset */}
      {!algorithmActive && CLOUDS.map((c, i) => {
        const x = c.cx * width + Math.sin(tick * 0.018 + c.phase) * 38;
        const y = c.cy * height + Math.sin(tick * 0.012 + c.phase + 1) * 10;
        return <Cloud key={i} x={x} y={y} width={width} scale={c.scale} />;
      })}
    </Group>
  );
}
