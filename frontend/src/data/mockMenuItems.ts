import { MenuItem } from "../types/menu";

// Stand-in for POST /menu/scan results until the backend endpoint ships
// (see docs/TASKS.md). Shape matches the fields backend has committed to.
export const mockMenuItems: MenuItem[] = [
  {
    id: "kimchi-jjigae",
    nameKo: "김치찌개",
    translationEn: "Kimchi Stew",
    translationZhTw: "泡菜鍋",
    description: "A hot, savory stew made with aged kimchi, tofu, and pork.",
    descriptionZhTw: "用熟成泡菜、豆腐和豬肉煮成的熱辣家常鍋。",
    spiceLevel: 2,
    allergens: ["soy", "pork"],
    howToEat: "Eat with a bowl of rice; the pot is shared at the table.",
    priceKrw: 9000,
  },
  {
    id: "jeyuk-bokkeum",
    nameKo: "제육볶음",
    translationEn: "Spicy Stir-Fried Pork",
    translationZhTw: "辣炒豬肉",
    description:
      "Thin pork slices stir-fried in a sweet and spicy gochujang sauce.",
    descriptionZhTw: "薄切豬肉片以甜辣辣椒醬快炒而成。",
    spiceLevel: 3,
    allergens: ["soy", "pork", "sesame"],
    howToEat: "Wrap a spoonful in lettuce with rice and garlic.",
    priceKrw: 12000,
  },
  {
    id: "gyeranjjim",
    nameKo: "계란찜",
    translationEn: "Steamed Egg",
    translationZhTw: "蒸蛋",
    description: "A soft, savory steamed egg custard served bubbling hot.",
    descriptionZhTw: "柔軟鹹香的韓式蒸蛋，通常熱騰騰上桌。",
    spiceLevel: 0,
    allergens: ["egg"],
    howToEat: "Spoon it out directly from the hot stone bowl.",
    priceKrw: 6000,
  },
];
