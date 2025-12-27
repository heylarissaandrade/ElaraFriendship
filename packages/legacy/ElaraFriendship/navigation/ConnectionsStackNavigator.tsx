import React from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ConnectionsScreen from "@/screens/ConnectionsScreen";
import ChatScreen from "@/screens/ChatScreen";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useMatches } from "@/contexts/MatchesContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { ElaraColors, Spacing } from "@/constants/theme";

export type ConnectionsStackParamList = {
  ConnectionsList: undefined;
  Chat: { connectionId: string; matchName: string };
};

const Stack = createNativeStackNavigator<ConnectionsStackParamList>();

const AVATAR_COLORS = [
  "#9B7DFF", "#B49CFF", "#7B5CE6", "#2FD6C5",
  "#F26B7A", "#FF9770", "#4ECDC4", "#FFE66D",
];

function getAvatarColor(id: string) {
  return AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];
}

function ChatHeaderTitle({ connectionId, matchName }: { connectionId: string; matchName: string }) {
  const { connections } = useMatches();
  const connection = connections.find(c => c.id === connectionId);
  const match = connection?.match;
  const avatarColor = match ? getAvatarColor(match.id) : ElaraColors.primary;
  const initials = matchName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <View style={headerStyles.container}>
      <View style={[headerStyles.avatar, { backgroundColor: avatarColor }]}>
        <ThemedText style={headerStyles.initials}>{initials}</ThemedText>
      </View>
      <View style={headerStyles.info}>
        <ThemedText type="body" style={headerStyles.name}>{matchName}</ThemedText>
        {match?.isVerified && (
          <View style={headerStyles.verifiedRow}>
            <View style={headerStyles.verifiedBadge}>
              <ThemedText style={headerStyles.verifiedText}>Verificada</ThemedText>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  info: {
    marginLeft: Spacing.sm,
  },
  name: {
    fontWeight: "600",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: ElaraColors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default function ConnectionsStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="ConnectionsList"
        component={ConnectionsScreen}
        options={{
          headerTitle: "Conexões",
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          headerTitle: () => (
            <ChatHeaderTitle 
              connectionId={route.params.connectionId} 
              matchName={route.params.matchName} 
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
}
