import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { groveTheme as t } from "@/constants/theme";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert("Sign in failed", error.message);
    }
    // _layout.tsx watches session changes and redirects automatically
  }

  const disabled = loading || !email || !password;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center", padding: 24 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
          <Text style={{ color: t.textMuted, fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: t.textPrimary, fontSize: 28, fontWeight: "800", marginBottom: 8 }}>
          Welcome back
        </Text>
        <Text style={{ color: t.textMuted, fontSize: 15, marginBottom: 40 }}>
          Your Grove is waiting.
        </Text>

        <Text style={{ color: t.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 8 }}>EMAIL</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={t.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            backgroundColor: t.bgInput,
            color: t.textPrimary,
            borderRadius: t.radiusCard,
            padding: 16,
            fontSize: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: t.border,
          }}
        />

        <Text style={{ color: t.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 8 }}>PASSWORD</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={t.textMuted}
          secureTextEntry
          style={{
            backgroundColor: t.bgInput,
            color: t.textPrimary,
            borderRadius: t.radiusCard,
            padding: 16,
            fontSize: 16,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: t.border,
          }}
        />

        <TouchableOpacity
          onPress={handleSignIn}
          disabled={disabled}
          style={{
            backgroundColor: disabled ? t.border : t.accent,
            borderRadius: t.radiusBtn,
            padding: 18,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color={t.accentText} />
          ) : (
            <Text style={{ color: disabled ? t.textMuted : t.accentText, fontSize: 17, fontWeight: "700" }}>
              Sign in
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(auth)/sign-up")}
          style={{ alignItems: "center", paddingTop: 20 }}
        >
          <Text style={{ color: t.textMuted, fontSize: 15 }}>
            No account yet?{" "}
            <Text style={{ color: t.textSecondary, fontWeight: "600" }}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
