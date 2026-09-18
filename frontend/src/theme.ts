import {
  argbFromHex,
  hexFromArgb,
  TonalPalette,
} from "@material/material-color-utilities";
import { configureFonts, MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// Central Material Design 3 theme. Screens must consume these tokens — see
// frontend/CLAUDE.md. Palette below is Busan city's two brand colors (see
// docs/ARCHITECTURE.md "Brand palette v2") run through Google's official HCT
// tonal-palette algorithm (`@material/material-color-utilities`, the same
// engine behind Material Theme Builder) rather than hand-picked hexes — only
// primary/secondary and their `on-*`/container pairs are seeded from brand;
// background/surface/outline/error stay react-native-paper's MD3 defaults
// (near-white light / near-black dark, standard M3 red) per owner's
// instruction not to paint the whole UI in the brand hue.

const PRIMARY_SEED = "#1AB3FF"; // 바탕색
const SECONDARY_SEED = "#4000FF"; // 포인트 색

function tone(seedHex: string, t: number): string {
  return hexFromArgb(TonalPalette.fromInt(argbFromHex(seedHex)).tone(t));
}

// Standard M3 tone assignments for a seed's tonal palette (light/dark).
const primaryLight = {
  primary: tone(PRIMARY_SEED, 40),
  onPrimary: tone(PRIMARY_SEED, 100),
  primaryContainer: tone(PRIMARY_SEED, 90),
  onPrimaryContainer: tone(PRIMARY_SEED, 10),
};
const primaryDark = {
  primary: tone(PRIMARY_SEED, 80),
  onPrimary: tone(PRIMARY_SEED, 20),
  primaryContainer: tone(PRIMARY_SEED, 30),
  onPrimaryContainer: tone(PRIMARY_SEED, 90),
};
const secondaryLight = {
  secondary: tone(SECONDARY_SEED, 40),
  onSecondary: tone(SECONDARY_SEED, 100),
  secondaryContainer: tone(SECONDARY_SEED, 90),
  onSecondaryContainer: tone(SECONDARY_SEED, 10),
};
const secondaryDark = {
  secondary: tone(SECONDARY_SEED, 80),
  onSecondary: tone(SECONDARY_SEED, 20),
  secondaryContainer: tone(SECONDARY_SEED, 30),
  onSecondaryContainer: tone(SECONDARY_SEED, 90),
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...primaryLight,
    ...secondaryLight,
  },
  fonts: buildFontConfig(),
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...primaryDark,
    ...secondaryDark,
  },
  fonts: buildFontConfig(),
};

// Busan city's official typeface (owner-provided TTF, city-owned license —
// see docs/ARCHITECTURE.md) for display/headline-level text (screen titles,
// Korean dish names, the big order-card sentence) — 'Noto Sans KR' for
// everything else. Only one weight exists for the Busan font (no bold
// variant — emphasis uses size/color instead); Noto Sans KR uses its own
// Regular/Medium files rather than synthetic bolding of one weight.
function buildFontConfig() {
  return configureFonts({
    config: {
      displayLarge: { fontFamily: "BusanFont_Provisional" },
      displayMedium: { fontFamily: "BusanFont_Provisional" },
      displaySmall: { fontFamily: "BusanFont_Provisional" },
      headlineLarge: { fontFamily: "BusanFont_Provisional" },
      headlineMedium: { fontFamily: "BusanFont_Provisional" },
      headlineSmall: { fontFamily: "BusanFont_Provisional" },
      titleLarge: { fontFamily: "BusanFont_Provisional" },
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
