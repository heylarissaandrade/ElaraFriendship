import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  FlatList,
  Platform,
  Modal,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@shared/components/themed-view";
import { ThemedText } from "@shared/components/themed-text";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@shared/hooks/useTheme";
import { useMatches, WalkRequest, WalkParticipant, WalkTag } from "@shared/contexts/MatchesContext";
import { useAuth } from "@shared/contexts/AuthContext";
import { Spacing, BorderRadius, ElaraColors, Typography } from "@shared/constants/theme";

import { WalkSegmentedControl } from "@/components/walks/WalkSegmentedControl";
import { WalkFiltersChips, WalkFilterTag } from "@/components/walks/WalkFiltersChips";
import { WalkCard } from "@/components/walks/WalkCard";
import { SafetyBanner, ActiveTrackingBanner } from "@/components/walks/SafetyBanner";
import { LocationPermissionCard } from "@/components/walks/LocationPermissionCard";

type WalkTogetherParamList = {
  WalkTogether: undefined;
};

type WalkTogetherScreenProps = {
  navigation: NativeStackNavigationProp<WalkTogetherParamList, "WalkTogether">;
};

const WALK_TYPES = [
  { id: "casual", label: "Passeio", icon: "coffee", description: "Caminhada calma para conversar" },
  { id: "exercise", label: "Exercicio", icon: "activity", description: "Caminhada de fitness" },
  { id: "commute", label: "Trajeto", icon: "navigation", description: "Acompanhar no caminho" },
  { id: "exploration", label: "Explorar", icon: "map", description: "Descobrir novos lugares" },
] as const;

const WALK_TAGS: { id: WalkTag; label: string; icon: string }[] = [
  { id: "introvertidas", label: "Introvertidas", icon: "moon" },
  { id: "pet-friendly", label: "Pet-friendly", icon: "heart" },
  { id: "sem-alcool", label: "Sem alcool", icon: "coffee" },
  { id: "manha", label: "Manha", icon: "sunrise" },
  { id: "after-work", label: "After-work", icon: "briefcase" },
];

type TabValue = "nearby" | "mine";

export default function WalkTogetherScreen({ navigation }: WalkTogetherScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { walks, createWalk, joinWalk } = useMatches();
  const { user } = useAuth();

  const [selectedTab, setSelectedTab] = useState<TabValue>("nearby");
  const [filters, setFilters] = useState<WalkFilterTag[]>([]);
  const [locationStatus, setLocationStatus] = useState<"unknown" | "granted" | "denied">("unknown");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("4");
  const [selectedWalkType, setSelectedWalkType] = useState<typeof WALK_TYPES[number]["id"]>("casual");
  const [selectedTags, setSelectedTags] = useState<WalkTag[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [shareWithEmergency, setShareWithEmergency] = useState(true);
  const [safetyNote, setSafetyNote] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationStatus(status === "granted" ? "granted" : "denied");
    } catch {
      setLocationStatus("denied");
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationStatus(status === "granted" ? "granted" : "denied");
    } catch {
      setLocationStatus("denied");
    }
  };

  const upcomingWalkForUser = useMemo(() => {
    if (!user) return null;
    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    return walks.find(w => {
      const walkDate = new Date(w.scheduledTime);
      const isToday = walkDate >= now && walkDate <= todayEnd;
      const isParticipant = w.participants?.some(p => p.id === user.id) || w.hostId === user.id;
      return isToday && isParticipant && (w.status === "open" || w.status === "full");
    });
  }, [walks, user]);

  const visibleWalks = useMemo(() => {
    let base = selectedTab === "nearby"
      ? walks.filter(w => w.status === "open" || w.status === "full")
      : walks.filter(w => 
          w.hostId === user?.id || 
          w.participants?.some(p => p.id === user?.id)
        );

    if (filters.includes("hoje")) {
      const today = new Date();
      base = base.filter(w => {
        const walkDate = new Date(w.scheduledTime);
        return walkDate.toDateString() === today.toDateString();
      });
    }

    if (filters.includes("fim-de-semana")) {
      base = base.filter(w => {
        const walkDate = new Date(w.scheduledTime);
        const day = walkDate.getDay();
        return day === 0 || day === 6;
      });
    }

    const tagFilters = filters.filter(f => 
      ["introvertidas", "pet-friendly", "sem-alcool"].includes(f)
    );
    if (tagFilters.length > 0) {
      base = base.filter(w => 
        tagFilters.some(tag => w.tags?.includes(tag as WalkTag))
      );
    }

    return base;
  }, [walks, selectedTab, filters, user?.id]);

  const showLocationCard = selectedTab === "nearby" && locationStatus === "denied";

  const handleCreateWalk = () => {
    if (!startLocation.trim() || !endLocation.trim() || !user) return;

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const hostParticipant: WalkParticipant = {
      id: user.id,
      name: user.name,
      photoUrl: user.photoUrl,
      isVerified: true,
      joinedAt: new Date().toISOString(),
    };

    createWalk({
      hostId: user.id,
      hostName: user.name,
      hostPhoto: user.photoUrl,
      hostIsVerified: true,
      startLocation: startLocation.trim(),
      endLocation: endLocation.trim(),
      scheduledTime: new Date(Date.now() + 3600000).toISOString(),
      durationMinutes: parseInt(durationMinutes) || 60,
      participantsCount: 1,
      maxParticipants: parseInt(maxParticipants) || 4,
      participants: [hostParticipant],
      status: "open",
      verifiedOnly,
      shareWithEmergencyContacts: shareWithEmergency,
      safetyNote: safetyNote.trim() || undefined,
      walkType: selectedWalkType,
      tags: selectedTags,
      hostTrustScore: 85,
      hostCompletedMeetups: 0,
    });

    setShowCreateModal(false);
    resetForm();

    if (shareWithEmergency && user.emergencyContacts && user.emergencyContacts.length > 0) {
      Alert.alert(
        "Caminhada Criada",
        "Os teus contactos de emergencia serao notificados quando iniciares.",
        [{ text: "Perfeito", style: "default" }]
      );
    }
  };

  const resetForm = () => {
    setStartLocation("");
    setEndLocation("");
    setMaxParticipants("4");
    setSelectedWalkType("casual");
    setSelectedTags([]);
    setVerifiedOnly(true);
    setShareWithEmergency(true);
    setSafetyNote("");
    setDurationMinutes("60");
  };

  const handleJoinWalk = (walkId: string) => {
    if (!user) return;
    
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const participant: WalkParticipant = {
      id: user.id,
      name: user.name,
      photoUrl: user.photoUrl,
      isVerified: true,
      joinedAt: new Date().toISOString(),
    };

    joinWalk(walkId, participant);

    Alert.alert(
      "Juntaste-te a caminhada",
      "A anfitria sera notificada. Boa caminhada!",
      [{ text: "Perfeito", style: "default" }]
    );
  };

  const toggleTag = (tag: WalkTag) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundSecondary,
      color: theme.text,
    },
  ];

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.titleRow}>
        <View>
          <ThemedText type="h2">Caminhar Juntas</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
            Encontros ao ar livre com mulheres verificadas
          </ThemedText>
        </View>
        <Pressable
          onPress={() => {}}
          style={[styles.safetyIconButton, { backgroundColor: ElaraColors.success + "15" }]}
        >
          <Feather name="shield" size={20} color={ElaraColors.success} />
        </Pressable>
      </View>

      <Spacer height={Spacing.lg} />

      <WalkSegmentedControl
        value={selectedTab}
        onChange={(v) => setSelectedTab(v as TabValue)}
        options={[
          { value: "nearby", label: "Perto de mim" },
          { value: "mine", label: "Minhas caminhadas" },
        ]}
      />

      <Spacer height={Spacing.lg} />

      {upcomingWalkForUser && !showLocationCard && (
        <>
          <SafetyBanner
            walk={upcomingWalkForUser}
            onActivateSafety={() => {
              Alert.alert("Modo Seguranca", "Funcionalidade em desenvolvimento.");
            }}
            onViewDetails={() => {}}
          />
          <Spacer height={Spacing.lg} />
        </>
      )}

      {showLocationCard && (
        <>
          <LocationPermissionCard
            onEnableLocation={requestLocationPermission}
            onCreateWithoutLocation={() => setShowCreateModal(true)}
          />
          <Spacer height={Spacing.lg} />
        </>
      )}

      {!showLocationCard && (
        <>
          <WalkFiltersChips value={filters} onChange={setFilters} />
          <Spacer height={Spacing.lg} />
          
          {visibleWalks.length > 0 && (
            <ThemedText type="h4" style={styles.sectionTitle}>
              {selectedTab === "nearby" 
                ? `${visibleWalks.length} caminhada${visibleWalks.length !== 1 ? "s" : ""} disponive${visibleWalks.length !== 1 ? "is" : "l"}`
                : "As tuas caminhadas"
              }
            </ThemedText>
          )}
        </>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Animated.View
        entering={ZoomIn.springify()}
        style={[styles.emptyIcon, { backgroundColor: ElaraColors.primary + "15" }]}
      >
        <Feather 
          name={selectedTab === "nearby" ? "compass" : "calendar"} 
          size={48} 
          color={ElaraColors.primary} 
        />
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(200)}>
        <ThemedText type="h3" style={styles.emptyTitle}>
          {selectedTab === "nearby" 
            ? "Ainda nao ha caminhadas perto de ti"
            : "Nao tens caminhadas marcadas"
          }
        </ThemedText>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(400)}>
        <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
          {selectedTab === "nearby"
            ? "Se a primeira a criar uma caminhada segura na tua zona."
            : "Cria uma caminhada ou junta-te a uma ja existente."
          }
        </ThemedText>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(600)} style={styles.emptyActions}>
        <Pressable
          onPress={() => setShowCreateModal(true)}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: ElaraColors.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Feather name="plus" size={18} color="#fff" />
          <ThemedText style={styles.primaryButtonText}>Criar caminhada</ThemedText>
        </Pressable>
        {selectedTab === "mine" && (
          <Pressable
            onPress={() => setSelectedTab("nearby")}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <ThemedText style={{ color: theme.text }}>Explorar caminhadas</ThemedText>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );

  const renderWalkItem = ({ item, index }: { item: WalkRequest; index: number }) => (
    <WalkCard
      walk={item}
      index={index}
      isHost={item.hostId === user?.id}
      onJoin={handleJoinWalk}
      onManage={(id) => {}}
      onOpenDetails={() => {}}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={showLocationCard ? [] : visibleWalks}
        renderItem={renderWalkItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 100, paddingBottom: insets.bottom + 140 },
          (showLocationCard || visibleWalks.length === 0) && styles.emptyListContent,
        ]}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={showLocationCard ? null : renderEmptyState}
        ItemSeparatorComponent={() => <Spacer height={Spacing.md} />}
        showsVerticalScrollIndicator={false}
      />

      <Animated.View
        entering={ZoomIn.delay(500).springify()}
        style={[styles.fabContainer, { bottom: insets.bottom + 100 }]}
      >
        <Pressable
          onPress={() => setShowCreateModal(true)}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: ElaraColors.primary,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
        >
          <Feather name="plus" size={26} color="#fff" />
        </Pressable>
        <ThemedText type="small" style={[styles.fabLabel, { color: theme.textSecondary }]}>
          Nova Caminhada
        </ThemedText>
      </Animated.View>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleSection}>
                  <View style={[styles.modalIcon, { backgroundColor: ElaraColors.primary + "20" }]}>
                    <Feather name="navigation" size={18} color={ElaraColors.primary} />
                  </View>
                  <View>
                    <ThemedText type="h3">Nova Caminhada</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      Cria um trajeto seguro
                    </ThemedText>
                  </View>
                </View>
                <Pressable
                  onPress={() => setShowCreateModal(false)}
                  style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Feather name="x" size={24} color={theme.text} />
                </Pressable>
              </View>

              <View style={styles.modalContent}>
                <ThemedText type="small" style={styles.sectionLabel}>
                  Tipo de Caminhada
                </ThemedText>
                <View style={styles.walkTypeGrid}>
                  {WALK_TYPES.map((type) => (
                    <Pressable
                      key={type.id}
                      onPress={() => setSelectedWalkType(type.id)}
                      style={[
                        styles.walkTypeOption,
                        {
                          backgroundColor:
                            selectedWalkType === type.id
                              ? ElaraColors.primary + "20"
                              : theme.backgroundSecondary,
                          borderColor:
                            selectedWalkType === type.id ? ElaraColors.primary : "transparent",
                        },
                      ]}
                    >
                      <Feather
                        name={type.icon as any}
                        size={20}
                        color={selectedWalkType === type.id ? ElaraColors.primary : theme.textSecondary}
                      />
                      <ThemedText
                        type="small"
                        style={{
                          color: selectedWalkType === type.id ? ElaraColors.primary : theme.text,
                          fontWeight: "600",
                          marginTop: 6,
                        }}
                      >
                        {type.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>

                <Spacer height={Spacing.xl} />

                <ThemedText type="small" style={styles.sectionLabel}>
                  Ponto de Encontro
                </ThemedText>
                <View style={styles.inputWrapper}>
                  <Feather name="map-pin" size={18} color={ElaraColors.success} style={styles.inputIcon} />
                  <TextInput
                    style={[inputStyle, styles.inputWithIcon]}
                    value={startLocation}
                    onChangeText={setStartLocation}
                    placeholder="Ex: Parque Eduardo VII"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <Spacer height={Spacing.lg} />

                <ThemedText type="small" style={styles.sectionLabel}>
                  Destino Final
                </ThemedText>
                <View style={styles.inputWrapper}>
                  <Feather name="flag" size={18} color={ElaraColors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={[inputStyle, styles.inputWithIcon]}
                    value={endLocation}
                    onChangeText={setEndLocation}
                    placeholder="Ex: Cais do Sodre"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <Spacer height={Spacing.xl} />

                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="small" style={styles.sectionLabel}>
                      Participantes
                    </ThemedText>
                    <View style={styles.participantsSelector}>
                      {["2", "3", "4", "5", "6"].map((num) => (
                        <Pressable
                          key={num}
                          onPress={() => setMaxParticipants(num)}
                          style={[
                            styles.participantOption,
                            {
                              backgroundColor:
                                maxParticipants === num ? ElaraColors.primary : theme.backgroundSecondary,
                            },
                          ]}
                        >
                          <ThemedText
                            type="body"
                            style={{
                              color: maxParticipants === num ? "#FFFFFF" : theme.text,
                              fontWeight: "600",
                            }}
                          >
                            {num}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View style={{ flex: 1, marginLeft: Spacing.lg }}>
                    <ThemedText type="small" style={styles.sectionLabel}>
                      Duracao (min)
                    </ThemedText>
                    <View style={styles.participantsSelector}>
                      {["30", "60", "90"].map((min) => (
                        <Pressable
                          key={min}
                          onPress={() => setDurationMinutes(min)}
                          style={[
                            styles.participantOption,
                            {
                              backgroundColor:
                                durationMinutes === min ? ElaraColors.primary : theme.backgroundSecondary,
                            },
                          ]}
                        >
                          <ThemedText
                            type="body"
                            style={{
                              color: durationMinutes === min ? "#FFFFFF" : theme.text,
                              fontWeight: "600",
                            }}
                          >
                            {min}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>

                <Spacer height={Spacing.xl} />

                <ThemedText type="small" style={styles.sectionLabel}>
                  Tags (opcional)
                </ThemedText>
                <View style={styles.tagsGrid}>
                  {WALK_TAGS.map((tag) => (
                    <Pressable
                      key={tag.id}
                      onPress={() => toggleTag(tag.id)}
                      style={[
                        styles.tagOption,
                        {
                          backgroundColor: selectedTags.includes(tag.id)
                            ? ElaraColors.primary
                            : theme.backgroundSecondary,
                          borderColor: selectedTags.includes(tag.id)
                            ? ElaraColors.primary
                            : theme.border,
                        },
                      ]}
                    >
                      <Feather
                        name={tag.icon as any}
                        size={14}
                        color={selectedTags.includes(tag.id) ? "#fff" : theme.textSecondary}
                      />
                      <ThemedText
                        type="small"
                        style={{
                          color: selectedTags.includes(tag.id) ? "#fff" : theme.text,
                        }}
                      >
                        {tag.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>

                <Spacer height={Spacing.xl} />

                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <Feather name="shield" size={18} color={ElaraColors.success} />
                    <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                      <ThemedText type="body" style={{ fontWeight: "600" }}>
                        Apenas verificadas
                      </ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        So perfis verificados podem juntar-se
                      </ThemedText>
                    </View>
                  </View>
                  <Switch
                    value={verifiedOnly}
                    onValueChange={setVerifiedOnly}
                    trackColor={{ false: theme.border, true: ElaraColors.success + "50" }}
                    thumbColor={verifiedOnly ? ElaraColors.success : theme.textSecondary}
                  />
                </View>

                <View style={[styles.toggleRow, { marginTop: Spacing.md }]}>
                  <View style={styles.toggleInfo}>
                    <Feather name="share-2" size={18} color="#00BFFF" />
                    <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                      <ThemedText type="body" style={{ fontWeight: "600" }}>
                        Partilhar com emergencia
                      </ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        Os teus contactos recebem a rota
                      </ThemedText>
                    </View>
                  </View>
                  <Switch
                    value={shareWithEmergency}
                    onValueChange={setShareWithEmergency}
                    trackColor={{ false: theme.border, true: "#00BFFF50" }}
                    thumbColor={shareWithEmergency ? "#00BFFF" : theme.textSecondary}
                  />
                </View>

                <Spacer height={Spacing.xl} />

                <ThemedText type="small" style={styles.sectionLabel}>
                  Nota de seguranca (opcional)
                </ThemedText>
                <TextInput
                  style={[inputStyle, styles.noteInput]}
                  value={safetyNote}
                  onChangeText={setSafetyNote}
                  placeholder="Ex: Trazer agua, caminho com sombra..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={200}
                />

                <Spacer height={Spacing.xl} />

                <Pressable
                  onPress={handleCreateWalk}
                  disabled={!startLocation.trim() || !endLocation.trim()}
                  style={({ pressed }) => [
                    styles.createButton,
                    {
                      backgroundColor: startLocation.trim() && endLocation.trim() 
                        ? ElaraColors.primary 
                        : theme.backgroundSecondary,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Feather 
                    name="navigation" 
                    size={18} 
                    color={startLocation.trim() && endLocation.trim() ? "#fff" : theme.textSecondary} 
                  />
                  <ThemedText 
                    style={[
                      styles.createButtonText, 
                      { 
                        color: startLocation.trim() && endLocation.trim() ? "#fff" : theme.textSecondary,
                      },
                    ]}
                  >
                    Criar Caminhada
                  </ThemedText>
                </Pressable>
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  emptyListContent: {
    justifyContent: "flex-start",
  },
  headerSection: {
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  safetyIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
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
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  emptyActions: {
    gap: Spacing.md,
    width: "100%",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  fabContainer: {
    position: "absolute",
    right: Spacing.xl,
    alignItems: "center",
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabLabel: {
    marginTop: Spacing.xs,
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "90%",
    paddingTop: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  modalTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    padding: Spacing.sm,
  },
  modalContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sectionLabel: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  walkTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  walkTypeOption: {
    width: "48%",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    borderWidth: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: Spacing.md,
    zIndex: 1,
  },
  input: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    flex: 1,
  },
  inputWithIcon: {
    paddingLeft: 44,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: Spacing.md,
  },
  rowBetween: {
    flexDirection: "row",
  },
  participantsSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  participantOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tagOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  createButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
