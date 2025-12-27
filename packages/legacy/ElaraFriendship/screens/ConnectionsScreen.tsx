import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@shared/components/themed-view";
import { ThemedText } from "@shared/components/themed-text";
import Spacer from "@/components/Spacer";
import { useTheme } from "@shared/hooks/useTheme";
import { useMatches, Connection } from "@shared/contexts/MatchesContext";
import { useScreenInsets } from "@shared/hooks/use-screen-insets";
import { Spacing, BorderRadius, ElaraColors, Shadows } from "@shared/constants/theme";

type ConnectionsStackParamList = {
  ConnectionsList: undefined;
  Chat: { connectionId: string; matchName: string };
};

type ConnectionsScreenProps = {
  navigation: NativeStackNavigationProp<ConnectionsStackParamList, "ConnectionsList">;
};

type TabType = "chats" | "requests";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ConnectionItem({
  item,
  onPress,
  index,
}: {
  item: Connection;
  onPress: () => void;
  index: number;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Agora";
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
  };

  const isTracking = item.meetupTracking?.isActive || false;
  const safetyFlag = item.safetyFlag;

  const getSafetyBadgeColor = () => {
    switch (safetyFlag) {
      case "ok": return ElaraColors.safety;
      case "incomodo": return ElaraColors.warning;
      case "alerta": return ElaraColors.danger;
      default: return null;
    }
  };

  const safetyBadgeColor = getSafetyBadgeColor();

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      entering={FadeInDown.delay(index * 80).springify()}
      style={[
        styles.connectionItem,
        { backgroundColor: theme.backgroundDefault },
        isTracking && { borderLeftWidth: 3, borderLeftColor: ElaraColors.safety },
        animatedStyle,
      ]}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: ElaraColors.primary + "25" }]}>
          <ThemedText type="h4" style={{ color: ElaraColors.primary }}>
            {getInitials(item.match.name)}
          </ThemedText>
        </View>
        {isTracking ? (
          <Animated.View
            entering={ZoomIn}
            style={[styles.trackingIndicator, { backgroundColor: ElaraColors.safety }]}
          >
            <Feather name="shield" size={10} color="#FFFFFF" />
          </Animated.View>
        ) : safetyBadgeColor ? (
          <View style={[styles.safetyIndicator, { backgroundColor: safetyBadgeColor }]}>
            <Feather
              name={safetyFlag === "ok" ? "check" : safetyFlag === "incomodo" ? "minus" : "alert-triangle"}
              size={8}
              color="#FFFFFF"
            />
          </View>
        ) : null}
      </View>
      <View style={styles.connectionInfo}>
        <View style={styles.connectionHeader}>
          <View style={styles.nameRow}>
            <ThemedText type="h4">{item.match.name}</ThemedText>
            {item.match.isVerified && (
              <View style={[styles.verifiedMini, { backgroundColor: ElaraColors.safety }]}>
                <Feather name="shield" size={8} color="#FFFFFF" />
              </View>
            )}
            {item.match.reliabilityScore !== undefined && item.match.reliabilityScore >= 85 && (
              <View style={[styles.reliabilityMini]}>
                <ThemedText type="small" style={styles.reliabilityText}>
                  {item.match.reliabilityScore}%
                </ThemedText>
              </View>
            )}
            {item.match.completedMeetupsCount !== undefined && item.match.completedMeetupsCount > 0 && (
              <View style={[styles.meetupsMini]}>
                <Feather name="coffee" size={8} color="#8B4513" />
                <ThemedText type="small" style={styles.meetupsText}>
                  {item.match.completedMeetupsCount}
                </ThemedText>
              </View>
            )}
            {isTracking && (
              <View style={[styles.trackingBadge, { backgroundColor: ElaraColors.safety + "20" }]}>
                <ThemedText type="small" style={{ color: ElaraColors.safety, fontSize: 10 }}>
                  A caminho
                </ThemedText>
              </View>
            )}
          </View>
          {item.lastMessageTime && (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {formatTime(item.lastMessageTime)}
            </ThemedText>
          )}
        </View>
        {item.lastMessage ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
            {item.lastMessage}
          </ThemedText>
        ) : (
          <ThemedText type="small" style={{ color: ElaraColors.primary }}>
            Nova conexão - diz olá!
          </ThemedText>
        )}
      </View>
      {item.unreadCount > 0 && (
        <Animated.View
          entering={ZoomIn.springify()}
          style={[styles.unreadBadge, { backgroundColor: ElaraColors.primary }]}
        >
          <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
            {item.unreadCount}
          </ThemedText>
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

function RequestItem({
  item,
  onAccept,
  onDecline,
  index,
}: {
  item: Connection;
  onAccept: () => void;
  onDecline: () => void;
  index: number;
}) {
  const { theme } = useTheme();
  const acceptScale = useSharedValue(1);
  const declineScale = useSharedValue(1);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAcceptPress = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    acceptScale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1)
    );
    onAccept();
  };

  const handleDeclinePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    declineScale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1)
    );
    onDecline();
  };

  const acceptStyle = useAnimatedStyle(() => ({
    transform: [{ scale: acceptScale.value }],
  }));

  const declineStyle = useAnimatedStyle(() => ({
    transform: [{ scale: declineScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={[styles.requestItem, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={[styles.avatar, { backgroundColor: ElaraColors.primary + "25" }]}>
        <ThemedText type="h4" style={{ color: ElaraColors.primary }}>
          {getInitials(item.match.name)}
        </ThemedText>
      </View>
      <View style={styles.requestInfo}>
        <ThemedText type="h4">{item.match.name}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Quer conectar contigo
        </ThemedText>
      </View>
      <View style={styles.requestActions}>
        <AnimatedPressable
          onPress={handleDeclinePress}
          style={[
            styles.requestButton,
            { backgroundColor: theme.backgroundSecondary },
            declineStyle,
          ]}
        >
          <Feather name="x" size={20} color={theme.text} />
        </AnimatedPressable>
        <AnimatedPressable
          onPress={handleAcceptPress}
          style={[
            styles.requestButton,
            { backgroundColor: ElaraColors.primary },
            acceptStyle,
          ]}
        >
          <Feather name="check" size={20} color="#FFFFFF" />
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
}

export default function ConnectionsScreen({ navigation }: ConnectionsScreenProps) {
  const { theme } = useTheme();
  const { paddingTop, paddingBottom } = useScreenInsets();
  const { connections, acceptConnection, declineConnection } = useMatches();
  const [activeTab, setActiveTab] = useState<TabType>("chats");

  const acceptedConnections = connections.filter((c) => c.status === "accepted");
  const pendingConnections = connections.filter((c) => c.status === "pending");

  const handleTabChange = (tab: TabType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Animated.View
        entering={ZoomIn.springify()}
        style={[styles.emptyIcon, { backgroundColor: ElaraColors.primary + "15" }]}
      >
        <Feather
          name={activeTab === "chats" ? "message-circle" : "user-plus"}
          size={48}
          color={ElaraColors.primary}
        />
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(200)}>
        <ThemedText type="h4" style={styles.emptyTitle}>
          {activeTab === "chats" ? "Sem conversas ainda" : "Sem pedidos pendentes"}
        </ThemedText>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(400)}>
        <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
          {activeTab === "chats"
            ? "Conecta-te com outras mulheres na secção Descobrir para começar a conversar."
            : "Quando alguém quiser conectar contigo, aparecerá aqui."}
        </ThemedText>
      </Animated.View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        entering={FadeInDown.delay(100)}
        style={[styles.tabsContainer, { backgroundColor: theme.backgroundSecondary }]}
      >
        <Pressable
          onPress={() => handleTabChange("chats")}
          style={[
            styles.tab,
            activeTab === "chats" && { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText
            type="body"
            style={[
              styles.tabText,
              { color: activeTab === "chats" ? theme.text : theme.textSecondary },
            ]}
          >
            Conversas
          </ThemedText>
          {acceptedConnections.length > 0 && (
            <Animated.View
              entering={ZoomIn}
              style={[styles.tabBadge, { backgroundColor: ElaraColors.primary }]}
            >
              <ThemedText type="small" style={{ color: "#FFFFFF", fontSize: 11 }}>
                {acceptedConnections.length}
              </ThemedText>
            </Animated.View>
          )}
        </Pressable>
        <Pressable
          onPress={() => handleTabChange("requests")}
          style={[
            styles.tab,
            activeTab === "requests" && { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText
            type="body"
            style={[
              styles.tabText,
              { color: activeTab === "requests" ? theme.text : theme.textSecondary },
            ]}
          >
            Pedidos
          </ThemedText>
          {pendingConnections.length > 0 && (
            <Animated.View
              entering={ZoomIn}
              style={[styles.tabBadge, { backgroundColor: ElaraColors.accentCoral }]}
            >
              <ThemedText type="small" style={{ color: "#FFFFFF", fontSize: 11 }}>
                {pendingConnections.length}
              </ThemedText>
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>

      <FlatList
        data={activeTab === "chats" ? acceptedConnections : pendingConnections}
        renderItem={({ item, index }) =>
          activeTab === "chats" ? (
            <ConnectionItem
              item={item}
              onPress={() => navigation.navigate("Chat", { connectionId: item.id, matchName: item.match.name })}
              index={index}
            />
          ) : (
            <RequestItem
              item={item}
              onAccept={() => acceptConnection(item.id)}
              onDecline={() => declineConnection(item.id)}
              index={index}
            />
          )
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop, paddingBottom },
          (activeTab === "chats" ? acceptedConnections : pendingConnections).length === 0 &&
            styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <Spacer height={Spacing.sm} />}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  tabText: {
    fontWeight: "600",
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
  },
  connectionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    ...Shadows.card,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  connectionInfo: {
    flex: 1,
  },
  connectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  avatarContainer: {
    position: "relative",
  },
  trackingIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  safetyIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  trackingBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  verifiedMini: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  reliabilityMini: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: "rgba(255,193,7,0.2)",
  },
  reliabilityText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#D4A200",
  },
  meetupsMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: "rgba(139,69,19,0.15)",
  },
  meetupsText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#8B4513",
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xs,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    ...Shadows.card,
  },
  requestInfo: {
    flex: 1,
  },
  requestActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  requestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 22,
  },
});
