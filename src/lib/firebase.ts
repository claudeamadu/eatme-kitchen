
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDpDIjCHll4hlO2D-tqUY6ba7GmEir56T0",
  authDomain: "eatme-kitchen-4fa31.firebaseapp.com",
  projectId: "eatme-kitchen-4fa31",
  storageBucket: "eatme-kitchen-4fa31.appspot.com",
  messagingSenderId: "405646447800",
  appId: "1:405646447800:web:1da0f688c7e35ccaea104d"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
