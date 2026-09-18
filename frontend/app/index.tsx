import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import MenuScanScreen from "../src/screens/MenuScanScreen";
import { useScanResult } from "../src/state/ScanResultContext";
import { useLanguage } from "../src/i18n/LanguageContext";

export default function ScanRoute() {
  const router = useRouter();
  const { setResult } = useScanResult();
  const { language, ready } = useLanguage();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!language) {
    return <Redirect href="/onboarding-language" />;
  }

  return (
    <MenuScanScreen
      onAnalyze={(restaurantName, items) => {
        setResult(restaurantName, items);
        router.push("/order-card");
      }}
    />
  );
}
