import {
  doc, setDoc, getDoc, updateDoc, collection,
  addDoc, query, where, getDocs, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export async function saveUserProfile(uid, profile) {
  await setDoc(doc(db, "users", uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(uid, updates) {
  await updateDoc(doc(db, "users", uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function saveSkillGapReport(uid, report) {
  await setDoc(doc(db, "skillReports", uid), {
    ...report,
    createdAt: serverTimestamp(),
  });
}

export async function getSkillGapReport(uid) {
  const snap = await getDoc(doc(db, "skillReports", uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveLearningPath(uid, path) {
  await setDoc(doc(db, "learningPaths", uid), {
    weeks: path.weeks,
    createdAt: serverTimestamp(),
    currentWeek: 1,
    currentDay: 1,
  });
}

export async function getLearningPath(uid) {
  const snap = await getDoc(doc(db, "learningPaths", uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateProgress(uid, week, day, completed, quizScore) {
  const progressRef = doc(db, "progress", `${uid}_w${week}_d${day}`);
  await setDoc(progressRef, {
    uid, week, day, completed,
    quizScore: quizScore ?? null,
    completedAt: serverTimestamp(),
  });

  // Update streak
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    const streak = (data.streak || 0) + 1;
    const totalDays = (data.totalDaysCompleted || 0) + 1;
    await updateDoc(userRef, { streak, totalDaysCompleted: totalDays, updatedAt: serverTimestamp() });
  }
}

export async function getProgress(uid) {
  const q = query(collection(db, "progress"), where("uid", "==", uid));
  const snap = await getDocs(q);
  const progress = {};
  snap.forEach((d) => {
    const data = d.data();
    progress[`w${data.week}_d${data.day}`] = data;
  });
  return progress;
}

export async function saveChatMessage(uid, message) {
  await addDoc(collection(db, "chats", uid, "messages"), {
    ...message,
    timestamp: serverTimestamp(),
  });
}

export async function getChatHistory(uid) {
  const q = query(
    collection(db, "chats", uid, "messages"),
    orderBy("timestamp", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
