import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "../src/components/AppButton";
import { useLanguage } from "../src/i18n/LanguageContext";
import { UI_LANGUAGES } from "../src/i18n/strings";

export default function OnboardingLanguageRoute() {
  const theme = useTheme();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const choose = (code: (typeof UI_LANGUAGES)[number]["code"]) => {
    setLanguage(code);
    router.replace("/");
  };

  return (
    <SafeAreaView
      style={[styles.stage, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.copy}>
        <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
          {t("onboarding.title")}
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          {t("onboarding.subtitle")}
        </Text>
      </View>
      <View style={styles.options}>
        {UI_LANGUAGES.map((option) => (
          <AppButton
            key={option.code}
            variant={language === option.code ? "filled" : "outlined"}
            onPress={() => choose(option.code)}
            style={styles.optionButton}
          >
            {option.label}
          </AppButton>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 40,
  },
  copy: {
    gap: 8,
  },
  subtitle: {
    marginTop: 4,
  },
  options: {
    gap: 12,
  },
  optionButton: {
    width: "100%",
  },
});
