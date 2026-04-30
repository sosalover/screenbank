import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const slides = [
  {
    title: "The Algorithm has been stealing your time.",
    body: "Every scroll, every autoplay, every notification — it feeds on your attention. It's been growing stronger for years.",
    bg: "#0a0a0a",
    accent: "#ef4444",
    label: "The threat",
  },
  {
    title: "Every minute you take back is yours to spend.",
    body: "Set a daily screen time budget. Stay under it and earn that time back — as real minutes you control.",
    bg: "#0f1a0f",
    accent: "#4ade80",
    label: "The mechanic",
  },
  {
    title: "Spend your time on something real.",
    body: "Use your reclaimed minutes to plant trees, shelter puppies, clean the ocean. Your Grove grows as the Algorithm shrinks.",
    bg: "#0a0f1a",
    accent: "#60a5fa",
    label: "The purpose",
  },
];

export default function WelcomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  }

  const slide = slides[activeIndex];
  const isLast = activeIndex === slides.length - 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: slide.bg }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {slides.map((s, i) => (
          <View
            key={i}
            style={{ width, flex: 1, backgroundColor: s.bg, padding: 32, justifyContent: "center" }}
          >
            <Text style={{ color: s.accent, fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>
              {s.label}
            </Text>
            <Text style={{ color: "#ffffff", fontSize: 32, fontWeight: "800", lineHeight: 40, marginBottom: 24 }}>
              {s.title}
            </Text>
            <Text style={{ color: "#9ca3af", fontSize: 17, lineHeight: 28 }}>
              {s.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, paddingVertical: 16 }}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === activeIndex ? 20 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === activeIndex ? slide.accent : "#374151",
            }}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={{ padding: 24, paddingBottom: 32 }}>
        {isLast ? (
          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-up")}
            style={{ backgroundColor: "#4ade80", borderRadius: 14, padding: 18, alignItems: "center" }}
          >
            <Text style={{ color: "#0a0a0a", fontSize: 17, fontWeight: "700" }}>
              Create your Grove
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              scrollRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
              setActiveIndex(activeIndex + 1);
            }}
            style={{ backgroundColor: "#1f2937", borderRadius: 14, padding: 18, alignItems: "center" }}
          >
            <Text style={{ color: "#ffffff", fontSize: 17, fontWeight: "600" }}>Continue</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => router.push("/(auth)/sign-in")}
          style={{ alignItems: "center", paddingTop: 16 }}
        >
          <Text style={{ color: "#6b7280", fontSize: 15 }}>
            Already have an account? <Text style={{ color: "#9ca3af", fontWeight: "600" }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
