import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

import { ThemedView } from "@shared/components/themed-view";
import { ThemedText } from "@shared/components/themed-text";
import { EmojiPicker } from "@/components/EmojiPicker";
import {
  SharePathModal,
  SafetyCheckInModal,
  SafetyModeButtons,
  TrackingBanner,
} from "@/components/SafetyModeModal";
import {
  InviteModal,
  InviteBanner,
  MessageLimitBanner,
} from "@/components/InviteModal";
import { useTheme } from "@/hooks/useTheme";
import { useMatches, Message, SafetyFlag, ConnectionIntent } from "@/contexts/MatchesContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, ElaraColors, Typography } from "@/constants/theme";

type ConnectionsStackParamList = {
  ConnectionsList: undefined;
  Chat: { connectionId: string; matchName: string };
};

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<ConnectionsStackParamList, "Chat">;
  route: RouteProp<ConnectionsStackParamList, "Chat">;
};

export default function ChatScreen({ route }: ChatScreenProps) {
  const { connectionId } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    messages,
    sendMessage,
    connections,
    startMeetupTracking,
    endMeetupTracking,
    setSafetyFlag,
    sendInvite,
    acceptInvite,
    declineInvite,
    canSendMoreMessages,
  } = useMatches();
  const { user } = useAuth();
  const [inputText, setInputText] = useState("");
  const [showSharePathModal, setShowSharePathModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const chatMessages = messages[connectionId] || [];
  const connection = connections.find((c) => c.id === connectionId);
  const isTracking = connection?.meetupTracking?.isActive || false;
  const canMessage = canSendMoreMessages(connectionId);
  const MESSAGE_LIMIT = 10;
  const messagesRemaining = Math.max(0, MESSAGE_LIMIT - (connection?.messageCount || 0));

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages.length]);

  const handleSend = () => {
    if (!inputText.trim() || !user) return;
    
    if (!canMessage) {
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    sendMessage(connectionId, inputText.trim(), user.id);
    setInputText("");
  };

  const handleStartTracking = (location: string, contacts: string[]) => {
    startMeetupTracking(connectionId, location, contacts);
  };

  const handleEndTracking = () => {
    endMeetupTracking(connectionId);
    setShowCheckInModal(true);
  };

  const handleSafetyFlagSubmit = (flag: SafetyFlag) => {
    setSafetyFlag(connectionId, flag);
  };

  const handleSendInvite = (intent: ConnectionIntent, date?: string, location?: string) => {
    sendInvite(connectionId, intent, date, location);
  };

  const handleAcceptInvite = () => {
    acceptInvite(connectionId);
  };

  const handleDeclineInvite = () => {
    declineInvite(connectionId);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === user?.id;
    const showTime =
      index === 0 ||
      new Date(item.timestamp).getTime() -
        new Date(chatMessages[index - 1].timestamp).getTime() >
        300000;

    return (
      <View style={styles.messageContainer}>
        {showTime && (
          <ThemedText type="small" style={[styles.timestamp, { color: theme.textSecondary }]}>
            {formatTime(item.timestamp)}
          </ThemedText>
        )}
        <View
          style={[
            styles.messageBubble,
            isOwnMessage
              ? [styles.ownMessage, { backgroundColor: ElaraColors.primary }]
              : [styles.otherMessage, { backgroundColor: theme.backgroundDefault }],
          ]}
        >
          <ThemedText
            type="body"
            style={[styles.messageText, { color: isOwnMessage ? "#FFFFFF" : theme.text }]}
          >
            {item.text}
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderEmptyChat = () => (
    <View style={styles.emptyChat}>
      <View style={[styles.emptyIcon, { backgroundColor: ElaraColors.primary + "15" }]}>
        <Feather name="message-circle" size={40} color={ElaraColors.primary} />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>
        Começa a conversa
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
        Diz olá a {connection?.match.name} e descobrem o que têm em comum!
      </ThemedText>
    </View>
  );

  if (!connection) return null;

  return (
    <ThemedView style={styles.container}>
      <TrackingBanner connection={connection} onEndTracking={handleEndTracking} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesContent,
            chatMessages.length === 0 && styles.emptyContent,
          ]}
          ListHeaderComponent={
            <>
              <SafetyModeButtons
                connection={connection}
                onSharePath={() => setShowSharePathModal(true)}
                onCheckIn={() => setShowCheckInModal(true)}
                isTracking={isTracking}
              />
              <InviteBanner
                connection={connection}
                onAccept={handleAcceptInvite}
                onDecline={handleDeclineInvite}
              />
              <MessageLimitBanner
                connection={connection}
                onInvite={() => setShowInviteModal(true)}
                messagesRemaining={messagesRemaining}
              />
            </>
          }
          ListEmptyComponent={renderEmptyChat}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (chatMessages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />

        <View style={{ backgroundColor: theme.backgroundDefault }}>
          {showEmojiPicker && (
            <View style={styles.emojiPickerContainer}>
              <EmojiPicker
                visible={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
                onSelectEmoji={(emoji) => {
                  setInputText((prev) => prev + emoji);
                }}
              />
            </View>
          )}
          <View
            style={[
              styles.inputContainer,
              { paddingBottom: insets.bottom + Spacing.sm },
            ]}
          >
            <Pressable
              onPress={() => setShowInviteModal(true)}
              style={[styles.inviteButton, { backgroundColor: theme.backgroundSecondary }]}
            >
              <Feather name="calendar" size={20} color={ElaraColors.primary} />
            </Pressable>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setShowEmojiPicker(!showEmojiPicker);
              }}
              style={[
                styles.emojiButton,
                { backgroundColor: showEmojiPicker ? ElaraColors.primary + "20" : theme.backgroundSecondary },
              ]}
            >
              <Feather name="smile" size={20} color={showEmojiPicker ? ElaraColors.primary : theme.textSecondary} />
            </Pressable>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { backgroundColor: theme.backgroundSecondary, color: theme.text },
                !canMessage && styles.inputDisabled,
              ]}
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => setShowEmojiPicker(false)}
              placeholder={canMessage ? "Escreve uma mensagem..." : "Convida para um encontro para continuar"}
              placeholderTextColor={theme.textSecondary}
              multiline
              maxLength={500}
              editable={canMessage}
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim() || !canMessage}
              style={({ pressed }) => [
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() && canMessage ? ElaraColors.primary : theme.backgroundSecondary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Feather
                name="send"
                size={20}
                color={inputText.trim() && canMessage ? "#FFFFFF" : theme.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <SharePathModal
        visible={showSharePathModal}
        onClose={() => setShowSharePathModal(false)}
        connection={connection}
        onStartTracking={handleStartTracking}
      />

      <SafetyCheckInModal
        visible={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        connection={connection}
        onSubmit={handleSafetyFlagSubmit}
      />

      <InviteModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        connection={connection}
        onSendInvite={handleSendInvite}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  emptyContent: {
    justifyContent: "center",
  },
  messageContainer: {
    marginBottom: Spacing.sm,
  },
  timestamp: {
    textAlign: "center",
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  ownMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: Spacing.xs,
  },
  otherMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: Spacing.xs,
  },
  messageText: {
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.body.fontSize,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiPickerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  inputDisabled: {
    opacity: 0.5,
  },
  emptyChat: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 22,
  },
});
