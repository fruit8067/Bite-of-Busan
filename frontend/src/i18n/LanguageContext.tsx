import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { interpolate, STRINGS, StringKey, UiLanguage } from "./strings";

const STORAGE_KEY = "busanbite.uiLanguage";

interface LanguageState {
  // null = not chosen yet, undefined-equivalent while `ready` is false
  language: UiLanguage | null;
  ready: boolean;
  setLanguage: (lang: UiLanguage) => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageState | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<UiLanguage | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === "en" || stored === "zh-TW" || stored === "ja" || stored === "es") {
          setLanguageState(stored);
        }
      })
      .finally(() => setReady(true));
  }, []);

  const setLanguage = (lang: UiLanguage) => {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {
      // Non-fatal — the choice still applies for this session.
    });
  };

  const t = useMemo(() => {
    const dict = STRINGS[language ?? "en"];
    return (key: StringKey, vars?: Record<string, string | number>) =>
      interpolate(dict[key], vars);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, ready, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
