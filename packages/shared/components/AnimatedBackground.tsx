import React from "react";
import { View } from "react-native";

export function AnimatedBackground(props: { children?: React.ReactNode }) {
  return <View style={{ flex: 1 }}>{props.children}</View>;
}

export default AnimatedBackground;
