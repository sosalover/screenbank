import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { ScreenTime, AuthorizationStatus } from '@/modules/screen-time/src/index';
import { useGame } from '@/store/gameStore';
import { useAuth } from '@/store/authStore';

/**
 * Handles the full screen time lifecycle:
 * 1. On each app foreground: syncs screenTimeUsedMinutes, claims pending sparks,
 *    triggers Algorithm raid if budget exceeded
 * 2. requestAndSetup: requests auth → shows app picker → starts monitoring
 */
export function useScreenTime() {
  const { state, dispatch } = useGame();
  const { budgetMinutes } = useAuth();

  const algorithmActiveRef = useRef(state.algorithmActive);
  useEffect(() => {
    algorithmActiveRef.current = state.algorithmActive;
  }, [state.algorithmActive]);

  const claimPendingEarnings = useCallback(async () => {
    try {
      const data = await ScreenTime.getStoredData();
      console.log('[ScreenTime] sync:', JSON.stringify(data));
      dispatch({ type: 'SET_SCREEN_TIME_USED', usedMinutes: data.screenTimeUsedMinutes });
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

  // Auth → app picker → start monitoring
  const requestAndSetup = useCallback(async (budgetMinutes = 180) => {
    try {
      const status: AuthorizationStatus = await ScreenTime.requestAuthorization();
      if (status === 'approved') {
        await ScreenTime.presentAppPicker();
        // Stop first so startMonitoring re-registers with the new app selection
        ScreenTime.stopMonitoring();
        await ScreenTime.startMonitoring(budgetMinutes);
        await claimPendingEarnings();
      }
      return status;
    } catch {
      return 'unknown' as AuthorizationStatus;
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const status = await ScreenTime.getAuthorizationStatus();
        console.log('[ScreenTime] auth status:', status, 'budget:', budgetMinutes);
        if (status === 'approved' && budgetMinutes) {
          const ok = await ScreenTime.startMonitoring(budgetMinutes);
          console.log('[ScreenTime] startMonitoring result:', ok, 'budget:', budgetMinutes);
        } else if (status === 'notDetermined' && budgetMinutes) {
          // Returning user (e.g. reinstall) — re-request auth and restart with existing selection
          console.log('[ScreenTime] re-requesting auth for returning user...');
          const newStatus = await ScreenTime.requestAuthorization();
          console.log('[ScreenTime] re-auth result:', newStatus);
          if (newStatus === 'approved') {
            const ok = await ScreenTime.startMonitoring(budgetMinutes);
            console.log('[ScreenTime] startMonitoring result:', ok, 'budget:', budgetMinutes);
          }
        }
      } catch (e) {
        console.log('[ScreenTime] init error:', e);
      }
      claimPendingEarnings();
    }
    init();

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        console.log('[ScreenTime] app foregrounded, claiming earnings...');
        claimPendingEarnings();
      }
    });
    return () => sub.remove();
  }, [claimPendingEarnings]);

  return { requestAndSetup, claimPendingEarnings };
}
