import { useState } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Snackbar, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "../components/AppButton";
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
  const theme = useTheme();
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
        <View style={[styles.dot, styles.dotActive, { backgroundColor: theme.colors.primary }]} />
        <View style={[styles.dot, { backgroundColor: theme.colors.surfaceVariant }]} />
        <View style={[styles.dot, { backgroundColor: theme.colors.surfaceVariant }]} />
      </View>

      <View
        style={[
          styles.phone,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
        ]}
      >
        <View style={[styles.notch, { backgroundColor: theme.colors.outline }]} />
        <ScrollView
          style={styles.phoneScreen}
          contentContainerStyle={styles.phoneContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topbar}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
              {t("scan.topbarLabel")}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t("scan.liveBackend")}
            </Text>
          </View>

          <View style={[styles.scanFrame, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={[styles.corner, styles.cornerTl, { borderColor: theme.colors.primary }]} />
            <View style={[styles.corner, styles.cornerTr, { borderColor: theme.colors.primary }]} />
            <View style={[styles.corner, styles.cornerBl, { borderColor: theme.colors.primary }]} />
            <View style={[styles.corner, styles.cornerBr, { borderColor: theme.colors.primary }]} />
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <Pressable
                  onPress={clearImage}
                  style={({ pressed }) => [
                    styles.retakeBadge,
                    { backgroundColor: theme.colors.inverseSurface },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text variant="labelMedium" style={{ color: theme.colors.inverseOnSurface }}>
                    {t("scan.retake")}
                  </Text>
                </Pressable>
              </>
            ) : (
              <View
                style={[
                  styles.menuBoard,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
                ]}
              >
                <Text
                  variant="headlineSmall"
                  style={[styles.boardTitle, { color: theme.colors.onSurface }]}
                >
                  자갈치 국밥집
                </Text>
                <View style={[styles.boardRule, { backgroundColor: theme.colors.outlineVariant }]} />
                {sampleMenuRows.map(([name, price]) => (
                  <View key={name} style={styles.boardRow}>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                      {name}
                    </Text>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {price}
                    </Text>
                  </View>
                ))}
                <View style={[styles.boardRule, { backgroundColor: theme.colors.outlineVariant }]} />
                <Text
                  variant="bodySmall"
                  style={[styles.boardFoot, { color: theme.colors.onSurfaceVariant }]}
                >
                  포장 가능 · 카드 결제 가능
                </Text>
              </View>
            )}
          </View>

          <Text
            variant="bodySmall"
            style={[styles.scanHint, { color: theme.colors.onSurfaceVariant }]}
          >
            {fileName
              ? t("scan.hintChosen", { fileName })
              : t("scan.hintEmpty")}
          </Text>

          <View style={styles.actionRow}>
            <AppButton
              variant="outlined"
              onPress={() => pickImage("camera")}
              style={styles.actionButton}
            >
              {t("scan.actionCamera")}
            </AppButton>
            <AppButton
              variant="outlined"
              onPress={() => pickImage("gallery")}
              style={styles.actionButton}
            >
              {t("scan.actionGallery")}
            </AppButton>
          </View>

          <AppButton
            onPress={analyze}
            disabled={!imageBase64}
            loading={loading}
            style={styles.analyzeButton}
          >
            {loading ? t("scan.analyzing") : t("scan.analyze")}
          </AppButton>
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
  scanFrame: {
    flex: 1,
    minHeight: 310,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
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
  },
  menuBoard: {
    width: "78%",
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
  },
  boardTitle: {
    textAlign: "center",
    marginBottom: 12,
  },
  boardRule: {
    height: 1,
    marginVertical: 8,
  },
  boardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  boardFoot: {
    textAlign: "center",
    marginTop: 8,
  },
  scanHint: {
    textAlign: "center",
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  actionButton: {
    flex: 1,
  },
  analyzeButton: {
    alignSelf: "stretch",
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
