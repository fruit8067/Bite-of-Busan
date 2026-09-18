import { useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Snackbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatBotOverlay from "../components/ChatBotOverlay";
import { MenuScanError, scanMenu } from "../api/menuApi";
import { MenuItem } from "../types/menu";
import { useLanguage } from "../i18n/LanguageContext";

interface Props {
  onAnalyze: (restaurantName: string | null, items: MenuItem[]) => void;
}

type PickSource = "camera" | "gallery";

type PickerAssetWithFile = ImagePicker.ImagePickerAsset & {
  file?: Blob;
};

const sampleMenuRows = [
  ["돼지국밥", "9,000원"],
  ["순대국밥", "9,000원"],
  ["물밀면", "8,000원"],
  ["수육(小)", "18,000원"],
];

function stripDataUrlPrefix(value: string): string {
  const commaIndex = value.indexOf(",");
  return value.startsWith("data:") && commaIndex !== -1
    ? value.slice(commaIndex + 1)
    : value;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof FileReader === "undefined") {
      reject(new Error("FileReader is not available in this runtime."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(stripDataUrlPrefix(reader.result));
      } else {
        reject(new Error("Image file did not produce a base64 string."));
      }
    };
    reader.readAsDataURL(blob);
  });
}

async function assetToBase64(asset: PickerAssetWithFile): Promise<string> {
  if (asset.base64) return stripDataUrlPrefix(asset.base64);
  if (asset.file) return blobToBase64(asset.file);

  if (Platform.OS !== "web") {
    const response = await fetch(asset.uri);
    return blobToBase64(await response.blob());
  }

  throw new Error("The selected image could not be read.");
}

export default function MenuScanScreen({ onAnalyze }: Props) {
  const { t } = useLanguage();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const clearImage = () => {
    setImageUri(null);
    setImageBase64(null);
    setFileName(null);
  };

  const pickImage = async (source: PickSource) => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setSnackbarMessage(
        source === "camera"
          ? t("scan.errorCameraPermission")
          : t("scan.errorGalleryPermission")
      );
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.85,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.85,
            base64: true,
          });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0] as PickerAssetWithFile;

    try {
      const base64 = await assetToBase64(asset);
      setImageUri(asset.uri);
      setImageBase64(base64);
      setFileName(asset.fileName ?? "menu photo");
    } catch {
      setImageUri(asset.uri);
      setImageBase64(null);
      setFileName(asset.fileName ?? "menu photo");
      setSnackbarMessage(t("scan.errorImageUnreadable"));
    }
  };

  const analyze = async () => {
    if (!imageBase64) {
      setSnackbarMessage(t("scan.errorChooseImageFirst"));
      return;
    }

    setLoading(true);
    try {
      const { restaurantName, items } = await scanMenu(imageBase64);
      onAnalyze(restaurantName, items);
    } catch (err) {
      if (err instanceof MenuScanError) {
        setSnackbarMessage(err.message);
      } else {
        setSnackbarMessage(t("scan.errorNetwork"));
      }
    } finally {
      setLoading(false);
    }
  };

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
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <View style={styles.phone}>
        <View style={styles.notch} />
        <ScrollView
          style={styles.phoneScreen}
          contentContainerStyle={styles.phoneContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topbar}>
            <Text variant="labelMedium" style={styles.topbarLabel}>
              {t("scan.topbarLabel")}
            </Text>
            <Text variant="labelSmall" style={styles.topbarMuted}>
              {t("scan.liveBackend")}
            </Text>
          </View>

          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTl]} />
            <View style={[styles.corner, styles.cornerTr]} />
            <View style={[styles.corner, styles.cornerBl]} />
            <View style={[styles.corner, styles.cornerBr]} />
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <Pressable
                  onPress={clearImage}
                  style={({ pressed }) => [
                    styles.retakeBadge,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text variant="labelMedium" style={styles.retakeBadgeText}>
                    {t("scan.retake")}
                  </Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.menuBoard}>
                <Text variant="headlineSmall" style={styles.boardTitle}>
                  자갈치 국밥집
                </Text>
                <View style={styles.boardRule} />
                {sampleMenuRows.map(([name, price]) => (
                  <View key={name} style={styles.boardRow}>
                    <Text variant="titleMedium" style={styles.boardName}>
                      {name}
                    </Text>
                    <Text variant="labelMedium" style={styles.boardPrice}>
                      {price}
                    </Text>
                  </View>
                ))}
                <View style={styles.boardRule} />
                <Text variant="bodySmall" style={styles.boardFoot}>
                  포장 가능 · 카드 결제 가능
                </Text>
              </View>
            )}
          </View>

          <Text variant="bodySmall" style={styles.scanHint}>
            {fileName
              ? t("scan.hintChosen", { fileName })
              : t("scan.hintEmpty")}
          </Text>

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => pickImage("camera")}
              style={({ pressed }) => [
                styles.secondaryAction,
                pressed && styles.pressed,
              ]}
            >
              <Text variant="labelLarge" style={styles.secondaryActionText}>
                {t("scan.actionCamera")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => pickImage("gallery")}
              style={({ pressed }) => [
                styles.secondaryAction,
                pressed && styles.pressed,
              ]}
            >
              <Text variant="labelLarge" style={styles.secondaryActionText}>
                {t("scan.actionGallery")}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={analyze}
            disabled={!imageBase64 || loading}
            style={({ pressed }) => [
              styles.shutter,
              (!imageBase64 || loading) && styles.disabled,
              pressed && imageBase64 && !loading && styles.pressed,
            ]}
          >
            <View style={styles.shutterInner}>
              <Text variant="labelLarge" style={styles.shutterText}>
                {loading ? t("scan.analyzing") : t("scan.analyze")}
              </Text>
            </View>
          </Pressable>
        </ScrollView>
        <ChatBotOverlay />
      </View>

      <Snackbar
        visible={snackbarMessage !== null}
        onDismiss={() => setSnackbarMessage(null)}
        duration={4000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
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
  },
  phoneContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 34,
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  topbarLabel: {
    color: "#1a1030",
  },
  topbarMuted: {
    color: "#8b7fa0",
  },
  scanFrame: {
    flex: 1,
    minHeight: 310,
    borderRadius: 20,
    backgroundColor: "#191410",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#EC008C",
    zIndex: 2,
  },
  cornerTl: {
    top: 14,
    left: 14,
    borderLeftWidth: 3,
    borderTopWidth: 3,
  },
  cornerTr: {
    top: 14,
    right: 14,
    borderRightWidth: 3,
    borderTopWidth: 3,
  },
  cornerBl: {
    bottom: 14,
    left: 14,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
  },
  cornerBr: {
    bottom: 14,
    right: 14,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  retakeBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 3,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(6,9,13,0.72)",
  },
  retakeBadgeText: {
    color: "#fbf8ff",
  },
  menuBoard: {
    width: "78%",
    borderRadius: 8,
    backgroundColor: "#2a2018",
    padding: 18,
  },
  boardTitle: {
    color: "#f2ead9",
    textAlign: "center",
    marginBottom: 12,
  },
  boardRule: {
    height: 1,
    backgroundColor: "#4a3d2c",
    marginVertical: 8,
  },
  boardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  boardName: {
    color: "#f2ead9",
  },
  boardPrice: {
    color: "#d8c9a4",
  },
  boardFoot: {
    color: "#d8c9a4",
    textAlign: "center",
    marginTop: 8,
  },
  scanHint: {
    color: "#8b7fa0",
    textAlign: "center",
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  secondaryAction: {
    flex: 1,
    alignItems: "center",
    borderRadius: 100,
    borderWidth: 1.4,
    borderColor: "#e4d9f5",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: "#1a1030",
  },
  shutter: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "#1a1030",
    backgroundColor: "#ffffff",
  },
  shutterInner: {
    alignItems: "center",
    justifyContent: "center",
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#58228F",
  },
  shutterText: {
    color: "#ffffff",
  },
  disabled: {
    opacity: 0.42,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
