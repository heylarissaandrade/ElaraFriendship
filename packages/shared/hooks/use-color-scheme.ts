import { useColorScheme as rnUseColorScheme } from 'react-native'

export const useColorScheme = () => {
  return rnUseColorScheme() || 'light'
}

export default useColorScheme
