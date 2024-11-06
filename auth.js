// Import Firebase configuration and necessary methods
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

// Firebase configuration (replace with your actual configuration)
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
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Sign Up Form
document.getElementById('signUpForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User signed up:", userCredential.user);
        // Optionally store additional user info like name
        alert("Sign-up successful!");
    } catch (error) {
        console.error("Error signing up:", error.message);
        alert(error.message); // Display error to the user
    }
});

// Sign In Form
document.getElementById('signInForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in:", userCredential.user);
        alert("Sign-in successful!");
        // Redirect or perform any action after sign-in
    } catch (error) {
        console.error("Error signing in:", error.message);
        alert(error.message); // Display error to the user
    }
});
