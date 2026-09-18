export type CurrencyCode = "KRW" | "TWD" | "JPY" | "CNY" | "USD";

interface RateConfig {
  symbol: string;
  rate: number; // KRW per 1 unit of this currency
  decimals: number;
}

// Fixed demo exchange rate table — not live rates. Matches the teammate demo
// (claude.ai/artifact/PrTZ9BbUidr8NrPZhZQTem)'s `RATES` object exactly, per
// docs/PRODUCT.md "지금 증분". Client-side only; no backend FX API for v1.
export const RATES: Record<CurrencyCode, RateConfig> = {
  KRW: { symbol: "₩", rate: 1, decimals: 0 },
  TWD: { symbol: "NT$", rate: 44, decimals: 0 },
  JPY: { symbol: "¥", rate: 9.3, decimals: 0 },
  CNY: { symbol: "CN¥", rate: 192, decimals: 0 },
  USD: { symbol: "$", rate: 1390, decimals: 2 },
};

export const CURRENCIES: { code: CurrencyCode; label: string }[] = [
  { code: "KRW", label: "₩ KRW" },
  { code: "TWD", label: "NT$ TWD" },
  { code: "JPY", label: "¥ JPY" },
  { code: "CNY", label: "CN¥ CNY" },
  { code: "USD", label: "$ USD" },
];

export function formatPrice(
  priceKrw: number | null,
  currency: CurrencyCode,
  notListedText = "Price not listed"
): string {
  if (priceKrw == null) return notListedText;
  if (currency === "KRW") {
    return `₩${priceKrw.toLocaleString()}`;
  }
  const { symbol, rate, decimals } = RATES[currency];
  const converted = priceKrw / rate;
  const convertedStr = converted.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${convertedStr}`;
}

export function krwSubLabel(priceKrw: number | null): string | null {
  if (priceKrw == null) return null;
  return `₩${priceKrw.toLocaleString()}`;
}
