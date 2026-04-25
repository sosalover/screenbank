import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { GRID } from "@/utils/gridMath";

export type CauseItem = {
  id: string;
  name: string;
  icon: string;
  minuteCost: number;
  realDurationMs: number;
  impact: string;
  charity: string;
};

export type Build = {
  id: string;
  cause: CauseItem;
  startedAt: Date;
  completesAt: Date;
  delayedMs: number;
  status: "in_progress" | "delayed" | "complete";
  gridPos: { col: number; row: number };
};

type PlacementMode = {
  active: boolean;
  pendingCause: CauseItem | null;
  selectedCell: { col: number; row: number } | null;
};

type MoveMode = {
  active: boolean;
  buildId: string | null;
};

type State = {
  minuteBalance: number;
  activeBuilds: Build[];
  completedBuilds: Build[];
  streak: number;
  algorithmRaids: number;
  algorithmActive: boolean;
  placementMode: PlacementMode;
  moveMode: MoveMode;
};

type Action =
  | { type: "QUEUE_BUILD"; cause: CauseItem }
  | { type: "COMPLETE_BUILD"; buildId: string }
  | { type: "ALGORITHM_RAID"; minutesOver: number }
  | { type: "CLEAR_ALGORITHM" }
  | { type: "ENTER_PLACEMENT_MODE"; cause: CauseItem }
  | { type: "SELECT_CELL"; col: number; row: number }
  | { type: "CONFIRM_PLACEMENT" }
  | { type: "CANCEL_PLACEMENT_MODE" }
  | { type: "ENTER_MOVE_MODE"; buildId: string }
  | { type: "CANCEL_MOVE_MODE" }
  | { type: "MOVE_BUILD"; buildId: string; col: number; row: number }
  | { type: "TICK" };

const DEV_SPEED = __DEV__ ? 0.00005 : 1;

export const CAUSE_ITEMS: CauseItem[] = [
  {
    id: "puppy",
    name: "Shelter a Puppy",
    icon: "paw",
    minuteCost: 15,
    realDurationMs: 6 * 60 * 60 * 1000 * DEV_SPEED,
    impact: "Funds 1 day of shelter care",
    charity: "ASPCA",
  },
  {
    id: "family",
    name: "Feed a Family",
    icon: "restaurant-outline",
    minuteCost: 10,
    realDurationMs: 12 * 60 * 60 * 1000 * DEV_SPEED,
    impact: "Provides a family meal",
    charity: "Feeding America",
  },
  {
    id: "bee",
    name: "Sow Bee Habitat",
    icon: "flower-outline",
    minuteCost: 5,
    realDurationMs: 18 * 60 * 60 * 1000 * DEV_SPEED,
    impact: "Plants 1m² of pollinator habitat",
    charity: "Xerces Society",
  },
  {
    id: "ocean",
    name: "Collect Ocean Plastic",
    icon: "boat-outline",
    minuteCost: 8,
    realDurationMs: 24 * 60 * 60 * 1000 * DEV_SPEED,
    impact: "Removes 1kg of ocean plastic",
    charity: "Ocean Conservancy",
  },
  {
    id: "tree",
    name: "Plant a Sapling",
    icon: "leaf-outline",
    minuteCost: 5,
    realDurationMs: 2 * 24 * 60 * 60 * 1000 * DEV_SPEED,
    impact: "Plants a real tree",
    charity: "One Tree Planted",
  },
  {
    id: "coral",
    name: "Rescue a Coral",
    icon: "fish-outline",
    minuteCost: 20,
    realDurationMs: 5 * 24 * 60 * 60 * 1000 * DEV_SPEED,
    impact: "Restores a coral reef fragment",
    charity: "Coral Restoration Foundation",
  },
];

export const MOCK_SCREEN_TIME = {
  todayUsed: "2h 14m",
  budget: "3h 0m",
  remaining: "46m",
  minutesEarned: 46,
  avgScreenTime: "3h 42m",
  streak: 4,
};

function getAlgorithmDelayMs(minutesOver: number): number {
  let ms: number;
  if (minutesOver < 15) ms = 2 * 60 * 60 * 1000;
  else if (minutesOver < 60) ms = 6 * 60 * 60 * 1000;
  else ms = 24 * 60 * 60 * 1000;
  return ms * DEV_SPEED;
}

export function formatTimeRemaining(completesAt: Date): string {
  const ms = completesAt.getTime() - Date.now();
  if (ms <= 0) return "Done!";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/** Pick a random unoccupied grove cell. */
function randomGroveCell(existingBuilds: Build[]): { col: number; row: number } {
  const occupied = new Set(existingBuilds.map((b) => `${b.gridPos.col},${b.gridPos.row}`));
  const candidates: { col: number; row: number }[] = [];
  for (let row = 0; row <= GRID.GROVE_END_ROW; row++) {
    for (let col = 0; col < GRID.COLS; col++) {
      if (!occupied.has(`${col},${row}`)) candidates.push({ col, row });
    }
  }
  return candidates[Math.floor(Math.random() * candidates.length)] ?? { col: 0, row: 0 };
}

const initialPlacementMode: PlacementMode = {
  active: false,
  pendingCause: null,
  selectedCell: null,
};

const initialMoveMode: MoveMode = { active: false, buildId: null };

const initialState: State = {
  minuteBalance: 46,
  activeBuilds: [],
  completedBuilds: [],
  streak: 4,
  algorithmRaids: 0,
  algorithmActive: false,
  placementMode: initialPlacementMode,
  moveMode: initialMoveMode,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "QUEUE_BUILD": {
      if (state.minuteBalance < action.cause.minuteCost) return state;
      if (state.activeBuilds.length > 0) return state;
      const allBuilds = [...state.activeBuilds, ...state.completedBuilds];
      const gridPos = randomGroveCell(allBuilds);
      const now = new Date();
      const build: Build = {
        id: `${action.cause.id}-${Date.now()}`,
        cause: action.cause,
        startedAt: now,
        completesAt: new Date(now.getTime() + action.cause.realDurationMs),
        delayedMs: 0,
        status: "in_progress",
        gridPos,
      };
      return {
        ...state,
        minuteBalance: state.minuteBalance - action.cause.minuteCost,
        activeBuilds: [build],
      };
    }
    case "COMPLETE_BUILD": {
      const build = state.activeBuilds.find((b) => b.id === action.buildId);
      if (!build) return state;
      return {
        ...state,
        activeBuilds: [],
        completedBuilds: [...state.completedBuilds, { ...build, status: "complete" }],
      };
    }
    case "ALGORITHM_RAID": {
      const delay = getAlgorithmDelayMs(action.minutesOver);
      return {
        ...state,
        algorithmRaids: state.algorithmRaids + 1,
        algorithmActive: true,
        activeBuilds: state.activeBuilds.map((b) => ({
          ...b,
          status: "delayed" as const,
          completesAt: new Date(b.completesAt.getTime() + delay),
          delayedMs: b.delayedMs + delay,
        })),
      };
    }
    case "CLEAR_ALGORITHM": {
      return {
        ...state,
        algorithmActive: false,
        activeBuilds: state.activeBuilds.map((b) => ({
          ...b,
          status: b.status === "delayed" ? ("in_progress" as const) : b.status,
        })),
      };
    }
    case "ENTER_PLACEMENT_MODE": {
      if (state.minuteBalance < action.cause.minuteCost) return state;
      if (state.activeBuilds.length > 0) return state;
      return {
        ...state,
        placementMode: { active: true, pendingCause: action.cause, selectedCell: null },
      };
    }
    case "SELECT_CELL": {
      if (!state.placementMode.active) return state;
      return {
        ...state,
        placementMode: { ...state.placementMode, selectedCell: { col: action.col, row: action.row } },
      };
    }
    case "CONFIRM_PLACEMENT": {
      const { pendingCause, selectedCell } = state.placementMode;
      if (!pendingCause || !selectedCell) return state;
      if (state.minuteBalance < pendingCause.minuteCost) return state;
      const now = new Date();
      const build: Build = {
        id: `${pendingCause.id}-${Date.now()}`,
        cause: pendingCause,
        startedAt: now,
        completesAt: new Date(now.getTime() + pendingCause.realDurationMs),
        delayedMs: 0,
        status: "in_progress",
        gridPos: selectedCell,
      };
      return {
        ...state,
        minuteBalance: state.minuteBalance - pendingCause.minuteCost,
        activeBuilds: [build],
        placementMode: initialPlacementMode,
      };
    }
    case "CANCEL_PLACEMENT_MODE": {
      return { ...state, placementMode: initialPlacementMode };
    }
    case "ENTER_MOVE_MODE": {
      const exists = state.completedBuilds.some((b) => b.id === action.buildId);
      if (!exists) return state;
      return { ...state, moveMode: { active: true, buildId: action.buildId } };
    }
    case "CANCEL_MOVE_MODE": {
      return { ...state, moveMode: initialMoveMode };
    }
    case "MOVE_BUILD": {
      return {
        ...state,
        completedBuilds: state.completedBuilds.map((b) =>
          b.id === action.buildId
            ? { ...b, gridPos: { col: action.col, row: action.row } }
            : b
        ),
        moveMode: initialMoveMode,
      };
    }
    case "TICK":
      return { ...state };
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let completed = false;
      state.activeBuilds.forEach((build) => {
        if (build.status === "in_progress" && now >= build.completesAt.getTime()) {
          dispatch({ type: "COMPLETE_BUILD", buildId: build.id });
          completed = true;
        }
      });
      if (!completed) dispatch({ type: "TICK" });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.activeBuilds]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
