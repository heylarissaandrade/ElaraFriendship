import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import UserProfileScreen from "@/screens/UserProfileScreen";
import EditProfileScreen from "@/screens/EditProfileScreen";
import PrivacySecurityScreen from "@/screens/PrivacySecurityScreen";
import HelpCenterScreen from "@/screens/HelpCenterScreen";
import FeedbackScreen from "@/screens/FeedbackScreen";
import { useTheme } from "@shared/hooks/useTheme";
import { getCommonScreenOptions } from "@shared/navigation/screenOptions";

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  PrivacySecurity: undefined;
  HelpCenter: undefined;
  Feedback: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Profile"
        component={UserProfileScreen}
        options={{
          headerTitle: "Meu Perfil",
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerTitle: "Editar Perfil",
        }}
      />
      <Stack.Screen
        name="PrivacySecurity"
        component={PrivacySecurityScreen}
        options={{
          headerTitle: "Privacidade e Seguranca",
        }}
      />
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{
          headerTitle: "Centro de Ajuda",
        }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          headerTitle: "Enviar Feedback",
        }}
      />
    </Stack.Navigator>
  );
}
