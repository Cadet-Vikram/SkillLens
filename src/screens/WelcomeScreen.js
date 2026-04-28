import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar,
} from "react-native";
import { COLORS } from "../constants/config";
import { useLocalizedCopy } from "../hooks/useLocalizedCopy";
import { usePreferredLanguage } from "../hooks/usePreferredLanguage";

export default function WelcomeScreen({ navigation }) {
  const language = usePreferredLanguage();
  const copy = useLocalizedCopy(language, {
    feature1: "AI detects your exact skill gaps",
    feature2: "Personalized 4-week learning path",
    feature3: "Works in Hindi, Tamil, Telugu & more",
    feature4: "100% free - always",
    hero: "Your personal AI career coach.\nSpeak your goal. We'll map your path.",
    primary: "Get Started - It's Free",
    secondary: "I already have an account",
  });

  const features = [
    { icon: "🎯", text: copy.feature1 },
    { icon: "🗺️", text: copy.feature2 },
    { icon: "🌐", text: copy.feature3 },
    { icon: "💰", text: copy.feature4 },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.heroCircle}>
            <Text style={styles.heroIcon}>🔍</Text>
          </View>
          <Text style={styles.heroTitle}>SkillLens</Text>
          <Text style={styles.heroSub}>{copy.hero}</Text>
        </View>

        <View style={styles.features}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>{f.icon}</Text>
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.navigate("Signup")}
          >
            <Text style={styles.btnPrimaryText}>{copy.primary}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.btnSecondaryText}>{copy.secondary}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.dark },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  hero: { alignItems: "center", paddingVertical: 32 },
  heroCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  heroIcon: { fontSize: 36 },
  heroTitle: { fontSize: 32, fontWeight: "700", color: "#fff", marginBottom: 10 },
  heroSub: { fontSize: 16, color: COLORS.textMuted, textAlign: "center", lineHeight: 24 },
  features: { backgroundColor: COLORS.navy, borderRadius: 16, padding: 20, gap: 16, marginBottom: 32 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary + "30", alignItems: "center", justifyContent: "center",
  },
  featureIconText: { fontSize: 18 },
  featureText: { fontSize: 15, color: "#fff", flex: 1 },
  actions: { gap: 12 },
  btnPrimary: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: "center",
  },
  btnPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  btnSecondary: {
    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: "center",
  },
  btnSecondaryText: { color: COLORS.primary, fontSize: 16, fontWeight: "600" },
});
