import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

interface AlgorithmBannerProps {
  onDismiss: () => void;
}

export function AlgorithmBanner({ onDismiss }: AlgorithmBannerProps) {
  const { top } = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { top: top + 8 }]}>
      <Ionicons name="eye" size={18} color="#e879f9" />
      <Text
        style={[styles.text, { fontFamily: theme.fontBody }]}
        numberOfLines={2}
      >
        The algorithm beat you today. Your builds are paused.
      </Text>
      <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
        <Text style={[styles.dismissText, { fontFamily: theme.fontBody }]}>
          Resist
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1e0a2e",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#7c3aed",
    shadowColor: "#7c3aed",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    flex: 1,
    color: "#e9d5ff",
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 18,
  },
  dismissBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#7c3aed",
    borderRadius: 8,
  },
  dismissText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
