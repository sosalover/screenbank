import React from 'react';
import { Group } from '@shopify/react-native-skia';
import { TileRendererProps } from '../types';

interface BaseTileRendererProps extends TileRendererProps {
  children: React.ReactNode;
}

export function BaseTileRenderer({ children }: BaseTileRendererProps) {
  return <Group>{children}</Group>;
}
