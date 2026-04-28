# SkillLens

SkillLens is a multilingual AI career coach built with Expo and React Native. The app helps a learner describe a goal in natural language, detects skill gaps, generates a 4-week learning path, tracks progress, and lets the user chat with an AI coach in their chosen language.

## What it does

- AI skill-gap analysis from a user’s goal
- Multilingual coaching and UI translation
- Personalized 4-week learning path with quizzes
- Progress tracking, streaks, and readiness scores
- AI coach chat
- Profile language switching that regenerates app content
- Firebase auth and Firestore-backed persistence

## Tech Stack

- Expo SDK 54
- React Native
- React Navigation
- Firebase Authentication
- Firestore
- Groq API for AI generation
- Google Cloud Translation API for translated content
- AsyncStorage for persisted language preference

## App Flow

1. Splash screen
2. Welcome screen
3. Signup or login
4. Onboarding
5. Skill analysis
6. Learning path generation
7. Main tabs:
   - Home
   - Skill Report
   - Learning Path
   - Coach
   - Progress
   - Profile

## Project Structure

```text
App.js
src/
  constants/
    config.js
    theme.ts
  hooks/
    useAuth.js
    useLocalizedCopy.js
    usePreferredLanguage.js
  navigation/
    AppNavigator.js
  screens/
    WelcomeScreen.js
    LoginScreen.js
    SignupScreen.js
    SplashScreen.js
    OnboardingScreen.js
    HomeScreen.js
    SkillReportScreen.js
    LearningPathScreen.js
    CoachScreen.js
    ProgressScreen.js
    ProfileScreen.js
  services/
    firebase.js
    groqService.js
    uiTranslationService.js
    userService.js
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
EXPO_PUBLIC_GOOGLE_TRANSLATE_KEY=your_google_translate_api_key
```

The app reads these from `src/constants/config.js`.

### 3. Start the app

```bash
npx expo start
```

You can open it with:

- Expo Go on a device
- Android emulator
- iOS simulator

## Available Scripts

- `npm run start` - start Expo
- `npm run android` - start Expo and open Android
- `npm run ios` - start Expo and open iOS
- `npm run web` - start Expo web
- `npm run lint` - run lint checks

## How Language Switching Works

When the user changes language from Profile:

- the selected language is saved to the user profile
- skill-report data is regenerated in that language
- the learning path is regenerated in that language
- the AI coach replies in that language
- the UI copy is translated through a shared translation helper

## Build an Android APK

For a standalone APK, use EAS Build.

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Configure EAS

```bash
eas build:configure
```

### 3. Add an APK build profile

In `eas.json`, use a preview profile that produces an APK:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

### 4. Build the APK

```bash
eas build -p android --profile preview
```

Expo’s current docs recommend APKs for preview builds and AABs for Google Play submissions.

## Build a Play Store Release

For a real store submission, build an Android App Bundle instead:

```bash
eas build -p android --profile production
```

Then submit the AAB to Google Play.

## Notes

- The app entry point is `App.js`, not Expo Router.
- Firebase, Groq, and translation keys should stay in env vars, not hardcoded in source.
- The app currently targets Android-first usage, but it also supports iOS and web through Expo.

## License

No license file is included yet.
