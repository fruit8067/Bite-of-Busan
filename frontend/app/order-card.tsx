import { useRouter } from "expo-router";
import OrderCardScreen from "../src/screens/OrderCardScreen";
import { useScanResult } from "../src/state/ScanResultContext";
import { mockMenuItems } from "../src/data/mockMenuItems";

export default function OrderCardRoute() {
  const router = useRouter();
  const { items, restaurantName } = useScanResult();

  // Falls back to mock data if this route is reached without a scan result
  // (e.g. reloading the app directly on this route during development).
  return (
    <OrderCardScreen
      items={items ?? mockMenuItems}
      restaurantName={items ? restaurantName : null}
      onBackToScan={() => router.back()}
    />
  );
}
