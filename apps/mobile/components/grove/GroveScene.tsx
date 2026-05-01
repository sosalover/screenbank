import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Rect } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame, Build } from '@/store/gameStore';
import { getTileSize, getGridOffsetX, SKY_HEIGHT, GRID, screenToCell, cellToScreen, isCauseValidForTile, buildOccupiedSet } from '@/utils/gridMath';
import { useCharacterController } from '@/hooks/useCharacterController';
import { SkyLayer } from './layers/SkyLayer';
import { TerrainLayer } from './layers/TerrainLayer';
import { OceanLayer } from './layers/OceanLayer';
import { ItemsLayer } from './layers/ItemsLayer';
import { GrassLayer } from './layers/GrassLayer';
import { PlacementOverlay } from './layers/PlacementOverlay';
import { CharacterLayer } from './layers/CharacterLayer';
import { PlacementBanner } from './PlacementBanner';
import { PlacementConfirmSheet } from './PlacementConfirmSheet';
import { ItemInfoSheet } from './ItemInfoSheet';
import { AlgorithmBanner } from './AlgorithmBanner';
import { MoveModeBanner } from './MoveModeBanner';

export function GroveScene() {
  const { width, height } = useWindowDimensions();
  const { state, dispatch } = useGame();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const [inspectedBuild, setInspectedBuild] = useState<Build | null>(null);

  // Cap tileSize so the grid + HUD both fit on screen.
  // Tab bar ≈ 49 + bottomInset. Reserve 150pt minimum for the HUD.
  const TAB_BAR = 49 + bottomInset;
  const MIN_HUD = 150;
  const maxTileSizeByHeight = Math.floor(
    (height - TAB_BAR - MIN_HUD - SKY_HEIGHT - topInset) / GRID.ROWS
  );
  const tileSize = Math.min(getTileSize(width), maxTileSizeByHeight);
  const gridOffsetX = getGridOffsetX(width, tileSize);
  const gridOffsetY = SKY_HEIGHT + topInset;
  const allBuilds = [...state.activeBuilds, ...state.completedBuilds];
  const { placementMode, moveMode, algorithmActive } = state;
  const character = useCharacterController(tileSize, gridOffsetX, gridOffsetY);

  // Build being moved (if any)
  const movingBuild = moveMode.active && moveMode.buildId
    ? state.completedBuilds.find((b) => b.id === moveMode.buildId) ?? null
    : null;

  // Occupied cells — exclude the build being moved so it can be placed freely
  const occupiedCells = buildOccupiedSet(
    moveMode.active && moveMode.buildId
      ? allBuilds.filter((b) => b.id !== moveMode.buildId)
      : allBuilds
  );

  const handleTap = useCallback((x: number, y: number) => {
    const cell = screenToCell(x, y, tileSize, gridOffsetX, 0, gridOffsetY);
    if (!cell) return;

    // Move mode: tap a valid cell to relocate the build
    if (moveMode.active && movingBuild) {
      if (!isCauseValidForTile(movingBuild.cause.id, cell.row)) return;
      if (occupiedCells.has(`${cell.col},${cell.row}`)) return;
      dispatch({ type: 'MOVE_BUILD', buildId: movingBuild.id, col: cell.col, row: cell.row });
      const cellScreen = cellToScreen(cell.col, cell.row, tileSize, gridOffsetX, 0, gridOffsetY);
      character.moveTo(cellScreen.x + tileSize / 2, cellScreen.y + tileSize / 2);
      return;
    }

    // Placement mode: tap a valid cell to select it
    if (placementMode.active && placementMode.pendingCause) {
      if (!isCauseValidForTile(placementMode.pendingCause.id, cell.row)) return;
      if (occupiedCells.has(`${cell.col},${cell.row}`)) return;
      dispatch({ type: 'SELECT_CELL', col: cell.col, row: cell.row });
      return;
    }

    // Inspect tapped build
    const build = allBuilds.find(
      (b) => b.gridPos.col === cell.col && b.gridPos.row === cell.row
    );
    if (build) setInspectedBuild(build);

    // Walk to tapped cell — stand beside it if it's occupied
    const walkCol = occupiedCells.has(`${cell.col},${cell.row}`)
      ? (cell.col < GRID.COLS - 1 ? cell.col + 1 : cell.col - 1)
      : cell.col;
    const cellScreen = cellToScreen(walkCol, cell.row, tileSize, gridOffsetX, 0, gridOffsetY);
    character.moveTo(cellScreen.x + tileSize / 2, cellScreen.y + tileSize / 2);
  }, [moveMode, movingBuild, placementMode, tileSize, gridOffsetX, gridOffsetY, occupiedCells, allBuilds, dispatch, character]);

  const handleLongPress = useCallback((x: number, y: number) => {
    const cell = screenToCell(x, y, tileSize, gridOffsetX, 0, gridOffsetY);
    if (!cell) return;
    // Only long-press completed builds to enter move mode
    const build = state.completedBuilds.find(
      (b) => b.gridPos.col === cell.col && b.gridPos.row === cell.row
    );
    if (build) dispatch({ type: 'ENTER_MOVE_MODE', buildId: build.id });
  }, [state.completedBuilds, tileSize, gridOffsetX, gridOffsetY, dispatch]);

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd((e) => { handleTap(e.x, e.y); });

  const longPressGesture = Gesture.LongPress()
    .runOnJS(true)
    .minDuration(600)
    .onEnd((e) => { handleLongPress(e.x, e.y); });

  const composed = Gesture.Race(tapGesture, longPressGesture);

  // Determine which overlay to show (placement or move)
  const showOverlay =
    (placementMode.active && !!placementMode.pendingCause) ||
    (moveMode.active && !!movingBuild);
  const overlayCauseId = moveMode.active && movingBuild
    ? movingBuild.cause.id
    : placementMode.pendingCause?.id ?? '';
  const overlaySelectedCell = placementMode.active ? placementMode.selectedCell : null;

  return (
    <View style={{ backgroundColor: algorithmActive ? '#0d0d1a' : '#0284c7' }}>
      <GestureDetector gesture={composed}>
        <Canvas style={{ width, height: gridOffsetY + GRID.ROWS * tileSize }}>
          <SkyLayer
            width={width}
            height={gridOffsetY}
            algorithmActive={algorithmActive}
            tick={character.tick}
          />
          <TerrainLayer
            tileSize={tileSize}
            gridOffsetX={gridOffsetX}
            gridOffsetY={gridOffsetY}
            algorithmActive={algorithmActive}
          />
          <GrassLayer
            tileSize={tileSize}
            gridOffsetX={gridOffsetX}
            gridOffsetY={gridOffsetY}
            tick={character.tick}
          />
          {showOverlay && (
            <PlacementOverlay
              pendingCauseId={overlayCauseId}
              selectedCell={overlaySelectedCell}
              occupiedCells={occupiedCells}
              tileSize={tileSize}
              gridOffsetX={gridOffsetX}
              gridOffsetY={gridOffsetY}
            />
          )}
          <OceanLayer
            tileSize={tileSize}
            gridOffsetX={gridOffsetX}
            gridOffsetY={gridOffsetY}
            tick={character.tick}
          />
          <ItemsLayer
            builds={allBuilds}
            tileSize={tileSize}
            gridOffsetX={gridOffsetX}
            gridOffsetY={gridOffsetY}
          />
          <CharacterLayer
            x={character.x}
            y={character.y}
            animState={character.animState}
            direction={character.direction}
            tick={character.tick}
            tileSize={tileSize}
          />
          {/* Algorithm dark overlay */}
          {algorithmActive && (
            <Rect x={0} y={0} width={width} height={height} color="rgba(88,28,135,0.22)" />
          )}
        </Canvas>
      </GestureDetector>

      {/* Algorithm raid banner */}
      {algorithmActive && (
        <AlgorithmBanner onDismiss={() => dispatch({ type: 'CLEAR_ALGORITHM' })} />
      )}

      {/* Move mode banner */}
      {moveMode.active && movingBuild && (
        <MoveModeBanner
          build={movingBuild}
          onCancel={() => dispatch({ type: 'CANCEL_MOVE_MODE' })}
        />
      )}

      {placementMode.active && placementMode.pendingCause && !placementMode.selectedCell && (
        <PlacementBanner
          cause={placementMode.pendingCause}
          onCancel={() => dispatch({ type: 'CANCEL_PLACEMENT_MODE' })}
        />
      )}

      {placementMode.active && placementMode.pendingCause && placementMode.selectedCell && (
        <PlacementConfirmSheet
          cause={placementMode.pendingCause}
          cell={placementMode.selectedCell}
          onConfirm={() => dispatch({ type: 'CONFIRM_PLACEMENT' })}
          onCancel={() => dispatch({ type: 'CANCEL_PLACEMENT_MODE' })}
        />
      )}

      {inspectedBuild && !placementMode.active && !moveMode.active && (
        <ItemInfoSheet
          build={inspectedBuild}
          onClose={() => setInspectedBuild(null)}
        />
      )}

      {/* Dev-only controls */}
      {__DEV__ && (
        <View style={[styles.devPanel, { bottom: bottomInset + 80 }]}>
          <TouchableOpacity
            style={styles.devBtn}
            onPress={() => dispatch({ type: 'ALGORITHM_RAID', minutesOver: 30 })}
          >
            <Text style={styles.devBtnText}>Raid</Text>
          </TouchableOpacity>
          <View style={styles.devRow}>
            <Text style={styles.devLabel}>Screen</Text>
            <TouchableOpacity style={styles.devSmallBtn} onPress={() => dispatch({ type: 'SET_SCREEN_TIME_USED', usedMinutes: state.screenTimeUsedMinutes - 15 })}>
              <Text style={styles.devBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.devValue}>{state.screenTimeUsedMinutes}m</Text>
            <TouchableOpacity style={styles.devSmallBtn} onPress={() => dispatch({ type: 'SET_SCREEN_TIME_USED', usedMinutes: state.screenTimeUsedMinutes + 15 })}>
              <Text style={styles.devBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.devRow}>
            <Text style={styles.devLabel}>Sparks</Text>
            <TouchableOpacity style={styles.devSmallBtn} onPress={() => dispatch({ type: 'SET_SPARK_BALANCE', sparks: (state.sparkBalance ?? 0) - 1000 })}>
              <Text style={styles.devBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.devValue}>{state.sparkBalance ?? 0}</Text>
            <TouchableOpacity style={styles.devSmallBtn} onPress={() => dispatch({ type: 'SET_SPARK_BALANCE', sparks: (state.sparkBalance ?? 0) + 1000 })}>
              <Text style={styles.devBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  devPanel: {
    position: 'absolute',
    right: 16,
    gap: 6,
    zIndex: 99,
  },
  devBtn: {
    backgroundColor: 'rgba(124,58,237,0.85)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: 'center',
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  devSmallBtn: {
    backgroundColor: 'rgba(124,58,237,0.85)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  devBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  devLabel: {
    color: '#fff',
    fontSize: 10,
    width: 42,
  },
  devValue: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
});
