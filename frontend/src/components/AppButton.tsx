import { ReactNode } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { useTheme } from "react-native-paper";

type Variant = "filled" | "outlined" | "outlinedLight" | "text" | "dark";

interface Props {
  children: ReactNode;
  onPress: (e: GestureResponderEvent) => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Plain Pressable/View button — not react-native-paper's Button — per
// docs/ARCHITECTURE.md "Hybrid component approach": primary CTAs get custom
// pill styling to match the teammate demo, while still pulling every color
// and text style from theme.ts (M3 tokens), never hardcoding either.
export default function AppButton({
  children,
  onPress,
  variant = "filled",
  disabled = false,
  loading = false,
  style,
}: Props) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === "filled"
      ? theme.colors.primary
      : variant === "dark"
        ? theme.colors.inverseSurface
        : "transparent";
  const borderColor =
    variant === "outlined"
      ? theme.colors.outline
      : variant === "outlinedLight"
        ? "rgba(255,255,255,0.2)"
        : "transparent";
  const textColor =
    variant === "filled"
      ? theme.colors.onPrimary
      : variant === "dark"
        ? theme.colors.inverseOnSurface
        : variant === "outlined"
          ? theme.colors.onSurface
          : variant === "outlinedLight"
            ? "#c9d2d8"
            : theme.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant !== "text" && styles.pill,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === "outlined" ? 1.4 : 0,
        },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[theme.fonts.labelLarge, { color: textColor }]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    borderRadius: 100,
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.85,
  },
});
