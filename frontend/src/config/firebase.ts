import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCo5y8evhO6ILd5u8K7nZeDnUBnOOuRYMg",
  authDomain: "pettiboy-rag.firebaseapp.com",
  projectId: "pettiboy-rag",
  storageBucket: "pettiboy-rag.firebasestorage.app",
  messagingSenderId: "273453162261",
  appId: "1:273453162261:web:3bf480318f19387b95531c",
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
