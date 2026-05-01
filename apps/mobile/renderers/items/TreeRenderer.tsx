import React from 'react';
import { Circle, RoundedRect, Group, Path, Skia } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';
import { BaseItemRenderer } from './BaseItemRenderer';

export function TreeRenderer(props: ItemRendererProps) {
  const { x, y, size } = props;
  const s = size;
  const cx = x + s / 2;
  const cy = y + s / 2 - s * 0.05;

  const canopyR = s * 0.35;
  const trunkW  = s * 0.13;
  const trunkH  = s * 0.2;
  const trunkX  = cx - trunkW / 2;
  const trunkY  = cy + canopyR * 0.7;

  // Trunk side face (right, darker)
  const trunkSide = Skia.Path.Make();
  const sd = s * 0.055; // side depth
  trunkSide.moveTo(trunkX + trunkW,      trunkY);
  trunkSide.lineTo(trunkX + trunkW + sd, trunkY - sd * 0.6);
  trunkSide.lineTo(trunkX + trunkW + sd, trunkY - sd * 0.6 + trunkH);
  trunkSide.lineTo(trunkX + trunkW,      trunkY + trunkH);
  trunkSide.close();

  // Puff positions around the canopy edge (top arc only — bottom hidden behind trunk)
  const puffs = [
    { angle: -Math.PI * 0.75, r: canopyR * 0.38 },
    { angle: -Math.PI * 0.5,  r: canopyR * 0.4  },
    { angle: -Math.PI * 0.25, r: canopyR * 0.38 },
    { angle:  0,              r: canopyR * 0.35  },
    { angle: -Math.PI,        r: canopyR * 0.35  },
    { angle: -Math.PI * 1.1,  r: canopyR * 0.32  },
    { angle:  Math.PI * 0.1,  r: canopyR * 0.32  },
  ];

  return (
    <BaseItemRenderer {...props}>
      <Group>
        {/* Ground shadow */}
        <Circle cx={cx + 2} cy={trunkY + trunkH + 2} r={canopyR * 0.55} color="rgba(0,0,0,0.13)" />

        {/* Trunk side face */}
        <Path path={trunkSide} color="#5a3620" />
        {/* Trunk front */}
        <RoundedRect x={trunkX} y={trunkY} width={trunkW} height={trunkH} r={trunkW * 0.3} color="#7a4f2d" />

        {/* Canopy underside — dark shadow ring at base of sphere */}
        <Circle cx={cx} cy={cy + canopyR * 0.22} r={canopyR * 0.88} color="#174d17" />

        {/* Main canopy */}
        <Circle cx={cx} cy={cy} r={canopyR} color="#2d7a2d" />

        {/* Puff clusters around edge for leafy silhouette */}
        {puffs.map((p, i) => (
          <Circle
            key={i}
            cx={cx + Math.cos(p.angle) * canopyR * 0.78}
            cy={cy + Math.sin(p.angle) * canopyR * 0.78}
            r={p.r}
            color="#2d7a2d"
          />
        ))}

        {/* Mid highlight — upper left */}
        <Circle
          cx={cx - canopyR * 0.28}
          cy={cy - canopyR * 0.28}
          r={canopyR * 0.42}
          color="#3fa33f"
        />

        {/* Bright top highlight — sun catch */}
        <Circle
          cx={cx - canopyR * 0.18}
          cy={cy - canopyR * 0.38}
          r={canopyR * 0.2}
          color="#52c452"
        />

        {/* Specular glint */}
        <Circle
          cx={cx - canopyR * 0.22}
          cy={cy - canopyR * 0.45}
          r={canopyR * 0.08}
          color="rgba(255,255,255,0.25)"
        />
      </Group>
    </BaseItemRenderer>
  );
}
