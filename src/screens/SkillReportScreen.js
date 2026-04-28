import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  StatusBar, ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { getSkillGapReport } from "../services/userService";
import { COLORS } from "../constants/config";
import { useLocalizedCopy } from "../hooks/useLocalizedCopy";
import { usePreferredLanguage } from "../hooks/usePreferredLanguage";

export default function SkillReportScreen() {
  const { user } = useAuth();
  const language = usePreferredLanguage();
  const copy = useLocalizedCopy(language, {
    pageTitle: "Your Skill Report",
    targetRole: "Target role",
    ready: "Ready",
    jobReadinessScore: "Job Readiness Score",
    focusAreas: "Focus Areas",
    breakdown: "Skill-by-Skill Breakdown",
    current: "Current",
    required: "Required",
    gap: "Gap",
    toClose: "to close",
    highPriority: "high priority",
    mediumPriority: "medium priority",
    lowPriority: "low priority",
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSkillGapReport(user.uid).then((r) => {
      setReport(r);
      setLoading(false);
    });
  }, [user.uid]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </SafeAreaView>
    );
  }

  const priorityColors = { high: COLORS.coral, medium: COLORS.accent, low: COLORS.success };

  const priorityText = (priority) => {
    if (priority === "high") return copy.highPriority;
    if (priority === "medium") return copy.mediumPriority;
    return copy.lowPriority;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{copy.pageTitle} 📊</Text>
        <Text style={styles.pageSub}>{copy.targetRole}: {report?.jobRole}</Text>

        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNum}>{report?.readinessScore}%</Text>
            <Text style={styles.scoreLabel}>{copy.ready}</Text>
          </View>
          <View style={styles.scoreRight}>
            <Text style={styles.scoreTitle}>{copy.jobReadinessScore}</Text>
            <Text style={styles.scoreSub}>{report?.summary}</Text>
          </View>
        </View>

        {report?.topGaps && (
          <View style={styles.topGapsCard}>
            <Text style={styles.cardTitle}>🎯 {copy.focusAreas}</Text>
            <View style={styles.gapPills}>
              {report.topGaps.map((gap, i) => (
                <View key={i} style={styles.gapPill}>
                  <Text style={styles.gapPillText}>{gap}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>{copy.breakdown}</Text>
        {report?.skills?.map((skill, i) => (
          <View key={i} style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <Text style={styles.skillName}>{skill.name}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColors[skill.priority] + "25" }]}>
                <Text style={[styles.priorityText, { color: priorityColors[skill.priority] }]}>
                  {skill.priority === "high" ? "🔴" : skill.priority === "medium" ? "🟡" : "🟢"} {priorityText(skill.priority)}
                </Text>
              </View>
            </View>

            <Text style={styles.skillDesc}>{skill.description}</Text>

            <View style={styles.barSection}>
              <View style={styles.barRow}>
                <Text style={styles.barLabel}>{copy.current}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${skill.current}%`, backgroundColor: COLORS.primary }]} />
                </View>
                <Text style={styles.barVal}>{skill.current}%</Text>
              </View>
              <View style={styles.barRow}>
                <Text style={styles.barLabel}>{copy.required}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${skill.required}%`, backgroundColor: COLORS.accent }]} />
                </View>
                <Text style={styles.barVal}>{skill.required}%</Text>
              </View>
            </View>

            <View style={styles.gapTag}>
              <Text style={styles.gapTagText}>{copy.gap}: {skill.gap}% {copy.toClose}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.dark },
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  pageTitle: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 4 },
  pageSub: { fontSize: 14, color: COLORS.textMuted, marginBottom: 24 },
  scoreCard: {
    backgroundColor: COLORS.primary, borderRadius: 20, padding: 20,
    flexDirection: "row", gap: 16, alignItems: "center", marginBottom: 16,
  },
  scoreCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
  },
  scoreNum: { fontSize: 22, fontWeight: "700", color: "#fff" },
  scoreLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  scoreRight: { flex: 1 },
  scoreTitle: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 6 },
  scoreSub: { fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 20 },
  topGapsCard: {
    backgroundColor: COLORS.navy, borderRadius: 16, padding: 16, marginBottom: 24,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#fff", marginBottom: 12 },
  gapPills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gapPill: {
    backgroundColor: COLORS.coral + "25", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.coral + "60",
  },
  gapPillText: { color: COLORS.coral, fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#fff", marginBottom: 12 },
  skillCard: {
    backgroundColor: COLORS.navy, borderRadius: 16, padding: 16, marginBottom: 12,
  },
  skillHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  skillName: { fontSize: 15, fontWeight: "700", color: "#fff", flex: 1 },
  priorityBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  priorityText: { fontSize: 11, fontWeight: "600" },
  skillDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20, marginBottom: 12 },
  barSection: { gap: 8, marginBottom: 10 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  barLabel: { color: COLORS.textMuted, fontSize: 12, width: 60 },
  barBg: { flex: 1, backgroundColor: "#1E3A5F", borderRadius: 4, height: 8, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4 },
  barVal: { color: "#fff", fontSize: 12, fontWeight: "600", width: 36, textAlign: "right" },
  gapTag: {
    backgroundColor: COLORS.coral + "20", borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 4, alignSelf: "flex-start",
  },
  gapTagText: { color: COLORS.coral, fontSize: 12, fontWeight: "600" },
});
