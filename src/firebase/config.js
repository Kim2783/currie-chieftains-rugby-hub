import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Currie Chieftains Firebase Project Credentials
export const firebaseConfig = {
  apiKey: "AIzaSyCwdl4HvDH0j7y2dCTRiVqoc0Bk9DmPBiM",
  authDomain: "currie-chieftains-rugby-hub.firebaseapp.com",
  projectId: "currie-chieftains-rugby-hub",
  storageBucket: "currie-chieftains-rugby-hub.firebasestorage.app",
  messagingSenderId: "1046273883340",
  appId: "1:1046273883340:web:880a1e673d171550019669",
  measurementId: "G-ERBHXXEKS0"
};

let app = null;
let db = null;
let auth = null;
let isConfigured = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    isConfigured = true;
    console.log("🔥 Firebase initialized successfully for Currie Chieftains RFC!");
  } else {
    console.warn("⚠️ Firebase configuration keys not provided. Running in local mode.");
  }
} catch (err) {
  console.error("Firebase init error:", err);
}

export { app, db, auth, isConfigured };
