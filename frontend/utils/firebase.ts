import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";



const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_APP_ID
}

export const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();




// function to handle google sign-in

export const signInWithGoogle = async () =>{
    try{
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;

    }catch(err){
         console.log("Google sign-in error:", err);
         throw err;
    }
}


