import { NativeModulesProxy, EventEmitter } from 'expo-modules-core';

const ScreenTimeNative = NativeModulesProxy.ScreenTime;

export type AuthorizationStatus = 'approved' | 'denied' | 'notDetermined' | 'unknown';

export interface ScreenTimeData {
  budgetMinutes: number;
  budgetExceeded: boolean;
  pendingEarnedMinutes: number;
}

export const ScreenTime = {
  /** Request FamilyControls authorization. Shows a system dialog on first call. */
  requestAuthorization(): Promise<AuthorizationStatus> {
    return ScreenTimeNative.requestAuthorization();
  },

  /** Returns current authorization status without prompting. */
  getAuthorizationStatus(): AuthorizationStatus {
    return ScreenTimeNative.getAuthorizationStatus();
  },

  /**
   * Set the daily budget and start monitoring.
   * Must be called after authorization is approved.
   * budgetMinutes: total screen time allowed per day (e.g. 180 for 3 hours)
   */
  startMonitoring(budgetMinutes: number): Promise<boolean> {
    return ScreenTimeNative.startMonitoring(budgetMinutes);
  },

  stopMonitoring(): void {
    ScreenTimeNative.stopMonitoring();
  },

  /** Read data written by the monitor extension via the shared App Group. */
  getStoredData(): ScreenTimeData {
    return ScreenTimeNative.getStoredData();
  },

  /** Call after claiming pendingEarnedMinutes to prevent double-earning. */
  clearPendingEarnings(): void {
    ScreenTimeNative.clearPendingEarnings();
  },

  setBudgetMinutes(minutes: number): Promise<boolean> {
    return ScreenTimeNative.setBudgetMinutes(minutes);
  },
};
