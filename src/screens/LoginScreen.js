import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { COLORS } from "../constants/config";
import { useLocalizedCopy } from "../hooks/useLocalizedCopy";
import { usePreferredLanguage } from "../hooks/usePreferredLanguage";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const language = usePreferredLanguage();
  const copy = useLocalizedCopy(language, {
    back: "Back",
    title: "Welcome Back",
    subtitle: "Continue your learning journey",
    emailLabel: "Email Address",
    emailPlaceholder: "you@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Your password",
    signIn: "Sign In",
    signUpPrompt: "Don't have an account?",
    signUpAction: "Sign up free",
    missingTitle: "Missing Info",
    missingBody: "Please enter your email and password.",
    failedTitle: "Login Failed",
    genericError: "Login failed. Please try again.",
    noAccount: "No account found with this email.",
    wrongPassword: "Incorrect password. Please try again.",
    invalidEmail: "Please enter a valid email address.",
    invalidCredential: "Email or password is incorrect.",
    tooManyRequests: "Too many attempts. Please wait and try again.",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      Alert.alert(copy.missingTitle, copy.missingBody);
      return;
    }
    setLoading(true);
    try {
      await login(trimmedEmail, password);
    } catch (e) {
      let msg = copy.genericError;
      if (e.code === "auth/user-not-found") msg = copy.noAccount;
      else if (e.code === "auth/wrong-password") msg = copy.wrongPassword;
      else if (e.code === "auth/invalid-email") msg = copy.invalidEmail;
      else if (e.code === "auth/invalid-credential") msg = copy.invalidCredential;
      else if (e.code === "auth/too-many-requests") msg = copy.tooManyRequests;
      Alert.alert(copy.failedTitle, msg);
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
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🔍</Text>
            </View>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>{copy.subtitle}</Text>
          </View>

          <View style={styles.form}>
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
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>{copy.passwordLabel}</Text>
              <View style={styles.passRow}>
                <TextInput
                  style={[styles.input, styles.passInput]}
                  placeholder={copy.passwordPlaceholder}
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass((p) => !p)}>
                  <Text style={styles.eyeText}>{showPass ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>{copy.signIn} →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.link}>
                {copy.signUpPrompt}{" "}
                <Text style={styles.linkBold}>{copy.signUpAction}</Text>
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
  back: { marginBottom: 16 },
  backText: { color: COLORS.textMuted, fontSize: 16 },
  header: { alignItems: "center", marginBottom: 40 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  logoIcon: { fontSize: 32 },
  title: { fontSize: 26, fontWeight: "700", color: "#fff", marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textMuted },
  form: { gap: 16 },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13, color: COLORS.textMuted, fontWeight: "500" },
  input: {
    backgroundColor: COLORS.navy, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, color: "#fff", fontSize: 16,
    borderWidth: 1, borderColor: COLORS.border + "40",
  },
  passRow: { position: "relative" },
  passInput: { paddingRight: 50 },
  eyeBtn: { position: "absolute", right: 14, top: 0, bottom: 0, justifyContent: "center" },
  eyeText: { fontSize: 18 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: { textAlign: "center", color: COLORS.textMuted, fontSize: 14, marginTop: 8 },
  linkBold: { color: COLORS.primary, fontWeight: "700" },
});
