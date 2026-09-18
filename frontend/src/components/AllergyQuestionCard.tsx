import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import AppButton from "./AppButton";
import AppCard from "./AppCard";
import { useLanguage } from "../i18n/LanguageContext";

type Answer = "yes" | "no" | null;

// v1: on-the-spot confirmation only — the answer is never sent anywhere
// (see docs/PRODUCT.md "MVP에 반영: 알레르기 AI-추정 표시 + 확인 카드"). The
// Korean question itself stays fixed Korean regardless of UI language — it's
// read by Korean staff, same exception as the order card back (docs/PRODUCT.md
// "지금 증분 #1"). Only the tourist-facing labels around it are translated.
export default function AllergyQuestionCard() {
  const theme = useTheme();
  const { t } = useLanguage();
  const [answer, setAnswer] = useState<Answer>(null);

  return (
    <AppCard
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.secondaryContainer,
          borderColor: "transparent",
        },
      ]}
    >
      <Text
        variant="labelLarge"
        style={{ color: theme.colors.onSecondaryContainer }}
      >
        {t("allergen.askStaff")}
      </Text>
      <Text
        variant="headlineSmall"
        style={[
          styles.question,
          { color: theme.colors.onSecondaryContainer },
        ]}
      >
        땅콩 들어가나요?
      </Text>
      <Text
        variant="bodySmall"
        style={{
          color: theme.colors.onSecondaryContainer,
          marginBottom: 12,
        }}
      >
        {t("allergen.explain")}
      </Text>
      <View style={styles.buttonRow}>
        <AppButton
          variant={answer === "yes" ? "filled" : "outlinedLight"}
          onPress={() => setAnswer("yes")}
          style={styles.answerButton}
        >
          {t("allergen.yes")}
        </AppButton>
        <AppButton
          variant={answer === "no" ? "filled" : "outlinedLight"}
          onPress={() => setAnswer("no")}
          style={styles.answerButton}
        >
          {t("allergen.no")}
        </AppButton>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
  },
  question: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  answerButton: {
    flex: 1,
  },
});
