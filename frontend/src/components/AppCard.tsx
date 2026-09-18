import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
import { colors } from "../theme";

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Plain View — not react-native-paper's Card. Matches
// `frontendSample/busanbite-demo.html`'s `.item-card` exactly: white fill
// (not the phone screen's cream `paper` surface), hairline border, 16px
// radius. See docs/ARCHITECTURE.md "Design system: none — pixel-match".
export default function AppCard({ children, style }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.white,
          borderColor: theme.colors.outlineVariant,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    paddingBottom: 12,
  },
});
