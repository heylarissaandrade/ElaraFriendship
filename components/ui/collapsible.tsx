import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { View, ViewProps } from 'react-native';

type Props = ViewProps & { collapsed?: boolean; title?: string }

export const Collapsible: React.FC<Props> = ({ children, title, ...rest }) => {
  return (
    <View {...rest}>
      {title ? <ThemedText type="defaultSemiBold">{title}</ThemedText> : null}
      {children}
    </View>
  )
}

export default Collapsible
