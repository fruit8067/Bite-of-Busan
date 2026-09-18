import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotoSansKR_400Regular } from "@expo-google-fonts/noto-sans-kr/400Regular";
import { NotoSansKR_500Medium } from "@expo-google-fonts/noto-sans-kr/500Medium";
import { SongMyung_400Regular } from "@expo-google-fonts/song-myung/400Regular";
import { darkTheme, lightTheme } from "../src/theme";
import { ScanResultProvider } from "../src/state/ScanResultContext";
import { LanguageProvider } from "../src/i18n/LanguageContext";

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    SongMyung_400Regular,
  });

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
