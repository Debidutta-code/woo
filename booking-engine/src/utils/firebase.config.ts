import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDja7ilncpvWEqTPkJ4KxCrxKhWJXnO568",
  authDomain: "woohootrip-1e7ac.firebaseapp.com",
  projectId: "woohootrip-1e7ac",
  storageBucket: "woohootrip-1e7ac.firebasestorage.app",
  messagingSenderId: "386203949060",
  appId: "1:386203949060:web:4af8b0f79768a61191fd51",
  measurementId: "G-JWWDMNVXSP"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

let messaging: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.warn("🚫 FCM is not supported in this browser.", err);
  }
}

export { app, messaging };