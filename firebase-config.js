// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDmgqAxUzxgJqvYLPNoATqA3hBLYla2PR0",
    authDomain: "jangsukoreanstore-12ba2.firebaseapp.com",
    projectId: "jangsukoreanstore-12ba2",
    storageBucket: "jangsukoreanstore-12ba2.firebasestorage.app",
    messagingSenderId: "935502137643",
    appId: "1:935502137643:web:454fc81b20e3c1b5ae9d6e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { 
    db, storage, auth,
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot,
    ref, uploadBytes, getDownloadURL, deleteObject,
    signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, signOut
};
