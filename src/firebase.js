// src/firebase.js (reference)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB31kOw965UN-2_Gi4pNjOBtVCIDuh3Ef0",
  authDomain: "pce-shopping-mall.firebaseapp.com",
  projectId: "pce-shopping-mall",
  storageBucket: "pce-shopping-mall.appspot.com",
  messagingSenderId: "10570005342",
  appId: "1:10570005342:web:c30283e51d78a3b879adcf",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
