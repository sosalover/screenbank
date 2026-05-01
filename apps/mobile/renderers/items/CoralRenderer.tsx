import React from 'react';
import { Circle, RoundedRect, Group } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';
import { BaseItemRenderer } from './BaseItemRenderer';

export function CoralRenderer(props: ItemRendererProps) {
  const { x, y, size } = props;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const s = size;

  const trunkW  = s * 0.14;
  const branchW = s * 0.1;
  const tipW    = s * 0.065;

  // Branch: draws upward from pivot, starting at y=0, extending to y=-len
  // translateX/Y sets the pivot, rotate tilts it, rect hangs upward
  const Branch = ({ px, py, angle, len, w, color }: {
    px: number; py: number; angle: number; len: number; w: number; color: string;
  }) => (
    <Group transform={[{ translateX: px }, { translateY: py }, { rotate: angle }]}>
      <RoundedRect x={-w / 2} y={-len} width={w} height={len} r={w / 2} color={color} />
    </Group>
  );

  // Shadow version — offset right+down for depth
  const BranchShadow = ({ px, py, angle, len, w }: {
    px: number; py: number; angle: number; len: number; w: number;
  }) => (
    <Group transform={[{ translateX: px + 1.5 }, { translateY: py + 1.5 }, { rotate: angle }]}>
      <RoundedRect x={-w / 2} y={-len} width={w} height={len} r={w / 2} color="rgba(0,0,0,0.18)" />
    </Group>
  );

  const baseY = cy + s * 0.38;

  return (
    <BaseItemRenderer {...props}>
      <Group>
        {/* Ground shadow */}
        <Circle cx={cx + 1} cy={baseY + 2} r={s * 0.2} color="rgba(0,0,0,0.12)" />

        {/* Trunk shadow */}
        <BranchShadow px={cx}            py={baseY}             angle={0}      len={s * 0.52} w={trunkW} />
        <BranchShadow px={cx - s * 0.05} py={baseY - s * 0.22} angle={-0.55}  len={s * 0.36} w={branchW} />
        <BranchShadow px={cx + s * 0.05} py={baseY - s * 0.2}  angle={0.5}    len={s * 0.34} w={branchW} />

        {/* Trunk */}
        <Branch px={cx}            py={baseY}             angle={0}     len={s * 0.52} w={trunkW}  color="#c0392b" />

        {/* Left main branch */}
        <Branch px={cx - s * 0.05} py={baseY - s * 0.22} angle={-0.55} len={s * 0.36} w={branchW} color="#e8826a" />
        {/* Right main branch */}
        <Branch px={cx + s * 0.05} py={baseY - s * 0.2}  angle={0.5}   len={s * 0.34} w={branchW} color="#e8826a" />
        {/* Centre branch */}
        <Branch px={cx}            py={baseY - s * 0.28}  angle={-0.08} len={s * 0.26} w={branchW} color="#e8826a" />
        {/* Far left lean */}
        <Branch px={cx - s * 0.08} py={baseY - s * 0.1}  angle={-0.9}  len={s * 0.28} w={branchW} color="#e8826a" />
        {/* Far right lean */}
        <Branch px={cx + s * 0.08} py={baseY - s * 0.1}  angle={0.85}  len={s * 0.26} w={branchW} color="#e8826a" />

        {/* Sub-branches — left cluster */}
        <Branch px={cx - s * 0.18} py={baseY - s * 0.42} angle={-0.8}  len={s * 0.18} w={tipW} color="#f0a090" />
        <Branch px={cx - s * 0.12} py={baseY - s * 0.44} angle={-0.25} len={s * 0.17} w={tipW} color="#f0a090" />
        {/* Sub-branches — right cluster */}
        <Branch px={cx + s * 0.16} py={baseY - s * 0.4}  angle={0.72}  len={s * 0.18} w={tipW} color="#f0a090" />
        <Branch px={cx + s * 0.1}  py={baseY - s * 0.41} angle={0.18}  len={s * 0.17} w={tipW} color="#f0a090" />
        {/* Sub-branches — centre top */}
        <Branch px={cx - s * 0.03} py={baseY - s * 0.48} angle={-0.35} len={s * 0.16} w={tipW} color="#f0a090" />
        <Branch px={cx + s * 0.03} py={baseY - s * 0.47} angle={0.3}   len={s * 0.15} w={tipW} color="#f0a090" />
        {/* Sub-branches — far left */}
        <Branch px={cx - s * 0.28} py={baseY - s * 0.28} angle={-1.1}  len={s * 0.15} w={tipW} color="#f0a090" />
        <Branch px={cx - s * 0.26} py={baseY - s * 0.3}  angle={-0.5}  len={s * 0.14} w={tipW} color="#f0a090" />
        {/* Sub-branches — far right */}
        <Branch px={cx + s * 0.26} py={baseY - s * 0.26} angle={1.05}  len={s * 0.15} w={tipW} color="#f0a090" />
        <Branch px={cx + s * 0.24} py={baseY - s * 0.28} angle={0.45}  len={s * 0.14} w={tipW} color="#f0a090" />

        {/* Polyp dots at tips */}
        <Circle cx={cx - s * 0.24} cy={baseY - s * 0.58} r={s * 0.032} color="#ffd4c8" />
        <Circle cx={cx - s * 0.13} cy={baseY - s * 0.6}  r={s * 0.028} color="#ffd4c8" />
        <Circle cx={cx + s * 0.21} cy={baseY - s * 0.56} r={s * 0.03}  color="#ffd4c8" />
        <Circle cx={cx + s * 0.12} cy={baseY - s * 0.57} r={s * 0.032} color="#ffd4c8" />
        <Circle cx={cx - s * 0.04} cy={baseY - s * 0.62} r={s * 0.03}  color="#ffd4c8" />
        <Circle cx={cx + s * 0.05} cy={baseY - s * 0.61} r={s * 0.028} color="#ffd4c8" />
        <Circle cx={cx - s * 0.33} cy={baseY - s * 0.41} r={s * 0.025} color="#ffd4c8" />
        <Circle cx={cx + s * 0.32} cy={baseY - s * 0.39} r={s * 0.025} color="#ffd4c8" />

        {/* Trunk right-side shading */}
        <Branch px={cx + trunkW * 0.2} py={baseY} angle={0} len={s * 0.52} w={trunkW * 0.4} color="rgba(0,0,0,0.12)" />
      </Group>
    </BaseItemRenderer>
  );
}
