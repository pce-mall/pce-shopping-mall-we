import React, { useState, useEffect } from "react";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc, query,
  getDocs, deleteDoc, updateDoc, where
} from "firebase/firestore";

import { auth, db, initError } from "./firebase";  // <-- use guarded init
