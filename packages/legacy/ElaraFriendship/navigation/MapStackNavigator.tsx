import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MapScreen from "@/screens/MapScreen";
import { useTheme } from "@shared/hooks/useTheme";
import { getCommonScreenOptions } from "@shared/navigation/screenOptions";

export type MapStackParamList = {
  Map: undefined;
};

const Stack = createNativeStackNavigator<MapStackParamList>();

export default function MapStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{
          headerTitle: "Perto de Ti",
        }}
      />
    </Stack.Navigator>
  );
}
