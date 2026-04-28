import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  ActivityIndicator, TouchableOpacity, Linking, Alert, Modal,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { getLearningPath, getProgress, updateProgress } from "../services/userService";
import { generateQuizExplanation } from "../services/groqService";
import { COLORS } from "../constants/config";
import { useLocalizedCopy } from "../hooks/useLocalizedCopy";
import { usePreferredLanguage } from "../hooks/usePreferredLanguage";

export default function LearningPathScreen() {
  const { user } = useAuth();
  const language = usePreferredLanguage();
  const copy = useLocalizedCopy(language, {
    title: "Learning Path",
    daysDone: "days done",
    week: "Week",
    focus: "Focus",
    openResource: "Open Resource",
    resourceTitle: "Resource",
    resourceBody: "Open your learning platform and search for this topic.",
    errorTitle: "Error",
    openLinkFail: "Could not open link",
    dailyQuiz: "Daily Quiz",
    task: "Task",
    correctFallback: "Great job! That's correct.",
    close: "Close",
    markComplete: "Mark Day Complete",
  });
  const [path, setPath] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(0);
  const [quizModal, setQuizModal] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizExplanation, setQuizExplanation] = useState("");
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      const [p, prog] = await Promise.all([getLearningPath(user.uid), getProgress(user.uid)]);
      setPath(p);
      setProgress(prog);
      setLoading(false);
    };

    run();
  }, [user.uid]);

  const isCompleted = (week, day) => !!progress[`w${week}_d${day}`];

  const handleDayPress = (day, week) => {
    if (isCompleted(week, day.day)) return;
    setQuizModal({ day, week });
    setQuizAnswer(null);
    setQuizExplanation("");
  };

  const handleAnswer = async (optionIdx, day, week) => {
    setQuizAnswer(optionIdx);
    const isCorrect = optionIdx === day.quiz.answer;
    setQuizLoading(true);
    try {
      const explanation = await generateQuizExplanation(
        day.quiz.question, day.quiz.options[optionIdx],
        day.quiz.options[day.quiz.answer], day.skill
      );
      setQuizExplanation(explanation);
    } catch (_) {
      setQuizExplanation(isCorrect ? copy.correctFallback : `${copy.task}: ${day.quiz.options[day.quiz.answer]}`);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!quizModal) return;
    const { day, week } = quizModal;
    const score = quizAnswer === day.quiz.answer ? 100 : 50;
    await updateProgress(user.uid, week, day.day, true, score);
    setProgress((prev) => ({ ...prev, [`w${week}_d${day.day}`]: { completed: true } }));
    setQuizModal(null);
  };

  const openResource = (url) => {
    if (!url || url === "https://...") {
      Alert.alert(copy.resourceTitle, copy.resourceBody);
      return;
    }
    Linking.openURL(url).catch(() => Alert.alert(copy.errorTitle, copy.openLinkFail));
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </SafeAreaView>
    );
  }

  const weeks = path?.weeks || [];
  const completedCount = Object.keys(progress).length;
  const totalCount = weeks.reduce((a, w) => a + w.days.length, 0);
  const pct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const resourceTypeLabel = (type) => {
    if (type === "video") return "video";
    if (type === "article") return "article";
    return "exercise";
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />

      <View style={styles.header}>
        <Text style={styles.title}>{copy.title} 🗺️</Text>
        <Text style={styles.progress}>{completedCount}/{totalCount} {copy.daysDone}</Text>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekTabs}>
        {weeks.map((week, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.weekTab, activeWeek === i && styles.weekTabActive]}
            onPress={() => setActiveWeek(i)}
          >
            <Text style={[styles.weekTabText, activeWeek === i && styles.weekTabTextActive]}>
              {copy.week} {week.week}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {weeks[activeWeek] && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
          <View style={styles.weekHeader}>
            <Text style={styles.weekTheme}>{weeks[activeWeek].theme}</Text>
            <Text style={styles.weekFocus}>{copy.focus}: {weeks[activeWeek].focus}</Text>
          </View>

          {weeks[activeWeek].days.map((day, i) => {
            const done = isCompleted(weeks[activeWeek].week, day.day);
            return (
              <TouchableOpacity
                key={i}
                style={[styles.dayCard, done && styles.dayCardDone]}
                onPress={() => handleDayPress(day, weeks[activeWeek].week)}
                activeOpacity={done ? 1 : 0.8}
              >
                <View style={styles.dayLeft}>
                  <View style={[styles.dayNum, done && styles.dayNumDone]}>
                    <Text style={styles.dayNumText}>{done ? "✓" : day.day}</Text>
                  </View>
                </View>
                <View style={styles.dayContent}>
                  <Text style={[styles.dayTitle, done && styles.dayTitleDone]}>{day.title}</Text>
                  <Text style={styles.daySkill}>{day.skill}</Text>
                  <View style={styles.dayMeta}>
                    <Text style={styles.dayMetaText}>⏱ {day.duration}</Text>
                    <Text style={styles.dayMetaText}>
                      {day.resourceType === "video" ? "🎬" : day.resourceType === "article" ? "📖" : "💪"} {resourceTypeLabel(day.resourceType)} {day.resource}
                    </Text>
                  </View>
                  {!done && (
                    <TouchableOpacity style={styles.resourceBtn} onPress={() => openResource(day.resourceUrl)}>
                      <Text style={styles.resourceBtnText}>{copy.openResource} →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <Modal visible={!!quizModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {quizModal && (
              <>
                <Text style={styles.modalTitle}>📝 {copy.dailyQuiz}</Text>
                <Text style={styles.modalTask}>{copy.task}: {quizModal.day.task}</Text>
                <View style={styles.divider} />
                <Text style={styles.modalQ}>{quizModal.day.quiz.question}</Text>

                {quizModal.day.quiz.options.map((opt, i) => {
                  let style = styles.optionBtn;
                  if (quizAnswer !== null) {
                    if (i === quizModal.day.quiz.answer) style = styles.optionBtnCorrect;
                    else if (i === quizAnswer) style = styles.optionBtnWrong;
                  }
                  return (
                    <TouchableOpacity
                      key={i}
                      style={style}
                      onPress={() => quizAnswer === null && handleAnswer(i, quizModal.day, quizModal.week)}
                    >
                      <Text style={[styles.optionText, quizAnswer !== null && i === quizModal.day.quiz.answer && { color: "#fff" }]}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {quizLoading && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 12 }} />}
                {quizExplanation ? (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationText}>{quizExplanation}</Text>
                  </View>
                ) : null}

                {quizAnswer !== null && !quizLoading && (
                  <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
                    <Text style={styles.completeBtnText}>{copy.markComplete} ✓</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.closeBtn} onPress={() => setQuizModal(null)}>
                  <Text style={styles.closeBtnText}>{copy.close}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.dark },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: "700", color: "#fff" },
  progress: { color: COLORS.primaryLight, fontWeight: "600", fontSize: 14 },
  progressBarBg: { height: 4, backgroundColor: COLORS.navy, marginHorizontal: 20, borderRadius: 2 },
  progressBarFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
  weekTabs: { paddingHorizontal: 16, marginTop: 16, marginBottom: 4, flexGrow: 0 },
  weekTab: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 8,
    backgroundColor: COLORS.navy,
  },
  weekTabActive: { backgroundColor: COLORS.primary },
  weekTabText: { color: COLORS.textMuted, fontWeight: "600", fontSize: 13 },
  weekTabTextActive: { color: "#fff" },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 },
  weekHeader: { marginBottom: 16 },
  weekTheme: { fontSize: 18, fontWeight: "700", color: "#fff" },
  weekFocus: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  dayCard: {
    backgroundColor: COLORS.navy, borderRadius: 16, padding: 16,
    flexDirection: "row", gap: 14, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border + "30",
  },
  dayCardDone: { opacity: 0.6, borderColor: COLORS.success + "60" },
  dayLeft: { alignItems: "center", paddingTop: 2 },
  dayNum: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary + "30", alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  dayNumDone: { backgroundColor: COLORS.success + "30", borderColor: COLORS.success },
  dayNumText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  dayContent: { flex: 1 },
  dayTitle: { fontSize: 15, fontWeight: "700", color: "#fff", marginBottom: 2 },
  dayTitleDone: { textDecorationLine: "line-through", color: COLORS.textMuted },
  daySkill: { fontSize: 12, color: COLORS.primary, marginBottom: 8 },
  dayMeta: { flexDirection: "row", gap: 16, marginBottom: 10 },
  dayMetaText: { fontSize: 12, color: COLORS.textMuted },
  resourceBtn: { backgroundColor: COLORS.primary + "20", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, alignSelf: "flex-start" },
  resourceBtnText: { color: COLORS.primaryLight, fontSize: 12, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: COLORS.dark, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: "90%",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 8 },
  modalTask: { fontSize: 13, color: COLORS.textMuted, marginBottom: 12, lineHeight: 20 },
  divider: { height: 1, backgroundColor: COLORS.navy, marginBottom: 16 },
  modalQ: { fontSize: 16, color: "#fff", fontWeight: "600", marginBottom: 16, lineHeight: 24 },
  optionBtn: {
    backgroundColor: COLORS.navy, borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border + "40",
  },
  optionBtnCorrect: { backgroundColor: COLORS.success, borderRadius: 12, padding: 14, marginBottom: 8 },
  optionBtnWrong: { backgroundColor: COLORS.coral, borderRadius: 12, padding: 14, marginBottom: 8 },
  optionText: { color: "#fff", fontSize: 14 },
  explanationBox: { backgroundColor: COLORS.primary + "20", borderRadius: 12, padding: 12, marginTop: 8 },
  explanationText: { color: COLORS.primaryLight, fontSize: 13, lineHeight: 20 },
  completeBtn: { backgroundColor: COLORS.success, borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  completeBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  closeBtn: { paddingVertical: 12, alignItems: "center", marginTop: 8 },
  closeBtnText: { color: COLORS.textMuted, fontSize: 14 },
});
