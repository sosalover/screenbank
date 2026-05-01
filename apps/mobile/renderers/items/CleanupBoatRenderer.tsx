import React, { useState, useEffect } from 'react';
import { Circle, RoundedRect, Rect, Group, Path, Skia, Line } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';
import { BaseItemRenderer } from './BaseItemRenderer';

export function CleanupBoatRenderer(props: ItemRendererProps) {
  const { x, y, size, state } = props;
  const s  = size;
  const cx = x + s / 2;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  // Smooth back-and-forth glide + gentle rock
  const phase      = tick * 0.022;
  const boatOffX   = Math.sin(phase) * s * 0.2;
  const boatRock   = Math.sin(phase) * 0.06;
  const wakeOpacity = Math.abs(Math.sin(phase)) * 0.5 + 0.15;

  // Water surface
  const waterY = y + s * 0.32;
  const waterH = s * 0.58;

  // Hull dims (relative to animated center)
  const hullW = s * 0.82;
  const hullH = s * 0.32;
  const hullY = waterY + s * 0.06;

  const cabinW = hullW * 0.38;
  const cabinH = hullH * 0.9;
  const cabinY = hullY - cabinH + hullH * 0.15;

  const mastTopY = cabinY - s * 0.2;

  // Hull path — pointed bow on right, flat stern on left
  const boatCX = cx + boatOffX;
  const hull = Skia.Path.Make();
  hull.moveTo(boatCX - hullW * 0.5, hullY);
  hull.lineTo(boatCX - hullW * 0.5, hullY + hullH * 0.65);
  hull.quadTo(boatCX, hullY + hullH * 1.15, boatCX + hullW * 0.5, hullY + hullH * 0.65);
  hull.lineTo(boatCX + hullW * 0.5, hullY);
  hull.close();

  // Waterline stripe path
  const waterline = Skia.Path.Make();
  waterline.moveTo(boatCX - hullW * 0.5, hullY + hullH * 0.55);
  waterline.lineTo(boatCX - hullW * 0.5, hullY + hullH * 0.65);
  waterline.quadTo(boatCX, hullY + hullH * 1.15, boatCX + hullW * 0.5, hullY + hullH * 0.65);
  waterline.lineTo(boatCX + hullW * 0.5, hullY + hullH * 0.55);
  waterline.quadTo(boatCX, hullY + hullH * 1.05, boatCX - hullW * 0.5, hullY + hullH * 0.55);
  waterline.close();

  return (
    <BaseItemRenderer {...props}>
      <Group>
        {/* Water */}
        <RoundedRect x={x + s * 0.04} y={waterY} width={s * 0.92} height={waterH} r={4} color="#1a7ab5" />
        {/* Water shimmer lines */}
        {[0.18, 0.42, 0.65, 0.85].map((f, i) => (
          <Rect key={i} x={x + s * 0.08} y={waterY + waterH * f} width={s * 0.84} height={s * 0.012} color="rgba(255,255,255,0.1)" />
        ))}
        {/* Water edge shadow */}
        <Rect x={x + s * 0.04} y={waterY} width={s * 0.92} height={s * 0.025} color="rgba(0,0,0,0.12)" />

        {/* Wake foam — trails behind boat */}
        <Circle
          cx={boatCX - boatOffX * 0.6 - s * 0.12}
          cy={hullY + hullH * 0.5}
          r={s * 0.05}
          color={`rgba(255,255,255,${wakeOpacity})`}
        />
        <Circle
          cx={boatCX - boatOffX * 0.6 - s * 0.22}
          cy={hullY + hullH * 0.6}
          r={s * 0.035}
          color={`rgba(255,255,255,${wakeOpacity * 0.6})`}
        />

        {/* Boat group — rocks gently */}
        <Group transform={[{ translateX: boatCX }, { translateY: hullY + hullH * 0.4 }, { rotate: boatRock }, { translateX: -boatCX }, { translateY: -(hullY + hullH * 0.4) }]}>
          {/* Hull shadow */}
          <Path path={hull} color="rgba(0,0,0,0.22)" />

          {/* Hull */}
          <Path path={hull} color="#f0ece0" />
          {/* Waterline stripe — bold red */}
          <Path path={waterline} color="#c0392b" />
          {/* Hull highlight */}
          <Rect x={boatCX - hullW * 0.38} y={hullY + hullH * 0.04} width={hullW * 0.76} height={s * 0.014} color="rgba(255,255,255,0.5)" />

          {/* Cabin */}
          <RoundedRect x={boatCX - cabinW / 2} y={cabinY} width={cabinW} height={cabinH} r={3} color="#e8e0cc" />
          {/* Cabin window */}
          <RoundedRect x={boatCX - cabinW * 0.28} y={cabinY + cabinH * 0.2} width={cabinW * 0.56} height={cabinH * 0.38} r={2} color="#a8cfe0" />
          {/* Cabin roof */}
          <Rect x={boatCX - cabinW / 2} y={cabinY} width={cabinW} height={cabinH * 0.18} color="#c8b89a" />

          {/* Mast */}
          <Line
            p1={{ x: boatCX, y: cabinY }}
            p2={{ x: boatCX, y: mastTopY }}
            color="#8a7a5a"
            strokeWidth={s * 0.025}
          />
          {/* Flag */}
          <Path path={(() => {
            const p = Skia.Path.Make();
            p.moveTo(boatCX, mastTopY);
            p.lineTo(boatCX + s * 0.1, mastTopY + s * 0.04);
            p.lineTo(boatCX, mastTopY + s * 0.08);
            p.close();
            return p;
          })()} color="#e74c3c" />
        </Group>
      </Group>
    </BaseItemRenderer>
  );
}
