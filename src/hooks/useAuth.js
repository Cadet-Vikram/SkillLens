import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { getUserProfile } from "../services/userService";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  // Two loading flags:
  // authLoading  → true until Firebase confirms auth state (fast, ~1s)
  // profileLoading → true until Firestore profile is fetched
  const [authLoading,    setAuthLoading]    = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setProfileLoading(true);
        try {
          const p = await getUserProfile(u.uid);
          setProfile(p);
        } catch (_) {
          setProfile(null);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfile(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const refreshProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    } finally {
      setProfileLoading(false);
    }
  };

  // loading = true while EITHER auth OR profile is being fetched
  const loading = authLoading || profileLoading;

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, authLoading, profileLoading, signup, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);