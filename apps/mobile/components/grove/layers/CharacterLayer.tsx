// Top-down character drawn in Skia.
// Receives position + animation state from useCharacterController.
// All drawing is relative to (cx, cy) — the character's center.

import React from 'react';
import { Circle, RoundedRect, Rect, Group, Path, Skia } from '@shopify/react-native-skia';
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
  const bodyH  = s * 0.32; // shirt only — shorter to leave room for pants
  const legW   = s * 0.15;
  const legH   = s * 0.22;
  const legSep = s * 0.13;
  const pantsH = s * 0.14; // waistband/trouser section below shirt

  // Shovel dims
  const handleW = s * 0.07;
  const handleH = s * 0.36;
  const bladeW  = s * 0.14;
  const bladeH  = s * 0.09;

  const legSwing = animState === 'walking'
    ? Math.sin(tick * 0.55) * legH * 0.75
    : 0;

  const bounceY = animState === 'celebrating'
    ? -Math.abs(Math.sin(tick * 0.45)) * 14
    : 0;

  const idleY = animState === 'idle'
    ? Math.sin(tick * 0.09) * 3
    : 0;

  // Digging motion: shovel plunges forward (always same direction) and pulls back
  // digPhase 0→1→0 drives both the forward lean and the downward push
  const digPhase = animState === 'working' ? Math.abs(Math.sin(tick * 0.32)) : 0;
  const shovelAngle = 0.15 + digPhase * 0.6;   // 0.15 (ready) → 0.75 (plunged in)
  const shovelDigY  = digPhase * s * 0.07;      // slight downward push at peak

  const cx = x;
  const cy = y + bounceY + idleY;

  const shirtTop    = cy - bodyH / 2;
  const shirtBottom = cy + bodyH / 2;
  const pantsBottom = shirtBottom + pantsH;
  const legBaseY    = shirtBottom + pantsH * 0.4;
  const headCY      = shirtTop - headR * 0.65;

  // Pupil offset based on direction
  const pupilDX =
    direction === 'right' ?  headR * 0.07 :
    direction === 'left'  ? -headR * 0.07 : 0;
  const pupilDY =
    direction === 'down' ?  headR * 0.06 :
    direction === 'up'   ? -headR * 0.06 : headR * 0.02;

  // Straw hat — trapezoidal crown (flat top platform, wider base)
  const hatTopY      = headCY - headR * 2.4;
  const hatBaseY     = headCY - headR * 0.75;
  const hatTopHalfW  = headR * 0.52;  // narrow flat top
  const hatBaseHalfW = headR * 1.05;  // wider base
  const hatPath = Skia.Path.Make();
  hatPath.moveTo(cx - hatTopHalfW, hatTopY);
  hatPath.lineTo(cx + hatTopHalfW, hatTopY);
  hatPath.lineTo(cx + hatBaseHalfW, hatBaseY);
  hatPath.lineTo(cx - hatBaseHalfW, hatBaseY);
  hatPath.close();

  return (
    <Group>
      {/* Ground shadow */}
      <Circle
        cx={cx}
        cy={pantsBottom + legH * 0.6}
        r={bodyW * 0.48}
        color="rgba(0,0,0,0.13)"
      />

      {/* Legs — dark denim */}
      <RoundedRect
        x={cx - legSep - legW / 2}
        y={legBaseY + legSwing}
        width={legW}
        height={legH}
        r={legW / 2}
        color="#2d4a7a"
      />
      <RoundedRect
        x={cx + legSep - legW / 2}
        y={legBaseY - legSwing}
        width={legW}
        height={legH}
        r={legW / 2}
        color="#2d4a7a"
      />

      {/* Pants / trouser waistband */}
      <RoundedRect
        x={cx - bodyW / 2}
        y={shirtBottom - 1}
        width={bodyW}
        height={pantsH + 2}
        r={3}
        color="#2d4a7a"
      />

      {/* Shirt — blue */}
      <RoundedRect
        x={cx - bodyW / 2}
        y={shirtTop}
        width={bodyW}
        height={bodyH}
        r={bodyW * 0.22}
        color="#5b9cf6"
      />

      {/* Overall straps — red, run from shirt top down into pants */}
      <RoundedRect
        x={cx - bodyW * 0.26}
        y={shirtTop + bodyH * 0.06}
        width={bodyW * 0.13}
        height={bodyH + pantsH * 0.7}
        r={2}
        color="#c0392b"
      />
      <RoundedRect
        x={cx + bodyW * 0.13}
        y={shirtTop + bodyH * 0.06}
        width={bodyW * 0.13}
        height={bodyH + pantsH * 0.7}
        r={2}
        color="#c0392b"
      />
      {/* Strap buttons */}
      <Circle cx={cx - bodyW * 0.195} cy={shirtTop + bodyH * 0.14} r={bodyW * 0.045} color="#fff" />
      <Circle cx={cx + bodyW * 0.195} cy={shirtTop + bodyH * 0.14} r={bodyW * 0.045} color="#fff" />

      {/* Shovel — only when working */}
      {animState === 'working' && (
        <Group
          transform={[
            { translateX: cx + bodyW * 0.46 },
            { translateY: cy - bodyH * 0.05 + shovelDigY },
            { rotate: shovelAngle },
          ]}
        >
          <RoundedRect
            x={-handleW / 2}
            y={-handleH * 0.3}
            width={handleW}
            height={handleH}
            r={handleW / 2}
            color="#6b4226"
          />
          <RoundedRect
            x={-bladeW / 2}
            y={handleH * 0.68}
            width={bladeW}
            height={bladeH}
            r={3}
            color="#94a3b8"
          />
          <Rect
            x={-bladeW / 2 + 1}
            y={handleH * 0.68 + 1}
            width={bladeW * 0.35}
            height={bladeH - 2}
            color="rgba(255,255,255,0.3)"
          />
        </Group>
      )}

      {/* Head */}
      <Circle cx={cx} cy={headCY} r={headR} color="#f5c5a3" />

      {/* Straw hat — triangular crown */}
      <Path path={hatPath} color="#d4a420" />
      {/* Hat shading on right side of crown */}
      <Path path={(() => {
        const p = Skia.Path.Make();
        p.moveTo(cx + hatTopHalfW, hatTopY);
        p.lineTo(cx + hatBaseHalfW, hatBaseY);
        p.lineTo(cx, hatBaseY);
        p.lineTo(cx, hatTopY);
        p.close();
        return p;
      })()} color="rgba(0,0,0,0.1)" />
      {/* Hat band */}
      <RoundedRect
        x={cx - hatBaseHalfW + 1}
        y={hatBaseY - headR * 0.2}
        width={hatBaseHalfW * 2 - 2}
        height={headR * 0.2}
        r={2}
        color="#7c5c1e"
      />
      {/* Brim — wide and flat */}
      <RoundedRect
        x={cx - headR * 1.55}
        y={hatBaseY - headR * 0.08}
        width={headR * 3.1}
        height={headR * 0.3}
        r={headR * 0.15}
        color="#c8960c"
      />

      {/* Rosy cheeks */}
      <Circle cx={cx - headR * 0.52} cy={headCY + headR * 0.22} r={headR * 0.18} color="rgba(255,160,140,0.5)" />
      <Circle cx={cx + headR * 0.52} cy={headCY + headR * 0.22} r={headR * 0.18} color="rgba(255,160,140,0.5)" />

      {/* Eyes — whites */}
      <Circle cx={cx - headR * 0.34} cy={headCY - headR * 0.08} r={headR * 0.2} color="white" />
      <Circle cx={cx + headR * 0.34} cy={headCY - headR * 0.08} r={headR * 0.2} color="white" />

      {/* Pupils */}
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
    </Group>
  );
}
