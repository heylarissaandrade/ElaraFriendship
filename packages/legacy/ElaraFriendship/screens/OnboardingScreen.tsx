import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Image,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  interpolate,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
} from "react-native-reanimated";

import { ThemedText } from "@shared/components/themed-text";
import { ThemedView } from "@shared/components/themed-view";
import { PulsingButton } from "@/components/PulsingButton";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { 
  useAuth, 
  UserProfile, 
  EmergencyContact,
  Intent,
  SocialEnergy,
  MeetingPreferences,
  FrequencyPreference,
  PhaseOfLife,
  VerificationStatus
} from "@/contexts/AuthContext";
import { Spacing, BorderRadius, ElaraColors, Typography } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const VALUES_OPTIONS = [
  "Autenticidade", "Empatia", "Crescimento Pessoal", "Familia",
  "Liberdade", "Criatividade", "Honestidade", "Compaixao",
  "Aventura", "Sustentabilidade", "Comunidade", "Espiritualidade",
  "Respeito", "Lealdade", "Gratidao", "Humildade",
  "Coragem", "Paciencia", "Generosidade", "Justica",
  "Independencia", "Sabedoria", "Harmonia", "Confianca",
];

const HOBBIES_OPTIONS = [
  "Yoga", "Leitura", "Fotografia", "Caminhadas", "Culinaria",
  "Arte", "Danca", "Musica", "Viagens", "Jardinagem",
  "Cinema", "Desporto", "Meditacao", "Voluntariado",
  "Escrita", "Pintura", "Pilates", "Natacao", "Corrida",
  "Podcasts", "Costura", "Jogos", "Teatro", "Surf",
  "Montanhismo", "Ciclismo", "Astronomia", "Gastronomia",
];

const LIFESTYLE_OPTIONS = [
  "Saudavel", "Ativa", "Calma", "Aventureira", "Criativa",
  "Social", "Caseira", "Noturna", "Matinal", "Equilibrada",
];

const INTENT_OPTIONS: { value: Intent; label: string; icon: string }[] = [
  { value: "novas-amigas", label: "Fazer novas amigas", icon: "users" },
  { value: "rede-apoio", label: "Encontrar rede de apoio", icon: "heart" },
  { value: "networking", label: "Networking profissional", icon: "briefcase" },
  { value: "atividades", label: "Parceiras para atividades", icon: "activity" },
  { value: "tudo", label: "Um pouco de tudo", icon: "star" },
];

const SOCIAL_ENERGY_OPTIONS: { value: SocialEnergy; label: string; description: string }[] = [
  { value: "introvertida", label: "Introvertida", description: "Prefiro grupos pequenos e conversas profundas" },
  { value: "ambivertida", label: "Ambivertida", description: "Depende do dia e da energia" },
  { value: "extrovertida", label: "Extrovertida", description: "Adoro conhecer pessoas novas" },
];

const BOUNDARIES_OPTIONS = [
  "Sem alcool", "Sem sair a noite sozinha", "Sem partilhar casa",
  "Apenas locais publicos", "Prefiro nao conduzir a noite",
  "Nao aceito boleias de desconhecidas", "Aviso sempre alguem onde estou",
];

const FREQUENCY_OPTIONS: { value: FrequencyPreference; label: string }[] = [
  { value: "ocasional", label: "Ocasional (1-2x/mes)" },
  { value: "semanal", label: "Semanal" },
  { value: "quase-diaria", label: "Quase diaria" },
];

const PHASE_OPTIONS: { value: PhaseOfLife; label: string; icon: string }[] = [
  { value: "estudante", label: "Estudante", icon: "book" },
  { value: "recem-chegada", label: "Recem-chegada a cidade", icon: "map-pin" },
  { value: "mae", label: "Mae", icon: "heart" },
  { value: "expatriada", label: "Expatriada", icon: "globe" },
  { value: "em-transicao", label: "Em transicao de vida", icon: "refresh-cw" },
  { value: "profissional", label: "Profissional estabelecida", icon: "briefcase" },
  { value: "outro", label: "Outro", icon: "user" },
];

type OnboardingStep = "welcome" | "profile" | "intent" | "socialEnergy" | "values" | "hobbies" | "lifestyle" | "meeting" | "boundaries" | "frequency" | "emergency" | "verification";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AnimatedChip({
  item,
  isSelected,
  onPress,
  index,
}: {
  item: string;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 100 }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );
      rotate.value = withSequence(
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withSpring(0)
      );
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      entering={FadeInDown.delay(index * 50).springify()}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? ElaraColors.primary : theme.backgroundDefault,
          borderColor: isSelected ? ElaraColors.primary : theme.border,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        type="small"
        style={[
          styles.chipText,
          { color: isSelected ? "#FFFFFF" : theme.text },
        ]}
      >
        {item}
      </ThemedText>
      {isSelected && (
        <Animated.View entering={ZoomIn.springify()}>
          <Feather name="check" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

function FeatureCard({
  icon,
  text,
  color,
  index,
}: {
  icon: string;
  text: string;
  color: string;
  index: number;
}) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(
      index * 200 + 500,
      withRepeat(
        withSequence(
          withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 150 + 300).springify()}
      style={[styles.featureRow, animatedStyle]}
    >
      <View style={[styles.featureIcon, { backgroundColor: color + "25" }]}>
        <Feather name={icon as any} size={22} color={color} />
      </View>
      <ThemedText type="body" style={[styles.featureText, { color: theme.text }]}>
        {text}
      </ThemedText>
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const { theme, isDark } = useTheme();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);

  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: "1", name: "", phone: "" },
    { id: "2", name: "", phone: "" },
  ]);
  const [selectedIntents, setSelectedIntents] = useState<Intent[]>([]);
  const [selectedSocialEnergy, setSelectedSocialEnergy] = useState<SocialEnergy | null>(null);
  const [meetingPreferences, setMeetingPreferences] = useState<MeetingPreferences>({
    prefersDaytime: true,
    prefersGroupFirst: true,
    okayOneToOneFirst: false,
  });
  const [selectedBoundaries, setSelectedBoundaries] = useState<string[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyPreference | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<PhaseOfLife | null>(null);
  const [verificationPhoto, setVerificationPhoto] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState<"intro" | "camera" | "confirm">("intro");

  const elaraScale = useSharedValue(0.8);
  const elaraOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    elaraOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    elaraScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    glowOpacity.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const elaraStyle = useAnimatedStyle(() => ({
    opacity: elaraOpacity.value,
    transform: [{ scale: elaraScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const toggleSelection = (
    item: string,
    selected: string[],
    setSelected: (items: string[]) => void,
    maxItems: number = 5
  ) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else if (selected.length < maxItems) {
      setSelected([...selected, item]);
    }
  };

  const updateEmergencyContact = (index: number, field: "name" | "phone", value: string) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
  };

  const STEPS: OnboardingStep[] = [
    "welcome", "profile", "intent", "socialEnergy", "values", 
    "hobbies", "lifestyle", "meeting", "boundaries", "frequency", "emergency", "verification"
  ];

  const canProceed = () => {
    switch (step) {
      case "welcome":
        return true;
      case "profile":
        return name.trim().length >= 2 && age.trim().length > 0 && parseInt(age) >= 18;
      case "intent":
        return selectedIntents.length >= 1 && selectedIntents.length <= 2;
      case "socialEnergy":
        return selectedSocialEnergy !== null;
      case "values":
        return selectedValues.length >= 1;
      case "hobbies":
        return selectedHobbies.length >= 1;
      case "lifestyle":
        return selectedLifestyle.length >= 1;
      case "meeting":
        return true;
      case "boundaries":
        return true;
      case "frequency":
        return selectedFrequency !== null && selectedPhase !== null;
      case "emergency":
        return emergencyContacts.filter(c => c.name.trim() && c.phone.trim()).length >= 1;
      case "verification":
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1]);
    }
  };

  const completeOnboarding = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    const profile: UserProfile = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      age: parseInt(age),
      bio: bio.trim() || `Ola, sou ${name}!`,
      photoUrl: null,
      values: selectedValues,
      hobbies: selectedHobbies,
      lifestyle: selectedLifestyle,
      emergencyContacts: emergencyContacts.filter(c => c.name.trim() && c.phone.trim()),
      locationEnabled: false,
      dataSharingEnabled: false,
      profileHidden: false,
      isProfileComplete: true,
      intent: selectedIntents.length > 0 ? selectedIntents : undefined,
      socialEnergy: selectedSocialEnergy || undefined,
      meetingPreferences,
      boundaries: selectedBoundaries,
      frequencyPreference: selectedFrequency || undefined,
      phaseOfLife: selectedPhase || undefined,
      verificationStatus: verificationPhoto ? "pending" : "unverified",
      verificationPhotoUrl: verificationPhoto,
      verificationDate: verificationPhoto ? new Date().toISOString() : null,
    };

    await signIn(profile);
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundDefault,
      color: theme.text,
      borderColor: theme.border,
    },
  ];

  const renderWelcome = () => (
    <View style={styles.centeredContent}>
      <AnimatedBackground />
      
      <Animated.View style={[styles.elaraGlow, glowStyle]} />
      
      <Animated.View style={elaraStyle}>
        <Image
          source={require("../assets/images/elara-character.png")}
          style={styles.elaraImage}
          resizeMode="cover"
        />
      </Animated.View>
      
      <Spacer height={Spacing["2xl"]} />
      
      <Animated.View entering={FadeInUp.delay(400).springify()}>
        <ThemedText type="h1" style={styles.welcomeTitle}>
          Olá, sou a Elara
        </ThemedText>
      </Animated.View>
      
      <Spacer height={Spacing.md} />
      
      <Animated.View entering={FadeIn.delay(600)}>
        <ThemedText type="body" style={[styles.welcomeText, { color: theme.textSecondary }]}>
          A tua rede de apoio feminino segura. Conexoes baseadas em valores, com a tua seguranca em primeiro lugar.
        </ThemedText>
      </Animated.View>
      
      <Spacer height={Spacing["3xl"]} />
      
      <View style={styles.features}>
        <FeatureCard
          icon="shield"
          text="Rede segura: verificacao e encontros em locais publicos"
          color={ElaraColors.success}
          index={0}
        />
        <FeatureCard
          icon="heart"
          text="Conexoes baseadas em valores, nao em likes"
          color={ElaraColors.primary}
          index={1}
        />
        <FeatureCard
          icon="users"
          text="Buddy system: nunca voltes sozinha para casa"
          color={ElaraColors.success}
          index={2}
        />
        <FeatureCard
          icon="map-pin"
          text="Partilha de rota com contactos de confianca"
          color={ElaraColors.primary}
          index={3}
        />
      </View>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.stepContent}>
      <Animated.View entering={FadeInDown.delay(100)}>
        <ThemedText type="h2">Conta-me sobre ti</ThemedText>
        <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
          Perfis verificados criam uma rede mais segura. Quero conhecer-te para encontrar mulheres com valores semelhantes.
        </ThemedText>
      </Animated.View>
      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(200)}>
        <ThemedText type="small" style={styles.label}>Como te chamas?</ThemedText>
        <TextInput
          style={inputStyle}
          value={name}
          onChangeText={setName}
          placeholder="O teu nome"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="words"
        />
      </Animated.View>
      <Spacer height={Spacing.lg} />

      <Animated.View entering={FadeInDown.delay(300)}>
        <ThemedText type="small" style={styles.label}>Qual a tua idade?</ThemedText>
        <TextInput
          style={inputStyle}
          value={age}
          onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ""))}
          placeholder="A tua idade"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          maxLength={2}
        />
      </Animated.View>
      <Spacer height={Spacing.lg} />

      <Animated.View entering={FadeInDown.delay(400)}>
        <ThemedText type="small" style={styles.label}>Fala um pouco de ti (opcional)</ThemedText>
        <TextInput
          style={[inputStyle, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="O que te torna única..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={200}
        />
      </Animated.View>
    </View>
  );

  const toggleIntent = (intent: Intent) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedIntents.includes(intent)) {
      setSelectedIntents(selectedIntents.filter(i => i !== intent));
    } else if (selectedIntents.length < 2) {
      setSelectedIntents([...selectedIntents, intent]);
    }
  };

  const renderIntent = () => (
    <View style={styles.stepContent}>
      <Animated.View entering={FadeInDown}>
        <ThemedText type="h2">O que procuras na Elara?</ThemedText>
        <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
          Escolhe ate 2 opcoes que melhor descrevem o que procuras.
        </ThemedText>
      </Animated.View>
      <Spacer height={Spacing["2xl"]} />
      <View style={styles.optionsContainer}>
        {INTENT_OPTIONS.map((option, index) => {
          const isSelected = selectedIntents.includes(option.value);
          return (
            <AnimatedPressable
              key={option.value}
              entering={FadeInDown.delay(index * 80).springify()}
              onPress={() => toggleIntent(option.value)}
              style={[
                styles.optionCard,
                {
                  backgroundColor: isSelected ? ElaraColors.primary : theme.backgroundDefault,
                  borderColor: isSelected ? ElaraColors.primary : theme.border,
                },
              ]}
            >
              <View style={[styles.optionIcon, { backgroundColor: (isSelected ? "#fff" : ElaraColors.primary) + "20" }]}>
                <Feather name={option.icon as any} size={22} color={isSelected ? "#fff" : ElaraColors.primary} />
              </View>
              <ThemedText type="body" style={{ color: isSelected ? "#fff" : theme.text, fontWeight: "600", flex: 1 }}>
                {option.label}
              </ThemedText>
              {isSelected && (
                <Animated.View entering={ZoomIn.springify()}>
                  <Feather name="check-circle" size={20} color="#fff" />
                </Animated.View>
              )}
            </AnimatedPressable>
          );
        })}
      </View>
      <Spacer height={Spacing.lg} />
      <Animated.View entering={FadeIn.delay(500)}>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
          {selectedIntents.length}/2 selecionados
        </ThemedText>
      </Animated.View>
    </View>
  );

  const renderSocialEnergy = () => (
    <View style={styles.stepContent}>
      <Animated.View entering={FadeInDown}>
        <ThemedText type="h2">Qual e a tua energia social?</ThemedText>
        <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
          Isto ajuda-me a sugerir encontros que combinam contigo.
        </ThemedText>
      </Animated.View>
      <Spacer height={Spacing["2xl"]} />
      <View style={styles.optionsContainer}>
        {SOCIAL_ENERGY_OPTIONS.map((option, index) => (
          <AnimatedPressable
            key={option.value}
            entering={FadeInDown.delay(index * 100).springify()}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedSocialEnergy(option.value);
            }}
            style={[
              styles.energyCard,
              {
                backgroundColor: selectedSocialEnergy === option.value ? ElaraColors.primary : theme.backgroundDefault,
                borderColor: selectedSocialEnergy === option.value ? ElaraColors.primary : theme.border,
              },
            ]}
          >
            <ThemedText type="h4" style={{ color: selectedSocialEnergy === option.value ? "#fff" : theme.text }}>
              {option.label}
            </ThemedText>
            <ThemedText type="small" style={{ color: selectedSocialEnergy === option.value ? "rgba(255,255,255,0.8)" : theme.textSecondary, marginTop: 4 }}>
              {option.description}
            </ThemedText>
          </AnimatedPressable>
        ))}
      </View>
    </View>
  );

  const renderValues = () => (
    <View style={styles.stepContent}>
      <Animated.View entering={FadeInDown}>
        <ThemedText type="h2">Os teus valores</ThemedText>
        <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
          Na Elara, amizades nascem de valores partilhados - nao de aparencias. Seleciona o que te define.
        </ThemedText>
      </Animated.View>
      <Spacer height={Spacing["2xl"]} />
      <View style={styles.chipsContainer}>
        {VALUES_OPTIONS.map((item, index) => (
          <AnimatedChip
            key={item}
            item={item}
            isSelected={selectedValues.includes(item)}
            onPress={() => toggleSelection(item, selectedValues, setSelectedValues)}
            index={index}
          />
        ))}
      </View>
      <Spacer height={Spacing.lg} />
      <Animated.View entering={FadeIn.delay(600)}>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
          {selectedValues.length}/5 selecionados
        </ThemedText>
      </Animated.View>
    </View>
  );

  const renderHobbies = () => (
    <View style={styles.stepContent}>
      <Animated.View entering={FadeInDown}>
        <ThemedText type="h2">O que adoras fazer?</ThemedText>
        <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
          Atividades partilhadas criam lacos mais fortes. O que gostas de fazer?
        </ThemedText>
      </Animated.View>
      <Spacer height={Spacing["2xl"]} />
      <View style={styles.chipsContainer}>
        {HOBBIES_OPTIONS.map((item, index) => (
          <AnimatedChip
            key={item}
            item={item}
            isSelected={selectedHobbies.includes(item)}
            onPress={() => toggleSelection(item, selectedHobbies, setSelectedHobbies)}
            index={index}
          />
        ))}
      </View>
      <Spacer height={Spacing.lg} />
      <Animated.View entering={FadeIn.delay(700)}>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
          {selectedHobbies.length}/5 selecionados
        </ThemedText>
      </Animated.View>
    </View>
  );

  const renderLifestyle = () => (
    <View style={styles.stepContent}>
      <Animated.View entering={FadeInDown}>
        <ThemedText type="h2">O teu estilo de vida</ThemedText>
        <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
          Como é o teu dia-a-dia? Isto ajuda-me a encontrar mulheres compatíveis contigo.
        </ThemedText>
      </Animated.View>
      <Spacer height={Spacing["2xl"]} />
      <View style={styles.chipsContainer}>
        {LIFESTYLE_OPTIONS.map((item, index) => (
          <AnimatedChip
            key={item}
            item={item}
            isSelected={selectedLifestyle.includes(item)}
            onPress={() => toggleSelection(item, selectedLifestyle, setSelectedLifestyle, 3)}
            index={index}
          />
        ))}
      </View>
      <Spacer height={Spacing.lg} />
      <Animated.View entering={FadeIn.delay(500)}>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
          {selectedLifestyle.length}/3 selecionados
        </ThemedText>
      </Animated.View>
    </View>
  );

  const renderMeeting = () => (
    <View style={styles.stepContent}>
      <Animated.View entering={FadeInDown}>
        <ThemedText type="h2">Preferencias de encontro</ThemedText>
        <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
          Como preferes conhecer novas amigas?
        </ThemedText>
      </Animated.View>
      <Spacer height={Spacing["2xl"]} />
      
      <View style={styles.togglesContainer}>
        <Animated.View entering={FadeInDown.delay(100)} style={[styles.toggleRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.toggleInfo}>
            <Feather name="sun" size={20} color={ElaraColors.primary} />
            <View style={styles.toggleText}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Prefiro durante o dia</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Encontros em horario diurno</ThemedText>
            </View>
          </View>
          <Pressable
            onPress={() => setMeetingPreferences(prev => ({ ...prev, prefersDaytime: !prev.prefersDaytime }))}
            style={[styles.toggle, { backgroundColor: meetingPreferences.prefersDaytime ? ElaraColors.success : theme.backgroundSecondary }]}
          >
            <View style={[styles.toggleKnob, { transform: [{ translateX: meetingPreferences.prefersDaytime ? 20 : 0 }] }]} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={[styles.toggleRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.toggleInfo}>
            <Feather name="users" size={20} color={ElaraColors.primary} />
            <View style={styles.toggleText}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Prefiro grupo primeiro</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Conhecer em grupo antes de 1:1</ThemedText>
            </View>
          </View>
          <Pressable
            onPress={() => setMeetingPreferences(prev => ({ ...prev, prefersGroupFirst: !prev.prefersGroupFirst }))}
            style={[styles.toggle, { backgroundColor: meetingPreferences.prefersGroupFirst ? ElaraColors.success : theme.backgroundSecondary }]}
          >
            <View style={[styles.toggleKnob, { transform: [{ translateX: meetingPreferences.prefersGroupFirst ? 20 : 0 }] }]} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={[styles.toggleRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.toggleInfo}>
            <Feather name="user" size={20} color={ElaraColors.primary} />
            <View style={styles.toggleText}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>OK encontrar 1:1</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Confortavel com encontros individuais</ThemedText>
            </View>
          </View>
          <Pressable
            onPress={() => setMeetingPreferences(prev => ({ ...prev, okayOneToOneFirst: !prev.okayOneToOneFirst }))}
            style={[styles.toggle, { backgroundColor: meetingPreferences.okayOneToOneFirst ? ElaraColors.success : theme.backgroundSecondary }]}
          >
            <View style={[styles.toggleKnob, { transform: [{ translateX: meetingPreferences.okayOneToOneFirst ? 20 : 0 }] }]} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );

  const renderBoundaries = () => (
    <View style={styles.stepContent}>
      <Animated.View entering={FadeInDown}>
        <View style={styles.boundariesHeader}>
          <Feather name="shield" size={24} color={ElaraColors.success} />
          <ThemedText type="h2" style={{ marginLeft: Spacing.sm }}>Os teus limites</ThemedText>
        </View>
        <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
          Define os teus limites pessoais. Isto ajuda-nos a respeitar o teu espaco. (Opcional)
        </ThemedText>
      </Animated.View>
      <Spacer height={Spacing["2xl"]} />
      <View style={styles.chipsContainer}>
        {BOUNDARIES_OPTIONS.map((item, index) => (
          <AnimatedChip
            key={item}
            item={item}
            isSelected={selectedBoundaries.includes(item)}
            onPress={() => toggleSelection(item, selectedBoundaries, setSelectedBoundaries, 10)}
            index={index}
          />
        ))}
      </View>
    </View>
  );

  const renderFrequency = () => (
    <View style={styles.stepContent}>
      <Animated.View entering={FadeInDown}>
        <ThemedText type="h2">Frequencia e fase de vida</ThemedText>
        <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
          Com que frequencia queres encontrar amigas e em que fase de vida estas?
        </ThemedText>
      </Animated.View>
      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>Frequencia de encontros</ThemedText>
      <View style={styles.frequencyRow}>
        {FREQUENCY_OPTIONS.map((option, index) => (
          <AnimatedPressable
            key={option.value}
            entering={FadeInDown.delay(index * 80).springify()}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedFrequency(option.value);
            }}
            style={[
              styles.frequencyOption,
              {
                backgroundColor: selectedFrequency === option.value ? ElaraColors.primary : theme.backgroundDefault,
                borderColor: selectedFrequency === option.value ? ElaraColors.primary : theme.border,
              },
            ]}
          >
            <ThemedText type="small" style={{ color: selectedFrequency === option.value ? "#fff" : theme.text, fontWeight: "600", textAlign: "center" }}>
              {option.label}
            </ThemedText>
          </AnimatedPressable>
        ))}
      </View>

      <Spacer height={Spacing["2xl"]} />

      <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>Fase de vida</ThemedText>
      <View style={styles.phaseGrid}>
        {PHASE_OPTIONS.map((option, index) => (
          <AnimatedPressable
            key={option.value}
            entering={FadeInDown.delay(index * 60).springify()}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPhase(option.value);
            }}
            style={[
              styles.phaseOption,
              {
                backgroundColor: selectedPhase === option.value ? ElaraColors.primary : theme.backgroundDefault,
                borderColor: selectedPhase === option.value ? ElaraColors.primary : theme.border,
              },
            ]}
          >
            <Feather name={option.icon as any} size={18} color={selectedPhase === option.value ? "#fff" : ElaraColors.primary} />
            <ThemedText type="small" style={{ color: selectedPhase === option.value ? "#fff" : theme.text, marginTop: 4, textAlign: "center" }}>
              {option.label}
            </ThemedText>
          </AnimatedPressable>
        ))}
      </View>
    </View>
  );

  const renderEmergency = () => (
    <View style={styles.stepContent}>
      <Animated.View
        entering={ZoomIn.springify()}
        style={[styles.emergencyHeader, { backgroundColor: ElaraColors.success + "15" }]}
      >
        <Feather name="shield" size={24} color={ElaraColors.success} />
        <ThemedText type="h4" style={{ color: ElaraColors.success }}>A tua segurança importa</ThemedText>
      </Animated.View>
      <Spacer height={Spacing.lg} />
      <Animated.View entering={FadeInDown.delay(200)}>
        <ThemedText type="h2">Rede de seguranca</ThemedText>
        <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
          O buddy system da Elara: estas pessoas podem receber a tua localizacao e serem alertadas durante caminhadas.
        </ThemedText>
      </Animated.View>
      <Spacer height={Spacing["2xl"]} />

      {emergencyContacts.map((contact, index) => (
        <Animated.View
          key={contact.id}
          entering={FadeInDown.delay(300 + index * 100)}
          style={styles.contactCard}
        >
          <ThemedText type="small" style={styles.contactLabel}>
            Contacto {index + 1} {index === 0 ? "(obrigatório)" : "(opcional)"}
          </ThemedText>
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={contact.name}
            onChangeText={(value) => updateEmergencyContact(index, "name", value)}
            placeholder="Nome"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="words"
          />
          <Spacer height={Spacing.sm} />
          <TextInput
            style={inputStyle}
            value={contact.phone}
            onChangeText={(value) => updateEmergencyContact(index, "phone", value)}
            placeholder="Telefone"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
          />
          <Spacer height={Spacing.lg} />
        </Animated.View>
      ))}
    </View>
  );

  const takeSelfie = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        if (photo) {
          setVerificationPhoto(photo.uri);
          setVerificationStep("confirm");
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (error) {
        console.error("Failed to take photo:", error);
      }
    }
  };

  const renderVerification = () => {
    if (verificationStep === "intro") {
      return (
        <View style={styles.stepContent}>
          <Animated.View
            entering={ZoomIn.springify()}
            style={[styles.emergencyHeader, { backgroundColor: ElaraColors.primary + "15" }]}
          >
            <Feather name="shield" size={24} color={ElaraColors.primary} />
            <ThemedText type="h4" style={{ color: ElaraColors.primary }}>Verificacao de Identidade</ThemedText>
          </Animated.View>
          <Spacer height={Spacing.lg} />
          <Animated.View entering={FadeInDown.delay(200)}>
            <ThemedText type="h2">Confirma que es tu</ThemedText>
            <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Para garantir a seguranca de todas, precisamos verificar a tua identidade com uma selfie. Isto ajuda a criar uma comunidade de confianca.
            </ThemedText>
          </Animated.View>
          <Spacer height={Spacing["2xl"]} />
          
          <Animated.View entering={FadeInDown.delay(300)} style={styles.verificationFeatures}>
            <View style={[styles.verificationFeature, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={[styles.verificationIcon, { backgroundColor: ElaraColors.success + "20" }]}>
                <Feather name="camera" size={20} color={ElaraColors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>Selfie rapida</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Tira uma foto para confirmar a tua identidade</ThemedText>
              </View>
            </View>
            <View style={[styles.verificationFeature, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={[styles.verificationIcon, { backgroundColor: ElaraColors.primary + "20" }]}>
                <Feather name="lock" size={20} color={ElaraColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>Privada e segura</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>A foto e usada apenas para verificacao</ThemedText>
              </View>
            </View>
            <View style={[styles.verificationFeature, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={[styles.verificationIcon, { backgroundColor: ElaraColors.success + "20" }]}>
                <Feather name="check-circle" size={20} color={ElaraColors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>Selo de verificada</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>Recebe um selo que aumenta a confianca</ThemedText>
              </View>
            </View>
          </Animated.View>
          
          <Spacer height={Spacing["2xl"]} />
          
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setVerificationStep("camera");
            }}
            style={[styles.verifyButton, { backgroundColor: ElaraColors.primary }]}
          >
            <Feather name="camera" size={20} color="#fff" />
            <ThemedText style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>Verificar agora</ThemedText>
          </Pressable>
          
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              completeOnboarding();
            }}
            style={styles.skipButton}
          >
            <ThemedText style={{ color: theme.textSecondary, fontWeight: "500" }}>Verificar mais tarde</ThemedText>
          </Pressable>
        </View>
      );
    }

    if (verificationStep === "camera") {
      if (Platform.OS === "web") {
        return (
          <View style={styles.stepContent}>
            <View style={[styles.webCameraFallback, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="smartphone" size={48} color={ElaraColors.primary} />
              <Spacer height={Spacing.lg} />
              <ThemedText type="h3" style={{ textAlign: "center" }}>Usa o Expo Go</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
                A verificacao por selfie requer a camera do teu dispositivo. Abre a app no Expo Go para continuar.
              </ThemedText>
              <Spacer height={Spacing.xl} />
              <Pressable
                onPress={() => setVerificationStep("intro")}
                style={[styles.verifyButton, { backgroundColor: theme.border }]}
              >
                <ThemedText style={{ color: theme.text, fontWeight: "600" }}>Voltar</ThemedText>
              </Pressable>
            </View>
          </View>
        );
      }

      if (!cameraPermission?.granted) {
        return (
          <View style={styles.stepContent}>
            <View style={[styles.permissionCard, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="camera-off" size={48} color={ElaraColors.primary} />
              <Spacer height={Spacing.lg} />
              <ThemedText type="h3" style={{ textAlign: "center" }}>Permissao da Camera</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
                Precisamos de acesso a camera para tirar a tua selfie de verificacao.
              </ThemedText>
              <Spacer height={Spacing.xl} />
              <Pressable
                onPress={requestCameraPermission}
                style={[styles.verifyButton, { backgroundColor: ElaraColors.primary }]}
              >
                <Feather name="camera" size={20} color="#fff" />
                <ThemedText style={{ color: "#fff", fontWeight: "600" }}>Permitir Camera</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setVerificationStep("intro")}
                style={styles.skipButton}
              >
                <ThemedText style={{ color: theme.textSecondary }}>Voltar</ThemedText>
              </Pressable>
            </View>
          </View>
        );
      }

      return (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraHeader}>
                <Pressable onPress={() => setVerificationStep("intro")} style={styles.cameraBackBtn}>
                  <Feather name="x" size={24} color="#fff" />
                </Pressable>
                <ThemedText style={styles.cameraTitle}>Posiciona o teu rosto</ThemedText>
                <View style={{ width: 40 }} />
              </View>
              
              <View style={styles.faceGuide}>
                <View style={styles.faceGuideOval} />
              </View>
              
              <View style={styles.cameraInstructions}>
                <ThemedText style={styles.cameraInstructionText}>Olha diretamente para a camera</ThemedText>
                <ThemedText style={styles.cameraInstructionText}>Boa iluminacao no rosto</ThemedText>
              </View>
              
              <View style={styles.cameraFooter}>
                <Pressable onPress={takeSelfie} style={styles.captureButton}>
                  <View style={styles.captureButtonInner} />
                </Pressable>
              </View>
            </View>
          </CameraView>
        </View>
      );
    }

    if (verificationStep === "confirm") {
      return (
        <View style={styles.stepContent}>
          <Animated.View entering={ZoomIn.springify()} style={styles.confirmPhotoContainer}>
            <Image source={{ uri: verificationPhoto! }} style={styles.confirmPhoto} />
            <View style={[styles.verifiedBadgeOverlay, { backgroundColor: ElaraColors.primary }]}>
              <Feather name="clock" size={20} color="#fff" />
            </View>
          </Animated.View>
          <Spacer height={Spacing.xl} />
          <Animated.View entering={FadeInDown.delay(200)}>
            <ThemedText type="h2" style={{ textAlign: "center" }}>Foto enviada!</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
              A tua verificacao esta em analise. Recebes uma notificacao quando for aprovada.
            </ThemedText>
          </Animated.View>
          <Spacer height={Spacing["2xl"]} />
          
          <View style={[styles.verifiedCard, { backgroundColor: ElaraColors.primary + "15" }]}>
            <View style={[styles.verifiedIcon, { backgroundColor: ElaraColors.primary }]}>
              <Feather name="clock" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="body" style={{ fontWeight: "700", color: ElaraColors.primary }}>Verificacao Pendente</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>A tua foto esta a ser analisada pela nossa equipa</ThemedText>
            </View>
          </View>
          
          <Spacer height={Spacing.xl} />
          
          <Pressable
            onPress={completeOnboarding}
            style={[styles.verifyButton, { backgroundColor: ElaraColors.primary }]}
          >
            <ThemedText style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>Concluir e Comecar</ThemedText>
            <Feather name="arrow-right" size={20} color="#fff" />
          </Pressable>
          
          <Pressable
            onPress={() => {
              setVerificationPhoto(null);
              setVerificationStep("camera");
            }}
            style={styles.skipButton}
          >
            <ThemedText style={{ color: theme.textSecondary }}>Tirar outra foto</ThemedText>
          </Pressable>
        </View>
      );
    }

    return null;
  };

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return renderWelcome();
      case "profile":
        return renderProfile();
      case "intent":
        return renderIntent();
      case "socialEnergy":
        return renderSocialEnergy();
      case "values":
        return renderValues();
      case "hobbies":
        return renderHobbies();
      case "lifestyle":
        return renderLifestyle();
      case "meeting":
        return renderMeeting();
      case "boundaries":
        return renderBoundaries();
      case "frequency":
        return renderFrequency();
      case "emergency":
        return renderEmergency();
      case "verification":
        return renderVerification();
      default:
        return null;
    }
  };

  const getProgress = () => {
    return (STEPS.indexOf(step) + 1) / STEPS.length;
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {step !== "welcome" && (
        <Animated.View entering={FadeIn} style={styles.header}>
          <Pressable onPress={prevStep} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: ElaraColors.primary,
                    width: `${getProgress() * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.backButton} />
        </Animated.View>
      )}

      {Platform.OS === "web" ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={[styles.scroll, { backgroundColor: theme.backgroundRoot }]}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>
      ) : (
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          style={[styles.scroll, { backgroundColor: theme.backgroundRoot }]}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </KeyboardAwareScrollView>
      )}

      {step !== "verification" && (
        <Animated.View
          entering={FadeInUp.delay(800)}
          style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <PulsingButton
            onPress={nextStep}
            disabled={!canProceed()}
            pulseEnabled={canProceed()}
          >
            {step === "welcome"
              ? "Vamos começar"
              : step === "emergency"
              ? "Verificar identidade"
              : "Continuar"}
          </PulsingButton>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing["3xl"],
  },
  centeredContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  elaraGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: ElaraColors.primary,
    top: "15%",
  },
  elaraImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  welcomeTitle: {
    textAlign: "center",
  },
  welcomeText: {
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  features: {
    width: "100%",
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    fontWeight: "500",
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  stepDescription: {
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.body.fontSize,
  },
  bioInput: {
    height: 100,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  chipText: {
    fontWeight: "500",
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: "flex-start",
  },
  contactCard: {
    marginBottom: Spacing.md,
  },
  contactLabel: {
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  energyCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  togglesContainer: {
    gap: Spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  toggleText: {
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
  },
  boundariesHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  frequencyRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  frequencyOption: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  phaseOption: {
    width: "30%",
    aspectRatio: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  verificationFeatures: {
    gap: Spacing.md,
  },
  verificationFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  verificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  skipButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
  },
  webCameraFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.xl,
    marginTop: Spacing["3xl"],
  },
  permissionCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.xl,
    marginTop: Spacing["3xl"],
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: -Spacing.xl,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cameraHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing.lg,
  },
  cameraBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  faceGuide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  faceGuideOval: {
    width: 220,
    height: 280,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.7)",
    borderStyle: "dashed",
  },
  cameraInstructions: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  cameraInstructionText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginBottom: 4,
  },
  cameraFooter: {
    alignItems: "center",
    paddingBottom: Spacing["3xl"],
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
  },
  confirmPhotoContainer: {
    alignSelf: "center",
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
    marginTop: Spacing.xl,
  },
  confirmPhoto: {
    width: "100%",
    height: "100%",
  },
  verifiedBadgeOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  verifiedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  verifiedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
