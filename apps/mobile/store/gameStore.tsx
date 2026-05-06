import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GRID, HOME_COL, HOME_ROW } from "@/utils/gridMath";
import { recordCompletedBuild, flushPendingWrites } from "@/lib/db";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "grove_game_state_v2";

export type CauseItem = {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  narrative: string;
  sparkCost: number;
  realDurationMs: number;
  impact: string;
  charity: string;
  donationUsd: number;
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
  sparkBalance: number;
  screenTimeUsedMinutes: number;
  screenTimeBudgetMinutes: number;
  activeBuilds: Build[];
  completedBuilds: Build[];
  streak: number;
  algorithmRaids: number;
  algorithmActive: boolean;
  placementMode: PlacementMode;
  moveMode: MoveMode;
  tutorialComplete: boolean;
  monthlyDonated: number;
  budgetResetAt: string;
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
  | { type: "EARN_SPARKS"; sparks: number }
  | { type: "SET_SPARK_BALANCE"; sparks: number }
  | { type: "SET_SCREEN_TIME_USED"; usedMinutes: number }
  | { type: "TICK" }
  | { type: "COMPLETE_TUTORIAL" }
  | { type: "RESET_TUTORIAL" }
  | { type: "HYDRATE"; state: State }
  | {
      type: "RESTORE";
      sparkBalance: number;
      streak: number;
      monthlyDonated: number;
      budgetResetAt: string;
      completedBuilds: Build[];
    };

// --- Serialization ---

type SerializedBuild = Omit<Build, "startedAt" | "completesAt"> & {
  startedAt: string;
  completesAt: string;
};

type PersistedState = {
  sparkBalance: number;
  screenTimeUsedMinutes: number;
  screenTimeBudgetMinutes: number;
  activeBuilds: SerializedBuild[];
  completedBuilds: SerializedBuild[];
  streak: number;
  algorithmRaids: number;
  tutorialComplete: boolean;
  monthlyDonated: number;
  budgetResetAt: string;
};

function deserializeBuild(b: SerializedBuild): Build {
  return {
    ...b,
    startedAt: new Date(b.startedAt),
    completesAt: new Date(b.completesAt),
  };
}

function serializeState(state: State): PersistedState {
  return {
    sparkBalance: state.sparkBalance,
    screenTimeUsedMinutes: state.screenTimeUsedMinutes,
    screenTimeBudgetMinutes: state.screenTimeBudgetMinutes,
    activeBuilds: state.activeBuilds.map((b) => ({
      ...b,
      startedAt: b.startedAt.toISOString(),
      completesAt: b.completesAt.toISOString(),
    })),
    completedBuilds: state.completedBuilds.map((b) => ({
      ...b,
      startedAt: b.startedAt.toISOString(),
      completesAt: b.completesAt.toISOString(),
    })),
    streak: state.streak,
    algorithmRaids: state.algorithmRaids,
    tutorialComplete: state.tutorialComplete,
    monthlyDonated: state.monthlyDonated,
    budgetResetAt: state.budgetResetAt,
  };
}

function deserializeState(persisted: PersistedState): State {
  const now = Date.now();
  const activeBuilds = persisted.activeBuilds.map(deserializeBuild);
  const completedBuilds = persisted.completedBuilds.map(deserializeBuild);

  // Auto-complete builds that finished while the app was closed
  const stillActive: Build[] = [];
  const newlyCompleted: Build[] = [];
  for (const build of activeBuilds) {
    if (build.status === "in_progress" && now >= build.completesAt.getTime()) {
      newlyCompleted.push({ ...build, status: "complete" });
    } else {
      stillActive.push(build);
    }
  }

  return {
    ...initialState,
    sparkBalance: persisted.sparkBalance,
    screenTimeUsedMinutes: persisted.screenTimeUsedMinutes,
    screenTimeBudgetMinutes: persisted.screenTimeBudgetMinutes,
    activeBuilds: stillActive,
    completedBuilds: [...completedBuilds, ...newlyCompleted],
    streak: persisted.streak,
    algorithmRaids: persisted.algorithmRaids,
    tutorialComplete: persisted.tutorialComplete ?? false,
    monthlyDonated: persisted.monthlyDonated ?? 0,
    budgetResetAt: persisted.budgetResetAt ?? nextMonthReset(),
  };
}

const DEV_SPEED = __DEV__ ? 0.0001 : 1;

function nextMonthReset(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

export const CAUSE_ITEMS: CauseItem[] = [
  {
    id: "tree",
    name: "Plant a Sapling",
    icon: "leaf-outline",
    emoji: "🌱",
    narrative: "Minutes off your screen. Trees in the ground.",
    sparkCost: 2160,
    realDurationMs: 1 * 60 * 60 * 1000 * DEV_SPEED,
    impact: "Plants a real tree",
    charity: "One Tree Planted",
    donationUsd: 1.00,
  },
  {
    id: "puppy",
    name: "Shelter a Puppy",
    icon: "paw",
    emoji: "🐾",
    narrative: "Every spark you earn keeps a pup off the street.",
    sparkCost: 4320,
    realDurationMs: 2 * 60 * 60 * 1000 * DEV_SPEED,
    impact: "Funds 1 day of shelter care",
    charity: "ASPCA",
    donationUsd: 2.00,
  },
  {
    id: "ocean",
    name: "Collect Ocean Plastic",
    icon: "water-outline",
    emoji: "🌊",
    narrative: "Your screen time, turned against plastic.",
    sparkCost: 4320,
    realDurationMs: 2 * 60 * 60 * 1000 * DEV_SPEED,
    impact: "Removes 1 lb of ocean plastic",
    charity: "Ocean Conservancy",
    donationUsd: 2.00,
  },
  {
    id: "bee",
    name: "Save a Bee Hive",
    icon: "flower-outline",
    emoji: "🌸",
    narrative: "Reclaim your time. Restore the wild.",
    sparkCost: 10800,
    realDurationMs: 5 * 60 * 60 * 1000 * DEV_SPEED,
    impact: "Funds 1 bee hive habitat",
    charity: "Xerces Society",
    donationUsd: 5.00,
  },
  {
    id: "coral",
    name: "Rescue a Coral",
    icon: "fish-outline",
    emoji: "🪸",
    narrative: "The rarest build. The most endangered reef.",
    sparkCost: 21600,
    realDurationMs: 10 * 60 * 60 * 1000 * DEV_SPEED,
    impact: "Restores a coral reef fragment",
    charity: "Coral Restoration Foundation",
    donationUsd: 10.00,
  },
];

function getAlgorithmDelayMs(minutesOver: number): number {
  let ms: number;
  if (minutesOver < 15) ms = 2 * 60 * 60 * 1000;
  else if (minutesOver < 60) ms = 6 * 60 * 60 * 1000;
  else ms = 24 * 60 * 60 * 1000;
  return ms * DEV_SPEED;
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
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
function randomGroveCell(existingBuilds: Build[]): {
  col: number;
  row: number;
} {
  const occupied = new Set(
    existingBuilds.map((b) => `${b.gridPos.col},${b.gridPos.row}`),
  );
  const candidates: { col: number; row: number }[] = [];
  for (let row = 0; row <= GRID.GROVE_END_ROW; row++) {
    for (let col = 0; col < GRID.COLS; col++) {
      if (col === HOME_COL && row === HOME_ROW) continue;
      if (!occupied.has(`${col},${row}`)) candidates.push({ col, row });
    }
  }
  return (
    candidates[Math.floor(Math.random() * candidates.length)] ?? {
      col: 0,
      row: 0,
    }
  );
}

const initialPlacementMode: PlacementMode = {
  active: false,
  pendingCause: null,
  selectedCell: null,
};

const initialMoveMode: MoveMode = { active: false, buildId: null };

const initialState: State = {
  sparkBalance: 0,
  screenTimeUsedMinutes: 0,
  screenTimeBudgetMinutes: 180,
  activeBuilds: [],
  completedBuilds: [],
  streak: 0,
  algorithmRaids: 0,
  algorithmActive: false,
  placementMode: initialPlacementMode,
  moveMode: initialMoveMode,
  tutorialComplete: false,
  monthlyDonated: 0,
  budgetResetAt: nextMonthReset(),
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "QUEUE_BUILD": {
      if (state.sparkBalance < action.cause.sparkCost) return state;
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
        sparkBalance: state.sparkBalance - action.cause.sparkCost,
        activeBuilds: [build],
      };
    }
    case "COMPLETE_BUILD": {
      const build = state.activeBuilds.find((b) => b.id === action.buildId);
      if (!build) return state;
      const now = new Date();
      const resetAt = new Date(state.budgetResetAt);
      const monthlyDonated = now >= resetAt
        ? build.cause.donationUsd
        : state.monthlyDonated + build.cause.donationUsd;
      const budgetResetAt = now >= resetAt ? nextMonthReset() : state.budgetResetAt;
      return {
        ...state,
        activeBuilds: [],
        completedBuilds: [
          ...state.completedBuilds,
          { ...build, status: "complete" },
        ],
        monthlyDonated,
        budgetResetAt,
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
      if (state.sparkBalance < action.cause.sparkCost) return state;
      if (state.activeBuilds.length > 0) return state;
      return {
        ...state,
        placementMode: {
          active: true,
          pendingCause: action.cause,
          selectedCell: null,
        },
      };
    }
    case "SELECT_CELL": {
      if (!state.placementMode.active) return state;
      return {
        ...state,
        placementMode: {
          ...state.placementMode,
          selectedCell: { col: action.col, row: action.row },
        },
      };
    }
    case "CONFIRM_PLACEMENT": {
      const { pendingCause, selectedCell } = state.placementMode;
      if (!pendingCause || !selectedCell) return state;
      if (state.sparkBalance < pendingCause.sparkCost) return state;
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
        sparkBalance: state.sparkBalance - pendingCause.sparkCost,
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
            : b,
        ),
        moveMode: initialMoveMode,
      };
    }
    case "EARN_SPARKS": {
      return { ...state, sparkBalance: state.sparkBalance + action.sparks };
    }
    case "SET_SPARK_BALANCE": {
      return { ...state, sparkBalance: Math.max(0, isNaN(action.sparks) ? 0 : action.sparks) };
    }
    case "SET_SCREEN_TIME_USED": {
      return {
        ...state,
        screenTimeUsedMinutes: Math.max(0, action.usedMinutes),
      };
    }
    case "TICK":
      return { ...state };
    case "COMPLETE_TUTORIAL":
      return { ...state, tutorialComplete: true };
    case "RESET_TUTORIAL":
      return { ...state, tutorialComplete: false };
    case "HYDRATE":
      return action.state;
    case "RESTORE":
      return {
        ...state,
        sparkBalance: action.sparkBalance,
        streak: action.streak,
        monthlyDonated: action.monthlyDonated,
        budgetResetAt: action.budgetResetAt,
        completedBuilds: action.completedBuilds,
      };
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

async function restoreFromServer(): Promise<{
  sparkBalance: number;
  streak: number;
  monthlyDonated: number;
  budgetResetAt: string;
  completedBuilds: Build[];
} | null> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return null;

  const [profileRes, buildsRes] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", userId).single(),
    supabase.from("builds").select("*").eq("user_id", userId),
  ]);

  if (profileRes.error && profileRes.error.code !== "PGRST116") return null;

  const profile = profileRes.data;
  const rawBuilds = buildsRes.data ?? [];

  const completedBuilds: Build[] = rawBuilds
    .map((b) => {
      const cause = CAUSE_ITEMS.find((c) => c.id === b.cause_id);
      if (!cause) return null;
      return {
        id: b.id,
        cause,
        startedAt: new Date(b.started_at),
        completesAt: new Date(b.completed_at),
        delayedMs: 0,
        status: "complete" as const,
        gridPos: { col: b.grid_col, row: b.grid_row },
      };
    })
    .filter((b): b is Build => b !== null);

  return {
    sparkBalance: profile?.total_sparks_earned ?? 0,
    streak: profile?.streak ?? 0,
    monthlyDonated: profile?.monthly_donated ?? 0,
    budgetResetAt: profile?.budget_reset_at ?? nextMonthReset(),
    completedBuilds,
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const [wasEmpty, setWasEmpty] = useState(false);
  const prevActiveBuilds = useRef<Build[]>([]);

  // Load persisted state on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw: string | null) => {
      if (raw) {
        try {
          const persisted: PersistedState = JSON.parse(raw);
          dispatch({ type: "HYDRATE", state: deserializeState(persisted) });
        } catch {
          // Corrupted data — restore from server
          setWasEmpty(true);
        }
      } else {
        setWasEmpty(true);
      }
      setHydrated(true);
    });
  }, []);

  // No local state found — restore from Supabase (e.g. fresh install)
  // Must wait for auth session to be available, so we try immediately and
  // also listen for SIGNED_IN in case the session loads after hydration.
  useEffect(() => {
    if (!hydrated || !wasEmpty) return;

    let done = false;
    const tryRestore = () => {
      if (done) return;
      done = true;
      restoreFromServer().then((restored) => {
        if (restored) dispatch({ type: "RESTORE", ...restored });
      });
    };

    // Session may already be loaded (returning user)
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) tryRestore();
    });

    // Session loads after hydration (fresh install, user signs in)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
          session?.user
        ) {
          tryRestore();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [hydrated, wasEmpty]);

  // Save state whenever it changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState(state)));
  }, [state, hydrated]);

  // Game loop: check for completed builds every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let completed = false;
      state.activeBuilds.forEach((build) => {
        if (
          build.status === "in_progress" &&
          now >= build.completesAt.getTime()
        ) {
          dispatch({ type: "COMPLETE_BUILD", buildId: build.id });
          completed = true;
        }
      });
      if (!completed) dispatch({ type: "TICK" });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.activeBuilds]);

  // Fire DB writes when a build completes
  useEffect(() => {
    if (!hydrated) return;
    const prev = prevActiveBuilds.current;
    const justCompleted = prev.filter(
      (b) => !state.activeBuilds.find((a) => a.id === b.id)
    );
    for (const build of justCompleted) {
      supabase.auth.getUser().then(({ data }) => {
        const userId = data?.user?.id;
        if (!userId) return;
        const MONTHLY_BUDGET = 2.50; // base tier
        const funded = state.monthlyDonated <= MONTHLY_BUDGET;
        recordCompletedBuild(
          userId,
          { ...build, status: "complete" },
          state.monthlyDonated,
          state.budgetResetAt,
          state.streak,
          state.sparkBalance,
          funded,
        );
      });
    }
    prevActiveBuilds.current = state.activeBuilds;
  }, [state.activeBuilds, hydrated]);

  // Flush any failed DB writes when app becomes active
  useEffect(() => {
    flushPendingWrites();
  }, []);

  if (!hydrated) return null;

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
