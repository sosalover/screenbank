import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Build, CauseItem } from "@/store/gameStore";

const NOTIFIED_CAUSES_KEY = "notified_causes_v1";
const DAILY_SPARKS_ID_PREFIX = "daily-sparks-";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleBuildCompleteNotification(
  build: Build
): Promise<void> {
  if (build.completesAt.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    identifier: `build-complete-${build.id}`,
    content: {
      title: "Grover's done!",
      body: `Grover finished ${build.cause.name.toLowerCase()}! Check your grove.`,
      data: { screen: "/(tabs)" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: build.completesAt,
    },
  });
}

export async function cancelBuildCompleteNotification(
  buildId: string
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    `build-complete-${buildId}`
  );
}

export async function scheduleDailySparksNotification(
  sparksEarned: number
): Promise<void> {
  if (sparksEarned <= 0) return;
  const tomorrow8am = new Date();
  tomorrow8am.setDate(tomorrow8am.getDate() + 1);
  tomorrow8am.setHours(8, 0, 0, 0);
  const id = `${DAILY_SPARKS_ID_PREFIX}${tomorrow8am.toDateString()}`;
  // Cancel any existing for tomorrow (in case sparks updated later in day)
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: "Your Sparks are in",
      body: `You earned ${sparksEarned} Sparks yesterday. Keep it up!`,
      data: { screen: "/(tabs)" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: tomorrow8am,
    },
  });
}

export async function notifyNewCauseAffordable(
  cause: CauseItem
): Promise<void> {
  const raw = await AsyncStorage.getItem(NOTIFIED_CAUSES_KEY);
  const notified: string[] = raw ? JSON.parse(raw) : [];
  if (notified.includes(cause.id)) return;
  await Notifications.scheduleNotificationAsync({
    identifier: `cause-affordable-${cause.id}`,
    content: {
      title: "You can fund something new!",
      body: `You now have enough Sparks to fund ${cause.name.toLowerCase()}!`,
      data: { screen: "/(tabs)/causes" },
    },
    trigger: null,
  });
  await AsyncStorage.setItem(
    NOTIFIED_CAUSES_KEY,
    JSON.stringify([...notified, cause.id])
  );
}
