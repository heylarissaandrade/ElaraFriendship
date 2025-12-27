import React from 'react'
import { Text, TextProps, TextStyle } from 'react-native'

type ThemedTypes = 'title' | 'subtitle' | 'default' | 'defaultSemiBold' | 'link'

type Props = TextProps & { type?: ThemedTypes }

export const ThemedText: React.FC<Props> = ({ type, style, children, ...rest }) => {
  const typeStyle: TextStyle = {}
  if (type === 'title') typeStyle.fontSize = 20
  if (type === 'subtitle') typeStyle.fontSize = 16
  if (type === 'defaultSemiBold') typeStyle.fontWeight = '600'
  if (type === 'link') typeStyle.color = '#007AFF'

  return (
    <Text {...rest} style={[typeStyle, style]}>
      {children}
    </Text>
  )
}

export default ThemedText
