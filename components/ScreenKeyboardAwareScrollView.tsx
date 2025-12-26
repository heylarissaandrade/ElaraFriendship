import React from "react";
import { ScrollView, ScrollViewProps } from "react-native";

export function ScreenKeyboardAwareScrollView(props: ScrollViewProps) {
  return <ScrollView {...props} />;
}

export default ScreenKeyboardAwareScrollView;
