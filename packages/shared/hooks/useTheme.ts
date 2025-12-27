import { useMemo } from "react";

import { ThemeExtras } from "../constants/theme";

export function useTheme() {
  const theme = useMemo(() => ({
    backgroundDefault: "#fff",
    backgroundRoot: "#fff",
    backgroundSecondary: ThemeExtras.backgroundSecondary,
    text: "#000",
    textSecondary: "#666",
    tabIconDefault: "#999",
    border: ThemeExtras.border,
  }), []);
  return { theme, isDark: false };
}

export default useTheme;
