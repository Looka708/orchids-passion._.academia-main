
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, memoryLocalCache } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAkRb4Bv_oaGfAlEsjFJcqG7XuW6R8kQzk",
  authDomain: "cyber-security-460017.firebaseapp.com",
  projectId: "cyber-security-460017",
  storageBucket: "cyber-security-460017.firebasestorage.app",
  messagingSenderId: "705319384418",
  appId: "1:705319384418:web:d3c38152b19064c396683b",
  measurementId: "G-0F7CCNVK4V"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Use memoryLocalCache to prevent offline persistence issues in server environments
const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
});

const auth = getAuth(app);

export { db, app, auth };
