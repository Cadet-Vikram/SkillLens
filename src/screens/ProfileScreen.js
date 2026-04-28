import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  TouchableOpacity, Alert, Share, Modal, ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { updateUserProfile, saveSkillGapReport, saveLearningPath, getSkillGapReport } from "../services/userService";
import { analyzeSkillGaps, generateLearningPath } from "../services/groqService";
import { COLORS, LANGUAGES, GOOGLE_TRANSLATE_KEY } from "../constants/config";
import { useLocalizedCopy } from "../hooks/useLocalizedCopy";
import { usePreferredLanguage } from "../hooks/usePreferredLanguage";

export default function ProfileScreen({ navigation }) {
  const { user, profile, logout, refreshProfile } = useAuth();
  const preferredLanguage = usePreferredLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const [changingLang, setChangingLang] = useState(false);

  const copy = useLocalizedCopy(preferredLanguage, {
    updating: "Updating language & regenerating content...",
    updatingNote: "This takes about 20 seconds ☕",
    jobStarted: "Getting started",
    streak: "Streak",
    daysDone: "Days Done",
    readiness: "Readiness",
    settings: "Settings",
    language: "Language",
    languageHint: "Tap to change - updates all content",
    email: "Email",
    goal: "Goal",
    notSet: "Not set",
    actions: "Actions",
    sharePortfolio: "Share Portfolio",
    shareSub: "Show your progress to employers",
    reanalyze: "Re-analyze Skills",
    reanalyzeSub: "Update your skill gap report",
    signOut: "Sign Out",
    signOutSub: "See you soon!",
    footer: "SkillLens v1.0 - Built with ❤️ for India",
    chooseLanguage: "Choose Language",
    modalSub: "All your content - skill report, learning path, coach - will be regenerated in your chosen language.",
    cancel: "Cancel",
    updatingLanguageTitle: "Updating Language",
    updatingLanguageBodyTemplate: "Regenerating all your content in {lang}. This takes about 20 seconds...",
    doneTitle: "Done!",
    doneBodyTemplate: "App language changed to {lang}. All your content has been updated!",
    errorTitle: "Error",
    errorBody: "Language change failed. Please try again.",
    signOutTitle: "Sign Out",
    signOutBody: "Are you sure you want to sign out?",
    signOutCancel: "Cancel",
    signOutConfirm: "Sign Out",
    reanalyzeTitle: "Re-analyze Skills",
    reanalyzeBody: "This will re-run the AI analysis on your current goal. Continue?",
    continue: "Continue",
    reportLoading: "Updating language and regenerating content...",
  });

  useEffect(() => {
  }, [preferredLanguage]);

  const handleLanguageChange = async (newLang) => {
    if (newLang === profile?.language) {
      setShowLangModal(false);
      return;
    }
    setShowLangModal(false);
    setChangingLang(true);

    try {
      await updateUserProfile(user.uid, { language: newLang });

      const currentReport = await getSkillGapReport(user.uid);
      const goal = profile?.goal || currentReport?.goal || "career development";

      Alert.alert(
        copy.updatingLanguageTitle,
        copy.updatingLanguageBodyTemplate.replace("{lang}", newLang),
        [{ text: "OK" }]
      );

      const newReport = await analyzeSkillGaps(goal, profile?.name, newLang, GOOGLE_TRANSLATE_KEY);
      await saveSkillGapReport(user.uid, { ...newReport, goal, language: newLang });

      const newPath = await generateLearningPath(newReport.jobRole, newReport.skills, profile?.name, newLang, GOOGLE_TRANSLATE_KEY);
      await saveLearningPath(user.uid, newPath);

      await refreshProfile();
      Alert.alert(copy.doneTitle, copy.doneBodyTemplate.replace("{lang}", newLang));
    } catch (e) {
      console.error(e);
      Alert.alert(copy.errorTitle, `${copy.errorBody}\n${e.message}`);
    } finally {
      setChangingLang(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(copy.signOutTitle, copy.signOutBody, [
      { text: copy.signOutCancel, style: "cancel" },
      { text: copy.signOutConfirm, style: "destructive", onPress: logout },
    ]);
  };

  const handleSharePortfolio = async () => {
    try {
      await Share.share({
        message:
          `🎯 SkillLens Portfolio — ${profile?.name}\n\n` +
          `Career Goal: ${profile?.jobRole}\n` +
          `Job Readiness: ${profile?.readinessScore || 0}%\n` +
          `Days Completed: ${profile?.totalDaysCompleted || 0}\n` +
          `Streak: 🔥 ${profile?.streak || 0} days\n\n` +
          `Building skills with SkillLens AI — the free AI career coach!`,
      });
    } catch (_) {}
  };

  if (changingLang) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.changingText}>{copy.updating}</Text>
        <Text style={styles.changingSubText}>{copy.updatingNote}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>🎯 {profile?.jobRole || copy.jobStarted}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: copy.streak, value: `${profile?.streak || 0} 🔥` },
            { label: copy.daysDone, value: profile?.totalDaysCompleted || 0 },
            { label: copy.readiness, value: `${profile?.readinessScore || 0}%` },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.settings}</Text>

          <TouchableOpacity style={styles.settingRow} onPress={() => setShowLangModal(true)}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌐</Text>
              <View>
                <Text style={styles.settingLabel}>{copy.language}</Text>
                <Text style={styles.settingHint}>{copy.languageHint}</Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{profile?.language || preferredLanguage || "English"}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📧</Text>
              <Text style={styles.settingLabel}>{copy.email}</Text>
            </View>
            <Text style={styles.settingValue}>{user?.email}</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🎯</Text>
              <Text style={styles.settingLabel}>{copy.goal}</Text>
            </View>
            <Text style={[styles.settingValue, { maxWidth: "55%" }]} numberOfLines={2}>
              {profile?.goal || copy.notSet}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.actions}</Text>

          <TouchableOpacity style={styles.actionBtn} onPress={handleSharePortfolio}>
            <Text style={styles.actionIcon}>📤</Text>
            <View>
              <Text style={styles.actionLabel}>{copy.sharePortfolio}</Text>
              <Text style={styles.actionSub}>{copy.shareSub}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              Alert.alert(
                copy.reanalyzeTitle,
                copy.reanalyzeBody,
                [
                  { text: copy.signOutCancel, style: "cancel" },
                  { text: copy.continue, onPress: () => navigation.navigate("Onboarding") },
                ]
              )
            }
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <View>
              <Text style={styles.actionLabel}>{copy.reanalyze}</Text>
              <Text style={styles.actionSub}>{copy.reanalyzeSub}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={handleLogout}>
            <Text style={styles.actionIcon}>🚪</Text>
            <View>
              <Text style={[styles.actionLabel, { color: COLORS.coral }]}>{copy.signOut}</Text>
              <Text style={styles.actionSub}>{copy.signOutSub}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>{copy.footer}</Text>
      </ScrollView>

      <Modal visible={showLangModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🌐 {copy.chooseLanguage}</Text>
            <Text style={styles.modalSub}>{copy.modalSub}</Text>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langOption,
                  (profile?.language || preferredLanguage) === lang.label && styles.langOptionActive,
                ]}
                onPress={() => handleLanguageChange(lang.label)}
              >
                <Text style={[
                  styles.langOptionText,
                  (profile?.language || preferredLanguage) === lang.label && styles.langOptionTextActive,
                ]}>
                  {lang.label}
                </Text>
                {(profile?.language || preferredLanguage) === lang.label && (
                  <Text style={styles.langCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLangModal(false)}>
              <Text style={styles.cancelBtnText}>{copy.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.dark },
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  profileCard: { backgroundColor: COLORS.navy, borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  avatarText: { fontSize: 36, fontWeight: "700", color: "#fff" },
  name: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 4 },
  email: { fontSize: 14, color: COLORS.textMuted, marginBottom: 12 },
  roleBadge: { backgroundColor: COLORS.primary + "25", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.primary + "50" },
  roleBadgeText: { color: COLORS.primaryLight, fontSize: 14, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.navy, borderRadius: 14, padding: 14, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 4 },
  statLabel: { fontSize: 11, color: COLORS.textMuted },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 12 },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.navy, borderRadius: 12, padding: 14, marginBottom: 8 },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  settingIcon: { fontSize: 18 },
  settingLabel: { color: "#fff", fontSize: 14, fontWeight: "500" },
  settingHint: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  settingValue: { color: COLORS.primaryLight, fontSize: 13, fontWeight: "600", textAlign: "right" },
  chevron: { color: COLORS.textMuted, fontSize: 20, marginLeft: 4 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.navy, borderRadius: 14, padding: 16, marginBottom: 10 },
  dangerBtn: { borderWidth: 1, borderColor: COLORS.coral + "40" },
  actionIcon: { fontSize: 24 },
  actionLabel: { color: "#fff", fontWeight: "600", fontSize: 15 },
  actionSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  footer: { textAlign: "center", color: COLORS.textMuted, fontSize: 12, marginTop: 12 },
  changingText: { color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 20, textAlign: "center", paddingHorizontal: 30 },
  changingSubText: { color: COLORS.textMuted, fontSize: 13, marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: COLORS.dark, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 8 },
  modalSub: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20, marginBottom: 20 },
  langOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, backgroundColor: COLORS.navy },
  langOptionActive: { backgroundColor: COLORS.primary + "30", borderWidth: 1.5, borderColor: COLORS.primary },
  langOptionText: { fontSize: 15, color: "#fff" },
  langOptionTextActive: { color: COLORS.primaryLight, fontWeight: "700" },
  langCheck: { color: COLORS.primaryLight, fontSize: 18, fontWeight: "700" },
  cancelBtn: { paddingVertical: 14, alignItems: "center", marginTop: 4 },
  cancelBtnText: { color: COLORS.textMuted, fontSize: 15 },
});
