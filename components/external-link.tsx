import React from 'react'
import { Text, TextProps } from 'react-native'

export const ExternalLink: React.FC<TextProps & { href?: string }> = ({ children, ...rest }) => {
  return <Text {...rest}>{children}</Text>
}

export default ExternalLink
