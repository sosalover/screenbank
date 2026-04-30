import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { ScreenTime, AuthorizationStatus } from '@/modules/screen-time/src/index';
import { useGame } from '@/store/gameStore';

/**
 * Handles the full screen time lifecycle:
 * 1. Requests authorization on first mount
 * 2. On each app foreground: checks for pending earned minutes and claims them
 * 3. Exposes helpers for the settings screen (set budget, etc.)
 */
export function useScreenTime() {
  const { dispatch } = useGame();

  const claimPendingEarnings = useCallback(() => {
    try {
      const data = ScreenTime.getStoredData();
      if (data.pendingEarnedMinutes > 0) {
        dispatch({ type: 'EARN_MINUTES', minutes: data.pendingEarnedMinutes });
        ScreenTime.clearPendingEarnings();
      }
    } catch {
      // Native module not available (e.g. in Expo Go or simulator without entitlement)
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

  // Claim any pending earnings every time the app comes to foreground
  useEffect(() => {
    claimPendingEarnings();

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') claimPendingEarnings();
    });
    return () => sub.remove();
  }, [claimPendingEarnings]);

  return { requestAndSetup, claimPendingEarnings };
}
