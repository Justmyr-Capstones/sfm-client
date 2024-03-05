// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD8EUPCOUFU8EGHoZM5p_3QqiI8Y3CEwhg",
    authDomain: "santafe-f989f.firebaseapp.com",
    projectId: "santafe-f989f",
    storageBucket: "santafe-f989f.appspot.com",
    messagingSenderId: "889257772712",
    appId: "1:889257772712:web:d8908aa68f11b44a3be49d",
    measurementId: "G-SQHXVRD11B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);
