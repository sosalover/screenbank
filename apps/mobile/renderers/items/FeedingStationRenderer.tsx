import React from 'react';
import { Circle, RoundedRect, Group, Path, Skia, Rect } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';
import { BaseItemRenderer } from './BaseItemRenderer';

export function FeedingStationRenderer(props: ItemRendererProps) {
  const { x, y, size } = props;
  const s  = size;
  const cx = x + s / 2;
  const d  = s * 0.07; // 3D depth

  // Table top
  const tableW = s * 0.58;
  const tableH = s * 0.26;
  const tableX = cx - tableW / 2;
  const tableY = y + s * 0.36;

  // Benches (one near, one far)
  const benchW = s * 0.62;
  const benchH = s * 0.09;
  const benchX = cx - benchW / 2;
  const benchFarY  = tableY - benchH - s * 0.025;
  const benchNearY = tableY + tableH + s * 0.025;

  // Legs — four, drawn as short rectangles below table
  const legW = s * 0.05;
  const legH = s * 0.14;
  const legY = tableY + tableH;
  const legs = [
    { lx: tableX + tableW * 0.1 },
    { lx: tableX + tableW * 0.85 },
  ];

  // Bench legs
  const benchLegH = s * 0.08;
  const benchLegW = s * 0.04;

  // 3D side face — table
  const tableSide = Skia.Path.Make();
  tableSide.moveTo(tableX + tableW,     tableY);
  tableSide.lineTo(tableX + tableW + d, tableY - d * 0.65);
  tableSide.lineTo(tableX + tableW + d, tableY - d * 0.65 + tableH);
  tableSide.lineTo(tableX + tableW,     tableY + tableH);
  tableSide.close();

  // 3D side face — near bench
  const nearBenchSide = Skia.Path.Make();
  nearBenchSide.moveTo(benchX + benchW,     benchNearY);
  nearBenchSide.lineTo(benchX + benchW + d, benchNearY - d * 0.65);
  nearBenchSide.lineTo(benchX + benchW + d, benchNearY - d * 0.65 + benchH);
  nearBenchSide.lineTo(benchX + benchW,     benchNearY + benchH);
  nearBenchSide.close();

  // 3D side face — far bench
  const farBenchSide = Skia.Path.Make();
  farBenchSide.moveTo(benchX + benchW,     benchFarY);
  farBenchSide.lineTo(benchX + benchW + d, benchFarY - d * 0.65);
  farBenchSide.lineTo(benchX + benchW + d, benchFarY - d * 0.65 + benchH);
  farBenchSide.lineTo(benchX + benchW,     benchFarY + benchH);
  farBenchSide.close();

  // Bowl positions on table
  const bowls = [
    { bx: cx - tableW * 0.22, by: tableY + tableH * 0.28, r: s * 0.08, fill: '#e07b39', inner: '#c45e20' },
    { bx: cx + tableW * 0.18, by: tableY + tableH * 0.28, r: s * 0.075, fill: '#d4c87a', inner: '#b8a840' },
  ];

  return (
    <BaseItemRenderer {...props}>
      <Group>
        {/* Ground shadow */}
        <Circle cx={cx + 2} cy={y + s * 0.92} r={s * 0.32} color="rgba(0,0,0,0.13)" />

        {/* Far bench legs */}
        <RoundedRect x={benchX + benchW * 0.12} y={benchFarY + benchH} width={benchLegW} height={benchLegH} r={2} color="#5a3010" />
        <RoundedRect x={benchX + benchW * 0.82} y={benchFarY + benchH} width={benchLegW} height={benchLegH} r={2} color="#5a3010" />
        {/* Far bench side */}
        <Path path={farBenchSide} color="#7a4520" />
        {/* Far bench top */}
        <RoundedRect x={benchX} y={benchFarY} width={benchW} height={benchH} r={3} color="#a05828" />
        {/* Far bench plank line */}
        <Rect x={benchX + 2} y={benchFarY + benchH * 0.45} width={benchW - 4} height={s * 0.012} color="rgba(0,0,0,0.15)" />

        {/* Table legs */}
        {legs.map((l, i) => (
          <RoundedRect key={i} x={l.lx} y={legY} width={legW} height={legH} r={2} color="#5a3010" />
        ))}
        {/* Table side face */}
        <Path path={tableSide} color="#7a4520" />
        {/* Table top */}
        <RoundedRect x={tableX} y={tableY} width={tableW} height={tableH} r={3} color="#a05828" />
        {/* Plank lines */}
        {[0.3, 0.58, 0.82].map((f, i) => (
          <Rect key={i} x={tableX + 2} y={tableY + tableH * f} width={tableW - 4} height={s * 0.012} color="rgba(0,0,0,0.14)" />
        ))}
        {/* Table edge highlight */}
        <Rect x={tableX + 1} y={tableY + 1} width={tableW - 2} height={s * 0.014} color="rgba(255,255,255,0.18)" />

        {/* Food bowls */}
        {bowls.map((b, i) => (
          <Group key={i}>
            <Circle cx={b.bx + 1} cy={b.by + 1} r={b.r} color="rgba(0,0,0,0.18)" />
            <Circle cx={b.bx} cy={b.by} r={b.r} color={b.fill} />
            <Circle cx={b.bx} cy={b.by} r={b.r * 0.62} color={b.inner} />
            {/* Bowl rim highlight */}
            <Circle cx={b.bx - b.r * 0.3} cy={b.by - b.r * 0.3} r={b.r * 0.22} color="rgba(255,255,255,0.28)" />
          </Group>
        ))}

        {/* Near bench legs */}
        <RoundedRect x={benchX + benchW * 0.12} y={benchNearY + benchH} width={benchLegW} height={benchLegH} r={2} color="#5a3010" />
        <RoundedRect x={benchX + benchW * 0.82} y={benchNearY + benchH} width={benchLegW} height={benchLegH} r={2} color="#5a3010" />
        {/* Near bench side */}
        <Path path={nearBenchSide} color="#7a4520" />
        {/* Near bench top */}
        <RoundedRect x={benchX} y={benchNearY} width={benchW} height={benchH} r={3} color="#a05828" />
        {/* Near bench plank line */}
        <Rect x={benchX + 2} y={benchNearY + benchH * 0.45} width={benchW - 4} height={s * 0.012} color="rgba(0,0,0,0.15)" />
      </Group>
    </BaseItemRenderer>
  );
}
