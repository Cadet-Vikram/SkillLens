import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { getSkillGapReport, getLearningPath, getProgress } from "../services/userService";
import { COLORS } from "../constants/config";
import { useLocalizedCopy } from "../hooks/useLocalizedCopy";
import { usePreferredLanguage } from "../hooks/usePreferredLanguage";

export default function HomeScreen({ navigation }) {
  const { user, profile } = useAuth();
  const language = usePreferredLanguage();
  const copy = useLocalizedCopy(language, {
    greetingPrefix: "Good day, ",
    journeyFallback: "Your career journey starts here",
    jobReadiness: "Job Readiness",
    keepGoing: "Keep going!",
    highPriority: "high",
    mediumPriority: "medium",
    lowPriority: "low",
    pathDone: "Path done",
    todayTask: "Today's Task",
    startLearning: "Start Learning",
    yourSkillGaps: "Your Skill Gaps",
    seeAll: "See all",
    skillLabel: "Skill",
    now: "Now",
    goal: "Goal",
    quickActions: "Quick Actions",
    learningPath: "Learning Path",
    aiCoach: "AI Coach",
    skillReport: "Skill Report",
    progress: "Progress",
  });
  const [report, setReport] = useState(null);
  const [path, setPath] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [todayTask, setTodayTask] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const [r, p, prog] = await Promise.all([
          getSkillGapReport(user.uid),
          getLearningPath(user.uid),
          getProgress(user.uid),
        ]);
        setReport(r);
        setPath(p);
        setProgress(prog);
        if (p?.weeks) findTodayTask(p.weeks, prog);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user.uid]);

  const findTodayTask = (weeks, prog) => {
    for (const week of weeks) {
      for (const day of week.days) {
        const key = `w${week.week}_d${day.day}`;
        if (!prog[key]) {
          setTodayTask({ ...day, week: week.week });
          return;
        }
      }
    }
  };

  const completedDays = Object.keys(progress).length;
  const totalDays = path?.weeks?.reduce((a, w) => a + w.days.length, 0) || 20;
  const progressPct = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </SafeAreaView>
    );
  }

  const priorityLabel = (priority) => {
    if (priority === "high") return copy.highPriority;
    if (priority === "medium") return copy.mediumPriority;
    return copy.lowPriority;
  };

  const resourceTypeLabel = (type) => {
    if (type === "video") return "video";
    if (type === "article") return "article";
    return "exercise";
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{copy.greetingPrefix}{profile?.name?.split(" ")[0] || "Learner"} 👋</Text>
            <Text style={styles.subGreeting}>{profile?.jobRole || copy.journeyFallback}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakNum}>{profile?.streak || 0}</Text>
          </View>
        </View>

        {report && (
          <View style={styles.readinessCard}>
            <View style={styles.readinessLeft}>
              <Text style={styles.readinessLabel}>{copy.jobReadiness}</Text>
              <Text style={styles.readinessScore}>{report.readinessScore}%</Text>
              <Text style={styles.readinessSub}>{copy.keepGoing} 🚀</Text>
            </View>
            <View style={styles.readinessRight}>
              <View style={styles.progressRing}>
                <Text style={styles.progressRingText}>{progressPct}%</Text>
                <Text style={styles.progressRingLabel}>{copy.pathDone}</Text>
              </View>
            </View>
          </View>
        )}

        {todayTask && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{copy.todayTask} 📚</Text>
            <TouchableOpacity style={styles.todayCard} onPress={() => navigation.navigate("LearningPath")}>
              <View style={styles.todayTop}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {todayTask.resourceType === "video" ? "🎬" : todayTask.resourceType === "article" ? "📖" : "💪"} {resourceTypeLabel(todayTask.resourceType)}
                  </Text>
                </View>
                <Text style={styles.todayDuration}>{todayTask.duration}</Text>
              </View>
              <Text style={styles.todayTitle}>{todayTask.title}</Text>
              <Text style={styles.todaySkill}>{copy.skillLabel}: {todayTask.skill}</Text>
              <View style={styles.startBtn}>
                <Text style={styles.startBtnText}>{copy.startLearning} →</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {report?.skills && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{copy.yourSkillGaps}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("SkillReport")}>
                <Text style={styles.seeAll}>{copy.seeAll} →</Text>
              </TouchableOpacity>
            </View>
            {report.skills.slice(0, 3).map((skill, i) => (
              <View key={i} style={styles.skillRow}>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <View style={styles.priorityBadge(skill.priority)}>
                    <Text style={styles.priorityText(skill.priority)}>{priorityLabel(skill.priority)}</Text>
                  </View>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${skill.current}%`, backgroundColor: COLORS.primary }]} />
                  <View style={[styles.barTarget, { left: `${skill.required}%` }]} />
                </View>
                <View style={styles.skillNums}>
                  <Text style={styles.skillNumText}>{copy.now}: {skill.current}%</Text>
                  <Text style={styles.skillNumText}>{copy.goal}: {skill.required}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.quickActions}</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: "🗺️", label: copy.learningPath, screen: "LearningPath" },
              { icon: "🤖", label: copy.aiCoach, screen: "Coach" },
              { icon: "📊", label: copy.skillReport, screen: "SkillReport" },
              { icon: "📈", label: copy.progress, screen: "Progress" },
            ].map((a, i) => (
              <TouchableOpacity key={i} style={styles.quickCard} onPress={() => navigation.navigate(a.screen)}>
                <Text style={styles.quickIcon}>{a.icon}</Text>
                <Text style={styles.quickLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {report?.motivationalMessage && (
          <View style={styles.motivCard}>
            <Text style={styles.motivText}>💬 {report.motivationalMessage}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const priorityColors = { high: "#E76F51", medium: "#F4A261", low: "#02C39A" };
const priorityBg = { high: "#E76F5120", medium: "#F4A26120", low: "#02C39A20" };

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.dark },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: "700", color: "#fff" },
  subGreeting: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  streakBadge: {
    backgroundColor: COLORS.navy, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 8, alignItems: "center",
  },
  streakIcon: { fontSize: 18 },
  streakNum: { color: "#fff", fontWeight: "700", fontSize: 16 },
  readinessCard: {
    backgroundColor: COLORS.primary, borderRadius: 20,
    padding: 20, flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 24,
  },
  readinessLeft: {},
  readinessLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  readinessScore: { fontSize: 48, fontWeight: "700", color: "#fff", lineHeight: 52 },
  readinessSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },
  readinessRight: {},
  progressRing: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
  },
  progressRingText: { color: "#fff", fontWeight: "700", fontSize: 20 },
  progressRingLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#fff", marginBottom: 12 },
  seeAll: { color: COLORS.primary, fontSize: 14 },
  todayCard: { backgroundColor: COLORS.navy, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: COLORS.primary + "40" },
  todayTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  typeBadge: { backgroundColor: COLORS.primary + "25", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  typeBadgeText: { color: COLORS.primaryLight, fontSize: 12, fontWeight: "600" },
  todayDuration: { color: COLORS.textMuted, fontSize: 13 },
  todayTitle: { fontSize: 17, fontWeight: "700", color: "#fff", marginBottom: 4 },
  todaySkill: { fontSize: 13, color: COLORS.textMuted, marginBottom: 14 },
  startBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  startBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  skillRow: { backgroundColor: COLORS.navy, borderRadius: 12, padding: 14, marginBottom: 10 },
  skillInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  skillName: { color: "#fff", fontWeight: "600", fontSize: 14 },
  priorityBadge: (p) => ({
    backgroundColor: priorityBg[p] || priorityBg.low, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
  }),
  priorityText: (p) => ({ color: priorityColors[p] || priorityColors.low, fontSize: 11, fontWeight: "600" }),
  barBg: { backgroundColor: "#1E3A5F", borderRadius: 4, height: 8, marginBottom: 6, position: "relative" },
  barFill: { height: 8, borderRadius: 4 },
  barTarget: { position: "absolute", top: -2, width: 2, height: 12, backgroundColor: COLORS.accent },
  skillNums: { flexDirection: "row", justifyContent: "space-between" },
  skillNumText: { color: COLORS.textMuted, fontSize: 11 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickCard: {
    backgroundColor: COLORS.navy, borderRadius: 16, padding: 18,
    alignItems: "center", width: "47%",
    borderWidth: 1, borderColor: COLORS.border + "30",
  },
  quickIcon: { fontSize: 28, marginBottom: 8 },
  quickLabel: { color: "#fff", fontSize: 13, fontWeight: "600" },
  motivCard: {
    backgroundColor: COLORS.primary + "20", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.primary + "40",
  },
  motivText: { color: COLORS.primaryLight, fontSize: 14, lineHeight: 22, fontStyle: "italic" },
});
