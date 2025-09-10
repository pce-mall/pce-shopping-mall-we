// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let app = null;
let auth = null;
let db = null;
let initError = null;

try {
  // ⛳ USE THE EXACT CONFIG FROM Firebase Console → Project settings → Your apps → SDK config
  const firebaseConfig = {
    apiKey: "AIzaSyB31kOw965UN-2_Gi4pNjOBtVCIDuh3Ef0",
    authDomain: "pce-shopping-mall.firebaseapp.com",
    projectId: "pce-shopping-mall",
    // IMPORTANT: Firebase storage bucket usually ends with .appspot.com (not .firebasestorage.app)
    storageBucket: "pce-shopping-mall.appspot.com",
    messagingSenderId: "10570005342",
    appId: "1:10570005342:web:c30283e51d78a3b879adcf",
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase init error:", e);
  initError = e;
}

export { app, auth, db, initError };
