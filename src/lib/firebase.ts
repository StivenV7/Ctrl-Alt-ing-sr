// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

export { app, auth };
