// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration (you provided these)
const firebaseConfig = {
  apiKey: "AIzaSyB31kOw965UN-2_Gi4pNjOBtVCIDuh3Ef0",
  authDomain: "pce-shopping-mall.firebaseapp.com",
  projectId: "pce-shopping-mall",
  storageBucket: "pce-shopping-mall.firebasestorage.app",
  messagingSenderId: "10570005342",
  appId: "1:10570005342:web:c30283e51d78a3b879adcf",
  measurementId: "G-LSMP6YT0RV",
};

const app = initializeApp(firebaseConfig);

// Analytics is browser-only; guard to avoid errors in SSR/tests
try {
  if (typeof window !== "undefined") {
    getAnalytics(app);
  }
} catch (e) {
  // ignore analytics errors in non-browser envs
}

export const auth = getAuth(app);
export const db = getFirestore(app);
