import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDQ-Gk9B38crtL8FC-o2r6NlE4Wev0EDFU",
    authDomain: "threesentences-7b0cb.firebaseapp.com",
    projectId: "threesentences-7b0cb",
    storageBucket: "threesentences-7b0cb.firebasestorage.app",
    messagingSenderId: "133282432559",
    appId: "1:133282432559:web:41bb6679a83e9465de28da",
    measurementId: "G-FF4JL70EQ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

const isConfigured = true;

export { app, auth, isConfigured };
