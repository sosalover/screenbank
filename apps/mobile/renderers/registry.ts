import React from 'react';
import { ItemRendererProps } from './types';
import { TreeRenderer } from './items/TreeRenderer';
import { FlowerRenderer } from './items/FlowerRenderer';
import { ShelterRenderer } from './items/ShelterRenderer';
import { FeedingStationRenderer } from './items/FeedingStationRenderer';
import { CoralRenderer } from './items/CoralRenderer';
import { CleanupBoatRenderer } from './items/CleanupBoatRenderer';

export const ITEM_RENDERERS: Record<string, React.FC<ItemRendererProps>> = {
  tree: TreeRenderer,
  bee: FlowerRenderer,
  puppy: ShelterRenderer,
  family: FeedingStationRenderer,
  coral: CoralRenderer,
  ocean: CleanupBoatRenderer,
};
