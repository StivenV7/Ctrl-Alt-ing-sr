
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-7273k99dvhkPIRMwLfbHWasJ6TThL3I",
  authDomain: "administracionmaestra.firebaseapp.com",
  projectId: "administracionmaestra",
  storageBucket: "administracionmaestra.firebasestorage.app",
  messagingSenderId: "836762043895",
  appId: "1:836762043895:web:aea541e46de9bc17b69af2",
  measurementId: "G-VZ6QK0FHFS"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators if running in a development environment
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log("Connecting to Firebase Emulators");
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, 'localhost', 8080);
}


export { app, auth, db };
