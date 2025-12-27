import React from "react";
import { View } from "react-native";

export default function Spacer({ height = 8 }: { height?: number }) {
  return <View style={{ height }} />;
}
