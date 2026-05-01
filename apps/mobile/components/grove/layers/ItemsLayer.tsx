import React from 'react';
import { Build } from '@/store/gameStore';
import { ITEM_RENDERERS } from '@/renderers/registry';
import { cellToScreen, HOME_COL, HOME_ROW } from '@/utils/gridMath';
import { HomeRenderer } from '@/renderers/items/HomeRenderer';

interface ItemsLayerProps {
  builds: Build[];
  tileSize: number;
  gridOffsetX: number;
  gridOffsetY: number;
  panY?: number;
}

export function ItemsLayer({ builds, tileSize, gridOffsetX, gridOffsetY, panY = 0 }: ItemsLayerProps) {
  const home = cellToScreen(HOME_COL, HOME_ROW, tileSize, gridOffsetX, panY, gridOffsetY);

  return (
    <>
      <HomeRenderer x={home.x} y={home.y} size={tileSize} />
      {builds.map((build) => {
        if (!build.gridPos) return null;
        const Renderer = ITEM_RENDERERS[build.cause.id];
        if (!Renderer) return null;

        const { x, y } = cellToScreen(build.gridPos.col, build.gridPos.row, tileSize, gridOffsetX, panY, gridOffsetY);
        const now = Date.now();
        const elapsed = now - build.startedAt.getTime();
        const total = build.completesAt.getTime() - build.startedAt.getTime();
        const progress = build.status === 'complete' ? 1 : Math.min(elapsed / total, 1);

        return (
          <Renderer
            key={build.id}
            x={x}
            y={y}
            size={tileSize}
            state={build.status === 'complete' ? 'complete' : 'in_progress'}
            progress={progress}
          />
        );
      })}
    </>
  );
}
