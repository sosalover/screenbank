import { NativeModules } from 'react-native';

const ScreenTimeNative = NativeModules.ScreenTime;

export type AuthorizationStatus = 'approved' | 'denied' | 'notDetermined' | 'unknown';

export interface ScreenTimeData {
  budgetMinutes: number;
  budgetExceeded: boolean;
  pendingEarnedMinutes: number;
  screenTimeUsedMinutes: number;
}

export const ScreenTime = {
  requestAuthorization(): Promise<AuthorizationStatus> {
    return ScreenTimeNative.requestAuthorization();
  },
  getAuthorizationStatus(): Promise<AuthorizationStatus> {
    return ScreenTimeNative.getAuthorizationStatus();
  },
  presentAppPicker(): Promise<boolean> {
    return ScreenTimeNative.presentAppPicker();
  },
  startMonitoring(budgetMinutes: number): Promise<boolean> {
    return ScreenTimeNative.startMonitoring(budgetMinutes);
  },
  stopMonitoring(): void {
    ScreenTimeNative.stopMonitoring();
  },
  getStoredData(): Promise<ScreenTimeData> {
    return ScreenTimeNative.getStoredData();
  },
  clearPendingEarnings(): void {
    ScreenTimeNative.clearPendingEarnings();
  },
  setBudgetMinutes(minutes: number): Promise<boolean> {
    return ScreenTimeNative.setBudgetMinutes(minutes);
  },
};
