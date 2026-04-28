import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { saveUserProfile } from "../services/userService";
import { COLORS } from "../constants/config";
import { useLocalizedCopy } from "../hooks/useLocalizedCopy";
import { usePreferredLanguage } from "../hooks/usePreferredLanguage";

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const language = usePreferredLanguage();
  const copy = useLocalizedCopy(language, {
    back: "Back",
    title: "Create Account",
    subtitle: "Join thousands learning smarter with AI",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Enter your name",
    emailLabel: "Email",
    emailPlaceholder: "you@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 6 characters",
    createAccount: "Create Account",
    signInPrompt: "Already have an account?",
    signInAction: "Sign in",
    missingTitle: "Missing Info",
    missingBody: "Please fill in all fields.",
    weakTitle: "Weak Password",
    weakBody: "Password must be at least 6 characters.",
    failedTitle: "Signup Failed",
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert(copy.missingTitle, copy.missingBody);
      return;
    }
    if (password.length < 6) {
      Alert.alert(copy.weakTitle, copy.weakBody);
      return;
    }
    setLoading(true);
    try {
      const cred = await signup(email.trim(), password);
      await saveUserProfile(cred.user.uid, {
        name: name.trim(),
        email: email.trim(),
        onboardingComplete: false,
        streak: 0,
        totalDaysCompleted: 0,
        language: "English",
      });
    } catch (e) {
      Alert.alert(copy.failedTitle, e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>{copy.back}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>{copy.subtitle}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>{copy.fullNameLabel}</Text>
              <TextInput
                style={styles.input}
                placeholder={copy.fullNamePlaceholder}
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>{copy.emailLabel}</Text>
              <TextInput
                style={styles.input}
                placeholder={copy.emailPlaceholder}
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>{copy.passwordLabel}</Text>
              <TextInput
                style={styles.input}
                placeholder={copy.passwordPlaceholder}
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>{copy.createAccount} →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>
                {copy.signInPrompt} <Text style={{ color: COLORS.primary }}>{copy.signInAction}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.dark },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  back: { marginBottom: 24 },
  backText: { color: COLORS.textMuted, fontSize: 16 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 6 },
  subtitle: { fontSize: 15, color: COLORS.textMuted },
  form: { gap: 16 },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13, color: COLORS.textMuted, fontWeight: "500" },
  input: {
    backgroundColor: COLORS.navy, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    color: "#fff", fontSize: 16,
    borderWidth: 1, borderColor: COLORS.border + "40",
  },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: "center", marginTop: 8,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loginLink: { textAlign: "center", color: COLORS.textMuted, fontSize: 14, marginTop: 8 },
});
