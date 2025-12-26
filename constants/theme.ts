export const ElaraColors = {
  primary: "#6C5CE7",
  primaryStrong: "#5A4BDC",
  primarySoft: "#EDE9FF",
  accentCoral: "#FF6B6B",
  success: "#2ECC71",
  danger: "#E74C3C",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 20,
  full: 999,
};

export const Shadows = { fab: {} } as const;
export const Gradients = { primary: ["#6C5CE7", "#8E7FF2"] } as const;
export const Typography = {} as const;

export const Fonts = {
  body: "System",
  heading: "System",
  mono: "Menlo",
} as const;

export const ThemeExtras = {
  backgroundSecondary: "#F6F2FF",
  border: "#E6E6E6",
};

// add missing shadow tokens referenced by legacy screens
export const ShadowTokens = {
  button: {},
  card: {},
};

// merge into Shadows for convenience
export const ShadowsExtended = { ...Shadows, ...ShadowTokens } as const;
export const Colors = {
  ...ElaraColors,
  light: { icon: '#222', background: '#FFFFFF' },
  dark: { icon: '#FFFFFF', background: '#000000' },
} as const;

export default ElaraColors;
