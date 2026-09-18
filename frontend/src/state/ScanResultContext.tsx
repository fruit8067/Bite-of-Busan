import { createContext, ReactNode, useContext, useState } from "react";
import { MenuItem } from "../types/menu";

interface ScanResultState {
  restaurantName: string | null;
  items: MenuItem[] | null;
  setResult: (restaurantName: string | null, items: MenuItem[]) => void;
}

const ScanResultContext = createContext<ScanResultState | undefined>(
  undefined
);

export function ScanResultProvider({ children }: { children: ReactNode }) {
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [items, setItems] = useState<MenuItem[] | null>(null);

  return (
    <ScanResultContext.Provider
      value={{
        restaurantName,
        items,
        setResult: (name, newItems) => {
          setRestaurantName(name);
          setItems(newItems);
        },
      }}
    >
      {children}
    </ScanResultContext.Provider>
  );
}

export function useScanResult() {
  const ctx = useContext(ScanResultContext);
  if (!ctx) {
    throw new Error("useScanResult must be used within ScanResultProvider");
  }
  return ctx;
}
