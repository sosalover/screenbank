import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGame, CAUSE_ITEMS, formatTimeRemaining } from "@/store/gameStore";
import { useTheme } from "@/context/ThemeContext";
import { AppTheme } from "@/constants/theme";

export default function CausesScreen() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const { theme, algorithmActive } = useTheme();
  const s = makeStyles(theme, algorithmActive);
  const activeBuild = state.activeBuilds[0] ?? null;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Causes</Text>
          <View style={s.balanceBadge}>
            <Ionicons name="timer-outline" size={14} color={theme.textAccent} />
            <Text style={s.balanceText}>
              {state.sparkBalance ?? 0} Sparks in Bank
            </Text>
          </View>
        </View>
        <Text style={s.subtitle}>
          Spend the time you've taken back on something real.
        </Text>

        {/* Active build */}
        {activeBuild && (
          <View
            style={[
              s.activeBuildCard,
              activeBuild.status === "delayed" && s.activeBuildDelayed,
            ]}
          >
            <Ionicons
              name={activeBuild.cause.icon as any}
              size={36}
              color={
                activeBuild.status === "delayed" ? theme.danger : theme.accent
              }
            />
            <View style={s.activeBuildInfo}>
              <View style={s.activeBuildTitleRow}>
                <Ionicons
                  name={
                    activeBuild.status === "delayed" ? "eye" : "hammer-outline"
                  }
                  size={12}
                  color={theme.textMuted}
                />
                <Text style={s.activeBuildTitle}>
                  {activeBuild.status === "delayed"
                    ? "Delayed by The Algorithm"
                    : "In Progress"}
                </Text>
              </View>
              <Text style={s.activeBuildName}>{activeBuild.cause.name}</Text>
              <Text style={s.activeBuildTimer}>
                {formatTimeRemaining(activeBuild.completesAt)} remaining
              </Text>
            </View>
          </View>
        )}

        {/* Cause grid */}
        <View style={s.grid}>
          {CAUSE_ITEMS.map((cause) => {
            const canAfford = state.sparkBalance >= cause.sparkCost;
            const builderBusy = state.activeBuilds.length > 0;
            const disabled = !canAfford || builderBusy;

            return (
              <View key={cause.id} style={s.card}>
                <Ionicons
                  name={cause.icon as any}
                  size={32}
                  color={theme.accent}
                  style={s.cardIcon}
                />
                <Text style={s.cardNarrative}>{cause.narrative}</Text>
                <Text style={s.cardName}>{cause.name}</Text>
                <Text style={s.cardCharity}>{cause.charity}</Text>
                <View style={s.costRow}>
                  <Text style={s.costText}>Costs {cause.sparkCost} Sparks</Text>
                </View>
                <TouchableOpacity
                  style={[s.queueBtn, disabled && s.queueBtnDisabled]}
                  onPress={() => {
                    dispatch({ type: "ENTER_PLACEMENT_MODE", cause });
                    router.navigate("/(tabs)");
                  }}
                  disabled={disabled}
                >
                  <Text
                    style={[s.queueBtnText, disabled && s.queueBtnTextDisabled]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {builderBusy
                      ? "Builder busy"
                      : canAfford
                        ? `Fund with ${cause.sparkCost} Sparks →`
                        : `Need ${cause.sparkCost - (state.sparkBalance ?? 0)} more Sparks`}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: AppTheme, algorithmActive: boolean) {
  return {
    container: { flex: 1, backgroundColor: theme.bg },
    content: { padding: 16, paddingBottom: 40 },
    header: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      marginBottom: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: "800" as const,
      color: theme.textPrimary,
      fontFamily: theme.fontBody,
    },
    balanceBadge: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 4,
      backgroundColor: theme.bgBadge,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    balanceText: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: theme.textAccent,
      fontFamily: theme.fontBody,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textMuted,
      marginBottom: 16,
      fontFamily: theme.fontBody,
    },
    activeBuildCard: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 12,
      backgroundColor: theme.bgCard,
      borderColor: theme.accent,
      borderWidth: 1.5,
      borderRadius: theme.radiusCard,
      padding: 14,
      marginBottom: 20,
    },
    activeBuildDelayed: {
      backgroundColor: theme.dangerBg,
      borderColor: theme.danger,
    },
    activeBuildInfo: { flex: 1 },
    activeBuildTitleRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 4,
      marginBottom: 2,
    },
    activeBuildTitle: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: theme.textMuted,
      fontFamily: theme.fontBody,
    },
    activeBuildName: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: theme.textPrimary,
      fontFamily: theme.fontBody,
    },
    activeBuildTimer: {
      fontSize: 13,
      color: theme.accent,
      marginTop: 2,
      fontFamily: theme.fontBody,
    },
    grid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 12 },
    card: {
      width: "47%" as any,
      backgroundColor: theme.bgCard,
      borderRadius: theme.radiusCard,
      padding: 14,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardIcon: { marginBottom: 8 },
    cardNarrative: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 17,
      marginBottom: 8,
      fontStyle: algorithmActive ? ("normal" as const) : ("italic" as const),
      fontFamily: theme.fontBody,
    },
    cardName: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: theme.textPrimary,
      marginBottom: 2,
      fontFamily: theme.fontBody,
    },
    cardCharity: {
      fontSize: 11,
      color: theme.accent,
      fontWeight: "600" as const,
      marginBottom: 8,
      fontFamily: theme.fontBody,
    },
    costRow: { marginBottom: 10 },
    costText: {
      fontSize: 13,
      color: theme.textMuted,
      fontFamily: theme.fontBody,
    },
    queueBtn: {
      backgroundColor: theme.accent,
      borderRadius: theme.radiusBtn,
      paddingVertical: 9,
      alignItems: "center" as const,
    },
    queueBtnDisabled: { backgroundColor: theme.border },
    queueBtnText: {
      color: theme.accentText,
      fontWeight: "700" as const,
      fontSize: 13,
      fontFamily: theme.fontBody,
    },
    queueBtnTextDisabled: { color: theme.textMuted },
  };
}
