import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGame, formatTimeRemaining } from "@/store/gameStore";
import { useAuth } from "@/store/authStore";
import { useTheme } from "@/context/ThemeContext";
import { AppTheme } from "@/constants/theme";
import { useState } from "react";
import { useScreenTime } from "@/hooks/useScreenTime";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AccountScreen() {
  const { state } = useGame();
  const { signOut, displayName, setDisplayName, budgetMinutes } = useAuth();
  const { requestAndSetup } = useScreenTime();
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const [nameInput, setNameInput] = useState(displayName);
  const [nameSaved, setNameSaved] = useState(false);

  async function handleSaveName() {
    await setDisplayName(nameInput.trim());
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  }

  function handleSignOut() {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  }

  async function handleTestSetup() {
    console.log('[ScreenTime] starting full setup (auth → picker → monitor)...');
    const status = await requestAndSetup(budgetMinutes ?? 120);
    console.log('[ScreenTime] setup complete, status:', status);
  }
  const { completedBuilds, activeBuilds } = state;

  const totalMinutesSaved = (state.sparkBalance ?? 0)
    + completedBuilds.reduce((sum, b) => sum + (b.cause.sparkCost ?? (b.cause as any).minuteCost ?? 0), 0)
    + activeBuilds.reduce((sum, b) => sum + (b.cause.sparkCost ?? (b.cause as any).minuteCost ?? 0), 0);

  const impact: Record<string, number> = {};
  completedBuilds.forEach((b) => {
    impact[b.cause.name] = (impact[b.cause.name] ?? 0) + 1;
  });

  return (
    <SafeAreaView style={s.container}>
    <ScrollView contentContainerStyle={s.content}>
      {/* Avatar */}
      <View style={s.avatarRow}>
        <View style={s.avatar}>
          <Ionicons name="person-circle" size={40} color={theme.accent} />
        </View>
        <View style={{ gap: 4, flex: 1 }}>
          <View style={s.nameRow}>
            <TextInput
              style={s.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              onEndEditing={handleSaveName}
              placeholder="Your name"
              placeholderTextColor={theme.textMuted}
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            {nameSaved && <Text style={s.nameSaved}>Saved</Text>}
          </View>
          <View style={s.statRow}>
            <Ionicons name="flame" size={13} color={theme.textMuted} />
            <Text style={s.subtitle}>{state.streak} day streak</Text>
            <Text style={s.dot}>·</Text>
            <Ionicons name="timer-outline" size={13} color={theme.textMuted} />
            <Text style={s.subtitle}>{totalMinutesSaved} min reclaimed all time</Text>
          </View>
          {state.algorithmRaids > 0 && (
            <View style={s.statRow}>
              <Ionicons name="eye" size={13} color={theme.danger} />
              <Text style={s.raidStat}>The Algorithm raided {state.algorithmRaids}×</Text>
            </View>
          )}
        </View>
      </View>

      {/* Active builds */}
      {activeBuilds.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Active Build</Text>
          {activeBuilds.map((build) => (
            <View
              key={build.id}
              style={[s.buildRow, build.status === "delayed" && s.buildRowDelayed]}
            >
              <Ionicons name={build.cause.icon as any} size={28} color={build.status === "delayed" ? theme.danger : theme.accent} />
              <View style={s.buildInfo}>
                <Text style={s.buildName}>{build.cause.name}</Text>
                <Text style={s.buildCharity}>{build.cause.charity}</Text>
                <Text style={[s.buildTimer, build.status === "delayed" && s.buildTimerDelayed]}>
                  {build.status === "delayed"
                    ? `Delayed · ${formatTimeRemaining(build.completesAt)} left`
                    : `${formatTimeRemaining(build.completesAt)} remaining`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Impact summary */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Your Impact</Text>
        {Object.entries(impact).length === 0 ? (
          <Text style={s.empty}>No completed builds yet — head to Causes to get started.</Text>
        ) : (
          Object.entries(impact).map(([name, count]) => (
            <View key={name} style={s.statRow}>
              <Ionicons name="checkmark-circle" size={15} color={theme.accent} />
              <Text style={s.impactText}>{count}× {name}</Text>
            </View>
          ))
        )}
      </View>

      {/* Completed history */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Completed</Text>
        {completedBuilds.length === 0 ? (
          <Text style={s.empty}>Completed builds will appear here.</Text>
        ) : (
          [...completedBuilds].reverse().map((build, i) => (
            <View key={i} style={s.historyRow}>
              <Ionicons name={build.cause.icon as any} size={28} color={theme.accent} />
              <View style={s.historyInfo}>
                <Text style={s.historyName}>{build.cause.name}</Text>
                <Text style={s.historyCharity}>{build.cause.charity}</Text>
                <Text style={s.historyDate}>{formatDate(build.startedAt)}</Text>
              </View>
              <Text style={s.historyCost}>−{build.cause.sparkCost} ⚡</Text>
            </View>
          ))
        )}
      </View>

      {/* TEST: full screen time setup */}
      <TouchableOpacity onPress={handleTestSetup} style={[s.signOutBtn, { backgroundColor: '#1d4ed8', marginBottom: 8 }]}>
        <Text style={[s.signOutText, { color: '#fff' }]}>Setup Screen Time Monitoring</Text>
      </TouchableOpacity>

      {/* Sign out */}
      <TouchableOpacity onPress={handleSignOut} style={s.signOutBtn}>
        <Text style={s.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: AppTheme) {
  return {
    container: { flex: 1, backgroundColor: theme.bg },
    content: { padding: 20, paddingBottom: 40 },
    avatarRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 16,
      marginBottom: 28,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.bgBadge,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    nameRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
    nameInput: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: theme.textPrimary,
      fontFamily: theme.fontBody,
      flex: 1,
      padding: 0,
    },
    nameSaved: { fontSize: 12, color: theme.accent, fontFamily: theme.fontBody },
    statRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 4 },
    dot: { fontSize: 13, color: theme.divider },
    subtitle: { fontSize: 13, color: theme.textMuted, fontFamily: theme.fontBody },
    raidStat: { fontSize: 12, color: theme.danger, fontFamily: theme.fontBody },
    section: { marginBottom: 28 },
    sectionTitle: { fontSize: 18, fontWeight: "700" as const, color: theme.textPrimary, marginBottom: 12, fontFamily: theme.fontBody },
    empty: { color: theme.textMuted, fontSize: 14, fontFamily: theme.fontBody },
    buildRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 12,
      backgroundColor: theme.bgCard,
      borderColor: theme.accent,
      borderWidth: 1,
      borderRadius: theme.radiusCard,
      padding: 14,
      marginBottom: 8,
    },
    buildRowDelayed: {
      backgroundColor: theme.dangerBg,
      borderColor: theme.danger,
    },
    buildInfo: { flex: 1 },
    buildName: { fontSize: 15, fontWeight: "600" as const, color: theme.textPrimary, fontFamily: theme.fontBody },
    buildCharity: { fontSize: 12, color: theme.accent, marginTop: 1, fontFamily: theme.fontBody },
    buildTimer: { fontSize: 12, color: theme.textMuted, marginTop: 3, fontFamily: theme.fontBody },
    buildTimerDelayed: { color: theme.danger },
    impactText: { fontSize: 15, color: theme.accent, fontWeight: "600" as const, fontFamily: theme.fontBody },
    historyRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 12,
      backgroundColor: theme.bgCard,
      borderRadius: theme.radiusCard,
      padding: 14,
      marginBottom: 8,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    historyInfo: { flex: 1 },
    historyName: { fontSize: 15, fontWeight: "600" as const, color: theme.textPrimary, fontFamily: theme.fontBody },
    historyCharity: { fontSize: 12, color: theme.accent, marginTop: 1, fontFamily: theme.fontBody },
    historyDate: { fontSize: 12, color: theme.textMuted, marginTop: 2, fontFamily: theme.fontBody },
    historyCost: { fontSize: 13, fontWeight: "700" as const, color: theme.textSecondary, fontFamily: theme.fontBody },
    signOutBtn: {
      marginTop: 8,
      padding: 16,
      alignItems: "center" as const,
      borderRadius: theme.radiusCard,
      backgroundColor: theme.dangerBg,
    },
    signOutText: { fontSize: 15, fontWeight: "600" as const, color: theme.danger, fontFamily: theme.fontBody },
  };
}
