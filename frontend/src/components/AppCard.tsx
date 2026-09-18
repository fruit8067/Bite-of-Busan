import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Plain View — not react-native-paper's Card — per docs/ARCHITECTURE.md
// "Hybrid component approach": order/scan-result cards get a custom rounded-
// border look to match the teammate demo. Colors still come from theme.ts.
export default function AppCard({ children, style }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
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
    borderRadius: 8,
    padding: 14,
  },
});
