import LegacyApp from "@elara/legacy";
import { NavigationIndependentTree } from "@react-navigation/native";

export default function Page() {
  return (
    <NavigationIndependentTree>
      <LegacyApp />
    </NavigationIndependentTree>
  );
}
