import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  useWindowDimensions,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing,
  FadeIn,
  FadeInUp,
  ZoomIn,
  BounceIn,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { ThemedView } from "@shared/components/themed-view";
import { ThemedText } from "@shared/components/themed-text";
import { useTheme } from "@shared/hooks/useTheme";
import { useMatches, UserMatch, HomeHighlight } from "@shared/contexts/MatchesContext";
import { useAuth } from "@shared/contexts/AuthContext";
import { Spacing, ElaraColors, BorderRadius } from "@shared/constants/theme";
import { HomeHighlights, SocialProofBanner } from "@shared/components/HomeHighlights";

const SWIPE_THRESHOLD = 100;

interface CompatibilityInsight {
  icon: string;
  text: string;
  type: "values" | "meeting" | "phase" | "energy" | "hobby";
}

function getCompatibilityInsights(match: UserMatch, userProfile: any): CompatibilityInsight[] {
  const insights: CompatibilityInsight[] = [];
  
  if (userProfile?.values && match.values) {
    const sharedValues = userProfile.values.filter((v: string) => match.values.includes(v));
    if (sharedValues.length > 0) {
      const valuesText = sharedValues.length === 1 
        ? `Partilham o valor: ${sharedValues[0]}`
        : sharedValues.length <= 3
          ? `Partilham ${sharedValues.length} valores: ${sharedValues.join(", ")}`
          : `Partilham ${sharedValues.length} valores centrais`;
      insights.push({ icon: "heart", text: valuesText, type: "values" });
    }
  }
  
  if (userProfile?.meetingPreferences && match.meetingPreferences) {
    const userPrefs = userProfile.meetingPreferences;
    const matchPrefs = match.meetingPreferences;
    
    if (userPrefs.prefersDaytime && matchPrefs.prefersDaytime) {
      insights.push({ icon: "sun", text: "Ambas preferem encontros diurnos", type: "meeting" });
    }
    if (userPrefs.prefersGroupFirst && matchPrefs.prefersGroupFirst) {
      insights.push({ icon: "users", text: "Ambas preferem conhecer em grupo primeiro", type: "meeting" });
    }
  }
  
  if (userProfile?.phaseOfLife && match.phaseOfLife && userProfile.phaseOfLife === match.phaseOfLife) {
    insights.push({ icon: "compass", text: `Ambas em fase: ${match.phaseOfLife}`, type: "phase" });
  }
  
  if (userProfile?.socialEnergy && match.socialEnergy && userProfile.socialEnergy === match.socialEnergy) {
    const energyLabel = match.socialEnergy === "Introvertida" ? "introvertidas" 
      : match.socialEnergy === "Extrovertida" ? "extrovertidas" : "ambivertidas";
    insights.push({ icon: "zap", text: `Ambas sao ${energyLabel}`, type: "energy" });
  }
  
  if (userProfile?.hobbies && match.hobbies) {
    const sharedHobbies = userProfile.hobbies.filter((h: string) => match.hobbies.includes(h));
    if (sharedHobbies.length > 0) {
      const hobbyText = sharedHobbies.length === 1 
        ? `Ambas adoram: ${sharedHobbies[0]}`
        : `${sharedHobbies.length} hobbies em comum`;
      insights.push({ icon: "star", text: hobbyText, type: "hobby" });
    }
  }
  
  return insights.slice(0, 3);
}

const AVATAR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF",
  "#DDA0DD", "#87CEEB", "#F4A460", "#98D8C8",
];

function getAvatarColor(id: string) {
  return AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];
}

function ProfileDetailModal({ match, visible, onClose, onConnect, userProfile }: {
  match: UserMatch | null;
  visible: boolean;
  onClose: () => void;
  onConnect: () => void;
  userProfile: any;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  if (!match) return null;
  
  const color = getAvatarColor(match.id);
  const initials = match.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const insights = getCompatibilityInsights(match, userProfile);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={profileStyles.overlay}>
        <Pressable style={profileStyles.overlayBg} onPress={onClose} />
        <Animated.View 
          entering={FadeInUp.springify()} 
          style={[profileStyles.content, { backgroundColor: theme.backgroundDefault, paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <View style={profileStyles.handle} />
          
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} bounces={true}>
            <View style={profileStyles.photoSection}>
              {match.photoUrl ? (
                <Image source={{ uri: match.photoUrl }} style={profileStyles.photo} contentFit="cover" />
              ) : (
                <View style={[profileStyles.photoPlaceholder, { backgroundColor: color }]}>
                  <ThemedText style={profileStyles.photoInitials}>{initials}</ThemedText>
                </View>
              )}
              <LinearGradient 
                colors={["transparent", "rgba(0,0,0,0.7)"]} 
                style={profileStyles.photoGradient}
              />
              <View style={profileStyles.photoOverlay}>
                <ThemedText style={profileStyles.photoName}>{match.name}, {match.age}</ThemedText>
                <View style={profileStyles.photoBadges}>
                  {match.isVerified && (
                    <View style={[profileStyles.badge, { backgroundColor: ElaraColors.success }]}>
                      <Feather name="shield" size={10} color="#fff" />
                      <ThemedText style={profileStyles.badgeText}>Verificada</ThemedText>
                    </View>
                  )}
                  {match.distance !== undefined && (
                    <View style={[profileStyles.badge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                      <Feather name="map-pin" size={10} color="#fff" />
                      <ThemedText style={profileStyles.badgeText}>
                        {match.distance < 1 ? `${Math.round(match.distance * 1000)}m` : `${match.distance.toFixed(1)}km`}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={profileStyles.scrollContent}>
            <View style={[profileStyles.compatCard, { backgroundColor: ElaraColors.primary + "10" }]}>
              <View style={profileStyles.compatHeader}>
                <Feather name="heart" size={16} color={ElaraColors.primary} />
                <ThemedText style={[profileStyles.compatTitle, { color: ElaraColors.primary }]}>
                  {match.compatibilityScore}% compativel
                </ThemedText>
              </View>
              {insights.length > 0 && (
                <View style={profileStyles.insightsList}>
                  {insights.map((insight, i) => (
                    <View key={i} style={profileStyles.insightRow}>
                      <View style={[profileStyles.insightIcon, { backgroundColor: ElaraColors.success + "20" }]}>
                        <Feather name={insight.icon as any} size={12} color={ElaraColors.success} />
                      </View>
                      <ThemedText style={[profileStyles.insightText, { color: theme.text }]}>{insight.text}</ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={profileStyles.section}>
              <ThemedText type="h4" style={profileStyles.sectionTitle}>Sobre</ThemedText>
              <ThemedText style={[profileStyles.bio, { color: theme.textSecondary }]}>{match.bio}</ThemedText>
            </View>

            <View style={profileStyles.section}>
              <ThemedText type="h4" style={profileStyles.sectionTitle}>Valores</ThemedText>
              <View style={profileStyles.tagsRow}>
                {match.values.map(value => (
                  <View key={value} style={[profileStyles.tag, { backgroundColor: ElaraColors.primary + "15" }]}>
                    <ThemedText style={{ color: ElaraColors.primary, fontWeight: "600", fontSize: 13 }}>{value}</ThemedText>
                  </View>
                ))}
              </View>
            </View>

            <View style={profileStyles.section}>
              <ThemedText type="h4" style={profileStyles.sectionTitle}>Hobbies</ThemedText>
              <View style={profileStyles.tagsRow}>
                {match.hobbies.map(hobby => (
                  <View key={hobby} style={[profileStyles.tag, { backgroundColor: ElaraColors.success + "15" }]}>
                    <ThemedText style={{ color: ElaraColors.success, fontWeight: "600", fontSize: 13 }}>{hobby}</ThemedText>
                  </View>
                ))}
              </View>
            </View>

            {match.phaseOfLife && (
              <View style={profileStyles.section}>
                <ThemedText type="h4" style={profileStyles.sectionTitle}>Fase de vida</ThemedText>
                <View style={[profileStyles.phaseTag, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name="compass" size={14} color={theme.text} />
                  <ThemedText style={{ color: theme.text, fontWeight: "500" }}>{match.phaseOfLife}</ThemedText>
                </View>
              </View>
            )}
            </View>
          </ScrollView>

          <View style={profileStyles.actions}>
            <Pressable onPress={onClose} style={[profileStyles.btnSecondary, { borderColor: theme.border }]}>
              <Feather name="x" size={20} color={theme.text} />
              <ThemedText style={{ color: theme.text, fontWeight: "600" }}>Passar</ThemedText>
            </Pressable>
            <Pressable onPress={onConnect} style={[profileStyles.btnPrimary, { backgroundColor: ElaraColors.primary }]}>
              <Feather name="heart" size={20} color="#fff" />
              <ThemedText style={{ color: "#fff", fontWeight: "600" }}>Conectar</ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const profileStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  content: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: Spacing.md, maxHeight: "90%" },
  handle: { width: 40, height: 4, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 2, alignSelf: "center", marginBottom: Spacing.md },
  photoSection: { width: "100%", aspectRatio: 3 / 4, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", marginBottom: Spacing.lg },
  photo: { width: "100%", height: "100%" },
  photoPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  photoInitials: { fontSize: 72, fontWeight: "700", color: "#fff" },
  photoGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 120 },
  photoOverlay: { position: "absolute", bottom: Spacing.md, left: Spacing.lg, right: Spacing.lg },
  photoName: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 6 },
  photoBadges: { flexDirection: "row", gap: 8 },
  scrollContent: { paddingHorizontal: Spacing.xl },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "600", color: "#fff" },
  compatCard: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.lg },
  compatHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: Spacing.sm },
  compatTitle: { fontSize: 15, fontWeight: "700" },
  insightsList: { gap: 6 },
  insightRow: { flexDirection: "row", alignItems: "center" },
  insightIcon: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 10 },
  insightText: { fontSize: 13, flex: 1 },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { marginBottom: Spacing.sm },
  bio: { lineHeight: 22 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  phaseTag: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.md, alignSelf: "flex-start" },
  actions: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.md, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
  btnSecondary: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: BorderRadius.full, borderWidth: 1 },
  btnPrimary: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: BorderRadius.full },
});

function MatchCard({
  match,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  onTap,
  isTop,
  index,
  cardWidth,
  cardHeight,
  userProfile,
}: {
  match: UserMatch;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperLike: () => void;
  onTap: () => void;
  isTop: boolean;
  index: number;
  cardWidth: number;
  cardHeight: number;
  userProfile: any;
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const cardScale = useSharedValue(isTop ? 1 : 0.95 - index * 0.02);
  const cardOpacity = useSharedValue(1);

  const color = getAvatarColor(match.id);
  const initials = match.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    cardScale.value = withSpring(isTop ? 1 : 0.95 - index * 0.02, { damping: 15 });
  }, [isTop, index]);

  const handleSwipeComplete = useCallback((direction: "left" | "right" | "up") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(direction === "up" ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
    }
    if (direction === "left") onSwipeLeft();
    else if (direction === "right") onSwipeRight();
    else onSuperLike();
  }, [onSwipeLeft, onSwipeRight, onSuperLike]);

  const handleTap = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTap();
  }, [onTap]);

  const tapGesture = Gesture.Tap()
    .enabled(isTop)
    .onEnd(() => {
      runOnJS(handleTap)();
    });

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3;
      rotation.value = interpolate(event.translationX, [-screenWidth / 2, 0, screenWidth / 2], [-12, 0, 12], Extrapolation.CLAMP);
    })
    .onEnd((event) => {
      if (event.translationY < -100 && Math.abs(event.translationX) < 50) {
        translateY.value = withTiming(-screenHeight, { duration: 300 });
        cardOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(handleSwipeComplete)("up");
      } else if (event.translationX > SWIPE_THRESHOLD || event.velocityX > 500) {
        translateX.value = withTiming(screenWidth * 1.5, { duration: 250 });
        rotation.value = withTiming(20, { duration: 250 });
        cardOpacity.value = withTiming(0, { duration: 180 });
        runOnJS(handleSwipeComplete)("right");
      } else if (event.translationX < -SWIPE_THRESHOLD || event.velocityX < -500) {
        translateX.value = withTiming(-screenWidth * 1.5, { duration: 250 });
        rotation.value = withTiming(-20, { duration: 250 });
        cardOpacity.value = withTiming(0, { duration: 180 });
        runOnJS(handleSwipeComplete)("left");
      } else {
        translateX.value = withSpring(0, { damping: 18 });
        translateY.value = withSpring(0, { damping: 18 });
        rotation.value = withSpring(0, { damping: 18 });
      }
    });

  const composedGesture = Gesture.Race(tapGesture, panGesture);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value + (isTop ? 0 : index * 6) },
      { rotate: `${rotation.value}deg` },
      { scale: cardScale.value },
    ],
    opacity: cardOpacity.value,
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[
        styles.card,
        { width: cardWidth, height: cardHeight, zIndex: isTop ? 10 : 10 - index },
        cardStyle
      ]}>
        <View style={[styles.avatarSection, { backgroundColor: color }]}>
          <View style={styles.avatarCircle}>
            <ThemedText style={styles.avatarInitials}>{initials}</ThemedText>
          </View>
        </View>

        <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.gradient} />

        <View style={styles.cardContent}>
          <View style={styles.safetyBadgesRow}>
            {match.isVerified && (
              <View style={styles.verifiedBadgeLarge}>
                <Feather name="shield" size={10} color="#fff" />
                <ThemedText style={styles.badgeText}>Verificada</ThemedText>
              </View>
            )}
            {match.reliabilityScore !== undefined && match.reliabilityScore >= 85 && (
              <View style={styles.trustBadge}>
                <Feather name="check-circle" size={10} color="#fff" />
                <ThemedText style={styles.badgeText}>{match.reliabilityScore}% fiavel</ThemedText>
              </View>
            )}
            {match.completedMeetupsCount !== undefined && match.completedMeetupsCount > 0 && (
              <View style={styles.meetupsBadge}>
                <Feather name="coffee" size={10} color="#fff" />
                <ThemedText style={styles.badgeText}>{match.completedMeetupsCount} encontros</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.nameRow}>
            <ThemedText style={styles.name}>{match.name}</ThemedText>
            <ThemedText style={styles.age}>{match.age}</ThemedText>
          </View>

          {match.distance !== undefined && (
            <View style={styles.distanceRow}>
              <Feather name="navigation" size={12} color="rgba(255,255,255,0.6)" />
              <ThemedText style={styles.distanceText}>
                {match.distance < 1 ? `${Math.round(match.distance * 1000)}m` : `${match.distance.toFixed(1)}km`}
              </ThemedText>
            </View>
          )}

          <ThemedText style={styles.bio} numberOfLines={2}>{match.bio}</ThemedText>

          <View style={styles.compatibilityMap}>
            <View style={styles.compatibilityHeader}>
              <Feather name="heart" size={12} color={ElaraColors.primary} />
              <ThemedText style={styles.compatibilityTitle}>Mapa de Compatibilidade</ThemedText>
              <View style={styles.compatibilityScore}>
                <ThemedText style={styles.compatibilityScoreText}>{match.compatibilityScore}%</ThemedText>
              </View>
            </View>
            <View style={styles.insightsList}>
              {getCompatibilityInsights(match, userProfile).map((insight, i) => (
                <View key={i} style={styles.insightRow}>
                  <View style={styles.insightIcon}>
                    <Feather name={insight.icon as any} size={11} color={ElaraColors.success} />
                  </View>
                  <ThemedText style={styles.insightText} numberOfLines={1}>{insight.text}</ThemedText>
                </View>
              ))}
              {getCompatibilityInsights(match, userProfile).length === 0 && (
                <View style={styles.insightRow}>
                  <View style={styles.insightIcon}>
                    <Feather name="star" size={11} color={ElaraColors.success} />
                  </View>
                  <ThemedText style={styles.insightText}>Descobre mais sobre {match.name}</ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>

        <Animated.View style={[styles.swipeLabel, styles.likeLabel, likeOpacity]}>
          <ThemedText style={[styles.swipeLabelText, { color: "#00FF88" }]}>LIKE</ThemedText>
        </Animated.View>

        <Animated.View style={[styles.swipeLabel, styles.nopeLabel, nopeOpacity]}>
          <ThemedText style={[styles.swipeLabelText, { color: "#FF4458" }]}>NOPE</ThemedText>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function ActionButton({ icon, color, bgColor, onPress, size = 56, isPrimary = false }: {
  icon: string; color: string; bgColor: string; onPress: () => void; size?: number; isPrimary?: boolean;
}) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (isPrimary) {
      glow.value = withRepeat(withSequence(
        withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.sin) })
      ), -1, true);
    }
  }, [isPrimary]);

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(withTiming(0.85, { duration: 50 }), withSpring(1, { damping: 10 }));
    onPress();
  };

  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <AnimatedPressable onPress={handlePress} style={[styles.actionBtnWrapper, buttonStyle]}>
      {isPrimary && <Animated.View style={[styles.actionGlow, { backgroundColor: bgColor, width: size + 16, height: size + 16, borderRadius: (size + 16) / 2 }, glowStyle]} />}
      <View style={[styles.actionBtn, { backgroundColor: bgColor, width: size, height: size, borderRadius: size / 2 }]}>
        <Feather name={icon as any} size={size * 0.4} color={color} />
      </View>
    </AnimatedPressable>
  );
}

function MatchCelebration({ match, onClose }: { match: UserMatch | null; onClose: () => void }) {
  if (!match) return null;
  const color = getAvatarColor(match.id);
  const initials = match.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.celebrationOverlay} onPress={onClose}>
        <Animated.View entering={BounceIn.duration(500)} style={styles.celebrationContent}>
          <Animated.View entering={ZoomIn.delay(100).springify()}>
            <Feather name="heart" size={56} color={ElaraColors.primary} />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(200)}>
            <ThemedText style={styles.celebrationTitle}>Nova Conexao!</ThemedText>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(300)}>
            <ThemedText style={styles.celebrationSubtitle}>Tu e {match.name} agora estao conectadas</ThemedText>
          </Animated.View>
          <Animated.View entering={ZoomIn.delay(400).springify()} style={[styles.celebrationAvatar, { backgroundColor: color }]}>
            <ThemedText style={styles.celebrationInitials}>{initials}</ThemedText>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(600)} style={styles.celebrationBtns}>
            <Pressable onPress={onClose} style={[styles.celebrationBtn, { backgroundColor: ElaraColors.primary }]}>
              <Feather name="message-circle" size={18} color="#fff" />
              <ThemedText style={styles.celebrationBtnText}>Enviar Mensagem</ThemedText>
            </Pressable>
            <Pressable onPress={onClose} style={styles.celebrationBtnSecondary}>
              <ThemedText style={styles.celebrationBtnSecondaryText}>Continuar</ThemedText>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export default function DiscoverScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { 
    potentialMatches, 
    removeMatch, 
    sendConnectionRequest, 
    refreshMatches,
    trackEvent,
    getHomeHighlights,
    walks,
  } = useMatches();
  const { user } = useAuth();
  const [matchCelebration, setMatchCelebration] = useState<UserMatch | null>(null);
  const [showHighlights, setShowHighlights] = useState(true);
  const [profileDetailMatch, setProfileDetailMatch] = useState<UserMatch | null>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);

  const handleCardTap = useCallback((match: UserMatch) => {
    setProfileDetailMatch(match);
    setShowProfileDetail(true);
  }, []);

  const handleConnectFromProfile = useCallback(() => {
    if (profileDetailMatch) {
      if (user) {
        trackEvent("SEND_CONNECTION_REQUEST", user.id, profileDetailMatch.id);
      }
      sendConnectionRequest(profileDetailMatch.id);
      setShowProfileDetail(false);
      setTimeout(() => setMatchCelebration(profileDetailMatch), 250);
    }
  }, [profileDetailMatch, sendConnectionRequest, user, trackEvent]);

  const HORIZONTAL_MARGIN = 16;
  const TOP_SPACE = insets.top + 20;
  const BOTTOM_SPACE = 160;
  
  const cardWidth = width - (HORIZONTAL_MARGIN * 2);
  const cardHeight = height - TOP_SPACE - BOTTOM_SPACE;

  const highlights = user 
    ? getHomeHighlights(user.id, user.values, user.phaseOfLife) 
    : [];

  const handleHighlightPress = useCallback((highlight: HomeHighlight) => {
    setShowHighlights(false);
  }, []);

  const handleSwipeLeft = useCallback(() => {
    if (potentialMatches[0]) {
      if (user) {
        trackEvent("SKIP_MATCH", user.id, potentialMatches[0].id);
      }
      removeMatch(potentialMatches[0].id);
    }
  }, [potentialMatches, removeMatch, user, trackEvent]);

  const handleSwipeRight = useCallback(() => {
    if (potentialMatches[0]) {
      const matchUser = potentialMatches[0];
      if (user) {
        trackEvent("SEND_CONNECTION_REQUEST", user.id, matchUser.id);
      }
      sendConnectionRequest(matchUser.id);
      setTimeout(() => setMatchCelebration(matchUser), 250);
    }
  }, [potentialMatches, sendConnectionRequest, user, trackEvent]);

  const handleSuperLike = useCallback(() => {
    if (potentialMatches[0]) {
      const matchUser = potentialMatches[0];
      if (user) {
        trackEvent("SEND_CONNECTION_REQUEST", user.id, matchUser.id, { type: "super_like" });
      }
      sendConnectionRequest(matchUser.id);
      setTimeout(() => setMatchCelebration(matchUser), 250);
    }
  }, [potentialMatches, sendConnectionRequest, user, trackEvent]);

  if (potentialMatches.length === 0) {
    return (
      <ThemedView style={styles.container}>
        {highlights.length > 0 && (
          <View style={{ paddingTop: insets.top + Spacing.md }}>
            <HomeHighlights highlights={highlights} onHighlightPress={handleHighlightPress} />
            <SocialProofBanner walksThisWeek={walks.length} newFriendships={3} />
          </View>
        )}
        <View style={[styles.emptyState, { paddingTop: highlights.length > 0 ? Spacing.xl : insets.top + 80 }]}>
          <Animated.View entering={ZoomIn.springify()} style={styles.emptyIcon}>
            <Feather name="users" size={48} color={ElaraColors.primary} />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(200)}>
            <ThemedText type="h3" style={styles.emptyTitle}>Sem mais perfis</ThemedText>
          </Animated.View>
          <Animated.View entering={FadeIn.delay(400)}>
            <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>Volta mais tarde para descobrir novas conexoes</ThemedText>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(600)}>
            <Pressable onPress={refreshMatches} style={styles.refreshBtn}>
              <Feather name="refresh-cw" size={18} color="#fff" />
              <ThemedText style={styles.refreshBtnText}>Atualizar</ThemedText>
            </Pressable>
          </Animated.View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[
        styles.cardsContainer,
        {
          paddingTop: TOP_SPACE,
          paddingBottom: BOTTOM_SPACE,
        }
      ]}>
        {potentialMatches.slice(0, 3).reverse().map((match, idx) => (
          <MatchCard
            key={match.id}
            match={match}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSuperLike={handleSuperLike}
            onTap={() => handleCardTap(match)}
            isTop={idx === potentialMatches.slice(0, 3).length - 1}
            index={potentialMatches.slice(0, 3).length - 1 - idx}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            userProfile={user}
          />
        ))}
      </View>

      <View style={[styles.actionsRow, { bottom: insets.bottom + Spacing.xl }]}>
        <ActionButton icon="x" color="#FF4458" bgColor="#2A2A2A" onPress={handleSwipeLeft} size={52} />
        <ActionButton icon="star" color="#00BFFF" bgColor="#2A2A2A" onPress={handleSuperLike} size={42} />
        <ActionButton icon="heart" color="#fff" bgColor={ElaraColors.primary} onPress={handleSwipeRight} size={58} isPrimary />
      </View>

      {matchCelebration && <MatchCelebration match={matchCelebration} onClose={() => setMatchCelebration(null)} />}
      
      <ProfileDetailModal
        match={profileDetailMatch}
        visible={showProfileDetail}
        onClose={() => setShowProfileDetail(false)}
        onConnect={handleConnectFromProfile}
        userProfile={user}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cardsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  card: {
    position: "absolute",
    borderRadius: 24,
    backgroundColor: "#1C1C1E",
    overflow: "hidden",
  },
  avatarSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.35)",
  },
  avatarInitials: { fontSize: 36, fontWeight: "700", color: "#fff" },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "75%",
  },
  cardContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingTop: 10,
  },
  nameRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 2 },
  name: { fontSize: 20, fontWeight: "700", color: "#fff", marginRight: 6 },
  age: { fontSize: 18, fontWeight: "400", color: "#fff" },
  safetyBadgesRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  verifiedBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: ElaraColors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  safeMeetBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,191,255,0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,193,7,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  meetupsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(139,69,19,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  distanceRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  distanceText: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  bio: { fontSize: 13, lineHeight: 18, color: "rgba(255,255,255,0.8)", marginBottom: 8 },
  valuesSection: { marginBottom: 10 },
  valuesSectionLabel: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.5)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  valueTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(242,128,119,0.2)",
    borderColor: "rgba(242,128,119,0.4)",
  },
  valueTagText: { fontSize: 11, fontWeight: "600", color: ElaraColors.primary },
  compatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(76,175,80,0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compatText: { fontSize: 12, fontWeight: "600", color: ElaraColors.success },
  swipeLabel: {
    position: "absolute",
    top: "30%",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 3,
    borderRadius: 6,
  },
  likeLabel: { right: 16, borderColor: "#00FF88", transform: [{ rotate: "-12deg" }] },
  nopeLabel: { left: 16, borderColor: "#FF4458", transform: [{ rotate: "12deg" }] },
  swipeLabelText: { fontSize: 22, fontWeight: "800", letterSpacing: 1 },
  actionsRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  actionBtnWrapper: { position: "relative", alignItems: "center", justifyContent: "center" },
  actionGlow: { position: "absolute" },
  actionBtn: { alignItems: "center", justifyContent: "center" },
  emptyState: { flex: 1, alignItems: "center", paddingHorizontal: 32 },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ElaraColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: { textAlign: "center", marginBottom: 12 },
  emptyText: { textAlign: "center", lineHeight: 22, marginBottom: 24 },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: ElaraColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
  },
  refreshBtnText: { color: "#fff", fontWeight: "600" },
  celebrationOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", alignItems: "center", justifyContent: "center" },
  celebrationContent: { alignItems: "center", paddingHorizontal: 32 },
  celebrationTitle: { fontSize: 28, fontWeight: "700", color: "#fff", marginTop: 20, textAlign: "center" },
  celebrationSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 8, textAlign: "center" },
  celebrationAvatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginTop: 20 },
  celebrationInitials: { fontSize: 28, fontWeight: "700", color: "#fff" },
  celebrationBtns: { width: "100%", marginTop: 28, gap: 12 },
  celebrationBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 24 },
  celebrationBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  celebrationBtnSecondary: { alignItems: "center", paddingVertical: 10 },
  celebrationBtnSecondaryText: { color: "rgba(255,255,255,0.5)", fontWeight: "500" },
  compatibilityMap: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
  },
  compatibilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  compatibilityTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    marginLeft: 6,
    flex: 1,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  compatibilityScore: {
    backgroundColor: ElaraColors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  compatibilityScoreText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  insightsList: {
    gap: 5,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  insightIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(76,175,80,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  insightText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    flex: 1,
  },
});
