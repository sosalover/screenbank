// Base item renderer — opacity for in-progress state + progress arc overlay.
import React, { useMemo } from 'react';
import { Group, Path, Skia } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';

interface BaseItemRendererProps extends ItemRendererProps {
  children: React.ReactNode;
}

export function BaseItemRenderer({ x, y, size, state, progress = 0, children }: BaseItemRendererProps) {
  const opacity = state === 'in_progress' ? 0.5 : 1;

  const arcPath = useMemo(() => {
    if (state !== 'in_progress' || progress <= 0) return null;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.42;
    const sweep = progress * 360;
    const path = Skia.Path.Make();
    path.addArc({ x: cx - r, y: cy - r, width: r * 2, height: r * 2 }, -90, sweep);
    return path;
  }, [x, y, size, state, progress]);

  return (
    <Group opacity={opacity}>
      {children}
      {arcPath && (
        <Path
          path={arcPath}
          style="stroke"
          strokeWidth={3}
          color="rgba(255,255,255,0.9)"
          strokeCap="round"
        />
      )}
    </Group>
  );
}
