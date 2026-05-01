import React, { createContext, useContext } from "react";
import { useGame } from "@/store/gameStore";
import { AppTheme, groveTheme, algorithmTheme } from "@/constants/theme";

type ThemeContextValue = {
  theme: AppTheme;
  algorithmActive: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { state } = useGame();
  const algorithmActive = state.algorithmActive;
  const theme = algorithmActive ? algorithmTheme : groveTheme;

  return (
    <ThemeContext.Provider value={{ theme, algorithmActive }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
