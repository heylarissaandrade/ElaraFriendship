import React from 'react'
import { GestureResponderEvent, TouchableOpacity, ViewStyle } from 'react-native'

type Props = {
  onPress?: (e: GestureResponderEvent) => void
  style?: ViewStyle
  children?: React.ReactNode
}

export const HapticTab: React.FC<Props> = ({ onPress, style, children }) => {
  return (
    <TouchableOpacity onPress={onPress} style={style} accessibilityRole="button">
      {children}
    </TouchableOpacity>
  )
}

export default HapticTab
