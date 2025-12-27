import { NavigationIndependentTree } from "@react-navigation/native";
import LegacyApp from "@elara/legacy";

export default function Page() {
  return (
    <NavigationIndependentTree>
      <LegacyApp />
    </NavigationIndependentTree>
  );
}
