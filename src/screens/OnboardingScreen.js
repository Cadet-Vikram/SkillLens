import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert, ActivityIndicator,
  ScrollView, Animated,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { analyzeSkillGaps, generateLearningPath } from "../services/groqService";
import { saveSkillGapReport, saveLearningPath, updateUserProfile } from "../services/userService";
import { COLORS, LANGUAGES, JOB_ROLES, GOOGLE_TRANSLATE_KEY } from "../constants/config";
import { useLocalizedCopy } from "../hooks/useLocalizedCopy";
import { usePreferredLanguage } from "../hooks/usePreferredLanguage";

export default function OnboardingScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const preferredLanguage = usePreferredLanguage();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState(preferredLanguage);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const copy = useLocalizedCopy(preferredLanguage, {
    languageStep: "Language",
    goalStep: "Your Goal",
    hello: `Hi ${profile?.name?.split(" ")[0] || "there"}! 👋`,
    chooseLanguage: "Choose your preferred language",
    coachLanguage: "SkillLens will coach you in this language",
    continue: "Continue",
    dreamTitle: "What's your career dream? 🎯",
    dreamSub: 'Be specific! e.g. "I want to become a data analyst and get a job at a tech company"',
    placeholder: "Type your career goal...",
    analyze: "Analyze My Skills",
    back: "Back",
    loadingAnalyze: "Analyzing your career goal...",
    loadingPath: "Building Week 1 of your learning path...",
    loadingSave: "Saving your profile...",
    loadingNote: "This takes about 30-40 seconds ☕",
    tellUsMoreTitle: "Tell us more",
    tellUsMoreBody: "Please describe your career goal in a bit more detail.",
    failedTitle: "Analysis Failed",
    failedBody: "Something went wrong. Please try again.",
  });

  useEffect(() => {
    setLanguage(preferredLanguage);
  }, [preferredLanguage]);

  const pulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const handleAnalyze = async () => {
    if (!goal.trim() || goal.trim().length < 10) {
      Alert.alert(copy.tellUsMoreTitle, copy.tellUsMoreBody);
      return;
    }
    setLoading(true);
    pulse();
    try {
      setLoadingMsg(copy.loadingAnalyze);
      const report = await analyzeSkillGaps(goal, profile?.name || "Learner", language, GOOGLE_TRANSLATE_KEY);

      setLoadingMsg(copy.loadingPath);
      const path = await generateLearningPath(
        report.jobRole, report.skills, profile?.name || "Learner", language, GOOGLE_TRANSLATE_KEY
      );

      setLoadingMsg(copy.loadingSave);
      await saveSkillGapReport(user.uid, { ...report, goal, language });
      await saveLearningPath(user.uid, path);
      await updateUserProfile(user.uid, {
        jobRole: report.jobRole, goal, language,
        onboardingComplete: true,
        readinessScore: report.readinessScore,
      });
      await refreshProfile();
    } catch (e) {
      console.error(e);
      Alert.alert(copy.failedTitle, `${copy.failedBody}\n\n${e.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <Animated.View style={[styles.loadingCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={{ fontSize: 40 }}>🔍</Text>
        </Animated.View>
        <Text style={styles.loadingMsg}>{loadingMsg}</Text>
        <Text style={styles.loadingSub}>{copy.loadingNote}</Text>
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 24 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.progressRow}>
          {[copy.languageStep, copy.goalStep].map((label, i) => (
            <View key={i} style={styles.progressItem}>
              <View style={[styles.progressDot, step >= i && styles.progressDotActive]}>
                <Text style={styles.progressDotText}>{i + 1}</Text>
              </View>
              <Text style={[styles.progressLabel, step >= i && styles.progressLabelActive]}>{label}</Text>
            </View>
          ))}
        </View>

        {step === 0 && (
          <View style={styles.stepWrap}>
            <Text style={styles.stepHello}>{copy.hello}</Text>
            <Text style={styles.stepTitle}>{copy.chooseLanguage}</Text>
            <Text style={styles.stepSub}>{copy.coachLanguage}</Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langCard, language === lang.label && styles.langCardActive]}
                  onPress={() => setLanguage(lang.label)}
                >
                  <Text style={[styles.langLabel, language === lang.label && styles.langLabelActive]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btn} onPress={() => setStep(1)}>
              <Text style={styles.btnText}>{copy.continue} →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepWrap}>
            <Text style={styles.stepTitle}>{copy.dreamTitle}</Text>
            <Text style={styles.stepSub}>{copy.dreamSub}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {JOB_ROLES.slice(0, 6).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={styles.rolePill}
                    onPress={() => setGoal(`I want to become a ${role} and get a good job in the tech industry`)}
                  >
                    <Text style={styles.rolePillText}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TextInput
              style={styles.goalInput}
              placeholder={copy.placeholder}
              placeholderTextColor={COLORS.textMuted}
              value={goal}
              onChangeText={setGoal}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{goal.length} characters</Text>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnOutline} onPress={() => setStep(0)}>
                <Text style={styles.btnOutlineText}>← {copy.back}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={handleAnalyze}>
                <Text style={styles.btnText}>{copy.analyze} 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.dark },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  progressRow: { flexDirection: "row", justifyContent: "center", gap: 32, marginBottom: 32 },
  progressItem: { alignItems: "center", gap: 6 },
  progressDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.navy, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: COLORS.border + "40" },
  progressDotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  progressDotText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  progressLabel: { color: COLORS.textMuted, fontSize: 12 },
  progressLabelActive: { color: COLORS.primary },
  stepWrap: { gap: 16 },
  stepHello: { fontSize: 24, color: COLORS.primaryLight, fontWeight: "600" },
  stepTitle: { fontSize: 22, fontWeight: "700", color: "#fff", lineHeight: 30 },
  stepSub: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22 },
  langGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginVertical: 8 },
  langCard: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.navy, borderWidth: 1.5, borderColor: COLORS.border + "40", minWidth: "45%" },
  langCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + "20" },
  langLabel: { color: COLORS.textMuted, fontSize: 14, fontWeight: "500" },
  langLabelActive: { color: COLORS.primary },
  rolePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.primary + "25", borderWidth: 1, borderColor: COLORS.primary + "60" },
  rolePillText: { color: COLORS.primaryLight, fontSize: 13, fontWeight: "500" },
  goalInput: { backgroundColor: COLORS.navy, borderRadius: 14, padding: 16, color: "#fff", fontSize: 16, borderWidth: 1, borderColor: COLORS.border + "40", minHeight: 140 },
  charCount: { color: COLORS.textMuted, fontSize: 12, textAlign: "right" },
  btnRow: { flexDirection: "row", gap: 12 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  btnOutline: { borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20, alignItems: "center" },
  btnOutlineText: { color: COLORS.primary, fontSize: 16, fontWeight: "600" },
  loadingCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginBottom: 32 },
  loadingMsg: { fontSize: 18, color: "#fff", fontWeight: "600", textAlign: "center", paddingHorizontal: 24 },
  loadingSub: { fontSize: 14, color: COLORS.textMuted, marginTop: 8 },
});
