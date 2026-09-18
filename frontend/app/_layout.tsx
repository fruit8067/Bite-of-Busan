import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, loadAsync } from "expo-font";
import { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotoSansKR_400Regular } from "@expo-google-fonts/noto-sans-kr/400Regular";
import { NotoSansKR_500Medium } from "@expo-google-fonts/noto-sans-kr/500Medium";
import { darkTheme, lightTheme } from "../src/theme";
import { ScanResultProvider } from "../src/state/ScanResultContext";
import { LanguageProvider } from "../src/i18n/LanguageContext";

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;
  // Only the two Google Fonts block initial render — proven reliable. The
  // local Busan city font (require() of a bundled .ttf) hangs `useFonts`
  // forever specifically on web (confirmed via testing; unclear root cause —
  // likely an expo-font/web asset-loading gap, not our font file). Loading it
  // separately, non-blocking, means the app still shows correctly (falls
  // back to Noto Sans KR) even if this never resolves on web; native
  // platforms load local font requires through a different path and may not
  // hit the same issue — re-verify there before deciding this is permanent.
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
  });
  const [, setBusanFontLoaded] = useState(false);
  useEffect(() => {
    loadAsync({
      BusanFont_Provisional: require("../assets/fonts/BusanFont_Provisional.ttf"),
    })
      .then(() => setBusanFontLoaded(true))
      .catch((err) => console.warn("BusanFont_Provisional failed to load, falling back:", err));
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <LanguageProvider>
          <ScanResultProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="auto" />
          </ScanResultProvider>
        </LanguageProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
