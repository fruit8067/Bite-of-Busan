// App UI chrome strings (buttons/labels/hints/errors) — NOT the AI-translated
// menu item content, which already comes from the backend in en/zh-TW.
// See docs/PRODUCT.md "지금 증분 #1": every screen's UI text must follow the
// language chosen at onboarding. Exception (also enforced here by simply never
// keying it through `t()`): the Korean sentence on the back of the order card
// is always Korean, regardless of this language.
export type UiLanguage = "en" | "zh-TW";

export const UI_LANGUAGES: { code: UiLanguage; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh-TW", label: "繁體中文" },
];

const en = {
  "onboarding.title": "Choose your language",
  "onboarding.subtitle": "You can change this later in settings.",
  "brand.subtitle": "Point, scan, and order like a local",
  "mode.eat": "Eat",
  "mode.speak": "Speak",
  "scan.topbarLabel": "Scan the menu",
  "scan.liveBackend": "live backend",
  "scan.hintChosen": "{fileName} selected",
  "scan.hintEmpty": "Line up the menu in the frame, then choose a photo",
  "scan.actionCamera": "Take Photo",
  "scan.actionGallery": "Gallery",
  "scan.retake": "✕ Retake",
  "scan.analyzing": "Analyzing...",
  "scan.analyze": "Analyze",
  "scan.errorCameraPermission": "Camera permission is needed to scan a menu.",
  "scan.errorGalleryPermission":
    "Photo library permission is needed to pick a menu photo.",
  "scan.errorImageUnreadable":
    "I can show this image, but couldn't read it for upload. Try another JPG or PNG.",
  "scan.errorChooseImageFirst": "Choose a JPG or PNG menu photo first.",
  "scan.errorNetwork": "Couldn't reach the backend. Check the server and try again.",
  "order.backToScan": "‹ Retake",
  "order.topbarLabel": "Scan Results",
  "order.allergyShow": "AI allergy estimate",
  "order.allergyHide": "Hide allergy info",
  "order.lessSpicy": "Less spicy",
  "order.howToEatLabel": "How to eat",
  "order.selectedCount": "{count} selected",
  "order.makeCard": "Create Order Card",
  "order.priceNotListed": "Price not listed",
  "order.restaurantNamed": "{name}'s menu",
  "order.restaurantUnnamed": "This restaurant's menu",
  "order.spiceNone": "Not spicy",
  "order.spiceMild": "Mild",
  "order.spiceMedium": "Medium",
  "order.spiceHot": "Hot",
  "orderCard.topbarLabel": "Order Card",
  "orderCard.staffLabel": "TO. STAFF",
  "orderCard.title": "Here is my order",
  "orderCard.flipShow": "Show staff ↻",
  "orderCard.flipHide": "Back to my view",
  "orderCard.editMenu": "Edit menu",
  "orderCard.lessSpicyNote": "Less spicy, please",
  "allergen.askStaff": "ASK THE STAFF",
  "allergen.explain":
    '"Does this contain peanuts?" — show this screen to staff and tap their answer.',
  "allergen.yes": "예 (Yes)",
  "allergen.no": "아니오 (No)",
  "allergen.pork": "Pork",
  "allergen.shellfish": "Shellfish",
  "allergen.wheat": "Wheat/Gluten",
  "allergen.dairy": "Dairy",
  "allergen.peanut": "Peanut",
  "allergen.soy": "Soy",
  "allergen.egg": "Egg",
  "allergen.buckwheat": "Buckwheat",
};

const zhTW: typeof en = {
  "onboarding.title": "選擇語言",
  "onboarding.subtitle": "之後可以在設定中變更。",
  "brand.subtitle": "拍照、掃描,像當地人一樣點餐",
  "mode.eat": "吃",
  "mode.speak": "說",
  "scan.topbarLabel": "掃描菜單",
  "scan.liveBackend": "即時連線",
  "scan.hintChosen": "已選擇 {fileName}",
  "scan.hintEmpty": "將菜單對準框內,然後選擇照片",
  "scan.actionCamera": "拍照",
  "scan.actionGallery": "相簿",
  "scan.retake": "✕ 重新拍攝",
  "scan.analyzing": "分析中...",
  "scan.analyze": "開始分析",
  "scan.errorCameraPermission": "需要相機權限才能掃描菜單。",
  "scan.errorGalleryPermission": "需要相簿權限才能選擇菜單照片。",
  "scan.errorImageUnreadable":
    "可以顯示這張照片,但無法讀取上傳。請換一張 JPG 或 PNG 照片。",
  "scan.errorChooseImageFirst": "請先選擇一張 JPG 或 PNG 菜單照片。",
  "scan.errorNetwork": "無法連上伺服器,請確認後再試一次。",
  "order.backToScan": "‹ 重新拍攝",
  "order.topbarLabel": "分析結果",
  "order.allergyShow": "AI 過敏原推測",
  "order.allergyHide": "隱藏過敏原資訊",
  "order.lessSpicy": "少辣",
  "order.howToEatLabel": "吃法",
  "order.selectedCount": "已選 {count} 項",
  "order.makeCard": "建立點餐卡",
  "order.priceNotListed": "未標示價格",
  "order.restaurantNamed": "{name}的菜單",
  "order.restaurantUnnamed": "這間店的菜單",
  "order.spiceNone": "不辣",
  "order.spiceMild": "微辣",
  "order.spiceMedium": "中辣",
  "order.spiceHot": "大辣",
  "orderCard.topbarLabel": "點餐卡",
  "orderCard.staffLabel": "TO. 老闆",
  "orderCard.title": "我要這樣點餐",
  "orderCard.flipShow": "拿給老闆看 ↻",
  "orderCard.flipHide": "回到我的畫面",
  "orderCard.editMenu": "編輯菜單",
  "orderCard.lessSpicyNote": "麻煩少辣一點",
  "allergen.askStaff": "請店員確認",
  "allergen.explain": "「裡面有花生嗎?」— 把這個畫面拿給店員看,請他點選答案。",
  "allergen.yes": "예 (是)",
  "allergen.no": "아니오 (否)",
  "allergen.pork": "豬肉",
  "allergen.shellfish": "甲殼類",
  "allergen.wheat": "小麥/麩質",
  "allergen.dairy": "乳製品",
  "allergen.peanut": "花生",
  "allergen.soy": "黃豆",
  "allergen.egg": "雞蛋",
  "allergen.buckwheat": "蕎麥",
};

export const STRINGS: Record<UiLanguage, typeof en> = {
  en,
  "zh-TW": zhTW,
};

export type StringKey = keyof typeof en;

export function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template
  );
}

// For places that need a specific language's copy rather than the app-wide
// chosen UI language — e.g. the order card front side, which follows its own
// per-card content-language toggle (docs/PRODUCT.md "지금 증분 #1" only
// requires app *chrome* to follow the onboarding language; content the
// tourist deliberately toggles stays independent).
export function translate(
  lang: UiLanguage,
  key: StringKey,
  vars?: Record<string, string | number>
): string {
  return interpolate(STRINGS[lang][key], vars);
}
