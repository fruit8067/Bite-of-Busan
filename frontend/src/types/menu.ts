export type SpiceLevel = 0 | 1 | 2 | 3;

export interface MenuItem {
  id: string;
  nameKo: string;
  translationEn: string;
  translationZhTw: string;
  translationJa: string;
  translationEs: string;
  description: string;
  descriptionZhTw: string;
  descriptionJa: string;
  descriptionEs: string;
  spiceLevel: SpiceLevel;
  allergens: string[];
  howToEat: string;
  priceKrw: number | null;
}
