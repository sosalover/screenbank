import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useGame, CAUSE_ITEMS } from "@/store/gameStore";
import {
  requestNotificationPermissions,
  scheduleBuildCompleteNotification,
  cancelBuildCompleteNotification,
  scheduleDailySparksNotification,
  notifyNewCauseAffordable,
} from "@/lib/notifications";

export default function NotificationSync() {
  const { state } = useGame();
  const prevActiveBuildsRef = useRef(state.activeBuilds);
  const prevSparkBalanceRef = useRef(state.sparkBalance);
  const permissionRequestedRef = useRef(false);

  // Request permissions once on mount
  useEffect(() => {
    if (permissionRequestedRef.current) return;
    permissionRequestedRef.current = true;
    requestNotificationPermissions();
  }, []);

  // Handle notification taps → navigate to the right screen
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const screen = response.notification.request.content.data
          ?.screen as string | undefined;
        if (screen) router.push(screen as any);
      }
    );
    return () => sub.remove();
  }, []);

  // Watch activeBuilds: schedule notification for new builds, cancel for completed ones
  useEffect(() => {
    const prev = prevActiveBuildsRef.current;
    const curr = state.activeBuilds;

    // New builds → schedule
    for (const build of curr) {
      const wasPresent = prev.some((b) => b.id === build.id);
      if (!wasPresent) {
        scheduleBuildCompleteNotification(build);
      }
    }

    // Removed builds → cancel (already fired or manually handled)
    for (const build of prev) {
      const stillPresent = curr.some((b) => b.id === build.id);
      if (!stillPresent) {
        cancelBuildCompleteNotification(build.id);
      }
    }

    prevActiveBuildsRef.current = curr;
  }, [state.activeBuilds]);

  // Watch sparkBalance: if it went up, schedule daily sparks notification
  useEffect(() => {
    const prev = prevSparkBalanceRef.current;
    const curr = state.sparkBalance;
    const gained = curr - prev;

    if (gained > 0) {
      scheduleDailySparksNotification(gained);

      // Check if any new causes just became affordable
      for (const cause of CAUSE_ITEMS) {
        if (curr >= cause.sparkCost && prev < cause.sparkCost) {
          notifyNewCauseAffordable(cause);
        }
      }
    }

    prevSparkBalanceRef.current = curr;
  }, [state.sparkBalance]);

  return null;
}
