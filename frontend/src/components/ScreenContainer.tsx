import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";

interface Props {
  children: ReactNode;
  edges?: readonly Edge[];
  contentStyle?: ViewStyle;
}

// The web build can render at any browser width. Cap and center the content
// column on wide (desktop) viewports while staying full-width on phones —
// native screens are narrower than the cap anyway, so this is a no-op there.
export default function ScreenContainer({
  children,
  edges,
  contentStyle,
}: Props) {
  const theme = useTheme();
  // backgroundColor lives on this outer plain View, not on SafeAreaView itself —
  // react-native-safe-area-context's SafeAreaView doesn't reliably apply a
  // style-prop backgroundColor on web (confirmed: theme values are correct,
  // but no background paints through any SafeAreaView-generated node).
  // SafeAreaView still handles inset padding, just carries no fill color.
  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.screen} edges={edges ?? ["bottom", "left", "right"]}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 16,
  },
});
