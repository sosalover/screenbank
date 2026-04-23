// Main grove canvas — the top-level game scene component.
// Replaces the old GameScene.tsx. Layers are composited in draw order.
// Gestures, items, character, and pan added in later phases.

import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/store/gameStore';
import { getTileSize, getGridOffsetX, SKY_HEIGHT } from '@/utils/gridMath';
import { SkyLayer } from './layers/SkyLayer';
import { TerrainLayer } from './layers/TerrainLayer';

export function GroveScene() {
  const { width } = useWindowDimensions();
  const { state } = useGame();
  const { top: topInset } = useSafeAreaInsets();

  const tileSize = getTileSize(width);
  const gridOffsetX = getGridOffsetX(width, tileSize);
  const gridOffsetY = SKY_HEIGHT + topInset;

  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <SkyLayer
          width={width}
          height={gridOffsetY}
          algorithmActive={state.algorithmActive}
        />
        <TerrainLayer
          tileSize={tileSize}
          gridOffsetX={gridOffsetX}
          gridOffsetY={gridOffsetY}
          algorithmActive={state.algorithmActive}
        />
      </Canvas>
    </View>
  );
}
