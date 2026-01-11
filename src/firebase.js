import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyABvQAsfELRMCxOBXygk64bl25F8vIJGoI",
  authDomain: "digipantryai.firebaseapp.com",
  databaseURL: "https://digipantryai-default-rtdb.firebaseio.com",
  projectId: "digipantryai",
  storageBucket: "digipantryai.firebasestorage.app",
  messagingSenderId: "684245215974",
  appId: "1:684245215974:web:f190ea4059c238aa3da927",
  measurementId: "G-6JP1EL93SG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
