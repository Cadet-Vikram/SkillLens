import React from "react";
import { View, Text, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { AuthProvider, useAuth } from "../hooks/useAuth";
import { useLocalizedCopy } from "../hooks/useLocalizedCopy";
import { usePreferredLanguage } from "../hooks/usePreferredLanguage";
import { COLORS } from "../constants/config";

import WelcomeScreen from "../screens/WelcomeScreen";
import SignupScreen from "../screens/SignupScreen";
import LoginScreen from "../screens/LoginScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/HomeScreen";
import SkillReportScreen from "../screens/SkillReportScreen";
import LearningPathScreen from "../screens/LearningPathScreen";
import CoachScreen from "../screens/CoachScreen";
import ProgressScreen from "../screens/ProgressScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ icon, label, focused }) {
  return (
    <View style={tabStyles.wrap}>
      <Text style={tabStyles.icon}>{icon}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
      {focused && <View style={tabStyles.dot} />}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingTop: 6, width: 58 },
  icon: { fontSize: 22, lineHeight: 26 },
  label: { fontSize: 10, color: COLORS.textMuted, marginTop: 3, fontWeight: "500", textAlign: "center" },
  labelActive: { color: COLORS.primaryLight, fontWeight: "700" },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.primaryLight, marginTop: 3 },
});

function MainTabs() {
  const language = usePreferredLanguage();
  const copy = useLocalizedCopy(language, {
    home: "Home",
    skills: "Skills",
    learn: "Learn",
    coach: "Coach",
    progress: "Progress",
    profile: "Profile",
  });

  const tabs = [
    { name: "Home", component: HomeScreen, icon: "🏠", label: copy.home },
    { name: "SkillReport", component: SkillReportScreen, icon: "📊", label: copy.skills },
    { name: "LearningPath", component: LearningPathScreen, icon: "🗺️", label: copy.learn },
    { name: "Coach", component: CoachScreen, icon: "🤖", label: copy.coach },
    { name: "Progress", component: ProgressScreen, icon: "📈", label: copy.progress },
    { name: "Profile", component: ProfileScreen, icon: "👤", label: copy.profile },
  ];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = tabs.find((t) => t.name === route.name) || tabs[0];
        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: COLORS.dark,
            borderTopColor: "#1E3A5F",
            borderTopWidth: 1,
            height: Platform.OS === "android" ? 65 : 80,
            paddingBottom: Platform.OS === "android" ? 8 : 20,
            paddingTop: 4,
            elevation: 10,
          },
          tabBarIcon: ({ focused }) => <TabIcon icon={tab.icon} label={tab.label} focused={focused} />,
        };
      }}
    >
      {tabs.map((t) => (
        <Tab.Screen key={t.name} name={t.name} component={t.component} />
      ))}
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  const language = usePreferredLanguage();
  const copy = useLocalizedCopy(language, {
    title: "SkillLens",
    subtitle: "Know your gaps. Own your future.",
  });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.dark, justifyContent: "center", alignItems: "center" }}>
      <View style={{
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: COLORS.primary,
        alignItems: "center", justifyContent: "center", marginBottom: 24,
      }}>
        <Text style={{ fontSize: 36 }}>🔍</Text>
      </View>
      <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 6 }}>{copy.title}</Text>
      <Text style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 24 }}>{copy.subtitle}</Text>
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  );
}

function RootNavigator() {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  const isLoggedIn = !!user;
  const onboardingComplete = !!profile?.onboardingComplete;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : !onboardingComplete ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
