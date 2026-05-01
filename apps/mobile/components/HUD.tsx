import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGame, formatTimeRemaining, formatMinutes } from "@/store/gameStore";
import { useTheme } from "@/context/ThemeContext";
import { AppTheme } from "@/constants/theme";

function StatCard({
  icon,
  iconColor,
  value,
  label,
  theme,
}: {
  icon: string;
  iconColor: string;
  value: string | number;
  label: string;
  theme: AppTheme;
}) {
  const s = makeStyles(theme);
  return (
    <View style={s.card}>
      <Ionicons name={icon as any} size={18} color={iconColor} />
      <View>
        <Text style={s.cardValue}>{value}</Text>
        <Text style={s.cardLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function HUD() {
  const { state } = useGame();
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const activeBuild = state.activeBuilds[0] ?? null;
  const minutesLeft = Math.max(0, state.screenTimeBudgetMinutes - state.screenTimeUsedMinutes);

  return (
    <View style={s.container}>
      <View style={s.row}>
        <StatCard icon="timer-outline" iconColor={theme.accent} value={`${state.minuteBalance}m`} label="Grover's Timebank" theme={theme} />
        <View style={s.cardDivider} />
        <StatCard icon="phone-portrait-outline" iconColor="#0369a1" value={formatMinutes(minutesLeft)} label="left today" theme={theme} />
      </View>
      <View style={s.rowDivider} />
      <View style={s.row}>
        <StatCard icon="flame" iconColor="#f97316" value={state.streak} label="day streak" theme={theme} />
        <View style={s.cardDivider} />
        <StatCard icon="checkmark-circle-outline" iconColor="#7c3aed" value={state.completedBuilds.length} label="builds done" theme={theme} />
      </View>
      <View style={s.rowDivider} />
      <View style={s.buildRow}>
        <Ionicons
          name={activeBuild ? (activeBuild.status === "delayed" ? "eye" : "hammer-outline") : "leaf-outline"}
          size={14}
          color={activeBuild ? (activeBuild.status === "delayed" ? theme.danger : theme.accent) : theme.textMuted}
        />
        {activeBuild ? (
          <>
            <Text style={[s.buildText, activeBuild.status === "delayed" && s.delayed]} numberOfLines={1}>
              {activeBuild.status === "delayed" ? "Delayed: " : ""}{activeBuild.cause.name}
            </Text>
            <Text style={s.timer}>{formatTimeRemaining(activeBuild.completesAt)}</Text>
          </>
        ) : (
          <Text style={s.buildText}>Grove is quiet — start a build</Text>
        )}
      </View>
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return {
    container: {
      flex: 1,
      backgroundColor: theme.bg,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    row: {
      flex: 1,
      flexDirection: "row" as const,
      alignItems: "center" as const,
    },
    card: {
      flex: 1,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      gap: 8,
    },
    cardDivider: {
      width: 1,
      alignSelf: "stretch" as const,
      backgroundColor: theme.divider,
      marginVertical: 8,
    },
    rowDivider: {
      height: 1,
      backgroundColor: theme.divider,
    },
    cardValue: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: theme.textPrimary,
      fontFamily: theme.fontBody,
    },
    cardLabel: {
      fontSize: 11,
      color: theme.textMuted,
      fontFamily: theme.fontBody,
    },
    buildRow: {
      flex: 1,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 8,
    },
    buildText: {
      flex: 1,
      fontSize: 12,
      color: theme.textMuted,
      fontFamily: theme.fontBody,
    },
    delayed: {
      color: theme.danger,
    },
    timer: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: theme.textSecondary,
      fontFamily: theme.fontBody,
    },
  };
}
