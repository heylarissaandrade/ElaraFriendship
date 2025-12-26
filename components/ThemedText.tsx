import React from "react";
import { Text, TextProps } from "react-native";

export type ThemedTextProps = TextProps & { type?: string };

export function ThemedText(props: any) {
  const { children, style, ...rest } = props;
  return (
    <Text {...rest} style={style}>
      {children}
    </Text>
  );
}

export default ThemedText;
