import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD5KW6BxZ4juxz1Z8haP2jjE_CSHEJiuH0",
  authDomain: "pocket-heist-ah-2026.firebaseapp.com",
  projectId: "pocket-heist-ah-2026",
  storageBucket: "pocket-heist-ah-2026.firebasestorage.app",
  messagingSenderId: "51907448528",
  appId: "1:51907448528:web:2462cc3f27ebd659c6d8d5",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
