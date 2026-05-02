import React, { useState, useRef, useEffect, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Canvas } from "@shopify/react-native-skia";
import { SkyLayer } from "@/components/grove/layers/SkyLayer";

const MONO = Platform.OS === "ios" ? "Courier New" : "monospace";

// Isolated so its tick state doesn't re-render WelcomeScreen
const SkyCanvas = memo(function SkyCanvas({ width, height }: { width: number; height: number }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(id);
  }, []);
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <SkyLayer width={width} height={height} algorithmActive={false} tick={tick} />
    </Canvas>
  );
});

const slides = [
  {
    title: "The Algorithm has been stealing your time.",
    body: "Every scroll, every autoplay, every notification — it feeds on your attention. It's been growing stronger for years.",
    bg: "#0d0d1a",
    accent: "#c084fc",
    label: "THE ALGORITHM",
    isGrove: false,
  },
  {
    title: "Every minute under your budget earns a Spark.",
    body: "Set a daily screen time limit. Every minute you stay under it earns 1 Spark — currency Grover uses to fund real causes.",
    bg: "#87CEEB",
    accent: "#16a34a",
    label: "The Grove",
    isGrove: true,
  },
  {
    title: "Your Sparks become real donations.",
    body: "Spend Sparks to plant trees, shelter puppies, clean the ocean. Real money goes to real charities. Your screen time, turned into something good.",
    bg: "#87CEEB",
    accent: "#16a34a",
    label: "THE PURPOSE",
    isGrove: true,
  },
];

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const bgAnim = useRef(new Animated.Value(0)).current;

  // Animate background color when activeIndex changes
  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: activeIndex,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [activeIndex]);

  const animatedBg = bgAnim.interpolate({
    inputRange: slides.map((_, i) => i),
    outputRange: slides.map((s) => s.bg),
    extrapolate: "clamp",
  });

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
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
        onMomentumScrollEnd={handleScrollEnd}
        style={{ flex: 1 }}
      >
        {slides.map((s, i) => (
          <View key={i} style={{ width, flex: 1 }}>
            {s.isGrove ? (
              <>
                <SkyCanvas width={width} height={height} />
                <View style={{ flex: 1, padding: 32, justifyContent: "center" }}>
                  <Text style={{ color: s.accent, fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>
                    {s.label}
                  </Text>
                  <Text style={{ color: "#0f172a", fontSize: 32, fontWeight: "800", lineHeight: 40, marginBottom: 24 }}>
                    {s.title}
                  </Text>
                  <Text style={{ color: "#374151", fontSize: 17, lineHeight: 28 }}>
                    {s.body}
                  </Text>
                </View>
              </>
            ) : (
              <View style={{ flex: 1, backgroundColor: s.bg, padding: 32, justifyContent: "center" }}>
                <Text style={{ color: s.accent, fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24, fontFamily: MONO }}>
                  {s.label}
                </Text>
                <Text style={{ color: "#f1f5f9", fontSize: 28, fontWeight: "800", lineHeight: 38, marginBottom: 24, fontFamily: MONO }}>
                  {s.title}
                </Text>
                <Text style={{ color: "#94a3b8", fontSize: 16, lineHeight: 26, fontFamily: MONO }}>
                  {s.body}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Dots + CTA — background fades on index change */}
      <Animated.View style={{ backgroundColor: animatedBg }}>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, paddingVertical: 16 }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === activeIndex ? slide.accent : (slide.isGrove ? "#b0c4b0" : "#374151"),
              }}
            />
          ))}
        </View>

        <View style={{ padding: 24, paddingBottom: 32 }}>
          {isLast ? (
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-up")}
              style={{ backgroundColor: "#16a34a", borderRadius: 14, padding: 18, alignItems: "center" }}
            >
              <Text style={{ color: "#ffffff", fontSize: 17, fontWeight: "700" }}>
                Create your Grove
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                scrollRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
                setActiveIndex(activeIndex + 1);
              }}
              style={{ backgroundColor: slide.isGrove ? "#16a34a" : "#1e1b4b", borderRadius: 14, padding: 18, alignItems: "center" }}
            >
              <Text style={{ color: "#ffffff", fontSize: 17, fontWeight: "600", fontFamily: slide.isGrove ? undefined : MONO }}>
                Continue
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-in")}
            style={{ alignItems: "center", paddingTop: 16 }}
          >
            <Text style={{ color: slide.isGrove ? "#374151" : "#6b7280", fontSize: 15 }}>
              Already have an account?{" "}
              <Text style={{ color: slide.isGrove ? "#0f172a" : "#9ca3af", fontWeight: "600" }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
