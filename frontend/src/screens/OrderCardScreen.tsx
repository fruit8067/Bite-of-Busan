import { useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Checkbox, Chip, Divider, IconButton, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AllergenGrid from "../components/AllergenGrid";
import AllergyQuestionCard from "../components/AllergyQuestionCard";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";
import ChatBotOverlay from "../components/ChatBotOverlay";
import {
  CURRENCIES,
  CurrencyCode,
  formatPrice,
  krwSubLabel,
} from "../utils/currency";
import { MenuItem } from "../types/menu";
import { useLanguage } from "../i18n/LanguageContext";
import { translate } from "../i18n/strings";

type DisplayLanguage = "en" | "zh-TW";

type Selection = Record<
  string,
  {
    selected: boolean;
    quantity: number;
    lessSpicy: boolean;
    allergyOpen: boolean;
  }
>;

interface OrderLine {
  id: string;
  nameKo: string;
  nameCustomer: string;
  quantity: number;
  lessSpicy: boolean;
}

interface Props {
  items: MenuItem[];
  restaurantName: string | null;
  onBackToScan: () => void;
}

const LANGUAGES: { code: DisplayLanguage; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh-TW", label: "繁體中文" },
];

function buildInitialSelection(items: MenuItem[]): Selection {
  return Object.fromEntries(
    items.map((item) => [
      item.id,
      { selected: false, quantity: 1, lessSpicy: false, allergyOpen: false },
    ])
  );
}

function translatedName(item: MenuItem, language: DisplayLanguage): string {
  return language === "zh-TW" ? item.translationZhTw : item.translationEn;
}

function translatedDescription(
  item: MenuItem,
  language: DisplayLanguage
): string {
  return language === "zh-TW"
    ? item.descriptionZhTw || item.description
    : item.description;
}

function buildOrderLines(
  items: MenuItem[],
  selection: Selection,
  language: DisplayLanguage
): OrderLine[] {
  return items
    .filter((item) => selection[item.id]?.selected)
    .map((item) => ({
      id: item.id,
      nameKo: item.nameKo,
      nameCustomer: translatedName(item, language),
      quantity: selection[item.id].quantity,
      lessSpicy: selection[item.id].lessSpicy,
    }));
}

export default function OrderCardScreen({
  items,
  restaurantName,
  onBackToScan,
}: Props) {
  const theme = useTheme();
  const { t, language: uiLanguage } = useLanguage();
  const [selection, setSelection] = useState<Selection>(() =>
    buildInitialSelection(items)
  );
  const [cardVisible, setCardVisible] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>("KRW");
  const [language, setLanguage] = useState<DisplayLanguage>(
    uiLanguage === "zh-TW" ? "zh-TW" : "en"
  );
  const spiceLabels = [
    t("order.spiceNone"),
    t("order.spiceMild"),
    t("order.spiceMedium"),
    t("order.spiceHot"),
  ];
  const restaurantLabel = restaurantName
    ? t("order.restaurantNamed", { name: restaurantName })
    : t("order.restaurantUnnamed");

  const selectedCount = Object.values(selection).filter(
    (s) => s.selected
  ).length;
  const selectedQuantity = Object.values(selection)
    .filter((s) => s.selected)
    .reduce((total, s) => total + s.quantity, 0);

  const toggleSelected = (id: string) =>
    setSelection((prev) => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id].selected },
    }));

  const changeQuantity = (id: string, delta: number) =>
    setSelection((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: Math.min(9, Math.max(1, prev[id].quantity + delta)),
      },
    }));

  const toggleLessSpicy = (id: string) =>
    setSelection((prev) => ({
      ...prev,
      [id]: { ...prev[id], lessSpicy: !prev[id].lessSpicy },
    }));

  const toggleAllergyOpen = (id: string) =>
    setSelection((prev) => ({
      ...prev,
      [id]: { ...prev[id], allergyOpen: !prev[id].allergyOpen },
    }));

  if (cardVisible) {
    return (
      <StageShell step={2}>
        <FlippableOrderCard
          lines={buildOrderLines(items, selection, language)}
          language={language}
          onEdit={() => setCardVisible(false)}
        />
      </StageShell>
    );
  }

  return (
    <StageShell step={1}>
      <View style={styles.topbar}>
        <Pressable onPress={onBackToScan}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t("order.backToScan")}
          </Text>
        </Pressable>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
          {t("order.topbarLabel")}
        </Text>
        <Text
          variant="labelMedium"
          style={[styles.topbarSpacer, { color: theme.colors.onSurfaceVariant }]}
        >
          {selectedQuantity}
        </Text>
      </View>

      <Text
        variant="bodySmall"
        style={[styles.restaurantLabel, { color: theme.colors.onSurfaceVariant }]}
      >
        {restaurantLabel}
      </Text>

      <View style={styles.chipScrollerWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroller}
        >
          {LANGUAGES.map((lang) => (
            <Chip
              key={lang.code}
              compact
              selected={language === lang.code}
              onPress={() => setLanguage(lang.code)}
            >
              {lang.label}
            </Chip>
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroller}
        >
          {CURRENCIES.map((c) => (
            <Chip
              key={c.code}
              compact
              selected={currency === c.code}
              onPress={() => setCurrency(c.code)}
            >
              {c.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.resultScroll}
        contentContainerStyle={styles.resultScrollContent}
      >
        {items.map((item, index) => {
          const sel = selection[item.id];
          const selected = sel.selected;
          const krwLabel = currency !== "KRW" ? krwSubLabel(item.priceKrw) : null;

          return (
            <AppCard
              key={item.id}
              style={[
                styles.itemCard,
                selected && {
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.primaryContainer,
                },
                { opacity: 1 - index * 0.02 },
              ]}
            >
              <View style={styles.itemHead}>
                <Checkbox.Android
                  status={selected ? "checked" : "unchecked"}
                  onPress={() => toggleSelected(item.id)}
                />
                <View style={styles.itemNames}>
                  <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                    {item.nameKo}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[styles.itemTranslated, { color: theme.colors.primary }]}
                  >
                    {translatedName(item, language)}
                  </Text>
                  <Text
                    variant="labelLarge"
                    style={[styles.itemPrice, { color: theme.colors.onSurface }]}
                  >
                    {formatPrice(item.priceKrw, currency, t("order.priceNotListed"))}
                    {krwLabel ? ` · ${krwLabel}` : ""}
                  </Text>
                </View>
                <View style={styles.spiceBox}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                    {"🌶️".repeat(item.spiceLevel || 0) || t("order.spiceNone")}
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={[styles.spiceLabel, { color: theme.colors.onSurfaceVariant }]}
                  >
                    {spiceLabels[item.spiceLevel]}
                  </Text>
                </View>
              </View>

              <Text
                variant="bodySmall"
                style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
              >
                {translatedDescription(item, language)}
              </Text>

              {item.howToEat ? (
                <View
                  style={[styles.howtoBox, { borderTopColor: theme.colors.outlineVariant }]}
                >
                  <Text
                    variant="labelSmall"
                    style={[styles.howtoLabel, { color: theme.colors.onSurface }]}
                  >
                    {t("order.howToEatLabel")}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[styles.howtoText, { color: theme.colors.onSurfaceVariant }]}
                  >
                    {item.howToEat}
                  </Text>
                </View>
              ) : null}

              <Pressable onPress={() => toggleAllergyOpen(item.id)}>
                <Text
                  variant="labelMedium"
                  style={[styles.allergyToggle, { color: theme.colors.primary }]}
                >
                  {sel.allergyOpen
                    ? t("order.allergyHide")
                    : t("order.allergyShow")}
                </Text>
              </Pressable>
              {sel.allergyOpen && <AllergenGrid allergens={item.allergens} />}

              {selected && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.itemFoot}>
                    {item.spiceLevel > 0 ? (
                      <Pressable
                        onPress={() => toggleLessSpicy(item.id)}
                        style={[
                          styles.optionPill,
                          {
                            borderColor: sel.lessSpicy
                              ? theme.colors.primary
                              : theme.colors.outline,
                            backgroundColor: sel.lessSpicy
                              ? theme.colors.primaryContainer
                              : "transparent",
                          },
                        ]}
                      >
                        <Text
                          variant="labelMedium"
                          style={{
                            color: sel.lessSpicy
                              ? theme.colors.onPrimaryContainer
                              : theme.colors.onSurfaceVariant,
                          }}
                        >
                          {t("order.lessSpicy")}
                        </Text>
                      </Pressable>
                    ) : (
                      <View />
                    )}
                    <View style={styles.qtyRow}>
                      <IconButton
                        icon="minus"
                        mode="outlined"
                        size={16}
                        onPress={() => changeQuantity(item.id, -1)}
                      />
                      <Text
                        variant="titleMedium"
                        style={[styles.qtyText, { color: theme.colors.onSurface }]}
                      >
                        {sel.quantity}
                      </Text>
                      <IconButton
                        icon="plus"
                        mode="outlined"
                        size={16}
                        onPress={() => changeQuantity(item.id, 1)}
                      />
                    </View>
                  </View>
                </>
              )}
            </AppCard>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant },
        ]}
      >
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {t("order.selectedCount", { count: selectedCount })}
        </Text>
        <AppButton
          disabled={selectedCount === 0}
          onPress={() => setCardVisible(true)}
          style={styles.makeCardButton}
        >
          {t("order.makeCard")}
        </AppButton>
      </View>
    </StageShell>
  );
}

function StageShell({
  children,
  step,
}: {
  children: React.ReactNode;
  step: number;
}) {
  const theme = useTheme();
  const { t } = useLanguage();
  return (
    <SafeAreaView
      style={[styles.stage, { backgroundColor: theme.colors.background }]}
      edges={["bottom", "left", "right"]}
    >
      <View
        style={[styles.glow, styles.glowTopLeft, { backgroundColor: theme.colors.primary }]}
      />
      <View
        style={[styles.glow, styles.glowBottomRight, { backgroundColor: theme.colors.secondary }]}
      />
      <View style={styles.brand}>
        <Text variant="displaySmall" style={{ color: theme.colors.primary }}>
          부산한입
        </Text>
        <Text
          variant="bodySmall"
          style={[styles.brandSub, { color: theme.colors.onSurfaceVariant }]}
        >
          {t("brand.subtitle")}
        </Text>
      </View>
      <View style={styles.modeSwitch}>
        <View
          style={[
            styles.modeButton,
            { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
          ]}
        >
          <Text variant="labelMedium" style={{ color: theme.colors.onPrimary }}>
            {t("mode.eat")}
          </Text>
        </View>
        <View style={[styles.modeButton, { borderColor: theme.colors.outline }]}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t("mode.speak")}
          </Text>
        </View>
      </View>
      <View style={styles.stepper}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === step
                    ? theme.colors.primary
                    : i < step
                      ? theme.colors.secondaryContainer
                      : theme.colors.surfaceVariant,
              },
              i === step && styles.dotActive,
            ]}
          />
        ))}
      </View>
      <View
        style={[
          styles.phone,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
        ]}
      >
        <View style={[styles.notch, { backgroundColor: theme.colors.outline }]} />
        <View style={styles.phoneScreen}>{children}</View>
        <ChatBotOverlay />
      </View>
    </SafeAreaView>
  );
}

function FlippableOrderCard({
  lines,
  language,
  onEdit,
}: {
  lines: OrderLine[];
  language: DisplayLanguage;
  onEdit: () => void;
}) {
  const theme = useTheme();
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [showVendor, setShowVendor] = useState(false);

  const flip = () => {
    const next = !showVendor;
    setShowVendor(next);
    Animated.timing(flipAnim, {
      toValue: next ? 180 : 0,
      duration: 560,
      useNativeDriver: false,
    }).start();
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <>
      <View style={styles.topbar}>
        <Pressable onPress={onEdit}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            ‹ {translate(language, "orderCard.editMenu")}
          </Text>
        </Pressable>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
          {translate(language, "orderCard.topbarLabel")}
        </Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView
        style={styles.cardScroll}
        contentContainerStyle={styles.cardScrollContent}
      >
        <Pressable onPress={flip} style={styles.flipArea}>
          <Animated.View
            style={[
              styles.orderCard,
              { backgroundColor: theme.colors.primary, transform: [{ rotate: frontRotate }] },
            ]}
          >
            <Text
              variant="labelLarge"
              style={[styles.orderKicker, { color: theme.colors.onPrimary }]}
            >
              {translate(language, "orderCard.staffLabel")}
            </Text>
            <Text
              variant="headlineSmall"
              style={[styles.orderTitle, { color: theme.colors.onPrimary }]}
            >
              {translate(language, "orderCard.title")}
            </Text>
            {lines.map((line) => (
              <View
                key={line.id}
                style={[styles.orderLine, { borderTopColor: theme.colors.onPrimary }]}
              >
                <Text
                  variant="titleMedium"
                  style={[styles.orderLineName, { color: theme.colors.onPrimary }]}
                >
                  {line.nameCustomer}
                </Text>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.qtyBadge,
                    {
                      color: theme.colors.onPrimaryContainer,
                      backgroundColor: theme.colors.primaryContainer,
                    },
                  ]}
                >
                  x{line.quantity}
                </Text>
              </View>
            ))}
            {lines.some((line) => line.lessSpicy) && (
              <View
                style={[styles.notePill, { backgroundColor: theme.colors.primaryContainer }]}
              >
                <Text
                  variant="labelMedium"
                  style={{ color: theme.colors.onPrimaryContainer }}
                >
                  {translate(language, "orderCard.lessSpicyNote")}
                </Text>
              </View>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.orderCard,
              { backgroundColor: theme.colors.secondary, transform: [{ rotate: backRotate }] },
            ]}
          >
            <Text
              variant="labelLarge"
              style={[styles.orderKicker, { color: theme.colors.onSecondary }]}
            >
              TO. 사장님
            </Text>
            <Text
              variant="headlineSmall"
              style={[styles.orderTitle, { color: theme.colors.onSecondary }]}
            >
              사장님, 주문할게요!
            </Text>
            {lines.map((line) => (
              <View
                key={line.id}
                style={[styles.orderLine, { borderTopColor: theme.colors.onSecondary }]}
              >
                <Text
                  variant="titleMedium"
                  style={[styles.orderLineName, { color: theme.colors.onSecondary }]}
                >
                  {line.nameKo}
                  {line.lessSpicy ? " 안 맵게" : ""}
                </Text>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.qtyBadge,
                    {
                      color: theme.colors.onSecondaryContainer,
                      backgroundColor: theme.colors.secondaryContainer,
                    },
                  ]}
                >
                  {line.quantity}개
                </Text>
              </View>
            ))}
            {lines.some((line) => line.lessSpicy) && (
              <View
                style={[styles.notePill, { backgroundColor: theme.colors.secondaryContainer }]}
              >
                <Text
                  variant="labelMedium"
                  style={{ color: theme.colors.onSecondaryContainer }}
                >
                  덜 맵게 해주세요.
                </Text>
              </View>
            )}
          </Animated.View>
        </Pressable>

        <AppButton onPress={flip} style={styles.flipButton}>
          {translate(
            language,
            showVendor ? "orderCard.flipHide" : "orderCard.flipShow"
          )}
        </AppButton>

        <AllergyQuestionCard />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  glow: {
    position: "absolute",
    borderRadius: 120,
    opacity: 0.16,
  },
  glowTopLeft: {
    left: -70,
    top: -40,
    width: 220,
    height: 220,
  },
  glowBottomRight: {
    right: -70,
    bottom: -40,
    width: 240,
    height: 240,
  },
  brand: {
    alignItems: "center",
    marginBottom: 12,
  },
  brandSub: {
    marginTop: 2,
  },
  modeSwitch: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  modeButton: {
    borderWidth: 1.4,
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  stepper: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 22,
  },
  phone: {
    flex: 1,
    position: "relative",
    width: "100%",
    maxWidth: 380,
    maxHeight: 720,
    borderRadius: 46,
    borderWidth: 10,
    overflow: "hidden",
  },
  notch: {
    position: "absolute",
    top: 0,
    left: "50%",
    zIndex: 3,
    width: 120,
    height: 26,
    marginLeft: -60,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  phoneScreen: {
    flex: 1,
    paddingTop: 26,
  },
  topbar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topbarSpacer: {
    width: 56,
    textAlign: "right",
  },
  restaurantLabel: {
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  chipScrollerWrap: {
    paddingBottom: 4,
  },
  chipScroller: {
    gap: 7,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  resultScroll: {
    flex: 1,
  },
  resultScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 96,
  },
  itemCard: {
    borderRadius: 16,
    marginBottom: 10,
  },
  itemHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  itemNames: {
    flex: 1,
  },
  itemTranslated: {
    marginTop: 2,
  },
  itemPrice: {
    marginTop: 6,
  },
  spiceBox: {
    alignItems: "flex-end",
    maxWidth: 74,
  },
  spiceLabel: {
    marginTop: 2,
  },
  description: {
    marginTop: 9,
  },
  howtoBox: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
  },
  howtoLabel: {
    marginBottom: 2,
  },
  howtoText: {
    lineHeight: 18,
  },
  allergyToggle: {
    marginTop: 9,
  },
  divider: {
    marginVertical: 10,
  },
  itemFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionPill: {
    borderWidth: 1.4,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyText: {
    minWidth: 20,
    textAlign: "center",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  makeCardButton: {
    flex: 1,
    maxWidth: 210,
  },
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    padding: 22,
    paddingBottom: 28,
  },
  flipArea: {
    height: 350,
  },
  orderCard: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 22,
    padding: 24,
    backfaceVisibility: "hidden",
  },
  orderKicker: {
    opacity: 0.78,
    letterSpacing: 1,
  },
  orderTitle: {
    marginTop: 5,
    marginBottom: 18,
  },
  orderLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingVertical: 12,
    gap: 12,
  },
  orderLineName: {
    flex: 1,
  },
  qtyBadge: {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    overflow: "hidden",
  },
  notePill: {
    marginTop: 16,
    borderRadius: 12,
    padding: 12,
  },
  flipButton: {
    marginTop: 16,
  },
});
