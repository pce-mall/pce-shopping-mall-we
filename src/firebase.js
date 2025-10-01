// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB31kOw965UN-2_Gi4pNjOBtVCIDuh3Ef0",
  authDomain: "pce-shopping-mall.firebaseapp.com",
  projectId: "pce-shopping-mall",
  storageBucket: "pce-shopping-mall.appspot.com", // ✅ fixed storageBucket
  messagingSenderId: "10570005342",
  appId: "1:10570005342:web:c30283e51d78a3b879adcf",
  measurementId: "G-LSMP6YT0RV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Optional: Analytics (only works in browser, not on server build)
export const analytics = getAnalytics(app);

export default app;
