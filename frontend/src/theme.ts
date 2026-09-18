import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// Central Material Design 3 theme. Screens must consume these tokens —
// see frontend/CLAUDE.md. Swap the seed colors below when the owner picks a
// brand color; regenerate role colors from the M3 color system, don't hand-
// tune individual roles.

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
  },
};
