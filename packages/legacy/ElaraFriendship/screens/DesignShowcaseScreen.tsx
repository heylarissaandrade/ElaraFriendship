import React, { useState } from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { ThemedView } from "@shared/components/themed-view";
import { ThemedText } from "@shared/components/themed-text";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  ElaraColors,
  Colors,
  Typography,
  Shadows,
} from "@/constants/theme";

export function DesignShowcaseScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <ThemedText type="h1" style={styles.sectionTitle}>
            Elara Design System
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing["2xl"] }}>
            Guia visual completo para melhorias de design
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <ThemedText type="h2" style={styles.sectionTitle}>
            Paleta de Cores
          </ThemedText>
          
          <ThemedText type="h4" style={styles.subsectionTitle}>
            Cores Primarias
          </ThemedText>
          <View style={styles.colorGrid}>
            <ColorSwatch color={ElaraColors.primary} name="Primary" hex="#9B7DFF" />
            <ColorSwatch color={ElaraColors.primarySoft} name="Primary Soft" hex="#E8E0FF" />
            <ColorSwatch color={ElaraColors.primaryStrong} name="Primary Strong" hex="#7B5CE6" />
            <ColorSwatch color={ElaraColors.accentCoral} name="Accent Coral" hex="#F26B7A" />
          </View>

          <ThemedText type="h4" style={styles.subsectionTitle}>
            Cores Funcionais
          </ThemedText>
          <View style={styles.colorGrid}>
            <ColorSwatch color={ElaraColors.success} name="Success" hex="#2ECC71" />
            <ColorSwatch color={ElaraColors.warning} name="Warning" hex="#FFC857" />
            <ColorSwatch color={ElaraColors.danger} name="Danger" hex="#FF4C6A" />
            <ColorSwatch color={ElaraColors.accentTeal} name="Safety/Teal" hex="#2FD6C5" />
          </View>

          <ThemedText type="h4" style={styles.subsectionTitle}>
            Fundos ({isDark ? "Modo Escuro" : "Modo Claro"})
          </ThemedText>
          <View style={styles.colorGrid}>
            <ColorSwatch color={theme.backgroundRoot} name="Root" hex={isDark ? "#06040A" : "#F6F2FF"} border />
            <ColorSwatch color={theme.backgroundDefault} name="Default" hex={isDark ? "#15101C" : "#FFFFFF"} border />
            <ColorSwatch color={theme.backgroundSecondary} name="Secondary" hex={isDark ? "#221A2B" : "#F3EEFF"} border />
            <ColorSwatch color={theme.backgroundTertiary} name="Tertiary" hex={isDark ? "#2E243A" : "#E8DEFF"} border />
          </View>

          <ThemedText type="h4" style={styles.subsectionTitle}>
            Texto
          </ThemedText>
          <View style={styles.colorGrid}>
            <ColorSwatch color={theme.text} name="Primary" hex={isDark ? "#F6F2FF" : "#221A2B"} />
            <ColorSwatch color={theme.textSecondary} name="Secondary" hex={isDark ? "#C5BEE0" : "#7C728C"} />
            <ColorSwatch color={ElaraColors.textMuted} name="Muted" hex="#A197B5" />
            <ColorSwatch color={theme.link} name="Link" hex={isDark ? "#2FD6C5" : "#9B7DFF"} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <ThemedText type="h2" style={styles.sectionTitle}>
            Tipografia
          </ThemedText>
          
          <Card elevation={1} style={styles.typographyCard}>
            <ThemedText type="h1">H1 - Titulo Principal</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              32pt, Bold, letter-spacing: -0.5
            </ThemedText>
          </Card>
          
          <Card elevation={1} style={styles.typographyCard}>
            <ThemedText type="h2">H2 - Titulo de Secao</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              24pt, Semibold
            </ThemedText>
          </Card>
          
          <Card elevation={1} style={styles.typographyCard}>
            <ThemedText type="h3">H3 - Subtitulo</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              20pt, Semibold
            </ThemedText>
          </Card>
          
          <Card elevation={1} style={styles.typographyCard}>
            <ThemedText type="h4">H4 - Titulo de Card</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              17pt, Semibold
            </ThemedText>
          </Card>
          
          <Card elevation={1} style={styles.typographyCard}>
            <ThemedText type="body">Body - Texto padrao para paragrafos e conteudo geral da aplicacao.</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              15pt, Regular
            </ThemedText>
          </Card>
          
          <Card elevation={1} style={styles.typographyCard}>
            <ThemedText type="small">Small - Texto secundario e descricoes</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              13pt, Regular
            </ThemedText>
          </Card>
          
          <Card elevation={1} style={styles.typographyCard}>
            <ThemedText type="caption">CAPTION - ETIQUETAS E METADADOS</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              12pt, Medium, letter-spacing: 0.3
            </ThemedText>
          </Card>
          
          <Card elevation={1} style={styles.typographyCard}>
            <ThemedText type="link">Link - Texto clicavel</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              15pt, Regular, cor: coral
            </ThemedText>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <ThemedText type="h2" style={styles.sectionTitle}>
            Botoes
          </ThemedText>
          
          <View style={styles.buttonSection}>
            <Button onPress={() => {}}>Botao Primario</Button>
            <ThemedText type="small" style={styles.buttonLabel}>
              Primary - Acoes principais
            </ThemedText>
          </View>
          
          <View style={styles.buttonSection}>
            <Button variant="secondary" onPress={() => {}}>Botao Secundario</Button>
            <ThemedText type="small" style={styles.buttonLabel}>
              Secondary - Acoes alternativas
            </ThemedText>
          </View>
          
          <View style={styles.buttonSection}>
            <Button variant="danger" onPress={() => {}}>Botao Perigo</Button>
            <ThemedText type="small" style={styles.buttonLabel}>
              Danger - Acoes destrutivas/emergencia
            </ThemedText>
          </View>
          
          <View style={styles.buttonSection}>
            <Button disabled onPress={() => {}}>Botao Desativado</Button>
            <ThemedText type="small" style={styles.buttonLabel}>
              Disabled - Estado inativo (opacity: 0.5)
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)}>
          <ThemedText type="h2" style={styles.sectionTitle}>
            Cards e Elevacao
          </ThemedText>
          
          <Card elevation={0} style={styles.elevationCard}>
            <ThemedText type="h4">Elevation 0</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Background Root - Nivel base
            </ThemedText>
          </Card>
          
          <Card elevation={1} style={styles.elevationCard}>
            <ThemedText type="h4">Elevation 1</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Background Default - Cards padrao
            </ThemedText>
          </Card>
          
          <Card elevation={2} style={styles.elevationCard}>
            <ThemedText type="h4">Elevation 2</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Background Secondary - Cards destacados
            </ThemedText>
          </Card>
          
          <Card elevation={3} style={styles.elevationCard}>
            <ThemedText type="h4">Elevation 3</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Background Tertiary - Modais e popups
            </ThemedText>
          </Card>
          
          <Card elevation={1} onPress={() => {}} style={styles.elevationCard}>
            <View style={styles.cardWithIcon}>
              <View style={[styles.iconCircle, { backgroundColor: ElaraColors.primary + "20" }]}>
                <Feather name="heart" size={20} color={ElaraColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="h4">Card Interativo</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Pressione para ver animacao de escala (0.98)
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600)}>
          <ThemedText type="h2" style={styles.sectionTitle}>
            Componentes de Interface
          </ThemedText>

          <ThemedText type="h4" style={styles.subsectionTitle}>
            Controle Segmentado
          </ThemedText>
          <View style={[styles.segmentedControl, { backgroundColor: theme.backgroundSecondary }]}>
            {["Perto de mim", "Minhas caminhadas"].map((label, index) => (
              <Pressable
                key={label}
                onPress={() => setActiveTab(index)}
                style={[
                  styles.segment,
                  activeTab === index && { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: activeTab === index ? theme.text : theme.textSecondary,
                    fontWeight: activeTab === index ? "600" : "400",
                  }}
                >
                  {label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <ThemedText type="h4" style={styles.subsectionTitle}>
            Chips de Filtro
          </ThemedText>
          <View style={styles.chipsContainer}>
            <FilterChip label="Hoje" icon="calendar" active />
            <FilterChip label="Fim de semana" icon="sun" />
            <FilterChip label="Ate 3 km" icon="map-pin" />
            <FilterChip label="Pet-friendly" icon="heart" active />
            <FilterChip label="Sem alcool" icon="coffee" />
          </View>

          <ThemedText type="h4" style={styles.subsectionTitle}>
            Tags com Cores
          </ThemedText>
          <View style={styles.tagsContainer}>
            <Tag label="Introvertidas" color="#9B59B6" icon="moon" />
            <Tag label="Extrovertidas" color="#E91E63" icon="users" />
            <Tag label="Yoga" color="#9C27B0" icon="feather" />
            <Tag label="Exercicio" color="#FF9800" icon="activity" />
            <Tag label="Pet-friendly" color="#E74C3C" icon="heart" />
            <Tag label="Passeio leve" color="#4CAF50" icon="wind" />
          </View>

          <ThemedText type="h4" style={styles.subsectionTitle}>
            Indicadores de Confianca
          </ThemedText>
          <Card elevation={1} style={styles.trustCard}>
            <View style={styles.trustRow}>
              <View style={styles.trustItem}>
                <View style={[styles.verifiedBadge, { backgroundColor: ElaraColors.success }]}>
                  <Feather name="check" size={12} color="#fff" />
                </View>
                <ThemedText type="small">Verificada</ThemedText>
              </View>
              <View style={styles.trustItem}>
                <Feather name="award" size={16} color={ElaraColors.success} />
                <ThemedText type="small" style={{ color: ElaraColors.success }}>
                  95% Confianca
                </ThemedText>
              </View>
              <View style={styles.trustItem}>
                <Feather name="users" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  12 encontros
                </ThemedText>
              </View>
            </View>
          </Card>

          <ThemedText type="h4" style={styles.subsectionTitle}>
            Banner de Seguranca
          </ThemedText>
          <View style={[styles.safetyBanner, { backgroundColor: ElaraColors.safety + "15" }]}>
            <View style={styles.safetyBannerContent}>
              <View style={[styles.safetyIcon, { backgroundColor: ElaraColors.safety + "25" }]}>
                <Feather name="shield" size={20} color={ElaraColors.safety} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="h4" style={{ color: ElaraColors.safety }}>
                  Caminhada em 2h
                </ThemedText>
                <ThemedText type="small" style={{ color: ElaraColors.safety }}>
                  Os teus contactos de emergencia serao notificados
                </ThemedText>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700)}>
          <ThemedText type="h2" style={styles.sectionTitle}>
            Icones (Feather)
          </ThemedText>
          
          <Card elevation={1} style={styles.iconsCard}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              Navegacao
            </ThemedText>
            <View style={styles.iconsGrid}>
              <IconItem name="compass" label="Descobrir" />
              <IconItem name="map" label="Mapa" />
              <IconItem name="navigation" label="Caminhar" />
              <IconItem name="message-circle" label="Conexoes" />
              <IconItem name="user" label="Perfil" />
            </View>
          </Card>
          
          <Card elevation={1} style={styles.iconsCard}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              Acoes
            </ThemedText>
            <View style={styles.iconsGrid}>
              <IconItem name="heart" label="Gostar" />
              <IconItem name="x" label="Passar" />
              <IconItem name="star" label="Super" />
              <IconItem name="send" label="Enviar" />
              <IconItem name="plus" label="Adicionar" />
            </View>
          </Card>
          
          <Card elevation={1} style={styles.iconsCard}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              Seguranca
            </ThemedText>
            <View style={styles.iconsGrid}>
              <IconItem name="shield" label="Protecao" color={ElaraColors.safety} />
              <IconItem name="alert-triangle" label="Alerta" color={ElaraColors.warning} />
              <IconItem name="phone" label="Emergencia" color={ElaraColors.danger} />
              <IconItem name="check-circle" label="Verificado" color={ElaraColors.success} />
              <IconItem name="lock" label="Privado" />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800)}>
          <ThemedText type="h2" style={styles.sectionTitle}>
            Espacamento (Spacing)
          </ThemedText>
          
          <Card elevation={1} style={styles.spacingCard}>
            <SpacingItem name="xs" value={4} />
            <SpacingItem name="sm" value={8} />
            <SpacingItem name="md" value={12} />
            <SpacingItem name="lg" value={16} />
            <SpacingItem name="xl" value={20} />
            <SpacingItem name="2xl" value={24} />
            <SpacingItem name="3xl" value={32} />
            <SpacingItem name="4xl" value={40} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(900)}>
          <ThemedText type="h2" style={styles.sectionTitle}>
            Border Radius
          </ThemedText>
          
          <View style={styles.radiusGrid}>
            <RadiusItem name="xs" value={8} />
            <RadiusItem name="sm" value={12} />
            <RadiusItem name="md" value={16} />
            <RadiusItem name="lg" value={20} />
            <RadiusItem name="xl" value={24} />
            <RadiusItem name="full" value={9999} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000)}>
          <ThemedText type="h2" style={styles.sectionTitle}>
            Exemplo de Card Completo
          </ThemedText>
          
          <Card elevation={1} style={styles.exampleCard}>
            <View style={styles.exampleHeader}>
              <View style={[styles.avatar, { backgroundColor: ElaraColors.primary + "25" }]}>
                <ThemedText style={{ color: ElaraColors.primary, fontWeight: "700", fontSize: 16 }}>
                  MC
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <ThemedText type="h4">Maria Costa</ThemedText>
                  <View style={[styles.verifiedBadge, { backgroundColor: ElaraColors.success }]}>
                    <Feather name="check" size={10} color="#fff" />
                  </View>
                </View>
                <View style={styles.trustRowSmall}>
                  <Feather name="award" size={12} color={ElaraColors.success} />
                  <ThemedText type="small" style={{ color: ElaraColors.success }}>
                    Confianca Alta
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    12 encontros
                  </ThemedText>
                </View>
              </View>
              <View style={[styles.timeBadge, { backgroundColor: ElaraColors.success + "15" }]}>
                <Feather name="clock" size={12} color={ElaraColors.success} />
                <ThemedText type="small" style={{ color: ElaraColors.success, fontWeight: "600" }}>
                  15:30
                </ThemedText>
              </View>
            </View>

            <ThemedText type="h4" style={{ marginTop: Spacing.md }}>
              Parque Eduardo VII
            </ThemedText>
            
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={12} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                1.2 km de ti
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>•</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                ~45 min
              </ThemedText>
            </View>

            <View style={styles.tagsRow}>
              <Tag label="Yoga" color="#9C27B0" icon="feather" small />
              <Tag label="Passeio leve" color="#4CAF50" icon="wind" small />
            </View>

            <View style={styles.participantsRow}>
              <View style={styles.miniAvatars}>
                {["A", "B", "C"].map((letter, i) => (
                  <View
                    key={letter}
                    style={[
                      styles.miniAvatar,
                      {
                        backgroundColor: ElaraColors.primary + "30",
                        marginLeft: i > 0 ? -8 : 0,
                        zIndex: 3 - i,
                        borderColor: theme.backgroundDefault,
                      },
                    ]}
                  >
                    <ThemedText style={styles.miniAvatarText}>{letter}</ThemedText>
                  </View>
                ))}
              </View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                3/4 vagas
              </ThemedText>
            </View>

            <View style={[styles.actionsRow, { borderTopColor: theme.border }]}>
              <Pressable style={styles.actionButton}>
                <Feather name="info" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Ver detalhes
                </ThemedText>
              </Pressable>
              <Pressable style={[styles.primaryAction, { backgroundColor: ElaraColors.primary }]}>
                <Feather name="user-plus" size={16} color="#FFFFFF" />
                <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Juntar-me
                </ThemedText>
              </Pressable>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

function ColorSwatch({ color, name, hex, border }: { color: string; name: string; hex: string; border?: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={styles.colorSwatch}>
      <View
        style={[
          styles.colorBox,
          { backgroundColor: color },
          border && { borderWidth: 1, borderColor: theme.border },
        ]}
      />
      <ThemedText type="small" style={{ fontWeight: "600" }}>{name}</ThemedText>
      <ThemedText type="caption" style={{ color: theme.textSecondary }}>{hex}</ThemedText>
    </View>
  );
}

function FilterChip({ label, icon, active }: { label: string; icon: string; active?: boolean }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.filterChip,
        {
          backgroundColor: active ? ElaraColors.primary : theme.backgroundSecondary,
        },
      ]}
    >
      <Feather name={icon as any} size={14} color={active ? "#FFFFFF" : theme.textSecondary} />
      <ThemedText
        type="small"
        style={{ color: active ? "#FFFFFF" : theme.textSecondary, fontWeight: active ? "600" : "400" }}
      >
        {label}
      </ThemedText>
    </View>
  );
}

function Tag({ label, color, icon, small }: { label: string; color: string; icon: string; small?: boolean }) {
  return (
    <View style={[styles.tag, { backgroundColor: color + "15" }]}>
      <Feather name={icon as any} size={small ? 10 : 12} color={color} />
      <ThemedText type="small" style={{ color, fontSize: small ? 11 : 13 }}>
        {label}
      </ThemedText>
    </View>
  );
}

function IconItem({ name, label, color }: { name: string; label: string; color?: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.iconItem}>
      <View style={[styles.iconBox, { backgroundColor: (color || ElaraColors.primary) + "15" }]}>
        <Feather name={name as any} size={20} color={color || ElaraColors.primary} />
      </View>
      <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
        {label}
      </ThemedText>
    </View>
  );
}

function SpacingItem({ name, value }: { name: string; value: number }) {
  const { theme } = useTheme();
  return (
    <View style={styles.spacingItem}>
      <ThemedText type="small" style={{ width: 40 }}>{name}</ThemedText>
      <View style={[styles.spacingBar, { width: value * 4, backgroundColor: ElaraColors.primary }]} />
      <ThemedText type="small" style={{ color: theme.textSecondary }}>{value}px</ThemedText>
    </View>
  );
}

function RadiusItem({ name, value }: { name: string; value: number }) {
  const { theme } = useTheme();
  return (
    <View style={styles.radiusItem}>
      <View
        style={[
          styles.radiusBox,
          { borderRadius: Math.min(value, 24), backgroundColor: ElaraColors.primary + "30" },
        ]}
      />
      <ThemedText type="small" style={{ fontWeight: "600" }}>{name}</ThemedText>
      <ThemedText type="caption" style={{ color: theme.textSecondary }}>{value}px</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.lg,
  },
  subsectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  colorSwatch: {
    alignItems: "center",
    width: 70,
  },
  colorBox: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  typographyCard: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  buttonSection: {
    marginBottom: Spacing.lg,
  },
  buttonLabel: {
    marginTop: Spacing.xs,
    textAlign: "center",
    color: "#6B6766",
  },
  elevationCard: {
    marginBottom: Spacing.md,
  },
  cardWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  trustCard: {
    marginTop: Spacing.sm,
  },
  trustRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  safetyBanner: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  safetyBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  safetyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconsCard: {
    marginBottom: Spacing.md,
  },
  iconsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  iconItem: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  spacingCard: {
    gap: Spacing.sm,
  },
  spacingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  spacingBar: {
    height: 16,
    borderRadius: 4,
  },
  radiusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
  },
  radiusItem: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  radiusBox: {
    width: 48,
    height: 48,
  },
  exampleCard: {
    marginBottom: Spacing["2xl"],
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  trustRowSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: 2,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  tagsRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  participantsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  miniAvatars: {
    flexDirection: "row",
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  miniAvatarText: {
    fontSize: 11,
    fontWeight: "600",
    color: ElaraColors.primary,
  },
  actionsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flex: 1,
  },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
});
