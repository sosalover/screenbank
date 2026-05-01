// Manages character position and animation state.
// Uses refs inside the interval to avoid stale closures.
// Returns values for CharacterLayer to render each tick.

import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/store/gameStore';
import { cellToScreen, GRID, HOME_COL, HOME_ROW } from '@/utils/gridMath';

export type AnimState = 'idle' | 'walking' | 'working' | 'celebrating';
export type Direction = 'up' | 'down' | 'left' | 'right';

const WALK_SPEED = 8;          // px per 50ms tick → ~160px/s
const CELEBRATE_TICKS = 44;    // ~2.2s at 50ms
const WANDER_IDLE_TICKS = 160; // ~8s idle before Grover wanders

function getDirection(fromX: number, fromY: number, toX: number, toY: number): Direction {
  const dx = toX - fromX;
  const dy = toY - fromY;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

export function useCharacterController(
  tileSize: number,
  gridOffsetX: number,
  gridOffsetY: number,
) {
  // Start at center of grove
  const startCol = Math.floor(GRID.COLS / 2);
  const startRow = Math.floor(GRID.GROVE_END_ROW / 2);
  const startCell = cellToScreen(startCol, startRow, tileSize, gridOffsetX, 0, gridOffsetY);
  const startX = startCell.x + tileSize / 2;
  const startY = startCell.y + tileSize / 2;

  const [pos, setPos] = useState({ x: startX, y: startY });
  const [animState, setAnimState] = useState<AnimState>('idle');
  const [direction, setDirection] = useState<Direction>('down');
  const [tick, setTick] = useState(0);

  // Mutable refs for use inside interval (avoids stale closures)
  const posRef = useRef({ x: startX, y: startY });
  const targetRef = useRef({ x: startX, y: startY });
  const animStateRef = useRef<AnimState>('idle');
  const celebTicksRef = useRef(0);
  const idleTicksRef = useRef(0);
  const activeBuildIdRef = useRef<string | null>(null);
  const completedCountRef = useRef(0);
  const directionRef = useRef<Direction>('down');
  const walkModeRef = useRef<'build' | 'free'>('free');

  // Refs for tileSize/offsets so the tick loop (empty deps) can access current values
  const tileSizeRef = useRef(tileSize);
  const gridOffsetXRef = useRef(gridOffsetX);
  const gridOffsetYRef = useRef(gridOffsetY);
  useEffect(() => {
    tileSizeRef.current = tileSize;
    gridOffsetXRef.current = gridOffsetX;
    gridOffsetYRef.current = gridOffsetY;
  }, [tileSize, gridOffsetX, gridOffsetY]);

  const { state } = useGame();

  // Track occupied cells so wander avoids walking onto builds
  const occupiedRef = useRef<Set<string>>(new Set([`${HOME_COL},${HOME_ROW}`]));
  useEffect(() => {
    const allBuilds = [...state.activeBuilds, ...state.completedBuilds];
    const set = new Set(allBuilds.map((b) => `${b.gridPos.col},${b.gridPos.row}`));
    set.add(`${HOME_COL},${HOME_ROW}`);
    occupiedRef.current = set;
  }, [state.activeBuilds, state.completedBuilds]);

  // Respond to new active builds → walk to the build cell
  useEffect(() => {
    const build = state.activeBuilds[0];
    if (build && build.id !== activeBuildIdRef.current) {
      activeBuildIdRef.current = build.id;
      // Stand in the adjacent cell rather than on top of the build
      const adjCol = build.gridPos.col < GRID.COLS - 1 ? build.gridPos.col + 1 : build.gridPos.col - 1;
      const cell = cellToScreen(adjCol, build.gridPos.row, tileSize, gridOffsetX, 0, gridOffsetY);
      targetRef.current = { x: cell.x + tileSize / 2, y: cell.y + tileSize / 2 };
      walkModeRef.current = 'build';
      if (animStateRef.current !== 'celebrating') {
        animStateRef.current = 'walking';
        setAnimState('walking');
      }
    }
    if (!build) activeBuildIdRef.current = null;
  }, [state.activeBuilds, tileSize, gridOffsetX, gridOffsetY]);

  // Respond to completed builds → celebrate
  useEffect(() => {
    if (state.completedBuilds.length > completedCountRef.current) {
      completedCountRef.current = state.completedBuilds.length;
      animStateRef.current = 'celebrating';
      celebTicksRef.current = 0;
      setAnimState('celebrating');
    }
  }, [state.completedBuilds.length]);

  // Main tick loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);

      if (animStateRef.current === 'celebrating') {
        celebTicksRef.current += 1;
        if (celebTicksRef.current >= CELEBRATE_TICKS) {
          animStateRef.current = 'idle';
          setAnimState('idle');
        }
        return;
      }

      if (animStateRef.current === 'idle') {
        idleTicksRef.current += 1;
        if (idleTicksRef.current >= WANDER_IDLE_TICKS) {
          idleTicksRef.current = 0;
          const goHome = Math.random() < 0.5;
          let col = goHome ? HOME_COL : Math.floor(Math.random() * GRID.COLS);
          let row = goHome ? HOME_ROW : Math.floor(Math.random() * (GRID.GROVE_END_ROW + 1));
          // Retry until we find an unoccupied cell (or give up after 20 tries)
          if (!goHome) {
            let attempts = 0;
            while (occupiedRef.current.has(`${col},${row}`) && attempts < 20) {
              col = Math.floor(Math.random() * GRID.COLS);
              row = Math.floor(Math.random() * (GRID.GROVE_END_ROW + 1));
              attempts++;
            }
          }
          const cell = cellToScreen(col, row, tileSizeRef.current, gridOffsetXRef.current, 0, gridOffsetYRef.current);
          targetRef.current = { x: cell.x + tileSizeRef.current / 2, y: cell.y + tileSizeRef.current / 2 };
          walkModeRef.current = 'free';
          animStateRef.current = 'walking';
          setAnimState('walking');
        }
      }

      if (animStateRef.current === 'walking') {
        const { x: px, y: py } = posRef.current;
        const { x: tx, y: ty } = targetRef.current;
        const dx = tx - px;
        const dy = ty - py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= WALK_SPEED) {
          posRef.current = { x: tx, y: ty };
          setPos({ x: tx, y: ty });
          const arrived = walkModeRef.current === 'build' ? 'working' : 'idle';
          animStateRef.current = arrived;
          idleTicksRef.current = 0;
          setAnimState(arrived);
        } else {
          const nx = px + (dx / dist) * WALK_SPEED;
          const ny = py + (dy / dist) * WALK_SPEED;
          const dir = getDirection(px, py, tx, ty);
          posRef.current = { x: nx, y: ny };
          directionRef.current = dir;
          setPos({ x: nx, y: ny });
          setDirection(dir);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, []); // empty — all state accessed via refs

  const moveTo = (screenX: number, screenY: number) => {
    if (animStateRef.current === 'celebrating') return;
    targetRef.current = { x: screenX, y: screenY };
    walkModeRef.current = 'free';
    animStateRef.current = 'walking';
    setAnimState('walking');
  };

  return { x: pos.x, y: pos.y, animState, direction, tick, moveTo };
}
