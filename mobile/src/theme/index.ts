export const colors = {
  bg: "#0a0a0b",
  surface: "#131316",
  surface2: "#1c1c20",
  surface3: "#26262c",
  border: "#2a2a30",
  muted: "#6b6b75",
  text: "#f5f5f7",
  textSoft: "#b8b8c0",

  brand: "#ef2c39",
  brandStrong: "#dc1f2b",
  brandSoft: "#ff5a65",
  brandGlow: "rgba(239, 44, 57, 0.35)",

  success: "#22c55e",
  warn: "#f59e0b",
  info: "#3b82f6",
  pink: "#ec4899",
  purple: "#a855f7",
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  "2xl": 28,
  "3xl": 34,
} as const;

export const shadows = {
  glow: {
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
