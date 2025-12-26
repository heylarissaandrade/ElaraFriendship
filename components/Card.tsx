import React from "react";
import { View } from "react-native";

export function Card({ children }: { children?: React.ReactNode }) {
  return <View>{children}</View>;
}

export default Card;
