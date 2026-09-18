import { configureFonts, MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// Design system: none — pixel-match `frontendSample/busanbite-demo.html`.
// See docs/ARCHITECTURE.md "Design system: none — pixel-match the sample
// front" (2026-09-19, final, owner decision). Material Design 3 tonal
// generation is dropped entirely; these are the demo's literal `:root` CSS
// variables, used as flat hex values (no light/dark HCT computation). We keep
// exporting `lightTheme`/`darkTheme` (built on react-native-paper's MD3
// base) only so `PaperProvider`, `Chip`, `TextInput`, and `Snackbar` — the
// only remaining Paper components per the doc — still get sensible derived
// styling; every custom screen/component should read from `colors` directly
// or via `useTheme().colors` for the tokens below.

export const colors = {
  stage: "#0d0a1f",
  stage2: "#140d2e",
  paper: "#fbf8ff",
  paper2: "#f1eafb",
  ink: "#1a1030",
  muted: "#8b7fa0",
  hairline: "#e4d9f5",
  yellow: "#ec008c",
  yellowDeep: "#003795",
  red: "#58228f",
  teal: "#0095d9",
  white: "#ffffff",
};

// Role mapping onto react-native-paper's MD3 color slots, so existing
// `useTheme().colors.*` call sites (AppButton, AppCard, screens) keep working
// without call-site changes — only what these roles resolve to changes.
const shared = {
  primary: colors.yellow,
  onPrimary: colors.ink,
  primaryContainer: colors.paper2,
  onPrimaryContainer: colors.ink,
  secondary: colors.teal,
  onSecondary: colors.white,
  secondaryContainer: colors.ink,
  onSecondaryContainer: colors.yellow,
  background: colors.stage,
  onBackground: colors.paper,
  surface: colors.paper,
  onSurface: colors.ink,
  surfaceVariant: colors.paper2,
  onSurfaceVariant: colors.muted,
  outline: colors.hairline,
  outlineVariant: colors.hairline,
  error: colors.red,
  onError: colors.white,
  errorContainer: "rgba(88,34,143,0.1)",
  onErrorContainer: colors.red,
  inverseSurface: colors.ink,
  inverseOnSurface: colors.yellow,
  inversePrimary: colors.yellow,
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...shared,
  },
  fonts: buildFontConfig(),
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...shared,
    background: colors.stage,
  },
  fonts: buildFontConfig(),
};

// Demo typography: 'Song Myung' (serif) for display/headline text (screen
// titles, Korean dish names, the big order-card sentence), 'Noto Sans KR' for
// everything else. Reverts the earlier BusanFont(부산체) swap — owner
// confirmed Song Myung 2026-09-19 (docs/ARCHITECTURE.md).
function buildFontConfig() {
  return configureFonts({
    config: {
      displayLarge: { fontFamily: "SongMyung_400Regular" },
      displayMedium: { fontFamily: "SongMyung_400Regular" },
      displaySmall: { fontFamily: "SongMyung_400Regular" },
      headlineLarge: { fontFamily: "SongMyung_400Regular" },
      headlineMedium: { fontFamily: "SongMyung_400Regular" },
      headlineSmall: { fontFamily: "SongMyung_400Regular" },
      titleLarge: { fontFamily: "SongMyung_400Regular" },
      titleMedium: { fontFamily: "NotoSansKR_500Medium" },
      titleSmall: { fontFamily: "NotoSansKR_500Medium" },
      labelLarge: { fontFamily: "NotoSansKR_500Medium" },
      labelMedium: { fontFamily: "NotoSansKR_500Medium" },
      labelSmall: { fontFamily: "NotoSansKR_500Medium" },
      bodyLarge: { fontFamily: "NotoSansKR_400Regular" },
      bodyMedium: { fontFamily: "NotoSansKR_400Regular" },
      bodySmall: { fontFamily: "NotoSansKR_400Regular" },
    },
  });
}
