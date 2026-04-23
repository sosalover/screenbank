// Base item renderer — handles opacity for in-progress state and progress arc.
// All item renderers wrap their shapes in this component.
// Phase 2 will expand this with the progress arc overlay.

import React from 'react';
import { Group } from '@shopify/react-native-skia';
import { ItemRendererProps } from '../types';

interface BaseItemRendererProps extends ItemRendererProps {
  children: React.ReactNode;
}

export function BaseItemRenderer({ state, children }: BaseItemRendererProps) {
  const opacity = state === 'in_progress' ? 0.4 : 1;
  return <Group opacity={opacity}>{children}</Group>;
}
