import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/store/authStore";

const BUDGET_OPTIONS = [
  { label: "1 hour", minutes: 60 },
  { label: "1.5 hours", minutes: 90 },
  { label: "2 hours", minutes: 120 },
  { label: "3 hours", minutes: 180 },
  { label: "4 hours", minutes: 240 },
];

export default function SetupScreen() {
  const { setBudgetMinutes } = useAuth();
  const [selected, setSelected] = useState(120);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await setBudgetMinutes(selected);
    setLoading(false);
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a", padding: 24 }}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={{ color: "#4ade80", fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
          Step 1 of 1
        </Text>
        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "800", marginBottom: 12 }}>
          Set your daily budget
        </Text>
        <Text style={{ color: "#6b7280", fontSize: 16, lineHeight: 26, marginBottom: 48 }}>
          This is how much screen time you're allowing yourself per day. Stay under it and you earn that time back.
        </Text>

        <View style={{ gap: 12 }}>
          {BUDGET_OPTIONS.map((opt) => {
            const isSelected = selected === opt.minutes;
            return (
              <TouchableOpacity
                key={opt.minutes}
                onPress={() => setSelected(opt.minutes)}
                style={{
                  borderRadius: 14,
                  padding: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: isSelected ? "#0f2a0f" : "#111827",
                  borderWidth: 1.5,
                  borderColor: isSelected ? "#4ade80" : "#1f2937",
                }}
              >
                <Text style={{ color: isSelected ? "#4ade80" : "#ffffff", fontSize: 17, fontWeight: isSelected ? "700" : "400" }}>
                  {opt.label}
                </Text>
                {isSelected && (
                  <Text style={{ color: "#4ade80", fontSize: 18 }}>✓</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleConfirm}
        disabled={loading}
        style={{
          backgroundColor: "#4ade80",
          borderRadius: 14,
          padding: 18,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#0a0a0a" />
        ) : (
          <Text style={{ color: "#0a0a0a", fontSize: 17, fontWeight: "700" }}>
            Start tending my Grove
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
