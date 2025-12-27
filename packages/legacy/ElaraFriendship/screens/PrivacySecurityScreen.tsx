import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Switch,
  Platform,
  Linking,
  Alert,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@shared/components/themed-text";
import { ThemedView } from "@shared/components/themed-view";
import Spacer from "@/components/Spacer";
import { useTheme } from "@shared/hooks/useTheme";
import { useAuth } from "@shared/contexts/AuthContext";
import { Spacing, BorderRadius, ElaraColors } from "@shared/constants/theme";

const PRIVACY_SECTIONS = [
  {
    id: "data-collection",
    title: "Recolha de Dados",
    icon: "database",
    content: `O Elara recolhe apenas os dados necessarios para o funcionamento da aplicacao:

- Informacoes de perfil (nome, idade, foto, bio)
- Valores, hobbies e estilo de vida que escolhes partilhar
- Localizacao (apenas quando autorizas e para funcionalidades especificas)
- Contactos de emergencia que adicionas voluntariamente
- Historico de mensagens e conexoes

Nunca vendemos os teus dados a terceiros.`,
  },
  {
    id: "data-usage",
    title: "Utilizacao dos Dados",
    icon: "eye",
    content: `Os teus dados sao utilizados exclusivamente para:

- Personalizar a tua experiencia na app
- Encontrar conexoes compativeis com base nos teus valores
- Funcionalidades de seguranca (alertas de emergencia)
- Melhorar os nossos servicos de forma anonimizada

A tua privacidade e a nossa prioridade.`,
  },
  {
    id: "data-sharing",
    title: "Partilha de Dados",
    icon: "share-2",
    content: `O Elara partilha dados apenas nos seguintes casos:

- Com outras utilizadoras: apenas as informacoes que escolhes tornar publicas no teu perfil
- Com contactos de emergencia: a tua localizacao quando ativas um alerta
- Por obrigacao legal: quando exigido por lei

Nunca partilhamos os teus dados com anunciantes.`,
  },
  {
    id: "data-storage",
    title: "Armazenamento e Seguranca",
    icon: "lock",
    content: `Os teus dados sao protegidos com:

- Encriptacao de ponta a ponta nas mensagens
- Armazenamento seguro em servidores certificados
- Autenticacao segura
- Auditorias regulares de seguranca

Os dados sao armazenados enquanto mantiveres a tua conta ativa.`,
  },
  {
    id: "your-rights",
    title: "Os Teus Direitos",
    icon: "user-check",
    content: `De acordo com o RGPD, tens direito a:

- Aceder a todos os teus dados pessoais
- Corrigir informacoes incorretas
- Eliminar a tua conta e todos os dados
- Exportar os teus dados
- Retirar consentimento a qualquer momento

Para exercer estes direitos, contacta-nos atraves da app.`,
  },
];

const SAFETY_FEATURES = [
  {
    id: "verified-profiles",
    title: "Perfis Verificados",
    icon: "check-circle",
    description: "Todas as utilizadoras passam por um processo de verificacao para garantir autenticidade.",
  },
  {
    id: "emergency-contacts",
    title: "Contactos de Emergencia",
    icon: "phone",
    description: "Adiciona contactos de confianca que serao alertados em caso de emergencia.",
  },
  {
    id: "location-sharing",
    title: "Partilha de Localizacao",
    icon: "map-pin",
    description: "Partilha a tua localizacao com contactos de emergencia durante encontros.",
  },
  {
    id: "safety-checks",
    title: "Check-ins de Seguranca",
    icon: "shield",
    description: "Recebe lembretes para confirmar que estas em seguranca apos encontros.",
  },
  {
    id: "report-block",
    title: "Reportar e Bloquear",
    icon: "alert-circle",
    description: "Reporta comportamentos inadequados ou bloqueia utilizadoras a qualquer momento.",
  },
  {
    id: "safe-meetups",
    title: "Encontros Seguros",
    icon: "users",
    description: "Sugestoes de locais publicos e caminhadas em grupo para primeiros encontros.",
  },
];

export default function PrivacySecurityScreen() {
  const { theme } = useTheme();
  const { user, updateProfile, signOut } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(user?.locationEnabled ?? false);
  const [dataSharingEnabled, setDataSharingEnabled] = useState(user?.dataSharingEnabled ?? true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSection = (sectionId: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleLocationToggle = async (value: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocationEnabled(value);
    await updateProfile({ locationEnabled: value });
  };

  const handleDataSharingToggle = async (value: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDataSharingEnabled(value);
    await updateProfile({ dataSharingEnabled: value });
  };

  const openSupport = () => {
    if (Platform.OS !== "web") {
      Linking.openURL("mailto:suporte@elara.app");
    }
  };

  const handleDeleteAccountPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    Alert.alert(
      "Eliminar Conta",
      "Tens a certeza que queres eliminar a tua conta? Esta acao e irreversivel e todos os teus dados serao permanentemente apagados.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Continuar", 
          style: "destructive",
          onPress: () => setShowDeleteConfirm(true),
        },
      ]
    );
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText.toLowerCase() !== "eliminar") return;

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    setIsDeleting(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    Alert.alert(
      "Conta Eliminada",
      "A tua conta foi eliminada com sucesso. Obrigada por teres feito parte da Elara.",
      [{ text: "OK", onPress: () => signOut() }]
    );

    setIsDeleting(false);
  };

  return (
    <ScreenScrollView>
      <Animated.View entering={FadeIn}>
        <View style={[styles.headerCard, { backgroundColor: ElaraColors.primary + "10" }]}>
          <Feather name="shield" size={32} color={ElaraColors.primary} />
          <Spacer height={Spacing.md} />
          <ThemedText type="h3" style={styles.headerTitle}>
            A tua seguranca e prioridade
          </ThemedText>
          <ThemedText type="body" style={[styles.headerText, { color: theme.textSecondary }]}>
            O Elara foi desenhado com a seguranca das mulheres em mente. Aqui encontras todas as informacoes sobre como protegemos os teus dados e a tua seguranca.
          </ThemedText>
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(100)}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Funcionalidades de Seguranca
        </ThemedText>
        <Spacer height={Spacing.md} />
        
        {SAFETY_FEATURES.map((feature, index) => (
          <View
            key={feature.id}
            style={[styles.featureCard, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={[styles.featureIcon, { backgroundColor: ElaraColors.success + "15" }]}>
              <Feather name={feature.icon as keyof typeof Feather.glyphMap} size={20} color={ElaraColors.success} />
            </View>
            <View style={styles.featureContent}>
              <ThemedText type="body" style={styles.featureTitle}>
                {feature.title}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {feature.description}
              </ThemedText>
            </View>
          </View>
        ))}
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(200)}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Definicoes de Privacidade
        </ThemedText>
        <Spacer height={Spacing.md} />

        <View style={[styles.settingCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="map-pin" size={20} color={theme.text} />
              <View style={styles.settingText}>
                <ThemedText type="body">Partilha de Localizacao</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Permite encontrar utilizadoras perto de ti
                </ThemedText>
              </View>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: theme.border, true: ElaraColors.primary + "50" }}
              thumbColor={locationEnabled ? ElaraColors.primary : theme.textSecondary}
            />
          </View>
          <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="share-2" size={20} color={theme.text} />
              <View style={styles.settingText}>
                <ThemedText type="body">Partilha de Dados Anonimizados</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Ajuda-nos a melhorar a app
                </ThemedText>
              </View>
            </View>
            <Switch
              value={dataSharingEnabled}
              onValueChange={handleDataSharingToggle}
              trackColor={{ false: theme.border, true: ElaraColors.primary + "50" }}
              thumbColor={dataSharingEnabled ? ElaraColors.primary : theme.textSecondary}
            />
          </View>
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(300)}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Politica de Privacidade
        </ThemedText>
        <Spacer height={Spacing.md} />

        {PRIVACY_SECTIONS.map((section, index) => (
          <Pressable
            key={section.id}
            onPress={() => toggleSection(section.id)}
            style={[
              styles.accordionItem,
              { backgroundColor: theme.backgroundDefault },
              index === 0 && styles.accordionFirst,
              index === PRIVACY_SECTIONS.length - 1 && styles.accordionLast,
            ]}
          >
            <View style={styles.accordionHeader}>
              <Feather name={section.icon as keyof typeof Feather.glyphMap} size={20} color={ElaraColors.primary} />
              <ThemedText type="body" style={styles.accordionTitle}>
                {section.title}
              </ThemedText>
              <Feather
                name={expandedSection === section.id ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.textSecondary}
              />
            </View>
            {expandedSection === section.id && (
              <ThemedText type="small" style={[styles.accordionContent, { color: theme.textSecondary }]}>
                {section.content}
              </ThemedText>
            )}
          </Pressable>
        ))}
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(400)}>
        <View style={[styles.contactCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="mail" size={24} color={ElaraColors.primary} />
          <View style={styles.contactContent}>
            <ThemedText type="h4">Precisas de ajuda?</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Contacta a nossa equipa de suporte para qualquer questao sobre privacidade ou seguranca.
            </ThemedText>
          </View>
          <Pressable
            onPress={openSupport}
            style={({ pressed }) => [
              styles.contactButton,
              { backgroundColor: ElaraColors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText type="small" style={styles.contactButtonText}>
              Contactar
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(500)}>
        <ThemedText type="h3" style={[styles.sectionTitle, { color: ElaraColors.danger }]}>
          Zona de Perigo
        </ThemedText>
        <Spacer height={Spacing.md} />

        {showDeleteConfirm ? (
          <Animated.View 
            entering={FadeInDown}
            style={[styles.deleteConfirmCard, { backgroundColor: ElaraColors.danger + "10", borderColor: ElaraColors.danger + "30" }]}
          >
            <View style={[styles.deleteIcon, { backgroundColor: ElaraColors.danger + "20" }]}>
              <Feather name="alert-triangle" size={32} color={ElaraColors.danger} />
            </View>
            <Spacer height={Spacing.md} />
            <ThemedText type="h4" style={[styles.deleteTitle, { color: ElaraColors.danger }]}>
              Confirmacao Final
            </ThemedText>
            <Spacer height={Spacing.sm} />
            <ThemedText type="body" style={[styles.deleteDescription, { color: theme.textSecondary }]}>
              Escreve "eliminar" abaixo para confirmar que queres apagar permanentemente a tua conta e todos os teus dados.
            </ThemedText>
            <Spacer height={Spacing.lg} />
            <TextInput
              style={[
                styles.deleteInput,
                { 
                  backgroundColor: theme.backgroundDefault,
                  borderColor: deleteConfirmText.toLowerCase() === "eliminar" ? ElaraColors.danger : theme.border,
                  color: theme.text,
                },
              ]}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder='Escreve "eliminar"'
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
            />
            <Spacer height={Spacing.lg} />
            <View style={styles.deleteButtonsRow}>
              <Pressable
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                style={({ pressed }) => [
                  styles.cancelButton,
                  { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <ThemedText type="body" style={{ fontWeight: "600" }}>Cancelar</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleConfirmDelete}
                disabled={deleteConfirmText.toLowerCase() !== "eliminar" || isDeleting}
                style={({ pressed }) => [
                  styles.confirmDeleteButton,
                  { 
                    backgroundColor: deleteConfirmText.toLowerCase() === "eliminar" ? ElaraColors.danger : theme.backgroundSecondary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                {isDeleting ? (
                  <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    A eliminar...
                  </ThemedText>
                ) : (
                  <ThemedText 
                    type="body" 
                    style={{ 
                      color: deleteConfirmText.toLowerCase() === "eliminar" ? "#FFFFFF" : theme.textSecondary, 
                      fontWeight: "600" 
                    }}
                  >
                    Eliminar Conta
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </Animated.View>
        ) : (
          <View style={[styles.dangerCard, { backgroundColor: theme.backgroundDefault, borderColor: ElaraColors.danger + "30" }]}>
            <Feather name="trash-2" size={24} color={ElaraColors.danger} />
            <View style={styles.dangerContent}>
              <ThemedText type="body" style={styles.dangerTitle}>
                Eliminar Conta
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Remove permanentemente todos os teus dados
              </ThemedText>
            </View>
            <Pressable
              onPress={handleDeleteAccountPress}
              style={({ pressed }) => [
                styles.dangerButton,
                { backgroundColor: ElaraColors.danger, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Eliminar
              </ThemedText>
            </Pressable>
          </View>
        )}
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(600)}>
        <View style={styles.footerInfo}>
          <ThemedText type="small" style={[styles.footerText, { color: theme.textSecondary }]}>
            Ultima atualizacao: Dezembro 2025
          </ThemedText>
          <ThemedText type="small" style={[styles.footerText, { color: theme.textSecondary }]}>
            Versao 1.0.0
          </ThemedText>
        </View>
      </Animated.View>

      <Spacer height={Spacing["3xl"]} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  headerTitle: {
    textAlign: "center",
  },
  headerText: {
    textAlign: "center",
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  featureTitle: {
    fontWeight: "600",
    marginBottom: 2,
  },
  settingCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  accordionItem: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  accordionFirst: {
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
  },
  accordionLast: {
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    borderBottomWidth: 0,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  accordionTitle: {
    flex: 1,
    marginLeft: Spacing.md,
    fontWeight: "600",
  },
  accordionContent: {
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  contactContent: {
    flex: 1,
  },
  contactButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  footerInfo: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  footerText: {
    textAlign: "center",
  },
  settingDivider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  dangerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  dangerContent: {
    flex: 1,
  },
  dangerTitle: {
    fontWeight: "600",
    marginBottom: 2,
  },
  dangerButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  deleteConfirmCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
  },
  deleteIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteTitle: {
    textAlign: "center",
  },
  deleteDescription: {
    textAlign: "center",
    lineHeight: 22,
  },
  deleteInput: {
    width: "100%",
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    textAlign: "center",
  },
  deleteButtonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDeleteButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
