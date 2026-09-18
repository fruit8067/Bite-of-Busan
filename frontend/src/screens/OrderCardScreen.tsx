import { useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Checkbox, Chip, Divider, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AllergenGrid from "../components/AllergenGrid";
import AllergyQuestionCard from "../components/AllergyQuestionCard";
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
          <Text variant="labelMedium" style={styles.backText}>
            {t("order.backToScan")}
          </Text>
        </Pressable>
        <Text variant="labelMedium" style={styles.topbarLabel}>
          {t("order.topbarLabel")}
        </Text>
        <Text variant="labelMedium" style={styles.topbarSpacer}>
          {selectedQuantity}
        </Text>
      </View>

      <Text variant="bodySmall" style={styles.restaurantLabel}>
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
              style={styles.sampleChip}
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
              style={styles.sampleChip}
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
            <View
              key={item.id}
              style={[
                styles.itemCard,
                selected && styles.itemCardSelected,
                { opacity: 1 - index * 0.02 },
              ]}
            >
              <View style={styles.itemHead}>
                <Checkbox.Android
                  status={selected ? "checked" : "unchecked"}
                  onPress={() => toggleSelected(item.id)}
                />
                <View style={styles.itemNames}>
                  <Text variant="titleLarge" style={styles.itemKo}>
                    {item.nameKo}
                  </Text>
                  <Text variant="bodySmall" style={styles.itemTranslated}>
                    {translatedName(item, language)}
                  </Text>
                  <Text variant="labelLarge" style={styles.itemPrice}>
                    {formatPrice(item.priceKrw, currency, t("order.priceNotListed"))}
                    {krwLabel ? ` · ${krwLabel}` : ""}
                  </Text>
                </View>
                <View style={styles.spiceBox}>
                  <Text variant="bodySmall" style={styles.spiceIcon}>
                    {"🌶️".repeat(item.spiceLevel || 0) || t("order.spiceNone")}
                  </Text>
                  <Text variant="labelSmall" style={styles.spiceLabel}>
                    {spiceLabels[item.spiceLevel]}
                  </Text>
                </View>
              </View>

              <Text variant="bodySmall" style={styles.description}>
                {translatedDescription(item, language)}
              </Text>

              {item.howToEat ? (
                <View style={styles.howtoBox}>
                  <Text variant="labelSmall" style={styles.howtoLabel}>
                    {t("order.howToEatLabel")}
                  </Text>
                  <Text variant="bodySmall" style={styles.howtoText}>
                    {item.howToEat}
                  </Text>
                </View>
              ) : null}

              <Pressable onPress={() => toggleAllergyOpen(item.id)}>
                <Text variant="labelMedium" style={styles.allergyToggle}>
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
                          sel.lessSpicy && styles.optionPillOn,
                        ]}
                      >
                        <Text
                          variant="labelMedium"
                          style={[
                            styles.optionText,
                            sel.lessSpicy && styles.optionTextOn,
                          ]}
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
                      <Text variant="titleMedium" style={styles.qtyText}>
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
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text variant="bodySmall" style={styles.countText}>
          {t("order.selectedCount", { count: selectedCount })}
        </Text>
        <Pressable
          disabled={selectedCount === 0}
          onPress={() => setCardVisible(true)}
          style={[
            styles.makeCardButton,
            selectedCount === 0 && styles.disabled,
          ]}
        >
          <Text variant="labelLarge" style={styles.makeCardText}>
            {t("order.makeCard")}
          </Text>
        </Pressable>
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
  const { t } = useLanguage();
  return (
    <SafeAreaView style={styles.stage} edges={["bottom", "left", "right"]}>
      <View style={styles.glowMagenta} />
      <View style={styles.glowBlue} />
      <View style={styles.brand}>
        <Text variant="displaySmall" style={styles.brandTitle}>
          부산한입
        </Text>
        <Text variant="bodySmall" style={styles.brandSub}>
          {t("brand.subtitle")}
        </Text>
      </View>
      <View style={styles.modeSwitch}>
        <View style={[styles.modeButton, styles.modeActive]}>
          <Text variant="labelMedium" style={styles.modeActiveText}>
            {t("mode.eat")}
          </Text>
        </View>
        <View style={styles.modeButton}>
          <Text variant="labelMedium" style={styles.modeText}>
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
              i === step && styles.dotActive,
              i < step && styles.dotDone,
            ]}
          />
        ))}
      </View>
      <View style={styles.phone}>
        <View style={styles.notch} />
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
          <Text variant="labelMedium" style={styles.backText}>
            ‹ {translate(language, "orderCard.editMenu")}
          </Text>
        </Pressable>
        <Text variant="labelMedium" style={styles.topbarLabel}>
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
              { transform: [{ rotate: frontRotate }] },
            ]}
          >
            <Text variant="labelLarge" style={styles.orderKicker}>
              {translate(language, "orderCard.staffLabel")}
            </Text>
            <Text variant="headlineSmall" style={styles.orderTitle}>
              {translate(language, "orderCard.title")}
            </Text>
            {lines.map((line) => (
              <View key={line.id} style={styles.orderLine}>
                <Text variant="titleMedium" style={styles.orderLineName}>
                  {line.nameCustomer}
                </Text>
                <Text variant="titleMedium" style={styles.qtyBadge}>
                  x{line.quantity}
                </Text>
              </View>
            ))}
            {lines.some((line) => line.lessSpicy) && (
              <View style={styles.notePill}>
                <Text variant="labelMedium" style={styles.noteText}>
                  {translate(language, "orderCard.lessSpicyNote")}
                </Text>
              </View>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.orderCard,
              styles.orderCardBack,
              { transform: [{ rotate: backRotate }] },
            ]}
          >
            <Text variant="labelLarge" style={styles.orderKicker}>
              TO. 사장님
            </Text>
            <Text variant="headlineSmall" style={styles.orderTitle}>
              사장님, 주문할게요!
            </Text>
            {lines.map((line) => (
              <View key={line.id} style={styles.orderLine}>
                <Text variant="titleMedium" style={styles.orderLineName}>
                  {line.nameKo}
                  {line.lessSpicy ? " 안 맵게" : ""}
                </Text>
                <Text variant="titleMedium" style={styles.qtyBadge}>
                  {line.quantity}개
                </Text>
              </View>
            ))}
            {lines.some((line) => line.lessSpicy) && (
              <View style={styles.notePill}>
                <Text variant="labelMedium" style={styles.noteText}>
                  덜 맵게 해주세요.
                </Text>
              </View>
            )}
          </Animated.View>
        </Pressable>

        <Pressable onPress={flip} style={styles.flipButton}>
          <Text variant="labelLarge" style={styles.flipButtonText}>
            {translate(
              language,
              showVendor ? "orderCard.flipHide" : "orderCard.flipShow"
            )}
          </Text>
        </Pressable>

        <AllergyQuestionCard />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#0d0a1f",
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  glowMagenta: {
    position: "absolute",
    left: -70,
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(236,0,140,0.18)",
  },
  glowBlue: {
    position: "absolute",
    right: -70,
    bottom: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(0,149,217,0.18)",
  },
  brand: {
    alignItems: "center",
    marginBottom: 12,
  },
  brandTitle: {
    color: "#EC008C",
    textShadowColor: "rgba(236,0,140,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 14,
  },
  brandSub: {
    color: "#b9c2c9",
    marginTop: 2,
  },
  modeSwitch: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  modeButton: {
    borderWidth: 1.4,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  modeActive: {
    backgroundColor: "#EC008C",
    borderColor: "#EC008C",
  },
  modeText: {
    color: "#c9d2d8",
  },
  modeActiveText: {
    color: "#1a1030",
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
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  dotActive: {
    width: 22,
    backgroundColor: "#EC008C",
  },
  dotDone: {
    backgroundColor: "rgba(236,0,140,0.55)",
  },
  phone: {
    flex: 1,
    position: "relative",
    width: "100%",
    maxWidth: 380,
    maxHeight: 720,
    borderRadius: 46,
    backgroundColor: "#fbf8ff",
    borderWidth: 10,
    borderColor: "#06090d",
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
    backgroundColor: "#06090d",
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
  topbarLabel: {
    color: "#1a1030",
  },
  backText: {
    color: "#8b7fa0",
  },
  topbarSpacer: {
    width: 56,
    color: "#8b7fa0",
    textAlign: "right",
  },
  restaurantLabel: {
    color: "#8b7fa0",
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
  sampleChip: {
    backgroundColor: "#ffffff",
  },
  resultScroll: {
    flex: 1,
  },
  resultScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 96,
  },
  itemCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4d9f5",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  itemCardSelected: {
    borderColor: "#58228F",
    backgroundColor: "#f1eafb",
  },
  itemHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  itemNames: {
    flex: 1,
  },
  itemKo: {
    color: "#1a1030",
  },
  itemTranslated: {
    color: "#0095D9",
    marginTop: 2,
  },
  itemPrice: {
    color: "#1a1030",
    marginTop: 6,
  },
  spiceBox: {
    alignItems: "flex-end",
    maxWidth: 74,
  },
  spiceIcon: {
    color: "#1a1030",
  },
  spiceLabel: {
    color: "#8b7fa0",
    marginTop: 2,
  },
  description: {
    color: "#5a4f3d",
    marginTop: 9,
  },
  howtoBox: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#e4d9f5",
  },
  howtoLabel: {
    color: "#1a1030",
    marginBottom: 2,
  },
  howtoText: {
    color: "#5a4f3d",
    lineHeight: 18,
  },
  allergyToggle: {
    color: "#0095D9",
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
    borderColor: "#e4d9f5",
    backgroundColor: "#ffffff",
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  optionPillOn: {
    borderColor: "#58228F",
    backgroundColor: "rgba(88,34,143,0.1)",
  },
  optionText: {
    color: "#8b7fa0",
  },
  optionTextOn: {
    color: "#58228F",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyText: {
    color: "#1a1030",
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
    borderTopColor: "#e4d9f5",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  countText: {
    color: "#8b7fa0",
  },
  makeCardButton: {
    flex: 1,
    maxWidth: 210,
    alignItems: "center",
    backgroundColor: "#1a1030",
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  makeCardText: {
    color: "#EC008C",
  },
  disabled: {
    opacity: 0.35,
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
    backgroundColor: "#EC008C",
    backfaceVisibility: "hidden",
  },
  orderCardBack: {
    backgroundColor: "#003795",
  },
  orderKicker: {
    color: "#fbf8ff",
    opacity: 0.78,
    letterSpacing: 1,
  },
  orderTitle: {
    color: "#fbf8ff",
    marginTop: 5,
    marginBottom: 18,
  },
  orderLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.22)",
    paddingVertical: 12,
    gap: 12,
  },
  orderLineName: {
    color: "#fbf8ff",
    flex: 1,
  },
  qtyBadge: {
    color: "#fbf8ff",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  notePill: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 12,
    padding: 12,
  },
  noteText: {
    color: "#fbf8ff",
  },
  flipButton: {
    marginTop: 16,
    borderRadius: 100,
    backgroundColor: "#1a1030",
    paddingVertical: 15,
    alignItems: "center",
  },
  flipButtonText: {
    color: "#EC008C",
  },
});
