export type SpiceLevel = 0 | 1 | 2 | 3;

export interface MenuItem {
  id: string;
  nameKo: string;
  translationEn: string;
  translationZhTw: string;
  description: string;
  descriptionZhTw: string;
  spiceLevel: SpiceLevel;
  allergens: string[];
  howToEat: string;
  priceKrw: number | null;
}
