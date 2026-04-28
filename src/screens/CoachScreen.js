import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, TextInput,
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { chatWithCoach } from "../services/groqService";
import { COLORS } from "../constants/config";
import { useLocalizedCopy } from "../hooks/useLocalizedCopy";
import { usePreferredLanguage } from "../hooks/usePreferredLanguage";

export default function CoachScreen() {
  const { profile } = useAuth();
  const language = usePreferredLanguage();
  const copy = useLocalizedCopy(language, {
    coachName: "SkillLens Coach",
    alwaysAvailable: "Always available",
    thinking: "Thinking...",
    askAnything: "Ask your coach anything...",
    sorry: "Sorry, I had trouble connecting. Please try again!",
    suggestion1: "How do I start learning SQL?",
    suggestion2: "What are the best free resources?",
    suggestion3: "How long will it take to get job-ready?",
    suggestion4: "Explain Python in simple terms",
    suggestion5: "How do I practice data analysis?",
  });
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi ${profile?.name?.split(" ")[0] || "there"}! 👋 I'm your SkillLens AI Coach. I'm here to help you on your journey to become a ${profile?.jobRole || "professional"}.\n\nAsk me anything — career advice, skill tips, resource recommendations, or just to keep you motivated! 💪`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const suggestions = [copy.suggestion1, copy.suggestion2, copy.suggestion3, copy.suggestion4, copy.suggestion5];

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: msgText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const reply = await chatWithCoach(
        newMessages,
        profile?.jobRole || "professional",
        profile?.name || "Learner",
        profile?.language || language || "English"
      );
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (_) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: copy.sorry,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />

      <View style={styles.header}>
        <View style={styles.coachAvatar}>
          <Text style={styles.coachAvatarText}>🤖</Text>
        </View>
        <View>
          <Text style={styles.coachName}>{copy.coachName}</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>{copy.alwaysAvailable}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, i) => (
            <View key={i} style={[styles.bubble, msg.role === "user" ? styles.userBubble : styles.aiBubble]}>
              {msg.role === "assistant" && (
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>🤖</Text>
                </View>
              )}
              <View style={[styles.bubbleContent, msg.role === "user" ? styles.userContent : styles.aiContent]}>
                <Text style={[styles.bubbleText, msg.role === "user" && styles.userText]}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}
          {loading && (
            <View style={[styles.bubble, styles.aiBubble]}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>🤖</Text>
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator color={COLORS.primary} size="small" />
                <Text style={styles.typingText}>{copy.thinking}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {messages.length < 3 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestions}>
            {suggestions.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestionPill} onPress={() => sendMessage(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={copy.askAnything}
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.dark },
  header: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.navy,
  },
  coachAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center",
  },
  coachAvatarText: { fontSize: 22 },
  coachName: { fontSize: 16, fontWeight: "700", color: "#fff" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success },
  onlineText: { fontSize: 12, color: COLORS.textMuted },
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  bubble: { flexDirection: "row", gap: 8 },
  userBubble: { flexDirection: "row-reverse" },
  aiBubble: {},
  aiBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary + "30", alignItems: "center", justifyContent: "center",
    marginTop: 4, flexShrink: 0,
  },
  aiBadgeText: { fontSize: 16 },
  bubbleContent: { maxWidth: "80%", borderRadius: 16, padding: 14 },
  userContent: { backgroundColor: COLORS.primary, borderTopRightRadius: 4 },
  aiContent: { backgroundColor: COLORS.navy, borderTopLeftRadius: 4 },
  bubbleText: { fontSize: 15, color: COLORS.textMuted, lineHeight: 22 },
  userText: { color: "#fff" },
  typingBubble: {
    backgroundColor: COLORS.navy, borderRadius: 16, borderTopLeftRadius: 4,
    padding: 14, flexDirection: "row", alignItems: "center", gap: 8,
  },
  typingText: { color: COLORS.textMuted, fontSize: 14 },
  suggestions: { paddingHorizontal: 16, marginBottom: 8, flexGrow: 0 },
  suggestionPill: {
    backgroundColor: COLORS.navy, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 8, borderWidth: 1, borderColor: COLORS.primary + "50",
  },
  suggestionText: { color: COLORS.primaryLight, fontSize: 13 },
  inputRow: {
    flexDirection: "row", alignItems: "flex-end", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: COLORS.navy,
  },
  input: {
    flex: 1, backgroundColor: COLORS.navy, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 12, color: "#fff", fontSize: 15,
    maxHeight: 120, borderWidth: 1, borderColor: COLORS.border + "40",
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: COLORS.navy },
  sendBtnText: { color: "#fff", fontSize: 22, fontWeight: "700" },
});
