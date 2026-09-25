// ============================================
// FIREBASE CONFIG
// Replace the values below with YOUR Firebase project's
// credentials — Firebase Console → Project Settings → General → Your Apps
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA-s6OqRPIsQeqLkLnoOYHvt47NrxiMYMw",
  authDomain: "cafe-website-1b80a.firebaseapp.com",
  projectId: "cafe-website-1b80a",
  storageBucket: "cafe-website-1b80a.firebasestorage.app",
  messagingSenderId: "213151583491",
  appId: "1:213151583491:web:dd33cfe3e4795a98f6ad36",
  measurementId: "G-8GETE9Z8VB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
