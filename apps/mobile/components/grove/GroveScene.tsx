import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/store/gameStore';
import { getTileSize, getGridOffsetX, SKY_HEIGHT } from '@/utils/gridMath';
import { SkyLayer } from './layers/SkyLayer';
import { TerrainLayer } from './layers/TerrainLayer';
import { OceanLayer } from './layers/OceanLayer';
import { ItemsLayer } from './layers/ItemsLayer';

export function GroveScene() {
  const { width } = useWindowDimensions();
  const { state } = useGame();
  const { top: topInset } = useSafeAreaInsets();

  const tileSize = getTileSize(width);
  const gridOffsetX = getGridOffsetX(width, tileSize);
  const gridOffsetY = SKY_HEIGHT + topInset;
  const allBuilds = [...state.activeBuilds, ...state.completedBuilds];

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
        <OceanLayer
          tileSize={tileSize}
          gridOffsetX={gridOffsetX}
          gridOffsetY={gridOffsetY}
        />
        <ItemsLayer
          builds={allBuilds}
          tileSize={tileSize}
          gridOffsetX={gridOffsetX}
          gridOffsetY={gridOffsetY}
        />
      </Canvas>
    </View>
  );
}
