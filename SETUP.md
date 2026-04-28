# SkillLens — Setup & Run Guide
## React Native + Expo App for Windows

---

## ✅ Prerequisites (install these first)

1. **Node.js v18+** → https://nodejs.org
2. **Expo Go app** on your Android phone → Play Store
3. Make sure your phone and PC are on the **same WiFi network**

---

## 🚀 How to Run the App

Open **Command Prompt** or **PowerShell** and run these commands:

```bash
# Step 1 — go into the project folder
cd SkillLens

# Step 2 — install all packages (only needed once)
npm install

# Step 3 — start the app
npx expo start
```

A **QR code** will appear in the terminal.

Open **Expo Go** on your phone → tap **"Scan QR code"** → scan it.

The app will load on your phone in 10–20 seconds! 🎉

---

## 📁 Project Structure

```
SkillLens/
├── App.js                          ← Entry point
├── src/
│   ├── constants/
│   │   └── config.js               ← API keys, colors, constants
│   ├── hooks/
│   │   └── useAuth.js              ← Firebase auth context
│   ├── navigation/
│   │   └── AppNavigator.js         ← All navigation setup
│   ├── screens/
│   │   ├── SplashScreen.js         ← Loading/routing screen
│   │   ├── WelcomeScreen.js        ← Landing page
│   │   ├── SignupScreen.js         ← Register
│   │   ├── LoginScreen.js          ← Login
│   │   ├── OnboardingScreen.js     ← Goal input + AI analysis
│   │   ├── HomeScreen.js           ← Dashboard
│   │   ├── SkillReportScreen.js    ← Skill gap breakdown
│   │   ├── LearningPathScreen.js   ← 4-week plan + quizzes
│   │   ├── CoachScreen.js          ← AI chat coach
│   │   ├── ProgressScreen.js       ← Progress tracker
│   │   └── ProfileScreen.js        ← Profile + settings
│   └── services/
│       ├── firebase.js             ← Firebase init
│       ├── groqService.js          ← Groq AI calls
│       └── userService.js          ← Firestore CRUD
```

---

## 🔑 API Keys (already configured)

| Service | Key | Status |
|---------|-----|--------|
| Groq API | `gsk_N7z4Zduk...` | ✅ Configured |
| Firebase | `skilllens-934c7` | ✅ Configured |

---

## 📱 App Flow

```
Splash → Welcome → Signup/Login
                       ↓
              Onboarding (speak your goal)
                       ↓
           AI analyzes gaps (~15 sec)
                       ↓
              Main App (bottom tabs)
    ┌──────┬──────┬──────┬──────┬──────┐
  Home  Skills  Learn  Coach  Progress Profile
```

---

## 🛠 Troubleshooting

**"Network request failed" error?**
→ Make sure phone and PC are on the same WiFi

**Firebase auth error?**
→ Check that Email/Password sign-in is enabled in Firebase Console

**App won't load?**
→ Run `npx expo start --clear` to clear cache

**Groq API error?**
→ Check your API key at console.groq.com

---

## 🎯 Features Built

- [x] Firebase Auth (signup/login)
- [x] AI Skill Gap Analysis (Groq + Llama 3)
- [x] Personalized 4-Week Learning Path (AI generated)
- [x] Daily Tasks with resource links
- [x] Daily Quiz with AI explanations
- [x] Progress tracking + streak system
- [x] AI Coach chat (real-time)
- [x] Multilingual support (6 languages)
- [x] Skill radar / growth tracking
- [x] Portfolio sharing
- [x] Dark theme throughout

---

Built with ❤️ for GDG Solution Challenge 2025
