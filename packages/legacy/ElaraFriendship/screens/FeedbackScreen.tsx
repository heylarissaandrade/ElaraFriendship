import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenKeyboardAwareScrollView } from "@shared/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@shared/components/themed-text";
import { ThemedView } from "@shared/components/themed-view";
import Spacer from "@shared/components/Spacer";
import { useTheme } from "@shared/hooks/useTheme";
import { Spacing, BorderRadius, ElaraColors } from "@shared/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FEEDBACK_CATEGORIES = [
  { id: "geral", label: "Feedback Geral", icon: "message-circle" },
  { id: "bug", label: "Reportar Problema", icon: "alert-circle" },
  { id: "sugestao", label: "Sugestao", icon: "lightbulb" },
  { id: "seguranca", label: "Seguranca", icon: "shield" },
  { id: "conexoes", label: "Conexoes", icon: "users" },
  { id: "caminhadas", label: "Caminhadas", icon: "map" },
];

type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  PrivacySecurity: undefined;
  HelpCenter: undefined;
  Feedback: undefined;
};

type FeedbackScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Feedback">;
};

function StarRating({
  rating,
  onRatingChange,
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onRatingChange(star);
          }}
          style={styles.starButton}
        >
          <Feather
            name={star <= rating ? "star" : "star"}
            size={36}
            color={star <= rating ? ElaraColors.warning : theme.border}
            style={{ opacity: star <= rating ? 1 : 0.4 }}
          />
        </Pressable>
      ))}
    </View>
  );
}

function CategoryChip({
  category,
  isSelected,
  onPress,
  index,
}: {
  category: (typeof FEEDBACK_CATEGORIES)[0];
  isSelected: boolean;
  onPress: () => void;
  index: number;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withSpring(1)
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      entering={FadeInDown.delay(index * 60).springify()}
      style={[
        styles.categoryChip,
        {
          backgroundColor: isSelected ? ElaraColors.primary : theme.backgroundDefault,
          borderColor: isSelected ? ElaraColors.primary : theme.border,
        },
        animatedStyle,
      ]}
    >
      <Feather
        name={category.icon as keyof typeof Feather.glyphMap}
        size={18}
        color={isSelected ? "#FFFFFF" : theme.text}
      />
      <ThemedText
        type="small"
        style={{ color: isSelected ? "#FFFFFF" : theme.text, marginLeft: Spacing.sm }}
      >
        {category.label}
      </ThemedText>
    </AnimatedPressable>
  );
}

export default function FeedbackScreen({ navigation }: FeedbackScreenProps) {
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const canSubmit = rating > 0 && selectedCategory && feedbackText.trim().length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };

  const getRatingLabel = () => {
    switch (rating) {
      case 1: return "Muito insatisfeita";
      case 2: return "Insatisfeita";
      case 3: return "Satisfeita";
      case 4: return "Muito satisfeita";
      case 5: return "Adorei!";
      default: return "Toca nas estrelas para avaliar";
    }
  };

  if (isSubmitted) {
    return (
      <ThemedView style={styles.successContainer}>
        <Animated.View entering={FadeIn} style={styles.successContent}>
          <View style={[styles.successIcon, { backgroundColor: ElaraColors.success + "20" }]}>
            <Feather name="check-circle" size={64} color={ElaraColors.success} />
          </View>
          <Spacer height={Spacing.xl} />
          <ThemedText type="h2" style={styles.successTitle}>
            Obrigada!
          </ThemedText>
          <ThemedText type="body" style={[styles.successText, { color: theme.textSecondary }]}>
            O teu feedback e muito importante para nos. Vamos analisar e trabalhar para melhorar a Elara.
          </ThemedText>
        </Animated.View>
      </ThemedView>
    );
  }

  return (
    <ScreenKeyboardAwareScrollView>
      <Animated.View entering={FadeIn}>
        <View style={[styles.headerCard, { backgroundColor: ElaraColors.primary + "10" }]}>
          <Feather name="heart" size={32} color={ElaraColors.primary} />
          <Spacer height={Spacing.md} />
          <ThemedText type="h3" style={styles.headerTitle}>
            A tua opiniao importa
          </ThemedText>
          <ThemedText type="body" style={[styles.headerText, { color: theme.textSecondary }]}>
            Ajuda-nos a criar uma experiencia ainda melhor para todas as mulheres na comunidade Elara.
          </ThemedText>
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(100)}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Como esta a ser a tua experiencia?
        </ThemedText>
        <Spacer height={Spacing.md} />
        <View style={[styles.ratingCard, { backgroundColor: theme.backgroundDefault }]}>
          <StarRating rating={rating} onRatingChange={setRating} />
          <Spacer height={Spacing.sm} />
          <ThemedText
            type="body"
            style={{
              color: rating > 0 ? ElaraColors.primary : theme.textSecondary,
              textAlign: "center",
              fontWeight: rating > 0 ? "600" : "400",
            }}
          >
            {getRatingLabel()}
          </ThemedText>
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(200)}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Sobre o que e o teu feedback?
        </ThemedText>
        <Spacer height={Spacing.md} />
        <View style={styles.categoriesContainer}>
          {FEEDBACK_CATEGORIES.map((category, index) => (
            <CategoryChip
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              index={index}
            />
          ))}
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(300)}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Conta-nos mais
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          Minimo 10 caracteres
        </ThemedText>
        <Spacer height={Spacing.md} />
        <View style={[styles.textAreaContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <TextInput
            style={[styles.textArea, { color: theme.text }]}
            value={feedbackText}
            onChangeText={setFeedbackText}
            placeholder="Descreve a tua experiencia, sugestoes ou problemas que encontraste..."
            placeholderTextColor={theme.textSecondary}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />
          <View style={styles.charCounter}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {feedbackText.length}/1000
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(400)}>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: canSubmit ? ElaraColors.primary : theme.backgroundSecondary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          {isSubmitting ? (
            <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
              A enviar...
            </ThemedText>
          ) : (
            <>
              <Feather name="send" size={20} color={canSubmit ? "#FFFFFF" : theme.textSecondary} />
              <ThemedText
                type="body"
                style={{
                  color: canSubmit ? "#FFFFFF" : theme.textSecondary,
                  fontWeight: "600",
                  marginLeft: Spacing.sm,
                }}
              >
                Enviar Feedback
              </ThemedText>
            </>
          )}
        </Pressable>
      </Animated.View>

      <Spacer height={Spacing.xl} />

      <Animated.View entering={FadeInDown.delay(500)}>
        <View style={styles.privacyNote}>
          <Feather name="lock" size={16} color={theme.textSecondary} />
          <ThemedText type="small" style={[styles.privacyText, { color: theme.textSecondary }]}>
            O teu feedback e confidencial e sera utilizado apenas para melhorar a app.
          </ThemedText>
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />
    </ScreenKeyboardAwareScrollView>
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
    marginBottom: Spacing.xs,
  },
  ratingCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  starButton: {
    padding: Spacing.xs,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  textAreaContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  textArea: {
    minHeight: 150,
    padding: Spacing.lg,
    fontSize: 15,
    lineHeight: 22,
  },
  charCounter: {
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.lg,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  privacyText: {
    textAlign: "center",
    lineHeight: 20,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  successContent: {
    alignItems: "center",
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    textAlign: "center",
  },
  successText: {
    textAlign: "center",
    lineHeight: 22,
    marginTop: Spacing.md,
  },
});
