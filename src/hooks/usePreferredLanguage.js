import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./useAuth";

const STORAGE_KEY = "skilllens.language";

export function usePreferredLanguage(fallback = "English") {
  const { profile } = useAuth();
  const [storedLanguage, setStoredLanguage] = useState(fallback);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (!active) return;
      if (saved) setStoredLanguage(saved);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!profile?.language) return;
    setStoredLanguage(profile.language);
    AsyncStorage.setItem(STORAGE_KEY, profile.language).catch(() => {});
  }, [profile?.language]);

  return profile?.language || storedLanguage || fallback;
}
