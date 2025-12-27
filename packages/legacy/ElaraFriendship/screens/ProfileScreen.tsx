import { Feather } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Platform, Pressable, StyleSheet, Switch, View } from "react-native";

import { LanguageSelector } from "@/components/LanguageSelector";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import Spacer from "@/components/Spacer";
import { BorderRadius, ElaraColors, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import { ThemedText } from "@shared/components/themed-text";

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Profile">;
};

const AVATAR_COLORS = [
  "#9B7DFF", "#B49CFF", "#7B5CE6", "#2FD6C5",
  "#F26B7A", "#FF9770", "#4ECDC4", "#FFE66D",
];

function getAvatarColor(id: string) {
  return AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, updateProfile, signOut } = useAuth();
  const { currentLanguage, supportedLanguages } = useLanguage();
  const [locationEnabled, setLocationEnabled] = useState(user?.locationEnabled ?? false);
  const [dataSharingEnabled, setDataSharingEnabled] = useState(user?.dataSharingEnabled ?? false);
  const [profileHidden, setProfileHidden] = useState(user?.profileHidden ?? false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const currentLangName = supportedLanguages.find(l => l.code === currentLanguage)?.nativeName ?? "English";

  if (!user) {
    return (
      <ScreenScrollView>
        <View style={styles.emptyState}>
          <Feather name="user" size={48} color={theme.textSecondary} />
          <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
            {t("common.loading")}
          </ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  const avatarColor = getAvatarColor(user.id);
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleToggleLocation = async (value: boolean) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocationEnabled(value);
    await updateProfile({ locationEnabled: value });
  };

  const handleToggleDataSharing = async (value: boolean) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDataSharingEnabled(value);
    await updateProfile({ dataSharingEnabled: value });
  };

  const handleToggleProfileHidden = async (value: boolean) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProfileHidden(value);
    await updateProfile({ profileHidden: value });
  };

  const handleSignOut = () => {
    Alert.alert(
      t("profile.signOut"),
      t("profile.signOutConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("profile.signOut"), style: "destructive", onPress: signOut },
      ]
    );
  };

  return (
    <ScreenScrollView>
      <View style={styles.headerSection}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <ThemedText style={styles.avatarInitials}>{initials}</ThemedText>
        </View>
        <ThemedText type="h2" style={styles.name}>{user.name}, {user.age}</ThemedText>
        {user.trustScore !== undefined && (
          <View style={[styles.trustBadge, { backgroundColor: ElaraColors.success + "15" }]}>
            <Feather name="shield" size={14} color={ElaraColors.success} />
            <ThemedText style={{ color: ElaraColors.success, fontWeight: "600" }}>
              {user.trustScore}% {t("profile.trustworthy")}
            </ThemedText>
          </View>
        )}
        <ThemedText type="body" style={[styles.bio, { color: theme.textSecondary }]}>
          {user.bio}
        </ThemedText>
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundSecondary }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>{t("profile.values")}</ThemedText>
        <View style={styles.tagsRow}>
          {user.values.map(value => (
            <View key={value} style={[styles.tag, { backgroundColor: ElaraColors.primary + "15" }]}>
              <ThemedText style={{ color: ElaraColors.primary, fontWeight: "600" }}>{value}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundSecondary }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>{t("profile.hobbies")}</ThemedText>
        <View style={styles.tagsRow}>
          {user.hobbies.map(hobby => (
            <View key={hobby} style={[styles.tag, { backgroundColor: ElaraColors.success + "15" }]}>
              <ThemedText style={{ color: ElaraColors.success, fontWeight: "600" }}>{hobby}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundSecondary }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>{t("profile.statistics")}</ThemedText>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: ElaraColors.primary }}>
              {user.meetupsCompleted ?? 0}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("profile.meetupsCompleted")}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: ElaraColors.success }}>
              {user.safetyChecksCompleted ?? 0}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("profile.checkIns")}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: ElaraColors.accentCoral }}>
              {user.emergencyContacts.length}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("profile.contacts")}</ThemedText>
          </View>
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      <View style={[styles.settingsSection, { backgroundColor: theme.backgroundSecondary }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>{t("profile.privacy.title")}</ThemedText>
        
        <Pressable
          style={styles.settingRow}
          onPress={() => setShowLanguageModal(true)}
        >
          <View style={styles.settingInfo}>
            <Feather name="globe" size={20} color={ElaraColors.primary} />
            <View style={styles.settingText}>
              <ThemedText type="body">{t("common.language")}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {currentLangName}
              </ThemedText>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="map-pin" size={20} color={ElaraColors.primary} />
            <View style={styles.settingText}>
              <ThemedText type="body">{t("profile.privacy.shareLocation")}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {t("profile.privacy.shareLocationDesc")}
              </ThemedText>
            </View>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={handleToggleLocation}
            trackColor={{ false: theme.border, true: ElaraColors.primary + "50" }}
            thumbColor={locationEnabled ? ElaraColors.primary : theme.textSecondary}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="share-2" size={20} color={ElaraColors.primary} />
            <View style={styles.settingText}>
              <ThemedText type="body">{t("profile.privacy.dataSharing")}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {t("profile.privacy.dataSharingDesc")}
              </ThemedText>
            </View>
          </View>
          <Switch
            value={dataSharingEnabled}
            onValueChange={handleToggleDataSharing}
            trackColor={{ false: theme.border, true: ElaraColors.primary + "50" }}
            thumbColor={dataSharingEnabled ? ElaraColors.primary : theme.textSecondary}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="eye-off" size={20} color={ElaraColors.accentCoral} />
            <View style={styles.settingText}>
              <ThemedText type="body">{t("profile.privacy.hideProfile")}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {t("profile.privacy.hideProfileDesc")}
              </ThemedText>
            </View>
          </View>
          <Switch
            value={profileHidden}
            onValueChange={handleToggleProfileHidden}
            trackColor={{ false: theme.border, true: ElaraColors.accentCoral + "50" }}
            thumbColor={profileHidden ? ElaraColors.accentCoral : theme.textSecondary}
          />
        </View>
      </View>

      <Spacer height={Spacing.lg} />

      <View style={[styles.settingsSection, { backgroundColor: theme.backgroundSecondary }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>{t("profile.emergencyContacts")}</ThemedText>
        
        {user.emergencyContacts.length > 0 ? (
          user.emergencyContacts.map(contact => (
            <View key={contact.id} style={styles.contactRow}>
              <View style={[styles.contactAvatar, { backgroundColor: ElaraColors.accentTeal + "20" }]}>
                <Feather name="user" size={18} color={ElaraColors.accentTeal} />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText type="body">{contact.name}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>{contact.phone}</ThemedText>
              </View>
              <Feather name="shield" size={16} color={ElaraColors.success} />
            </View>
          ))
        ) : (
          <View style={styles.emptyContacts}>
            <Feather name="alert-circle" size={24} color={ElaraColors.accentCoral} />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
              {t("profile.addEmergencyContact")}
            </ThemedText>
          </View>
        )}
      </View>

      <Spacer height={Spacing["2xl"]} />

      <Pressable
        onPress={handleSignOut}
        style={[styles.signOutBtn, { borderColor: theme.border }]}
      >
        <Feather name="log-out" size={18} color={ElaraColors.accentCoral} />
        <ThemedText style={{ color: ElaraColors.accentCoral, fontWeight: "600" }}>{t("profile.signOut")}</ThemedText>
      </Pressable>

      <Spacer height={Spacing["4xl"]} />

      <LanguageSelector
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  name: {
    marginBottom: Spacing.xs,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  bio: {
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  settingsSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: 12,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
  },
  emptyContacts: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
  },
});
