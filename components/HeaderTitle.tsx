import React from "react";
import { Text } from "react-native";

export function HeaderTitle({ children }: { children?: React.ReactNode }) {
  return <Text>{children}</Text>;
}

export default HeaderTitle;
