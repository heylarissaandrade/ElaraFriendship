import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, I18nManager, StyleSheet, View } from "react-native";

import { ElaraColors } from "@/constants/theme";
import {
  changeLanguage,
  getCurrentLanguage,
  initI18n,
  SUPPORTED_LANGUAGES,
} from "@/localization/i18n";

type LanguageContextType = {
  currentLanguage: string;
  isReady: boolean;
  isRTL: boolean;
  setLanguage: (code: string) => Promise<void>;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");

  // garante que o react-i18next usa o mesmo i18n
  useTranslation();

  useEffect(() => {
    const boot = async () => {
      await initI18n();
      const lang = getCurrentLanguage();
      setCurrentLanguage(lang);
      setIsReady(true);
    };

    boot();
  }, []);

  const setLanguage = async (code: string) => {
    await changeLanguage(code);
    setCurrentLanguage(code);

    const rtl = code === "ar";
    if (I18nManager.isRTL !== rtl) {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
      // Nota: em alguns casos isto só aplica após reiniciar a app.
    }
  };

  const value = useMemo<LanguageContextType>(() => {
    const rtl = currentLanguage === "ar";
    return {
      currentLanguage,
      isReady,
      isRTL: rtl,
      setLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
    };
  }, [currentLanguage, isReady]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ElaraColors.primary} />
      </View>
    );
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F2FF",
  },
});
