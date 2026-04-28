import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FIREBASE_CONFIG } from "../constants/config";

const app =
  getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];

export const auth =
  getApps().length > 0
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export const db = getFirestore(app);
