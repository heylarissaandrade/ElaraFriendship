import React from "react";
import { Pressable, Text } from "react-native";

export function PulsingButton(props: any) {
  return (
    <Pressable {...props}>
      <Text>{props.children}</Text>
    </Pressable>
  );
}

export default PulsingButton;
