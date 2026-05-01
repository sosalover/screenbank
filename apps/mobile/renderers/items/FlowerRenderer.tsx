import React, { useState, useEffect } from 'react';
import { Circle, RoundedRect, Group, Rect } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';
import { BaseItemRenderer } from './BaseItemRenderer';

function Bee({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  const bodyR  = s * 0.13;
  const wingW  = s * 0.14;
  const wingH  = s * 0.04;
  return (
    <Group>
      {/* Wings */}
      <Circle cx={cx - bodyR * 0.8} cy={cy - bodyR * 0.9} r={wingW * 0.6} color="rgba(220,240,255,0.75)" />
      <Circle cx={cx + bodyR * 0.8} cy={cy - bodyR * 0.9} r={wingW * 0.55} color="rgba(220,240,255,0.75)" />
      {/* Body */}
      <Circle cx={cx} cy={cy} r={bodyR} color="#fbbf24" />
      {/* Stripe */}
      <Rect x={cx - bodyR * 0.9} y={cy - bodyR * 0.2} width={bodyR * 1.8} height={bodyR * 0.55} color="rgba(0,0,0,0.45)" />
      {/* Head */}
      <Circle cx={cx} cy={cy - bodyR * 0.85} r={bodyR * 0.45} color="#111" />
    </Group>
  );
}

export function FlowerRenderer(props: ItemRendererProps) {
  const { x, y, size, state } = props;
  const s = size;
  const cx = x + s / 2;
  const cy = y + s / 2;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (state !== 'complete') return;
    const id = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, [state]);

  const stemW     = s * 0.045;
  const stemBaseY = cy + s * 0.32;
  const stemTopY  = cy - s * 0.08;
  const flowerY   = stemTopY - s * 0.06;

  const petalLen  = s * 0.2;
  const petalW    = s * 0.09;
  const petalDist = s * 0.1;
  const numPetals = 8;

  const leafLen = s * 0.15;
  const leafW   = s * 0.07;
  const leafY   = stemBaseY - s * 0.16;

  // Bees orbit the flower in a flat ellipse
  const orbitRX = s * 0.32;
  const orbitRY = s * 0.14;
  const bees = [
    { phase: 0,             speed: 0.055 },
    { phase: Math.PI * 0.7, speed: 0.048 },
  ];

  const beePositions = bees.map((b) => {
    const t = tick * b.speed + b.phase;
    return {
      bx: cx + Math.cos(t) * orbitRX,
      by: flowerY - s * 0.08 + Math.sin(t) * orbitRY + Math.sin(tick * 0.14 + b.phase) * s * 0.03,
      front: Math.sin(t) > 0,
    };
  });

  return (
    <BaseItemRenderer {...props}>
      <Group>
        {/* Ground shadow */}
        <Circle cx={cx + 1} cy={stemBaseY + 2} r={s * 0.14} color="rgba(0,0,0,0.12)" />

        {/* Bees behind flower */}
        {state === 'complete' && beePositions.filter((b) => !b.front).map((b, i) => (
          <Bee key={i} cx={b.bx} cy={b.by} s={s} />
        ))}

        {/* Stem */}
        <RoundedRect
          x={cx - stemW / 2}
          y={stemTopY}
          width={stemW}
          height={stemBaseY - stemTopY}
          r={stemW / 2}
          color="#2d7a2d"
        />

        {/* Left leaf */}
        <Group transform={[{ translateX: cx - stemW * 0.4 }, { translateY: leafY }, { rotate: -0.65 }]}>
          <RoundedRect x={-leafW / 2} y={-leafLen} width={leafW} height={leafLen} r={leafW / 2} color="#3a9a3a" />
        </Group>

        {/* Right leaf */}
        <Group transform={[{ translateX: cx + stemW * 0.4 }, { translateY: leafY - s * 0.07 }, { rotate: 0.6 }]}>
          <RoundedRect x={-leafW / 2} y={-leafLen} width={leafW} height={leafLen} r={leafW / 2} color="#3a9a3a" />
        </Group>

        {/* Petal drop shadow */}
        <Circle cx={cx + 1.5} cy={flowerY + 1.5} r={petalDist + petalLen * 0.65} color="rgba(0,0,0,0.13)" />

        {/* Petals */}
        {Array.from({ length: numPetals }).map((_, i) => {
          const angle = (i / numPetals) * Math.PI * 2;
          const color = i % 2 === 0 ? '#f472b6' : '#e879a8';
          return (
            <Group key={i} transform={[{ translateX: cx }, { translateY: flowerY }, { rotate: angle }]}>
              <RoundedRect
                x={-petalW / 2}
                y={-(petalDist + petalLen)}
                width={petalW}
                height={petalLen}
                r={petalW / 2}
                color={color}
              />
            </Group>
          );
        })}

        {/* Petal sheen */}
        {[0, 1, 2].map((i) => {
          const angle = (i / numPetals) * Math.PI * 2 - Math.PI * 0.5;
          return (
            <Group key={i} transform={[{ translateX: cx }, { translateY: flowerY }, { rotate: angle }]}>
              <RoundedRect
                x={-petalW * 0.3}
                y={-(petalDist + petalLen * 0.85)}
                width={petalW * 0.6}
                height={petalLen * 0.4}
                r={petalW * 0.3}
                color="rgba(255,255,255,0.22)"
              />
            </Group>
          );
        })}

        {/* Centre */}
        <Circle cx={cx} cy={flowerY} r={s * 0.11} color="#f59e0b" />
        <Circle cx={cx} cy={flowerY} r={s * 0.07} color="#fbbf24" />
        <Circle cx={cx - s * 0.03}  cy={flowerY - s * 0.025} r={s * 0.014} color="rgba(0,0,0,0.28)" />
        <Circle cx={cx + s * 0.03}  cy={flowerY - s * 0.025} r={s * 0.014} color="rgba(0,0,0,0.28)" />
        <Circle cx={cx}             cy={flowerY + s * 0.033}  r={s * 0.014} color="rgba(0,0,0,0.28)" />
        <Circle cx={cx - s * 0.025} cy={flowerY - s * 0.03}  r={s * 0.02}  color="rgba(255,255,255,0.35)" />

        {/* Bees in front of flower */}
        {state === 'complete' && beePositions.filter((b) => b.front).map((b, i) => (
          <Bee key={i} cx={b.bx} cy={b.by} s={s} />
        ))}
      </Group>
    </BaseItemRenderer>
  );
}
