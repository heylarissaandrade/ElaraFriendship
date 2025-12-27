import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DiscoverScreen from "@/screens/DiscoverScreen";
import { HeaderTitle } from "@shared/components/HeaderTitle";
import { useTheme } from "@shared/hooks/useTheme";
import { getCommonScreenOptions } from "@shared/navigation/screenOptions";

export type DiscoverStackParamList = {
  Discover: undefined;
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Elara" />,
        }}
      />
    </Stack.Navigator>
  );
}
