import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { MatchesProvider } from "./contexts/MatchesContext";
import i18n from "./localization/i18n";
import RootNavigator from "./navigation/RootNavigator";

export default function LegacyApp() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <SafeAreaProvider>
            <GestureHandlerRootView style={styles.root}>
              <KeyboardProvider>
                <AuthProvider>
                  <MatchesProvider>
                    <NavigationContainer>
                      <RootNavigator />
                    </NavigationContainer>
                  </MatchesProvider>
                </AuthProvider>
                <StatusBar style="auto" />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </LanguageProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
