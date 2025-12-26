import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

export const useThemeColor = (colorParam: any, fallback: string = ''): string => {
  const scheme = useColorScheme()
  if (!colorParam) return fallback

  // if string that matches a Colors key
  if (typeof colorParam === 'string') {
    if ((Colors as any)[colorParam]) return (Colors as any)[colorParam]
    return colorParam
  }

  // if object with light/dark
  if (typeof colorParam === 'object') {
    const val = scheme === 'dark' ? colorParam.dark ?? colorParam.light : colorParam.light ?? colorParam.dark
    if (typeof val === 'string') return (Colors as any)[val] ?? val
  }

  return fallback
}

export default useThemeColor
