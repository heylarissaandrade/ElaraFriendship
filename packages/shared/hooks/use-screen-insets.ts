import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useScreenInsets() {
  return useSafeAreaInsets();
}

export default useScreenInsets;
