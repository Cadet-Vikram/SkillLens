export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDS7BJp19dKohfKKMnSeFmlN4bHZ5Ij6BU",
  authDomain: "skilllens-934c7.firebaseapp.com",
  projectId: "skilllens-934c7",
  storageBucket: "skilllens-934c7.firebasestorage.app",
  messagingSenderId: "616040948494",
  appId: "1:616040948494:android:9729c7d39e9bef8ea36d5f",
};

// Secrets are read from Expo public env vars so they are not committed to git.
export const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || "";
export const GOOGLE_TRANSLATE_KEY = process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_KEY || "";

export const COLORS = {
  primary: "#028090",
  primaryDark: "#01606e",
  primaryLight: "#02C39A",
  accent: "#F4A261",
  bg: "#F4F9F8",
  card: "#FFFFFF",
  dark: "#0A1628",
  navy: "#112240",
  text: "#1A2F4A",
  textMuted: "#6B7E8F",
  border: "#D0E8E4",
  success: "#02C39A",
  warning: "#F4A261",
  danger: "#E76F51",
  coral: "#F96167",
};

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी (Hindi)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "mr", label: "मराठी (Marathi)" },
];

export const JOB_ROLES = [
  "Data Analyst", "Software Developer", "Digital Marketer",
  "UI/UX Designer", "Product Manager", "Data Scientist",
  "Web Developer", "Business Analyst", "Content Writer",
  "Cybersecurity Analyst",
];
