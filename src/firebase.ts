// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1L_J4InRKTxvkucqxMMTThWax8iJJ05g",
  authDomain: "macro-tracker-4f7a1.firebaseapp.com",
  projectId: "macro-tracker-4f7a1",
  storageBucket: "macro-tracker-4f7a1.firebasestorage.app",
  messagingSenderId: "877162116787",
  appId: "1:877162116787:web:10ef6e191982a036ee62c6",
  measurementId: "G-7CZ3RY1009",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
