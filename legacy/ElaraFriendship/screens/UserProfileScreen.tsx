import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Platform,
  Alert,
  Modal,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, ElaraColors } from "@/constants/theme";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

type UserProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Profile">;
};

export default function UserProfileScreen({ navigation }: UserProfileScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, signOut, updateProfile } = useAuth();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Tens a certeza que queres sair?")) {
        signOut();
      }
    } else {
      Alert.alert(
        "Sair",
        "Tens a certeza que queres sair? Os teus contactos de emergência serão notificados.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sair",
            style: "destructive",
            onPress: () => signOut(),
          },
        ]
      );
    }
  };

  const handleEmergencyAlert = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setShowEmergencyModal(true);
  };

  const sendEmergencyAlert = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setShowEmergencyModal(false);
    
    if (Platform.OS === "web") {
      alert("Alerta enviado aos teus contactos de emergência!");
    } else {
      Alert.alert(
        "Alerta Enviado",
        "Os teus contactos de emergência foram notificados com a tua localização atual."
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScreenScrollView>
      <View style={styles.profileHeader}>
        <Pressable onPress={() => navigation.navigate("EditProfile")} style={styles.avatarContainer}>
          {user.photoUrl ? (
            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: ElaraColors.primary + "30" }]}>
              <ThemedText type="h1" style={[styles.avatarText, { color: ElaraColors.primary }]}>
                {getInitials(user.name)}
              </ThemedText>
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: ElaraColors.primary }]}>
            <Feather name="edit-2" size={12} color="#FFFFFF" />
          </View>
        </Pressable>
        <ThemedText type="h2" style={styles.userName}>
          {user.name}
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          {user.age} anos
        </ThemedText>
        {user.bio && (
          <ThemedText type="body" style={[styles.bio, { color: theme.textSecondary }]}>
            {user.bio}
          </ThemedText>
        )}
      </View>

      <Spacer height={Spacing["2xl"]} />

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Os meus valores
        </ThemedText>
        <View style={styles.tagsContainer}>
          {user.values.map((value) => (
            <View
              key={value}
              style={[styles.tag, { backgroundColor: ElaraColors.primary + "15" }]}
            >
              <ThemedText type="small" style={{ color: ElaraColors.primary }}>
                {value}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Os meus hobbies
        </ThemedText>
        <View style={styles.tagsContainer}>
          {user.hobbies.map((hobby) => (
            <View
              key={hobby}
              style={[styles.tag, { backgroundColor: ElaraColors.primarySoft }]}
            >
              <ThemedText type="small" style={{ color: ElaraColors.primaryStrong }}>
                {hobby}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <Spacer height={Spacing.xl} />

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Estilo de vida
        </ThemedText>
        <View style={styles.tagsContainer}>
          {user.lifestyle.map((style) => (
            <View
              key={style}
              style={[styles.tag, { backgroundColor: ElaraColors.success + "15" }]}
            >
              <ThemedText type="small" style={{ color: ElaraColors.success }}>
                {style}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <Spacer height={Spacing["2xl"]} />

      <View style={[styles.safetyCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.safetyHeader}>
          <View style={[styles.safetyIcon, { backgroundColor: ElaraColors.danger + "15" }]}>
            <Feather name="shield" size={24} color={ElaraColors.danger} />
          </View>
          <View style={styles.safetyInfo}>
            <ThemedText type="h4">Segurança</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {user.emergencyContacts.length} contacto(s) de emergência
            </ThemedText>
          </View>
        </View>

        <Spacer height={Spacing.lg} />

        {user.emergencyContacts.map((contact) => (
          <View key={contact.id} style={styles.emergencyContact}>
            <Feather name="user" size={16} color={theme.textSecondary} />
            <View style={styles.contactInfo}>
              <ThemedText type="body">{contact.name}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {contact.phone}
              </ThemedText>
            </View>
          </View>
        ))}

        <Spacer height={Spacing.lg} />

        <Pressable
          onPress={handleEmergencyAlert}
          style={({ pressed }) => [
            styles.emergencyButton,
            { backgroundColor: ElaraColors.danger, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="alert-triangle" size={20} color="#FFFFFF" />
          <ThemedText type="body" style={styles.emergencyButtonText}>
            Alerta de Emergência
          </ThemedText>
        </Pressable>
      </View>

      <Spacer height={Spacing["2xl"]} />

      <View style={styles.settingsSection}>
        <Pressable
          onPress={() => navigation.navigate("EditProfile")}
          style={({ pressed }) => [
            styles.settingsItem,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="edit-2" size={20} color={theme.text} />
          <ThemedText type="body" style={styles.settingsText}>
            Editar Perfil
          </ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("PrivacySecurity")}
          style={({ pressed }) => [
            styles.settingsItem,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="shield" size={20} color={theme.text} />
          <ThemedText type="body" style={styles.settingsText}>
            Privacidade e Seguranca
          </ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("HelpCenter")}
          style={({ pressed }) => [
            styles.settingsItem,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="help-circle" size={20} color={theme.text} />
          <ThemedText type="body" style={styles.settingsText}>
            Centro de Ajuda
          </ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

      </View>

      <Spacer height={Spacing.xl} />

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather name="log-out" size={20} color={ElaraColors.danger} />
        <ThemedText type="body" style={[styles.logoutText, { color: ElaraColors.danger }]}>
          Terminar Sessão
        </ThemedText>
      </Pressable>

      <Spacer height={Spacing["3xl"]} />

      <Modal
        visible={showEmergencyModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowEmergencyModal(false)}
      >
        <View style={styles.emergencyModalOverlay}>
          <View style={[styles.emergencyModalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={[styles.emergencyModalIcon, { backgroundColor: ElaraColors.danger + "15" }]}>
              <Feather name="alert-triangle" size={48} color={ElaraColors.danger} />
            </View>
            <ThemedText type="h2" style={styles.emergencyModalTitle}>
              Alerta de Emergência
            </ThemedText>
            <ThemedText type="body" style={[styles.emergencyModalText, { color: theme.textSecondary }]}>
              Isto enviará a tua localização atual para os teus contactos de emergência.
            </ThemedText>

            <Spacer height={Spacing.xl} />

            <Button onPress={sendEmergencyAlert} style={{ backgroundColor: ElaraColors.danger }}>
              Enviar Alerta
            </Button>

            <Spacer height={Spacing.md} />

            <Pressable
              onPress={() => setShowEmergencyModal(false)}
              style={({ pressed }) => [
                styles.cancelButton,
                { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                Cancelar
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    fontSize: 36,
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  bio: {
    textAlign: "center",
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  section: {},
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  safetyCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  safetyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  safetyInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  emergencyContact: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  contactInfo: {
    flex: 1,
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  emergencyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  settingsSection: {
    gap: Spacing.sm,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  settingsText: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  logoutText: {
    fontWeight: "600",
  },
  emergencyModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  emergencyModalContent: {
    width: "100%",
    maxWidth: 340,
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.xl,
    alignItems: "center",
  },
  emergencyModalIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emergencyModalTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  emergencyModalText: {
    textAlign: "center",
    lineHeight: 22,
  },
  cancelButton: {
    width: "100%",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
});
