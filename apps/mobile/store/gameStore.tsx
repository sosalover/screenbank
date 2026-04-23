import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";

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
  position: { x: number; y: number };
};

type State = {
  minuteBalance: number;
  activeBuilds: Build[];
  completedBuilds: Build[];
  streak: number;
  algorithmRaids: number;
  algorithmActive: boolean;
};

type Action =
  | { type: "QUEUE_BUILD"; cause: CauseItem }
  | { type: "COMPLETE_BUILD"; buildId: string }
  | { type: "ALGORITHM_RAID"; minutesOver: number }
  | { type: "CLEAR_ALGORITHM" };

// Speed multiplier for dev — makes build timers run 1000x faster
const DEV_SPEED = __DEV__ ? 0.001 : 1;

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

const initialState: State = {
  minuteBalance: 46,
  activeBuilds: [],
  completedBuilds: [],
  streak: 4,
  algorithmRaids: 0,
  algorithmActive: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "QUEUE_BUILD": {
      if (state.minuteBalance < action.cause.minuteCost) return state;
      if (state.activeBuilds.length > 0) return state; // 1 builder slot
      const now = new Date();
      const build: Build = {
        id: `${action.cause.id}-${Date.now()}`,
        cause: action.cause,
        startedAt: now,
        completesAt: new Date(now.getTime() + action.cause.realDurationMs),
        delayedMs: 0,
        status: "in_progress",
        position: {
          x: Math.random() * 0.65 + 0.05,
          y: Math.random() * 0.25 + 0.5,
        },
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
        completedBuilds: [
          ...state.completedBuilds,
          { ...build, status: "complete" },
        ],
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

  // Check build completion every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      state.activeBuilds.forEach((build) => {
        if (
          build.status === "in_progress" &&
          now >= build.completesAt.getTime()
        ) {
          dispatch({ type: "COMPLETE_BUILD", buildId: build.id });
        }
      });
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
