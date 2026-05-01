import { Platform } from "react-native";

export type AppTheme = {
  bg: string;
  bgCard: string;
  bgInput: string;
  bgBadge: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;
  accent: string;
  accentText: string;
  danger: string;
  dangerBg: string;
  border: string;
  divider: string;
  tabBarBg: string;
  tabBarActive: string;
  tabBarInactive: string;
  tabBarBorder: string;
  radiusCard: number;
  radiusBtn: number;
  fontBody: string | undefined;
};

export const groveTheme: AppTheme = {
  bg: "#f0fdf4",
  bgCard: "#ffffff",
  bgInput: "#f9fafb",
  bgBadge: "#dcfce7",
  textPrimary: "#111827",
  textSecondary: "#374151",
  textMuted: "#6b7280",
  textAccent: "#16a34a",
  accent: "#16a34a",
  accentText: "#ffffff",
  danger: "#dc2626",
  dangerBg: "#fef2f2",
  border: "#e5e7eb",
  divider: "#f3f4f6",
  tabBarBg: "#ffffff",
  tabBarActive: "#16a34a",
  tabBarInactive: "#9ca3af",
  tabBarBorder: "#e5e7eb",
  radiusCard: 16,
  radiusBtn: 10,
  fontBody: undefined,
};

export const algorithmTheme: AppTheme = {
  bg: "#0d0d1a",
  bgCard: "#1a1a2e",
  bgInput: "#16213e",
  bgBadge: "#2d1b69",
  textPrimary: "#f1f5f9",
  textSecondary: "#cbd5e1",
  textMuted: "#64748b",
  textAccent: "#c084fc",
  accent: "#7c3aed",
  accentText: "#ffffff",
  danger: "#ef4444",
  dangerBg: "#1f1010",
  border: "#2d2d4e",
  divider: "#1e1e3a",
  tabBarBg: "#0d0d1a",
  tabBarActive: "#c084fc",
  tabBarInactive: "#4b5563",
  tabBarBorder: "#2d2d4e",
  radiusCard: 4,
  radiusBtn: 2,
  fontBody:
    Platform.OS === "ios" ? "Courier New" : "monospace",
};
