import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Text, View } from "react-native";
import MainTabNavigator from "./MainTabNavigator";

export type RootStackParamList = {
  Main: undefined;
  WalkTogetherModal: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function WalkTogetherModal() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Walk Together (placeholder)</Text>
    </View>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="WalkTogetherModal" component={WalkTogetherModal} options={{ presentation: "modal" }} />
    </Stack.Navigator>
  );
}
