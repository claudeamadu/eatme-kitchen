// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6xs_rNd6IC3AjrHqKI_wbi0XmLVyRrew",
  authDomain: "eatme-kitchen.firebaseapp.com",
  projectId: "eatme-kitchen",
  storageBucket: "eatme-kitchen.firebasestorage.app",
  messagingSenderId: "377305497298",
  appId: "1:377305497298:web:9eb7a09966263559a9370b",
  measurementId: "G-GVMZ7LB1GQ",
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }

