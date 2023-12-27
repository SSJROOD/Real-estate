// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_firebase_api_key,
  authDomain: "real-estate-app-ea746.firebaseapp.com",
  projectId: "real-estate-app-ea746",
  storageBucket: "real-estate-app-ea746.appspot.com",
  messagingSenderId: "218732366281",
  appId: "1:218732366281:web:d67317ac7d642f76cf8018",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
