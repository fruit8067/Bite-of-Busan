import { openai } from "../config/openai";

export interface ScannedMenuItem {
  nameKo: string;
  spiceLevel: number | null; // 0-3, null if not applicable/unknown
  allergens: string[];
  howToEat: string | null;
  priceKrw: number | null; // KRW price as printed on the menu, null if not visible
  translations: {
    en: { name: string; description: string | null };
    "zh-TW": { name: string; description: string | null };
  };
}

export interface MenuScanResult {
  restaurantName: string | null;
  items: ScannedMenuItem[];
}

const SYSTEM_PROMPT = `You read Korean restaurant menu photos for foreign tourists in Busan.
First, look for the restaurant's name/sign visible in the photo (storefront sign, receipt header,
menu letterhead, etc.) — return it as restaurantName, or null if no name is visible anywhere in
the photo.
Then extract every distinct menu item you can read. For each item return:
- nameKo: the name exactly as printed on the menu (Korean)
- spiceLevel: integer 0-3 (0 = not spicy, 3 = very spicy), or null if not food / unknown
- allergens: array of allergen strings in English (e.g. "shellfish", "peanuts"), [] if none/unknown
- howToEat: a short English tip on how to eat/order the dish, or null if not applicable
- priceKrw: the price in Korean won as a plain integer (e.g. 12000 for "12,000원"), or null if no
  price is printed next to this item
- translations.en: { name, description } in English
- translations["zh-TW"]: { name, description } in Traditional Chinese

Respond with ONLY a JSON object of the shape:
{ "restaurantName": string|null,
  "items": [ { "nameKo": string, "spiceLevel": number|null, "allergens": string[], "howToEat": string|null,
  "priceKrw": number|null,
  "translations": { "en": { "name": string, "description": string|null }, "zh-TW": { "name": string, "description": string|null } } } ] }`;

export async function scanMenuImage(input: {
  imageBase64?: string;
  imageUrl?: string;
}): Promise<MenuScanResult> {
  const imageUrl = input.imageUrl ?? `data:image/jpeg;base64,${input.imageBase64}`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract the restaurant name (if visible) and the menu items from this photo." },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("empty response from OpenAI");

  const parsed = JSON.parse(raw) as { restaurantName?: string | null; items?: ScannedMenuItem[] };
  return { restaurantName: parsed.restaurantName ?? null, items: parsed.items ?? [] };
}
