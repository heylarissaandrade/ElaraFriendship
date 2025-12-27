import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenScrollView } from "@shared/components/ScreenScrollView";
import { ThemedView } from "@shared/components/themed-view";
import { ThemedText } from "@shared/components/themed-text";
import Spacer from "@shared/components/Spacer";
import { useTheme } from "@shared/hooks/useTheme";
import { Spacing, BorderRadius, ElaraColors } from "@shared/constants/theme";

type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  PrivacySecurity: undefined;
  HelpCenter: undefined;
  Feedback: undefined;
};

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: "geral" | "seguranca" | "conexoes" | "caminhadas" | "conta";
};

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    question: "O que e a Elara?",
    answer: "A Elara e uma rede de apoio segura para mulheres entre os 18 e 35 anos. Focamo-nos em conexoes genuinas baseadas em valores partilhados, encorajando encontros seguros e significativos em vez de interacoes superficiais.",
    category: "geral",
  },
  {
    id: "2",
    question: "Como funciona o sistema de convites?",
    answer: "Em vez de mensagens genericas, a Elara utiliza convites com proposito. Podes enviar 4 tipos de convites: Primeiro Cafe, Caminhada, Evento Cultural ou Atividade em Grupo. Isto encoraja encontros reais e significativos.",
    category: "conexoes",
  },
  {
    id: "3",
    question: "O que sao as Caminhadas Elara?",
    answer: "As Caminhadas Elara sao o nosso sistema de acompanhamento seguro. Quando marcas um encontro, podes ativar uma caminhada que partilha a tua localizacao em tempo real com os teus contactos de emergencia. Recebes check-ins automaticos e podes enviar alertas se precisares.",
    category: "caminhadas",
  },
  {
    id: "4",
    question: "Como adiciono contactos de emergencia?",
    answer: "Vai ao teu Perfil e toca em 'Contactos de Emergencia'. Podes adicionar ate 3 contactos de confianca que serao notificados durante as Caminhadas Elara ou em situacoes de emergencia.",
    category: "seguranca",
  },
  {
    id: "5",
    question: "O que e o Modo Seguranca?",
    answer: "O Modo Seguranca e ativado antes de um encontro. Partilha automaticamente o teu percurso com os contactos de emergencia, envia check-ins periodicos e permite enviar alertas discretos se te sentires desconfortavel.",
    category: "seguranca",
  },
  {
    id: "6",
    question: "Porque existe um limite de mensagens?",
    answer: "Limitamos a 10 mensagens antes de ser necessario enviar um convite. Isto encoraja encontros reais em vez de conversas infinitas, promovendo conexoes genuinas e evitando comportamentos de scrolling passivo.",
    category: "conexoes",
  },
  {
    id: "7",
    question: "O que e a pontuacao de confianca?",
    answer: "A pontuacao de confianca reflete a fiabilidade de uma utilizadora. Aumenta com perfil verificado, encontros bem-sucedidos, participacao em atividades de grupo e feedback positivo. Ajuda a criar uma comunidade de confianca.",
    category: "geral",
  },
  {
    id: "8",
    question: "Como posso verificar o meu perfil?",
    answer: "Para verificar o teu perfil, vai a Definicoes > Verificacao. Pedimos uma selfie em tempo real que comparamos com as tuas fotos de perfil. Perfis verificados recebem um distintivo especial.",
    category: "conta",
  },
  {
    id: "9",
    question: "Posso denunciar comportamentos inadequados?",
    answer: "Sim! A seguranca e a nossa prioridade. Em qualquer perfil ou conversa, toca no icone de menu e seleciona 'Denunciar'. A nossa equipa analisa todas as denuncias em 24 horas e toma as medidas necessarias.",
    category: "seguranca",
  },
  {
    id: "10",
    question: "Como elimino a minha conta?",
    answer: "Vai a Perfil > Privacidade e Seguranca > Eliminar Conta. Tens 30 dias para reativar antes da eliminacao permanente. Todos os teus dados serao apagados de acordo com o RGPD.",
    category: "conta",
  },
];

const GUIDE_ITEMS = [
  {
    id: "guide-1",
    title: "Primeiros Passos",
    description: "Como configurar o teu perfil e comecar",
    icon: "play-circle" as const,
    content: "1. Completa o teu perfil com fotos autenticas\n2. Adiciona os teus valores e hobbies\n3. Configura os contactos de emergencia\n4. Explora a comunidade no separador Descobrir\n5. Envia o teu primeiro convite com proposito",
  },
  {
    id: "guide-2",
    title: "Encontros Seguros",
    description: "Dicas para encontros em locais publicos",
    icon: "shield" as const,
    content: "1. Escolhe sempre locais publicos para o primeiro encontro\n2. Informa um contacto de confianca sobre os teus planos\n3. Ativa o Modo Seguranca antes de sair\n4. Mantem o telemovel carregado\n5. Confia nos teus instintos - se algo parecer estranho, e valido saíres",
  },
  {
    id: "guide-3",
    title: "Usar as Caminhadas",
    description: "Guia completo do sistema de acompanhamento",
    icon: "map-pin" as const,
    content: "1. Vai ao separador Caminhadas e toca em Criar\n2. Define o destino e hora prevista\n3. Seleciona os contactos que receberao a tua localizacao\n4. Durante a caminhada, recebes check-ins automaticos\n5. No fim, confirma que chegaste em seguranca",
  },
  {
    id: "guide-4",
    title: "Maximizar Conexoes",
    description: "Como criar um perfil atrativo e autentico",
    icon: "heart" as const,
    content: "1. Usa fotos que mostrem a tua personalidade\n2. Escreve uma bio genuina e interessante\n3. Seleciona valores que realmente representam quem es\n4. Envia convites personalizados com proposito\n5. Participa em atividades de grupo para aumentar a confianca",
  },
];

const CATEGORY_LABELS: Record<FAQItem["category"], string> = {
  geral: "Geral",
  seguranca: "Seguranca",
  conexoes: "Conexoes",
  caminhadas: "Caminhadas",
  conta: "Conta",
};

const CATEGORY_COLORS: Record<FAQItem["category"], string> = {
  geral: ElaraColors.primary,
  seguranca: ElaraColors.success,
  conexoes: ElaraColors.accent,
  caminhadas: ElaraColors.safety,
  conta: ElaraColors.warning,
};

export default function HelpCenterScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FAQItem["category"] | "todos">("todos");

  const toggleFAQ = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const selectCategory = (category: FAQItem["category"] | "todos") => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setSelectedCategory(category);
    setExpandedFAQ(null);
  };

  const filteredFAQs = selectedCategory === "todos" 
    ? FAQ_ITEMS 
    : FAQ_ITEMS.filter(item => item.category === selectedCategory);

  const openEmail = () => {
    Linking.openURL("mailto:suporte@elara.app?subject=Pedido de Ajuda");
  };

  const openChat = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      "Chat de Suporte",
      "O chat de suporte estara disponivel em breve. Entretanto, podes contactar-nos por email para suporte@elara.app",
      [
        { text: "Enviar Email", onPress: openEmail },
        { text: "OK", style: "cancel" },
      ]
    );
  };

  const openGuide = (guide: typeof GUIDE_ITEMS[0]) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(guide.title, guide.content, [{ text: "Entendi" }]);
  };

  const openFeedback = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Feedback");
  };

  return (
    <ScreenScrollView>
      <Animated.View entering={FadeIn}>
        <ThemedText type="h2" style={styles.title}>
          Como podemos ajudar?
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Encontra respostas rapidas ou contacta a nossa equipa
        </ThemedText>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(100)}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Contacto Rapido
        </ThemedText>
        <View style={styles.contactGrid}>
          <Pressable
            onPress={openEmail}
            style={({ pressed }) => [
              styles.contactCard,
              { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View style={[styles.contactIcon, { backgroundColor: ElaraColors.primary + "20" }]}>
              <Feather name="mail" size={24} color={ElaraColors.primary} />
            </View>
            <ThemedText type="body" style={styles.contactLabel}>
              Email
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              suporte@elara.app
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={openChat}
            style={({ pressed }) => [
              styles.contactCard,
              { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View style={[styles.contactIcon, { backgroundColor: ElaraColors.success + "20" }]}>
              <Feather name="message-circle" size={24} color={ElaraColors.success} />
            </View>
            <ThemedText type="body" style={styles.contactLabel}>
              Chat
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Resposta em 2h
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(200)}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Guias e Tutoriais
        </ThemedText>
        <View style={styles.guidesContainer}>
          {GUIDE_ITEMS.map((guide) => (
            <Pressable
              key={guide.id}
              onPress={() => openGuide(guide)}
              style={({ pressed }) => [
                styles.guideCard,
                { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View style={[styles.guideIcon, { backgroundColor: ElaraColors.primary + "15" }]}>
                <Feather name={guide.icon} size={20} color={ElaraColors.primary} />
              </View>
              <View style={styles.guideContent}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {guide.title}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {guide.description}
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(300)}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Perguntas Frequentes
        </ThemedText>
        
        <View style={styles.categoryFilters}>
          <Pressable
            onPress={() => selectCategory("todos")}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === "todos" ? ElaraColors.primary : theme.backgroundSecondary,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{ color: selectedCategory === "todos" ? "#FFFFFF" : theme.text }}
            >
              Todos
            </ThemedText>
          </Pressable>
          {(Object.keys(CATEGORY_LABELS) as FAQItem["category"][]).map((cat) => (
            <Pressable
              key={cat}
              onPress={() => selectCategory(cat)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === cat ? CATEGORY_COLORS[cat] : theme.backgroundSecondary,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{ color: selectedCategory === cat ? "#FFFFFF" : theme.text }}
              >
                {CATEGORY_LABELS[cat]}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <Spacer height={Spacing.lg} />

        <View style={styles.faqContainer}>
          {filteredFAQs.map((faq) => {
            const isExpanded = expandedFAQ === faq.id;
            return (
              <Pressable
                key={faq.id}
                onPress={() => toggleFAQ(faq.id)}
                style={[
                  styles.faqItem,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <View style={styles.faqHeader}>
                  <View style={styles.faqQuestion}>
                    <View
                      style={[
                        styles.categoryDot,
                        { backgroundColor: CATEGORY_COLORS[faq.category] },
                      ]}
                    />
                    <ThemedText type="body" style={styles.faqQuestionText}>
                      {faq.question}
                    </ThemedText>
                  </View>
                  <Feather
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.textSecondary}
                  />
                </View>
                {isExpanded ? (
                  <Animated.View entering={FadeIn} style={styles.faqAnswer}>
                    <ThemedText type="body" style={{ color: theme.textSecondary, lineHeight: 22 }}>
                      {faq.answer}
                    </ThemedText>
                  </Animated.View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(400)}>
        <ThemedView
          style={[styles.emergencyCard, { backgroundColor: ElaraColors.danger + "15" }]}
        >
          <View style={styles.emergencyHeader}>
            <View style={[styles.emergencyIcon, { backgroundColor: ElaraColors.danger + "20" }]}>
              <Feather name="alert-triangle" size={24} color={ElaraColors.danger} />
            </View>
            <View style={styles.emergencyContent}>
              <ThemedText type="h4" style={{ color: ElaraColors.danger }}>
                Emergencia?
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Se estiveres em perigo imediato
              </ThemedText>
            </View>
          </View>
          <Spacer height={Spacing.md} />
          <ThemedText type="body" style={{ color: theme.textSecondary, lineHeight: 22 }}>
            Liga para o 112 (numero europeu de emergencia) ou para a PSP/GNR local. 
            A tua seguranca e a prioridade absoluta.
          </ThemedText>
          <Spacer height={Spacing.md} />
          <Pressable
            onPress={() => Linking.openURL("tel:112")}
            style={[styles.emergencyButton, { backgroundColor: ElaraColors.danger }]}
          >
            <Feather name="phone" size={18} color="#FFFFFF" />
            <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600", marginLeft: Spacing.sm }}>
              Ligar 112
            </ThemedText>
          </Pressable>
        </ThemedView>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(500)}>
        <ThemedView
          style={[styles.feedbackCard, { backgroundColor: theme.backgroundSecondary }]}
        >
          <Feather name="heart" size={32} color={ElaraColors.primary} />
          <Spacer height={Spacing.md} />
          <ThemedText type="h4" style={{ textAlign: "center" }}>
            A tua opiniao importa
          </ThemedText>
          <Spacer height={Spacing.sm} />
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Ajuda-nos a melhorar a Elara partilhando as tuas sugestoes e feedback
          </ThemedText>
          <Spacer height={Spacing.lg} />
          <Pressable
            onPress={openFeedback}
            style={[styles.feedbackButton, { borderColor: ElaraColors.primary }]}
          >
            <ThemedText type="body" style={{ color: ElaraColors.primary, fontWeight: "600" }}>
              Enviar Feedback
            </ThemedText>
          </Pressable>
        </ThemedView>
      </Animated.View>

      <Spacer height={Spacing["3xl"]} />

      <View style={styles.footer}>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
          Elara - Versao 1.0.0
        </ThemedText>
        <Spacer height={Spacing.xs} />
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
          Feito com carinho para mulheres que valorizam conexoes genuinas
        </ThemedText>
      </View>

      <Spacer height={Spacing.xl} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    lineHeight: 22,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  contactGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  contactCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  contactLabel: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  guidesContainer: {
    gap: Spacing.sm,
  },
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  guideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  guideContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  categoryFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  faqContainer: {
    gap: Spacing.sm,
  },
  faqItem: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestion: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  faqQuestionText: {
    flex: 1,
    fontWeight: "500",
  },
  faqAnswer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  emergencyCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyContent: {
    marginLeft: Spacing.md,
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  feedbackCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  feedbackButton: {
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  footer: {
    alignItems: "center",
  },
});
