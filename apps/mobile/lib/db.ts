import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import { Build } from "@/store/gameStore";

const FAILED_WRITES_KEY = "pending_db_writes_v1";

type PendingWrite =
  | { type: "upsert_profile"; payload: UpsertProfilePayload }
  | { type: "insert_build"; payload: InsertBuildPayload }
  | { type: "insert_donation"; payload: InsertDonationPayload };

type UpsertProfilePayload = {
  id: string;
  streak: number;
  total_sparks_earned: number;
  monthly_donated: number;
  budget_reset_at: string;
};

type InsertBuildPayload = {
  id: string;
  user_id: string;
  cause_id: string;
  cause_name: string;
  charity: string;
  started_at: string;
  completed_at: string;
  grid_col: number;
  grid_row: number;
};

type InsertDonationPayload = {
  user_id: string;
  build_id: string;
  cause_id: string;
  cause_name: string;
  charity: string;
  amount_usd: number;
  spark_cost: number;
  funded: boolean;
};

async function loadPendingWrites(): Promise<PendingWrite[]> {
  try {
    const raw = await AsyncStorage.getItem(FAILED_WRITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function savePendingWrites(writes: PendingWrite[]): Promise<void> {
  await AsyncStorage.setItem(FAILED_WRITES_KEY, JSON.stringify(writes));
}

async function appendPendingWrite(write: PendingWrite): Promise<void> {
  const existing = await loadPendingWrites();
  await savePendingWrites([...existing, write]);
}

async function executeWrite(write: PendingWrite): Promise<boolean> {
  try {
    if (write.type === "upsert_profile") {
      const { error } = await supabase
        .from("user_profiles")
        .upsert(write.payload, { onConflict: "id", ignoreDuplicates: false });
      return !error;
    }
    if (write.type === "insert_build") {
      const { error } = await supabase
        .from("builds")
        .insert(write.payload);
      return !error;
    }
    if (write.type === "insert_donation") {
      const { error } = await supabase
        .from("donations")
        .insert(write.payload);
      return !error;
    }
    return false;
  } catch {
    return false;
  }
}

/** Retry any writes that failed previously. Call on app foreground. */
export async function flushPendingWrites(): Promise<void> {
  const pending = await loadPendingWrites();
  if (pending.length === 0) return;

  const stillFailed: PendingWrite[] = [];
  for (const write of pending) {
    const ok = await executeWrite(write);
    if (!ok) stillFailed.push(write);
  }
  await savePendingWrites(stillFailed);
}

async function write(pending: PendingWrite): Promise<void> {
  const ok = await executeWrite(pending);
  if (!ok) await appendPendingWrite(pending);
}

// --- Public API ---

export async function upsertProfile(payload: UpsertProfilePayload): Promise<void> {
  await write({ type: "upsert_profile", payload });
}

/** Only creates the profile row if it doesn't exist yet. Safe to call on every sign-in. */
export async function createProfileIfNotExists(userId: string, budgetResetAt: string): Promise<void> {
  try {
    await supabase
      .from("user_profiles")
      .insert({
        id: userId,
        budget_reset_at: budgetResetAt,
      })
      .throwOnError();
  } catch {
    // Row already exists — ignore
  }
}

export async function recordCompletedBuild(
  userId: string,
  build: Build,
  monthlyDonated: number,
  budgetResetAt: string,
  streak: number,
  totalSparksEarned: number,
  funded: boolean,
): Promise<void> {
  const buildPayload: InsertBuildPayload = {
    id: build.id,
    user_id: userId,
    cause_id: build.cause.id,
    cause_name: build.cause.name,
    charity: build.cause.charity,
    started_at: build.startedAt.toISOString(),
    completed_at: build.completesAt.toISOString(),
    grid_col: build.gridPos.col,
    grid_row: build.gridPos.row,
  };

  const donationPayload: InsertDonationPayload = {
    user_id: userId,
    build_id: build.id,
    cause_id: build.cause.id,
    cause_name: build.cause.name,
    charity: build.cause.charity,
    amount_usd: build.cause.donationUsd,
    spark_cost: build.cause.sparkCost,
    funded,
  };

  const profilePayload: UpsertProfilePayload = {
    id: userId,
    streak,
    total_sparks_earned: totalSparksEarned,
    monthly_donated: monthlyDonated,
    budget_reset_at: budgetResetAt,
  };

  // Insert build first (donation has FK to build)
  await write({ type: "insert_build", payload: buildPayload });
  await write({ type: "insert_donation", payload: donationPayload });
  await write({ type: "upsert_profile", payload: profilePayload });
}
