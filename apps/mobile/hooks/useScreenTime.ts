import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { ScreenTime, AuthorizationStatus } from '@/modules/screen-time/src/index';
import { useGame } from '@/store/gameStore';

/**
 * Handles the full screen time lifecycle:
 * 1. Requests authorization on first mount
 * 2. On each app foreground: claims pending earned sparks and triggers Algorithm raid if budget exceeded
 * 3. Exposes helpers for the settings screen (set budget, etc.)
 */
export function useScreenTime() {
  const { state, dispatch } = useGame();

  const algorithmActiveRef = useRef(state.algorithmActive);
  useEffect(() => {
    algorithmActiveRef.current = state.algorithmActive;
  }, [state.algorithmActive]);

  const claimPendingEarnings = useCallback(async () => {
    try {
      const data = await ScreenTime.getStoredData();
      if (data.budgetExceeded && !algorithmActiveRef.current) {
        dispatch({ type: 'ALGORITHM_RAID', minutesOver: 0 });
      }
      if (data.pendingEarnedMinutes > 0) {
        dispatch({ type: 'EARN_SPARKS', sparks: data.pendingEarnedMinutes });
        ScreenTime.clearPendingEarnings();
      }
    } catch {
      // Native module not available
    }
  }, [dispatch]);

  const requestAndSetup = useCallback(async (budgetMinutes = 180) => {
    try {
      const status: AuthorizationStatus = await ScreenTime.requestAuthorization();
      if (status === 'approved') {
        await ScreenTime.startMonitoring(budgetMinutes);
      }
      return status;
    } catch {
      return 'unknown' as AuthorizationStatus;
    }
  }, []);

  useEffect(() => {
    claimPendingEarnings();

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') claimPendingEarnings();
    });
    return () => sub.remove();
  }, [claimPendingEarnings]);

  return { requestAndSetup, claimPendingEarnings };
}
