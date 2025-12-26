import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Pressable,
  Modal,
  Linking,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useMatches, UserMatch } from "@/contexts/MatchesContext";
import { Spacing, BorderRadius, ElaraColors, Shadows } from "@/constants/theme";

let MapView: any = null;
let Marker: any = null;
let Callout: any = null;

try {
  const RNMaps = require("react-native-maps");
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
  Callout = RNMaps.Callout;
} catch (e) {
  MapView = null;
}

const LISBON_CENTER = { latitude: 38.7223, longitude: -9.1393 };

const AVATAR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF",
  "#DDA0DD", "#87CEEB", "#F4A460", "#98D8C8",
];

function getAvatarColor(id: string) {
  const index = parseInt(id, 10) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function UserMarkerCallout({ user }: { user: UserMatch }) {
  const { theme } = useTheme();
  const color = getAvatarColor(user.id);
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <View style={[styles.calloutContainer, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.calloutHeader}>
        <View style={[styles.calloutAvatar, { backgroundColor: color }]}>
          <ThemedText style={styles.calloutAvatarText}>{initials}</ThemedText>
        </View>
        <View style={styles.calloutInfo}>
          <ThemedText type="h4" style={styles.calloutName}>{user.name}, {user.age}</ThemedText>
          <View style={styles.calloutCompatibility}>
            <Feather name="heart" size={12} color={ElaraColors.primary} />
            <ThemedText type="small" style={{ color: ElaraColors.primary, fontWeight: "600" }}>
              {user.compatibilityScore}% compativel
            </ThemedText>
          </View>
        </View>
      </View>
      <ThemedText type="small" style={[styles.calloutBio, { color: theme.textSecondary }]} numberOfLines={2}>
        {user.bio}
      </ThemedText>
      <View style={styles.calloutTags}>
        {user.hobbies.slice(0, 2).map(hobby => (
          <View key={hobby} style={[styles.calloutTag, { backgroundColor: ElaraColors.primary + "15" }]}>
            <ThemedText type="small" style={{ color: ElaraColors.primary, fontSize: 10 }}>{hobby}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

function UserProfileModal({ 
  user, 
  visible, 
  onClose,
  onConnect 
}: { 
  user: UserMatch | null; 
  visible: boolean; 
  onClose: () => void;
  onConnect: () => void;
}) {
  const { theme } = useTheme();
  
  if (!user) return null;
  
  const color = getAvatarColor(user.id);
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]} onPress={() => {}}>
          <View style={styles.modalHandle} />
          
          <Animated.View entering={ZoomIn.springify()} style={[styles.modalAvatar, { backgroundColor: color }]}>
            <ThemedText style={styles.modalAvatarText}>{initials}</ThemedText>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(100)}>
            <ThemedText type="h2" style={styles.modalName}>{user.name}, {user.age}</ThemedText>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(150)} style={styles.modalCompatRow}>
            <Feather name="heart" size={16} color={ElaraColors.primary} />
            <ThemedText type="body" style={{ color: ElaraColors.primary, fontWeight: "600" }}>
              {user.compatibilityScore}% compativel
            </ThemedText>
            {user.distance !== undefined && (
              <>
                <View style={styles.modalDot} />
                <Feather name="map-pin" size={14} color={theme.textSecondary} />
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  {user.distance < 1 ? `${Math.round(user.distance * 1000)}m` : `${user.distance.toFixed(1)}km`}
                </ThemedText>
              </>
            )}
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(200)}>
            <ThemedText type="body" style={[styles.modalBio, { color: theme.textSecondary }]}>
              {user.bio}
            </ThemedText>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(250)} style={styles.modalSection}>
            <ThemedText type="small" style={[styles.modalSectionLabel, { color: theme.textSecondary }]}>
              Valores
            </ThemedText>
            <View style={styles.modalTags}>
              {user.values.map(value => (
                <View key={value} style={[styles.modalTag, { backgroundColor: ElaraColors.primary + "15" }]}>
                  <ThemedText type="small" style={{ color: ElaraColors.primary, fontWeight: "600" }}>{value}</ThemedText>
                </View>
              ))}
            </View>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(300)} style={styles.modalSection}>
            <ThemedText type="small" style={[styles.modalSectionLabel, { color: theme.textSecondary }]}>
              Hobbies
            </ThemedText>
            <View style={styles.modalTags}>
              {user.hobbies.map(hobby => (
                <View key={hobby} style={[styles.modalTag, { backgroundColor: ElaraColors.success + "15" }]}>
                  <ThemedText type="small" style={{ color: ElaraColors.success, fontWeight: "600" }}>{hobby}</ThemedText>
                </View>
              ))}
            </View>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(350)} style={styles.modalActions}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: ElaraColors.primary }]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onConnect();
                onClose();
              }}
            >
              <Feather name="heart" size={20} color="#FFFFFF" />
              <ThemedText style={styles.modalButtonText}>Conectar</ThemedText>
            </Pressable>
            <Pressable style={[styles.modalButtonSecondary, { borderColor: theme.border }]} onPress={onClose}>
              <ThemedText style={[styles.modalButtonSecondaryText, { color: theme.text }]}>Fechar</ThemedText>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function LocationSharingToggle({ 
  isSharing, 
  onToggle, 
  isLoading 
}: { 
  isSharing: boolean; 
  onToggle: () => void;
  isLoading: boolean;
}) {
  const { theme } = useTheme();
  const pulseAnim = useSharedValue(1);
  
  useEffect(() => {
    if (isSharing) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    } else {
      pulseAnim.value = 1;
    }
  }, [isSharing]);
  
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onToggle();
      }}
      style={[
        styles.toggleButton,
        { backgroundColor: isSharing ? ElaraColors.success : theme.backgroundDefault },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={isSharing ? "#FFFFFF" : theme.text} />
      ) : (
        <>
          <Animated.View style={pulseStyle}>
            <Feather 
              name={isSharing ? "eye" : "eye-off"} 
              size={18} 
              color={isSharing ? "#FFFFFF" : theme.textSecondary} 
            />
          </Animated.View>
          <ThemedText 
            type="small" 
            style={{ 
              color: isSharing ? "#FFFFFF" : theme.textSecondary,
              fontWeight: "600",
            }}
          >
            {isSharing ? "Visivel" : "Invisivel"}
          </ThemedText>
        </>
      )}
    </Pressable>
  );
}

function WebUserCard({ user, onPress }: { user: UserMatch; onPress: () => void }) {
  const { theme } = useTheme();
  const color = getAvatarColor(user.id);
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Pressable 
      onPress={onPress}
      style={[styles.webUserCard, { backgroundColor: theme.backgroundSecondary }]}
    >
      <View style={[styles.webUserAvatar, { backgroundColor: color }]}>
        <ThemedText style={styles.webUserAvatarText}>{initials}</ThemedText>
      </View>
      <View style={styles.webUserInfo}>
        <ThemedText type="body" style={{ fontWeight: "600" }}>{user.name}, {user.age}</ThemedText>
        <View style={styles.webUserMeta}>
          <Feather name="heart" size={12} color={ElaraColors.primary} />
          <ThemedText type="small" style={{ color: ElaraColors.primary }}>
            {user.compatibilityScore}%
          </ThemedText>
          {user.distance !== undefined && (
            <>
              <View style={styles.webUserDot} />
              <Feather name="map-pin" size={12} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {user.distance < 1 ? `${Math.round(user.distance * 1000)}m` : `${user.distance.toFixed(1)}km`}
              </ThemedText>
            </>
          )}
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
          {user.bio}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

function WebMapView({ 
  nearbyUsers, 
  onSelectUser,
  isLocationSharing,
  onToggleSharing,
  isLoading,
  onRefresh,
}: { 
  nearbyUsers: UserMatch[];
  onSelectUser: (user: UserMatch) => void;
  isLocationSharing: boolean;
  onToggleSharing: () => void;
  isLoading: boolean;
  onRefresh: () => void;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.webMapContainer, { backgroundColor: "#E8F4E8" }]}>
        <View style={styles.webMapGrid}>
          {[...Array(20)].map((_, i) => (
            <View key={i} style={styles.webMapGridLine} />
          ))}
        </View>
        
        <View style={styles.webMapCenter}>
          <View style={[styles.webMapCenterRing, styles.webMapCenterRing3]} />
          <View style={[styles.webMapCenterRing, styles.webMapCenterRing2]} />
          <View style={[styles.webMapCenterRing, styles.webMapCenterRing1]} />
          <View style={styles.webMapCenterDot}>
            <Feather name="navigation" size={16} color="#fff" />
          </View>
        </View>

        {nearbyUsers.slice(0, 8).map((user, index) => {
          const color = getAvatarColor(user.id);
          const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
          const angle = (index / 8) * 2 * Math.PI;
          const radius = 60 + (index % 3) * 40;
          const left = 50 + Math.cos(angle) * radius / 2;
          const top = 50 + Math.sin(angle) * radius / 2;

          return (
            <Pressable
              key={user.id}
              onPress={() => onSelectUser(user)}
              style={[
                styles.webMapMarker,
                { 
                  backgroundColor: color,
                  left: `${left}%`,
                  top: `${top}%`,
                }
              ]}
            >
              <ThemedText style={styles.webMapMarkerText}>{initials}</ThemedText>
            </Pressable>
          );
        })}

        <View style={[styles.topControls, { top: insets.top + Spacing.md }]}>
          <LocationSharingToggle 
            isSharing={isLocationSharing} 
            onToggle={onToggleSharing}
            isLoading={isLoading}
          />
          <Pressable
            onPress={onRefresh}
            style={[styles.refreshBtn, { backgroundColor: theme.backgroundDefault }]}
          >
            <Feather name="refresh-cw" size={18} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.webUsersList, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.webUsersHeader}>
          <Feather name="users" size={18} color={ElaraColors.primary} />
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {nearbyUsers.length} mulheres por perto
          </ThemedText>
        </View>
        <ScrollView 
          style={{ maxHeight: height * 0.35 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        >
          {nearbyUsers.map(user => (
            <WebUserCard key={user.id} user={user} onPress={() => onSelectUser(user)} />
          ))}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

export default function MapScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);
  const { 
    nearbyUsers, 
    userLocation, 
    isLocationSharing, 
    setUserLocation, 
    setLocationSharing,
    refreshNearbyUsers,
    sendConnectionRequest,
  } = useMatches();

  const [permission, setPermission] = useState<Location.PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserMatch | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      checkPermission();
    }
  }, []);

  const checkPermission = async () => {
    if (Platform.OS === "web") {
      setUserLocation(LISBON_CENTER);
      setLocationSharing(true);
      refreshNearbyUsers();
      return;
    }
    
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermission(status);
    
    if (status === "granted" && isLocationSharing) {
      await getCurrentLocation();
    }
    refreshNearbyUsers();
  };

  const requestPermission = async () => {
    if (Platform.OS === "web") {
      setLocationSharing(true);
      return true;
    }
    
    setIsLoading(true);
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      setPermission(status);
      
      if (status === "granted") {
        await getCurrentLocation();
        return true;
      } else if (status === "denied" && !canAskAgain) {
        try {
          await Linking.openSettings();
        } catch (e) {
          console.log("Could not open settings");
        }
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    if (Platform.OS === "web") {
      setUserLocation(LISBON_CENTER);
      return;
    }
    
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Failed to get location:", error);
      setUserLocation(LISBON_CENTER);
    }
  };

  const handleToggleSharing = async () => {
    if (!isLocationSharing) {
      if (Platform.OS === "web") {
        setLocationSharing(true);
        return;
      }
      if (permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) return;
      } else {
        await getCurrentLocation();
      }
      setLocationSharing(true);
    } else {
      setLocationSharing(false);
    }
  };

  const handleRefresh = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    try {
      if (isLocationSharing && (Platform.OS === "web" || permission === "granted")) {
        await getCurrentLocation();
      }
      refreshNearbyUsers();
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerPress = useCallback((user: UserMatch) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUser(user);
    setShowUserModal(true);
  }, []);

  const handleConnect = useCallback(() => {
    if (selectedUser) {
      sendConnectionRequest(selectedUser.id);
    }
  }, [selectedUser, sendConnectionRequest]);

  const centerOnUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  };

  if (Platform.OS === "web" || !MapView) {
    return (
      <>
        <WebMapView
          nearbyUsers={nearbyUsers}
          onSelectUser={handleMarkerPress}
          isLocationSharing={isLocationSharing}
          onToggleSharing={handleToggleSharing}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
        <UserProfileModal
          user={selectedUser}
          visible={showUserModal}
          onClose={() => setShowUserModal(false)}
          onConnect={handleConnect}
        />
      </>
    );
  }

  const initialRegion = userLocation || LISBON_CENTER;

  return (
    <ThemedView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...initialRegion,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        showsUserLocation={isLocationSharing && permission === "granted"}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {nearbyUsers.map(user => {
          if (!user.location) return null;
          const color = getAvatarColor(user.id);
          const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
          
          return (
            <Marker
              key={user.id}
              coordinate={user.location}
              onPress={() => handleMarkerPress(user)}
            >
              <View style={styles.markerContainer}>
                <View style={[styles.markerOuter, { backgroundColor: color + "40" }]}>
                  <View style={[styles.markerInner, { backgroundColor: color }]}>
                    <ThemedText style={styles.markerInitials}>{initials}</ThemedText>
                  </View>
                </View>
                <View style={[styles.markerArrow, { borderTopColor: color }]} />
              </View>
              {Callout && (
                <Callout tooltip onPress={() => handleMarkerPress(user)}>
                  <UserMarkerCallout user={user} />
                </Callout>
              )}
            </Marker>
          );
        })}
      </MapView>

      <View style={[styles.topControls, { top: insets.top + Spacing.md }]}>
        <LocationSharingToggle 
          isSharing={isLocationSharing} 
          onToggle={handleToggleSharing}
          isLoading={isLoading}
        />
        
        <Pressable
          onPress={handleRefresh}
          style={[styles.refreshBtn, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name="refresh-cw" size={18} color={theme.text} />
        </Pressable>
      </View>

      {isLocationSharing && userLocation && (
        <Pressable
          onPress={centerOnUser}
          style={[styles.centerBtn, { backgroundColor: theme.backgroundDefault, bottom: insets.bottom + 100 }]}
        >
          <Feather name="crosshair" size={20} color={ElaraColors.primary} />
        </Pressable>
      )}

      <View style={[styles.statsBar, { backgroundColor: theme.backgroundDefault, bottom: insets.bottom + 70 }]}>
        <View style={styles.statItem}>
          <Feather name="users" size={16} color={ElaraColors.primary} />
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {nearbyUsers.length}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            mulheres por perto
          </ThemedText>
        </View>
      </View>

      {!isLocationSharing && (
        <Animated.View 
          entering={FadeIn}
          style={[styles.promptCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name="map-pin" size={24} color={ElaraColors.primary} />
          <View style={styles.promptTextContainer}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              Partilha a tua localizacao
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Para ver mulheres perto de ti
            </ThemedText>
          </View>
          <Pressable
            onPress={handleToggleSharing}
            style={[styles.promptButton, { backgroundColor: ElaraColors.primary }]}
          >
            <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>Ativar</ThemedText>
          </Pressable>
        </Animated.View>
      )}

      <UserProfileModal
        user={selectedUser}
        visible={showUserModal}
        onClose={() => setShowUserModal(false)}
        onConnect={handleConnect}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  topControls: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadows.button,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.button,
  },
  centerBtn: {
    position: "absolute",
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.button,
  },
  statsBar: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    justifyContent: "center",
    ...Shadows.card,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  promptCard: {
    position: "absolute",
    top: "40%",
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  promptTextContainer: { flex: 1 },
  promptButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  markerContainer: { alignItems: "center" },
  markerOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  markerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  markerInitials: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -4,
  },
  calloutContainer: {
    width: 200,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  calloutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  calloutAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  calloutAvatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  calloutInfo: { flex: 1 },
  calloutName: { fontSize: 14 },
  calloutCompatibility: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  calloutBio: {
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  calloutTags: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  calloutTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing["2xl"],
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  modalAvatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  modalName: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  modalCompatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  modalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
  },
  modalBio: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  modalSection: {
    marginBottom: Spacing.lg,
  },
  modalSectionLabel: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  modalTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  modalTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  modalActions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  modalButtonSecondary: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  modalButtonSecondaryText: {
    fontWeight: "600",
  },
  webMapContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  webMapGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  webMapGridLine: {
    width: "10%",
    height: "10%",
    borderWidth: 0.5,
    borderColor: "rgba(0,100,0,0.1)",
  },
  webMapCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: "center",
    justifyContent: "center",
  },
  webMapCenterRing: {
    position: "absolute",
    borderRadius: 1000,
    borderWidth: 1,
    borderColor: ElaraColors.primary,
    opacity: 0.2,
  },
  webMapCenterRing1: {
    width: 60,
    height: 60,
  },
  webMapCenterRing2: {
    width: 120,
    height: 120,
  },
  webMapCenterRing3: {
    width: 180,
    height: 180,
  },
  webMapCenterDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ElaraColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  webMapMarker: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  webMapMarkerText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  webUsersList: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: -Spacing.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  webUsersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  webUserCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  webUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  webUserAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  webUserInfo: {
    flex: 1,
    gap: 2,
  },
  webUserMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  webUserDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
});
