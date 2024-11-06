// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAIzsqeyuM9_YYADhaQId8thFbmPVb6f1U",
    authDomain: "browzio.firebaseapp.com",
    projectId: "browzio",
    storageBucket: "browzio.firebasestorage.app",
    messagingSenderId: "248409461082",
    appId: "1:248409461082:web:3764d62c1f49e051756363",
    measurementId: "G-YYMBMNZ5WP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };