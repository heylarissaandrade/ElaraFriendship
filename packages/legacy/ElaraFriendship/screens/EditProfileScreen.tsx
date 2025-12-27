import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Platform,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, ElaraColors } from "@/constants/theme";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

type EditProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "EditProfile">;
};

const ALL_VALUES = [
  "Autenticidade", "Crescimento Pessoal", "Empatia", "Aventura",
  "Criatividade", "Familia", "Saude", "Espiritualidade",
  "Sustentabilidade", "Independencia", "Comunidade", "Liberdade",
];

const ALL_HOBBIES = [
  "Yoga", "Leitura", "Fotografia", "Culinaria", "Musica",
  "Danca", "Caminhadas", "Cinema", "Arte", "Viagens",
  "Desporto", "Meditacao", "Escrita", "Jardinagem", "Jogos",
];

const ALL_LIFESTYLES = [
  "Saudavel", "Calma", "Aventureira", "Urbana", "Rural",
  "Minimalista", "Social", "Caseira", "Ativa", "Equilibrada",
];

export default function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const { theme } = useTheme();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(user?.photoUrl || null);
  const [selectedValues, setSelectedValues] = useState<string[]>(user?.values || []);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(user?.hobbies || []);
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>(user?.lifestyle || []);
  const [isSaving, setIsSaving] = useState(false);

  const isNativePlatform = Platform.OS === "ios" || Platform.OS === "android";

  const pickImage = async () => {
    if (!isNativePlatform) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUrl(result.assets[0].uri);
      }
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permissao Necessaria",
        "Precisamos de acesso a tua galeria para escolher uma foto.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (isNativePlatform) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (!isNativePlatform) {
      Alert.alert("Camara", "A camara nao esta disponivel na versao web. Por favor, usa a app no teu telemovel.");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permissao Necessaria",
        "Precisamos de acesso a camara para tirar uma foto.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const showPhotoOptions = () => {
    if (!isNativePlatform) {
      pickImage();
      return;
    }

    Alert.alert(
      "Foto de Perfil",
      "Escolhe como queres adicionar a tua foto",
      [
        { text: "Tirar Foto", onPress: takePhoto },
        { text: "Escolher da Galeria", onPress: pickImage },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  const toggleSelection = (
    item: string,
    selected: string[],
    setSelected: (items: string[]) => void,
    maxItems: number = 5
  ) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else if (selected.length < maxItems) {
      setSelected([...selected, item]);
    } else {
      if (Platform.OS === "web") {
        alert(`Podes selecionar no maximo ${maxItems} opcoes`);
      } else {
        Alert.alert("Limite atingido", `Podes selecionar no maximo ${maxItems} opcoes`);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "Por favor, insere o teu nome");
      return;
    }
    
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      Alert.alert("Erro", "Por favor, insere uma idade valida (18-100)");
      return;
    }

    setIsSaving(true);
    
    try {
      await updateProfile({
        name: name.trim(),
        age: ageNum,
        bio: bio.trim(),
        photoUrl,
        values: selectedValues,
        hobbies: selectedHobbies,
        lifestyle: selectedLifestyle,
      });
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Nao foi possivel guardar as alteracoes. Tenta novamente.");
    } finally {
      setIsSaving(false);
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

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundSecondary,
      color: theme.text,
      borderColor: theme.border,
    },
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <Animated.View entering={FadeIn} style={styles.photoSection}>
        <Pressable onPress={showPhotoOptions} style={styles.photoContainer}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photo} />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: ElaraColors.primary + "30" }]}>
              <ThemedText type="h1" style={[styles.photoInitials, { color: ElaraColors.primary }]}>
                {name ? getInitials(name) : "?"}
              </ThemedText>
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: ElaraColors.primary }]}>
            <Feather name="camera" size={16} color="#FFFFFF" />
          </View>
        </Pressable>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
          Toca para alterar a foto
        </ThemedText>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
        <ThemedText type="h4" style={styles.label}>Nome</ThemedText>
        <TextInput
          style={inputStyle}
          value={name}
          onChangeText={setName}
          placeholder="O teu nome"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="words"
        />
      </Animated.View>

      <Spacer height={Spacing.xl} />

      <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
        <ThemedText type="h4" style={styles.label}>Idade</ThemedText>
        <TextInput
          style={inputStyle}
          value={age}
          onChangeText={setAge}
          placeholder="A tua idade"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          maxLength={3}
        />
      </Animated.View>

      <Spacer height={Spacing.xl} />

      <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
        <ThemedText type="h4" style={styles.label}>Bio</ThemedText>
        <TextInput
          style={[inputStyle, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="Conta-nos um pouco sobre ti..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={300}
        />
        <ThemedText type="small" style={[styles.charCount, { color: theme.textSecondary }]}>
          {bio.length}/300
        </ThemedText>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h4" style={styles.label}>Os meus valores</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {selectedValues.length}/5
          </ThemedText>
        </View>
        <View style={styles.tagsContainer}>
          {ALL_VALUES.map((value) => {
            const isSelected = selectedValues.includes(value);
            return (
              <Pressable
                key={value}
                onPress={() => toggleSelection(value, selectedValues, setSelectedValues)}
                style={[
                  styles.tag,
                  {
                    backgroundColor: isSelected ? ElaraColors.primary : theme.backgroundSecondary,
                    borderColor: isSelected ? ElaraColors.primary : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{ color: isSelected ? "#FFFFFF" : theme.text }}
                >
                  {value}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h4" style={styles.label}>Os meus hobbies</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {selectedHobbies.length}/5
          </ThemedText>
        </View>
        <View style={styles.tagsContainer}>
          {ALL_HOBBIES.map((hobby) => {
            const isSelected = selectedHobbies.includes(hobby);
            return (
              <Pressable
                key={hobby}
                onPress={() => toggleSelection(hobby, selectedHobbies, setSelectedHobbies)}
                style={[
                  styles.tag,
                  {
                    backgroundColor: isSelected ? ElaraColors.accent : theme.backgroundSecondary,
                    borderColor: isSelected ? ElaraColors.accent : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{ color: isSelected ? "#FFFFFF" : theme.text }}
                >
                  {hobby}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInDown.delay(350)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h4" style={styles.label}>Estilo de vida</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {selectedLifestyle.length}/3
          </ThemedText>
        </View>
        <View style={styles.tagsContainer}>
          {ALL_LIFESTYLES.map((style) => {
            const isSelected = selectedLifestyle.includes(style);
            return (
              <Pressable
                key={style}
                onPress={() => toggleSelection(style, selectedLifestyle, setSelectedLifestyle, 3)}
                style={[
                  styles.tag,
                  {
                    backgroundColor: isSelected ? ElaraColors.success : theme.backgroundSecondary,
                    borderColor: isSelected ? ElaraColors.success : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{ color: isSelected ? "#FFFFFF" : theme.text }}
                >
                  {style}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <Spacer height={Spacing["3xl"]} />

      <Button onPress={handleSave} disabled={isSaving}>
        {isSaving ? "A guardar..." : "Guardar Alteracoes"}
      </Button>

      <Spacer height={Spacing.xl} />

      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => [
          styles.cancelButton,
          { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <ThemedText type="body" style={{ fontWeight: "600" }}>
          Cancelar
        </ThemedText>
      </Pressable>

      <Spacer height={Spacing["3xl"]} />
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  photoSection: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  photoContainer: {
    position: "relative",
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitials: {
    fontSize: 42,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  section: {},
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    marginBottom: Spacing.md,
  },
  input: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
  },
  bioInput: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  charCount: {
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
});
