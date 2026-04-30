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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center", padding: 24 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
          <Text style={{ color: "#6b7280", fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: "#ffffff", fontSize: 28, fontWeight: "800", marginBottom: 8 }}>
          Welcome back
        </Text>
        <Text style={{ color: "#6b7280", fontSize: 15, marginBottom: 40 }}>
          Your Grove is waiting.
        </Text>

        <Text style={{ color: "#9ca3af", fontSize: 13, fontWeight: "600", marginBottom: 8 }}>EMAIL</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#374151"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            backgroundColor: "#111827",
            color: "#ffffff",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#1f2937",
          }}
        />

        <Text style={{ color: "#9ca3af", fontSize: 13, fontWeight: "600", marginBottom: 8 }}>PASSWORD</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#374151"
          secureTextEntry
          style={{
            backgroundColor: "#111827",
            color: "#ffffff",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: "#1f2937",
          }}
        />

        <TouchableOpacity
          onPress={handleSignIn}
          disabled={loading || !email || !password}
          style={{
            backgroundColor: loading || !email || !password ? "#1f2937" : "#4ade80",
            borderRadius: 14,
            padding: 18,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <Text style={{ color: "#0a0a0a", fontSize: 17, fontWeight: "700" }}>
              Sign in
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(auth)/sign-up")}
          style={{ alignItems: "center", paddingTop: 20 }}
        >
          <Text style={{ color: "#6b7280", fontSize: 15 }}>
            No account yet? <Text style={{ color: "#9ca3af", fontWeight: "600" }}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
