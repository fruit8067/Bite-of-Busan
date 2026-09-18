import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { ALLERGEN_CATALOG, matchesAllergen } from "../data/allergens";
import { useLanguage } from "../i18n/LanguageContext";

interface Props {
  allergens: string[];
}

// AI-estimated (see the "AI-estimated" toggle label above this grid) —
// highlighted cells are a heuristic keyword match, not a certified list.
export default function AllergenGrid({ allergens }: Props) {
  const theme = useTheme();
  const { t } = useLanguage();
  return (
    <View style={styles.grid}>
      {ALLERGEN_CATALOG.map((def) => {
        const present = matchesAllergen(allergens, def);
        return (
          <View
            key={def.key}
            style={[
              styles.cell,
              {
                backgroundColor: present
                  ? theme.colors.errorContainer
                  : theme.colors.surfaceVariant,
                opacity: present ? 1 : 0.4,
              },
            ]}
          >
            <Text style={styles.icon}>{def.icon}</Text>
            <Text
              variant="labelSmall"
              style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
            >
              {t(def.labelKey)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 6,
    rowGap: 8,
    marginTop: 8,
  },
  cell: {
    width: "22%",
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 8,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    textAlign: "center",
  },
});
