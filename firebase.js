// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
  } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_apiKey,
  authDomain: "campus--link.firebaseapp.com",
  projectId: "campus--link",
  storageBucket: "campus--link.appspot.com",
  messagingSenderId: "1081590428682",
  appId: "1:1081590428682:web:212348c7814f1352a35bf3",
  measurementId: "G-1RRHN5KRB9"
};


export const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore();