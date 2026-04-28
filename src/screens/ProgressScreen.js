import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  StatusBar, ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { getProgress, getLearningPath, getSkillGapReport } from "../services/userService";
import { COLORS } from "../constants/config";
import { useLocalizedCopy } from "../hooks/useLocalizedCopy";
import { usePreferredLanguage } from "../hooks/usePreferredLanguage";

export default function ProgressScreen() {
  const { user, profile } = useAuth();
  const language = usePreferredLanguage();
  const copy = useLocalizedCopy(language, {
    pageTitle: "Your Progress",
    daysDone: "Days Done",
    dayStreak: "Day Streak",
    pathDone: "Path Done",
    readiness: "Readiness",
    overallProgress: "Overall Progress",
    completedOf: "of",
    daysCompleted: "days completed",
    skillGrowthTracker: "Skill Growth Tracker",
    initial: "Initial",
    growth: "Growth",
    weekByWeek: "Week by Week",
    complete: "Complete",
    achievementUnlocked: "Achievement Unlocked!",
    starter: "5-Day Starter - great momentum!",
    halfway: "Halfway there - amazing progress!",
    completePath: "Path Complete! You're job-ready!",
  });
  const [progress, setProgress] = useState({});
  const [path, setPath] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProgress(user.uid),
      getLearningPath(user.uid),
      getSkillGapReport(user.uid),
    ]).then(([prog, p, r]) => {
      setProgress(prog);
      setPath(p);
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

  const totalDays = path?.weeks?.reduce((a, w) => a + w.days.length, 0) || 20;
  const completedDays = Object.keys(progress).length;
  const pct = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;

  const weekStats = path?.weeks?.map((week) => {
    const done = week.days.filter((d) => progress[`w${week.week}_d${d.day}`]).length;
    return { week: week.week, theme: week.theme, done, total: week.days.length };
  }) || [];

  const estimatedReadiness = Math.min(100, (report?.readinessScore || 20) + Math.round(pct * 0.5));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{copy.pageTitle} 📈</Text>

        <View style={styles.statsRow}>
          {[
            { label: copy.daysDone, value: completedDays, icon: "✅" },
            { label: copy.dayStreak, value: profile?.streak || 0, icon: "🔥" },
            { label: copy.pathDone, value: `${pct}%`, icon: "🗺️" },
            { label: copy.readiness, value: `${estimatedReadiness}%`, icon: "💼" },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.overallCard}>
          <View style={styles.overallHeader}>
            <Text style={styles.overallTitle}>{copy.overallProgress}</Text>
            <Text style={styles.overallPct}>{pct}%</Text>
          </View>
          <View style={styles.bigBarBg}>
            <View style={[styles.bigBarFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.overallSub}>{completedDays} {copy.completedOf} {totalDays} {copy.daysCompleted}</Text>
        </View>

        {report?.skills && (
          <View style={styles.skillSection}>
            <Text style={styles.sectionTitle}>{copy.skillGrowthTracker}</Text>
            {report.skills.map((skill, i) => {
              const growth = Math.round(skill.current + (skill.gap * pct) / 100 * 0.4);
              return (
                <View key={i} style={styles.skillRow}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <View style={styles.skillBars}>
                    <View style={styles.skillBarBg}>
                      <View style={[styles.skillBarBase, { width: `${skill.current}%` }]} />
                      <View style={[styles.skillBarGrowth, { width: `${Math.max(0, growth - skill.current)}%`, left: `${skill.current}%` }]} />
                    </View>
                    <Text style={styles.skillPct}>{growth}%</Text>
                  </View>
                </View>
              );
            })}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.legendText}>{copy.initial}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.primaryLight }]} />
                <Text style={styles.legendText}>{copy.growth}</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>{copy.weekByWeek}</Text>
        {weekStats.map((w, i) => (
          <View key={i} style={styles.weekCard}>
            <View style={styles.weekCardHeader}>
              <Text style={styles.weekCardTitle}>{copy.weekByWeek} {w.week}</Text>
              <Text style={[styles.weekCardStatus, w.done === w.total && { color: COLORS.success }]}>
                {w.done === w.total ? `${copy.complete}` : `${w.done}/${w.total} ${copy.daysDone.toLowerCase()}`}
              </Text>
            </View>
            <Text style={styles.weekCardTheme}>{w.theme}</Text>
            <View style={styles.weekBarBg}>
              <View style={[styles.weekBarFill, { width: `${Math.round((w.done / w.total) * 100)}%` }]} />
            </View>
          </View>
        ))}

        {completedDays >= 5 && (
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>🏆</Text>
            <View>
              <Text style={styles.achievementTitle}>{copy.achievementUnlocked}</Text>
              <Text style={styles.achievementSub}>
                {completedDays >= 20 ? copy.completePath :
                 completedDays >= 10 ? copy.halfway :
                 copy.starter}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.dark },
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  pageTitle: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 20 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: COLORS.navy, borderRadius: 16, padding: 14,
    alignItems: "center", gap: 4,
  },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 20, fontWeight: "700", color: "#fff" },
  statLabel: { fontSize: 11, color: COLORS.textMuted, textAlign: "center" },
  overallCard: { backgroundColor: COLORS.navy, borderRadius: 16, padding: 18, marginBottom: 24 },
  overallHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  overallTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  overallPct: { fontSize: 15, fontWeight: "700", color: COLORS.primaryLight },
  bigBarBg: { height: 12, backgroundColor: "#1E3A5F", borderRadius: 6, overflow: "hidden", marginBottom: 8 },
  bigBarFill: { height: 12, backgroundColor: COLORS.primary, borderRadius: 6 },
  overallSub: { color: COLORS.textMuted, fontSize: 12 },
  skillSection: { backgroundColor: COLORS.navy, borderRadius: 16, padding: 18, marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#fff", marginBottom: 14 },
  skillRow: { marginBottom: 14 },
  skillName: { color: COLORS.textMuted, fontSize: 13, marginBottom: 6 },
  skillBars: { flexDirection: "row", alignItems: "center", gap: 10 },
  skillBarBg: { flex: 1, height: 8, backgroundColor: "#1E3A5F", borderRadius: 4, overflow: "hidden", position: "relative" },
  skillBarBase: { height: 8, backgroundColor: COLORS.primary, borderRadius: 4 },
  skillBarGrowth: { position: "absolute", height: 8, backgroundColor: COLORS.primaryLight },
  skillPct: { color: "#fff", fontSize: 12, fontWeight: "600", width: 36, textAlign: "right" },
  legend: { flexDirection: "row", gap: 16, marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: COLORS.textMuted, fontSize: 12 },
  weekCard: { backgroundColor: COLORS.navy, borderRadius: 14, padding: 16, marginBottom: 10 },
  weekCardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  weekCardTitle: { color: "#fff", fontWeight: "700", fontSize: 14 },
  weekCardStatus: { color: COLORS.textMuted, fontSize: 13 },
  weekCardTheme: { color: COLORS.textMuted, fontSize: 12, marginBottom: 10 },
  weekBarBg: { height: 6, backgroundColor: "#1E3A5F", borderRadius: 3, overflow: "hidden" },
  weekBarFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  achievementCard: {
    backgroundColor: COLORS.accent + "20", borderRadius: 16, padding: 18,
    flexDirection: "row", gap: 14, alignItems: "center",
    borderWidth: 1, borderColor: COLORS.accent + "60", marginTop: 8,
  },
  achievementIcon: { fontSize: 36 },
  achievementTitle: { color: COLORS.accent, fontWeight: "700", fontSize: 15 },
  achievementSub: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
});
