import { Platform } from "react-native";

export const ElaraColors = {
  primary: "#9B7DFF",
  primarySoft: "#E8E0FF",
  primaryStrong: "#7B5CE6",

  accentCoral: "#F26B7A",
  accentTeal: "#2FD6C5",

  success: "#2ECC71",
  warning: "#FFC857",
  danger: "#FF4C6A",
  dangerDark: "#C7374C",
  safety: "#2FD6C5",

  neutral0: "#06040A",
  neutral10: "#15101C",
  neutral20: "#221A2B",
  neutral30: "#3A3144",
  neutral40: "#5C5068",
  neutral60: "#9C8FB0",
  neutral80: "#D9D2E8",
  neutral90: "#F6F2FF",
  neutral100: "#FFFFFF",

  textDark: "#221A2B",
  textMuted: "#A197B5",
  textOnPrimary: "#FFFFFF",

  borderSubtle: "#E6D9F5",
  borderStrong: "#C5B0EC",
};

export const Gradients = {
  primary: ["#9B7DFF", "#B49CFF"] as const,
  primaryCoral: ["#F26B7A", "#FF9770"] as const,
  backgroundHero: ["#12091C", "#1D1232"] as const,
};

export const Colors = {
  light: {
    text: ElaraColors.textDark,
    textSecondary: "#7C728C",
    textMuted: ElaraColors.textMuted,
    buttonText: "#FFFFFF",
    link: ElaraColors.primary,

    backgroundRoot: ElaraColors.neutral90,
    backgroundDefault: ElaraColors.neutral100,
    backgroundSecondary: "#F3EEFF",
    backgroundTertiary: "#E8DEFF",

    cardSurface: ElaraColors.neutral100,
    cardSurfaceElevated: "#FAF7FF",
    chipBackground: "#F0EAFF",
    chipBackgroundActive: ElaraColors.primarySoft,

    border: ElaraColors.borderSubtle,
    borderStrong: ElaraColors.borderStrong,
    cardShadow: "rgba(155, 125, 255, 0.18)",

    tabIconDefault: ElaraColors.neutral60,
    tabIconSelected: ElaraColors.primary,
  },

  dark: {
    text: "#F6F2FF",
    textSecondary: "#C5BEE0",
    textMuted: "#9C8FB0",
    buttonText: "#FFFFFF",
    link: ElaraColors.accentTeal,

    backgroundRoot: ElaraColors.neutral0,
    backgroundDefault: ElaraColors.neutral10,
    backgroundSecondary: ElaraColors.neutral20,
    backgroundTertiary: "#2E243A",

    cardSurface: ElaraColors.neutral20,
    cardSurfaceElevated: "#352742",
    chipBackground: "#2E243A",
    chipBackgroundActive: "#43305A",

    border: "#3D304C",
    borderStrong: "#6C4F9E",
    cardShadow: "rgba(0, 0, 0, 0.55)",

    tabIconDefault: ElaraColors.neutral40,
    tabIconSelected: ElaraColors.primary,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 50,
  buttonHeight: 54,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  "2xl": 36,
  "3xl": 44,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 26,
    fontWeight: "600" as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 17,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
  bodyStrong: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  small: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    letterSpacing: 0.4,
    textTransform: "uppercase" as const,
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  link: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.select({ ios: 0.16, android: 0.2 }) as number,
    shadowRadius: 20,
    elevation: 4,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  button: {
    shadowColor: "rgba(155, 125, 255, 0.8)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.select({ ios: 0.48, android: 0.6 }) as number,
    shadowRadius: 14,
    elevation: 3,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
