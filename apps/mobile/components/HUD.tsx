import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
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
  onLongPress,
}: {
  icon: string;
  iconColor: string;
  value: string | number;
  label: string;
  theme: AppTheme;
  onLongPress?: () => void;
}) {
  const s = makeStyles(theme);
  const inner = (
    <View style={s.card}>
      <View style={s.cardValueRow}>
        <Ionicons name={icon as any} size={15} color={iconColor} />
        <Text style={s.cardValue}>{value}</Text>
      </View>
      <Text style={s.cardLabel}>{label}</Text>
    </View>
  );

  if (onLongPress) {
    return (
      <TouchableOpacity
        style={s.card}
        onLongPress={onLongPress}
        activeOpacity={1}
      >
        <View style={s.cardValueRow}>
          <Ionicons name={icon as any} size={15} color={iconColor} />
          <Text style={s.cardValue}>{value}</Text>
        </View>
        <Text style={s.cardLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return inner;
}

export default function HUD() {
  const { state } = useGame();
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const activeBuild = state.activeBuilds[0] ?? null;
  const minutesLeft = Math.max(
    0,
    state.screenTimeBudgetMinutes - state.screenTimeUsedMinutes,
  );
  const [sparkTooltip, setSparkTooltip] = useState(false);

  return (
    <View style={s.container}>
      <Modal
        visible={sparkTooltip}
        transparent
        animationType="fade"
        onRequestClose={() => setSparkTooltip(false)}
      >
        <Pressable
          style={s.tooltipBackdrop}
          onPress={() => setSparkTooltip(false)}
        >
          <View
            style={[
              s.tooltipCard,
              { backgroundColor: theme.bgCard, borderColor: theme.border },
            ]}
          >
            <Text style={[s.tooltipTitle, { color: theme.textPrimary }]}>
              Grover's Timebank
            </Text>
            <Text style={[s.tooltipBody, { color: theme.textSecondary }]}>
              Sparks earned = minutes under your daily budget.{"\n"}
              Earn up to {state.screenTimeBudgetMinutes} Sparks/day.
            </Text>
          </View>
        </Pressable>
      </Modal>

      <View style={s.row}>
        <StatCard
          icon="flash-outline"
          iconColor={theme.accent}
          value={`${state.sparkBalance ?? 0} Sparks`}
          label="Grover's Bank"
          theme={theme}
          onLongPress={() => setSparkTooltip(true)}
        />
        <View style={s.cardDivider} />
        <StatCard
          icon="phone-portrait-outline"
          iconColor="#0369a1"
          value={formatMinutes(minutesLeft)}
          label="screen time left today"
          theme={theme}
        />
      </View>
      <View style={s.rowDivider} />
      <View style={s.row}>
        <StatCard
          icon="flame"
          iconColor="#f97316"
          value={state.streak}
          label="day streak"
          theme={theme}
        />
        <View style={s.cardDivider} />
        <StatCard
          icon="checkmark-circle-outline"
          iconColor="#7c3aed"
          value={state.completedBuilds.length}
          label="builds done"
          theme={theme}
        />
      </View>
      <View style={s.rowDivider} />
      <View style={s.buildRow}>
        <Ionicons
          name={
            activeBuild
              ? activeBuild.status === "delayed"
                ? "eye"
                : "hammer-outline"
              : "leaf-outline"
          }
          size={14}
          color={
            activeBuild
              ? activeBuild.status === "delayed"
                ? theme.danger
                : theme.accent
              : theme.textMuted
          }
        />
        {activeBuild ? (
          <>
            <Text
              style={[
                s.buildText,
                activeBuild.status === "delayed" && s.delayed,
              ]}
              numberOfLines={1}
            >
              {activeBuild.status === "delayed" ? "Delayed: " : ""}
              {activeBuild.cause.name}
            </Text>
            <Text style={s.timer}>
              {formatTimeRemaining(activeBuild.completesAt)}
            </Text>
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
      flexDirection: "column" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      gap: 2,
    },
    cardValueRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 4,
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
    tooltipBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    tooltipCard: {
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      width: "100%",
      gap: 8,
    },
    tooltipTitle: {
      fontSize: 16,
      fontWeight: "700" as const,
      textAlign: "center" as const,
    },
    tooltipBody: {
      fontSize: 14,
      lineHeight: 22,
      textAlign: "center" as const,
    },
  };
}
