import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBlWlwHMsgLHtn_KHPh7Wrx_7wyC1c1j_k",
    authDomain: "ai-trip-planer-1e687.firebaseapp.com",
    projectId: "ai-trip-planer-1e687",
    storageBucket: "ai-trip-planer-1e687.firebasestorage.app",
    messagingSenderId: "974145751607",
    appId: "1:974145751607:web:456fdf798dfb40a493cdb2",
    measurementId: "G-DW8QLEK8SG"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
