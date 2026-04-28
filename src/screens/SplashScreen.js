import React, { useEffect } from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { COLORS } from "../constants/config";
import { useLocalizedCopy } from "../hooks/useLocalizedCopy";
import { usePreferredLanguage } from "../hooks/usePreferredLanguage";

export default function SplashScreen({ navigation }) {
  const { user, profile, loading } = useAuth();
  const language = usePreferredLanguage();
  const copy = useLocalizedCopy(language, {
    tagline: "Know your gaps. Own your future.",
  });

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      if (user && profile?.onboardingComplete) {
        navigation.replace("Main");
      } else if (user) {
        navigation.replace("Onboarding");
      } else {
        navigation.replace("Welcome");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [loading, user, profile, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      <View style={styles.logoWrap}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>🔍</Text>
        </View>
        <Text style={styles.logoText}>SkillLens</Text>
        <Text style={styles.tagline}>{copy.tagline}</Text>
      </View>
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark, alignItems: "center", justifyContent: "center" },
  logoWrap: { alignItems: "center" },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center",
    marginBottom: 20,
  },
  logoIcon: { fontSize: 40 },
  logoText: { fontSize: 36, fontWeight: "700", color: "#fff", letterSpacing: 1 },
  tagline: { fontSize: 14, color: COLORS.textMuted, marginTop: 8, letterSpacing: 0.5 },
  dotsRow: { flexDirection: "row", gap: 8, position: "absolute", bottom: 60 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.navy },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
});
