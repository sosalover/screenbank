// Top-down character drawn in Skia.
// Receives position + animation state from useCharacterController.
// All drawing is relative to (cx, cy) — the character's center.

import React from 'react';
import { Circle, RoundedRect, Rect, Group } from '@shopify/react-native-skia';
import { AnimState, Direction } from '@/hooks/useCharacterController';

interface CharacterLayerProps {
  x: number;
  y: number;
  animState: AnimState;
  direction: Direction;
  tick: number;
  tileSize: number;
}

export function CharacterLayer({ x, y, animState, direction, tick, tileSize }: CharacterLayerProps) {
  const s = tileSize;

  const headR  = s * 0.22;
  const bodyW  = s * 0.44;
  const bodyH  = s * 0.38;
  const legW   = s * 0.15;
  const legH   = s * 0.22;
  const legSep = s * 0.13;

  const legSwing = animState === 'walking'
    ? Math.sin(tick * 0.55) * legH * 0.75
    : 0;

  const bounceY = animState === 'celebrating'
    ? -Math.abs(Math.sin(tick * 0.45)) * 14
    : 0;

  const idleY = animState === 'idle'
    ? Math.sin(tick * 0.09) * 3
    : 0;

  const armSwing = animState === 'working'
    ? Math.sin(tick * 0.38) * 0.75
    : 0;

  const cx = x;
  const cy = y + bounceY + idleY;

  const legBaseY = cy + bodyH * 0.28;
  const headCY = cy - bodyH / 2 - headR * 0.65;

  // Pupil offset based on direction
  const pupilDX =
    direction === 'right' ? headR * 0.07 :
    direction === 'left'  ? -headR * 0.07 : 0;
  const pupilDY =
    direction === 'down' ? headR * 0.06 :
    direction === 'up'   ? -headR * 0.06 : headR * 0.02;

  return (
    <Group>
      {/* Ground shadow */}
      <Circle
        cx={cx}
        cy={cy + bodyH * 0.55}
        r={bodyW * 0.48}
        color="rgba(0,0,0,0.13)"
      />

      {/* Left leg */}
      <RoundedRect
        x={cx - legSep - legW / 2}
        y={legBaseY + legSwing}
        width={legW}
        height={legH}
        r={legW / 2}
        color="#3b5ea6"
      />

      {/* Right leg */}
      <RoundedRect
        x={cx + legSep - legW / 2}
        y={legBaseY - legSwing}
        width={legW}
        height={legH}
        r={legW / 2}
        color="#3b5ea6"
      />

      {/* Body */}
      <RoundedRect
        x={cx - bodyW / 2}
        y={cy - bodyH / 2}
        width={bodyW}
        height={bodyH}
        r={bodyW * 0.22}
        color="#5b9cf6"
      />

      {/* Head */}
      <Circle cx={cx} cy={headCY} r={headR} color="#f5c5a3" />

      {/* Farmer hat — crown */}
      <RoundedRect
        x={cx - headR * 0.72}
        y={headCY - headR * 1.72}
        width={headR * 1.44}
        height={headR * 0.9}
        r={headR * 0.28}
        color="#d4a420"
      />
      {/* Farmer hat — band */}
      <RoundedRect
        x={cx - headR * 0.72}
        y={headCY - headR * 0.9}
        width={headR * 1.44}
        height={headR * 0.15}
        r={2}
        color="#7c5c1e"
      />
      {/* Farmer hat — brim */}
      <RoundedRect
        x={cx - headR * 1.2}
        y={headCY - headR * 0.88}
        width={headR * 2.4}
        height={headR * 0.28}
        r={headR * 0.1}
        color="#c8960c"
      />

      {/* Rosy cheeks */}
      <Circle cx={cx - headR * 0.52} cy={headCY + headR * 0.22} r={headR * 0.18} color="rgba(255,160,140,0.5)" />
      <Circle cx={cx + headR * 0.52} cy={headCY + headR * 0.22} r={headR * 0.18} color="rgba(255,160,140,0.5)" />

      {/* Eyes — whites */}
      <Circle cx={cx - headR * 0.34} cy={headCY - headR * 0.08} r={headR * 0.2} color="white" />
      <Circle cx={cx + headR * 0.34} cy={headCY - headR * 0.08} r={headR * 0.2} color="white" />

      {/* Pupils — shift based on direction */}
      <Circle
        cx={cx - headR * 0.34 + pupilDX}
        cy={headCY - headR * 0.08 + pupilDY}
        r={headR * 0.11}
        color="#1a1a2e"
      />
      <Circle
        cx={cx + headR * 0.34 + pupilDX}
        cy={headCY - headR * 0.08 + pupilDY}
        r={headR * 0.11}
        color="#1a1a2e"
      />

      {/* Celebration sparkles */}
      {animState === 'celebrating' && (
        <Group opacity={0.5 + Math.sin(tick * 0.4) * 0.5}>
          <Circle cx={cx - s * 0.22} cy={cy - s * 0.28} r={3} color="#fbbf24" />
          <Circle cx={cx + s * 0.24} cy={cy - s * 0.32} r={2.5} color="#fbbf24" />
          <Circle cx={cx + s * 0.1}  cy={cy - s * 0.38} r={2} color="#f472b6" />
          <Circle cx={cx - s * 0.12} cy={cy - s * 0.42} r={1.5} color="#34d399" />
        </Group>
      )}

      {/* Work tool arm */}
      {animState === 'working' && (
        <Group
          transform={[
            { translateX: cx + bodyW * 0.38 },
            { translateY: cy - bodyH * 0.1 },
            { rotate: armSwing },
          ]}
        >
          <RoundedRect x={-legW * 0.4} y={0} width={legW * 0.8} height={s * 0.18} r={2} color="#f5c5a3" />
          <Rect x={-legW * 0.6} y={s * 0.15} width={legW * 1.2} height={legW * 0.7} color="#8B6914" />
        </Group>
      )}
    </Group>
  );
}
