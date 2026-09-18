import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { PaperProvider, Text, Button } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { darkTheme, lightTheme } from "./src/theme";

export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SafeAreaView
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            backgroundColor: theme.colors.background,
          }}
        >
          <Text variant="headlineMedium">Material 3 scaffold ready</Text>
          <Button mode="contained" onPress={() => {}}>
            M3 Button
          </Button>
        </SafeAreaView>
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
