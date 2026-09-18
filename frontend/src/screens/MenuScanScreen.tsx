import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Snackbar, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "../components/AppButton";
import ChatBotOverlay from "../components/ChatBotOverlay";
import { MenuScanError, scanMenu } from "../api/menuApi";
import { deleteImageFromBlob, uploadImageToBlob } from "../api/uploadApi";
import { MenuItem } from "../types/menu";
import { useLanguage } from "../i18n/LanguageContext";
import { colors } from "../theme";

interface Props {
  onAnalyze: (restaurantName: string | null, items: MenuItem[]) => void;
}

type PickSource = "camera" | "gallery";

const sampleMenuRows = [
  ["돼지국밥", "9,000원"],
  ["순대국밥", "9,000원"],
  ["물밀면", "8,000원"],
  ["수육(小)", "18,000원"],
];

export default function MenuScanScreen({ onAnalyze }: Props) {
  const theme = useTheme();
  const { t } = useLanguage();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const cleanupBlob = (url: string | null) => {
    if (url) {
      void deleteImageFromBlob(url).catch(() => undefined);
    }
  };

  const clearImage = () => {
    cleanupBlob(imageBlobUrl);
    setImageUri(null);
    setImageBlobUrl(null);
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
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.85,
          });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];

    try {
      cleanupBlob(imageBlobUrl);
      setImageUri(asset.uri);
      setFileName(asset.fileName ?? "menu photo");
      const blobUrl = await uploadImageToBlob(asset.uri);
      setImageBlobUrl(blobUrl);
    } catch {
      setImageUri(asset.uri);
      setImageBlobUrl(null);
      setFileName(asset.fileName ?? "menu photo");
      setSnackbarMessage(t("scan.errorImageUnreadable"));
    }
  };

  const analyze = async () => {
    if (!imageBlobUrl) {
      setSnackbarMessage(t("scan.errorChooseImageFirst"));
      return;
    }

    setLoading(true);
    try {
      const { restaurantName, items } = await scanMenu(imageBlobUrl);
      await deleteImageFromBlob(imageBlobUrl).catch(() => undefined);
      onAnalyze(restaurantName, items);
    } catch (err) {
      await deleteImageFromBlob(imageBlobUrl).catch(() => undefined);
      setImageUri(null);
      setImageBlobUrl(null);
      setFileName(null);
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

          <View style={[styles.scanFrame, { backgroundColor: colors.ink }]}>
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
                  { backgroundColor: "#2a2018", borderColor: "#4a3d2c" },
                ]}
              >
                <Text variant="headlineSmall" style={[styles.boardTitle, { color: "#f2ead9" }]}>
                  자갈치 국밥집
                </Text>
                <View style={[styles.boardRule, { backgroundColor: "#4a3d2c" }]} />
                {sampleMenuRows.map(([name, price]) => (
                  <View key={name} style={styles.boardRow}>
                    <Text variant="titleMedium" style={{ color: "#f2ead9" }}>
                      {name}
                    </Text>
                    <Text variant="labelMedium" style={{ color: "#d8c9a4" }}>
                      {price}
                    </Text>
                  </View>
                ))}
                <View style={[styles.boardRule, { backgroundColor: "#4a3d2c" }]} />
                <Text variant="bodySmall" style={[styles.boardFoot, { color: "#8f7d5c" }]}>
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
            variant="dark"
            onPress={analyze}
            disabled={!imageBlobUrl}
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
