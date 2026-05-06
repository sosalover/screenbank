import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/store/authStore";
import { useScreenTime } from "@/hooks/useScreenTime";
import { groveTheme as t } from "@/constants/theme";

const BUDGET_OPTIONS = [
  { label: "1 hour", minutes: 60 },
  { label: "1.5 hours", minutes: 90 },
  { label: "2 hours", minutes: 120 },
  { label: "3 hours", minutes: 180 },
  { label: "4 hours", minutes: 240 },
];

export default function SetupScreen() {
  const { setBudgetMinutes } = useAuth();
  const { requestAndSetup } = useScreenTime();
  const [selected, setSelected] = useState(120);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await setBudgetMinutes(selected);
    await requestAndSetup(selected);
    setLoading(false);
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg, padding: 24 }}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            color: t.textAccent,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Step 1 of 1
        </Text>
        <Text
          style={{
            color: t.textPrimary,
            fontSize: 28,
            fontWeight: "800",
            marginBottom: 8,
          }}
        >
          Set your daily budget
        </Text>
        <Text
          style={{
            color: t.textMuted,
            fontSize: 16,
            lineHeight: 26,
            marginBottom: 32,
          }}
        >
          Stay under this limit to earn Sparks each day.
        </Text>

        <View style={{ gap: 12 }}>
          {BUDGET_OPTIONS.map((opt) => {
            const isSelected = selected === opt.minutes;
            return (
              <TouchableOpacity
                key={opt.minutes}
                onPress={() => setSelected(opt.minutes)}
                style={{
                  borderRadius: t.radiusCard,
                  padding: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: isSelected ? t.bgBadge : t.bgCard,
                  borderWidth: 1.5,
                  borderColor: isSelected ? t.accent : t.border,
                }}
              >
                <Text
                  style={{
                    color: isSelected ? t.textAccent : t.textPrimary,
                    fontSize: 17,
                    fontWeight: isSelected ? "700" : "400",
                  }}
                >
                  {opt.label}
                </Text>
                {isSelected && (
                  <Text style={{ color: t.textAccent, fontSize: 18 }}>✓</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text
          style={{
            color: t.textMuted,
            fontSize: 14,
            lineHeight: 22,
            marginTop: 20,
          }}
        >
          Every minute under this limit earns 1 Spark. Sparks fund real donations to real charities — Grover handles the rest.
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleConfirm}
        disabled={loading}
        style={{
          backgroundColor: t.accent,
          borderRadius: t.radiusBtn,
          padding: 18,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        {loading ? (
          <ActivityIndicator color={t.accentText} />
        ) : (
          <Text style={{ color: t.accentText, fontSize: 17, fontWeight: "700" }}>
            Start tending my Grove
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
