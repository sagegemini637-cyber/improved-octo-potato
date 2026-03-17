import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
 apiKey: "API_KEY",
 authDomain: "PROJECT.firebaseapp.com",
 projectId: "PROJECT_ID",
 storageBucket: "PROJECT.appspot.com",
 messagingSenderId: "ID",
 appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
