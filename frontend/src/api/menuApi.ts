// Matches docs/API_CONTRACT.md "POST /menu/scan" — keep in sync with that
// file, not with backend source, per frontend/CLAUDE.md.
import { API_BASE_URL } from "./config";
import { MenuItem, SpiceLevel } from "../types/menu";

interface ScanMenuItemResponse {
  id: number;
  nameKo: string;
  spiceLevel: number | null;
  allergens: string[];
  howToEat: string | null;
  priceKrw: number | null;
  translations: {
    en: { name: string; description: string | null };
    "zh-TW": { name: string; description: string | null };
  };
}

interface ScanMenuResponse {
  restaurantId: number;
  restaurantName?: string | null;
  items: ScanMenuItemResponse[];
}

export interface MenuScanResult {
  restaurantName: string | null;
  items: MenuItem[];
}

export class MenuScanError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function toMenuItem(item: ScanMenuItemResponse): MenuItem {
  return {
    id: String(item.id),
    nameKo: item.nameKo,
    translationEn: item.translations.en.name,
    translationZhTw: item.translations["zh-TW"].name,
    description: item.translations.en.description ?? "",
    descriptionZhTw: item.translations["zh-TW"].description ?? "",
    spiceLevel: (item.spiceLevel ?? 0) as SpiceLevel,
    allergens: item.allergens,
    howToEat: item.howToEat ?? "",
    priceKrw: item.priceKrw,
  };
}

export async function scanMenu(imageBase64: string): Promise<MenuScanResult> {
  const res = await fetch(`${API_BASE_URL}/menu/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data.error === "string" && data.error) ||
      "Menu scan failed";
    throw new MenuScanError(message, res.status);
  }

  const response = data as ScanMenuResponse;
  return {
    restaurantName: response.restaurantName ?? null,
    items: response.items.map(toMenuItem),
  };
}
