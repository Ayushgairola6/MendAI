import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { dotenv } from 'dotenv';
dotenv.config();


const firebaseConfig = {
    apiKey: process.env.firebaseapiKey,
    authDomain: process.env.firebaseauthDomain,
    projectId: process.env.firebaseprojectId,
    storageBucket: process.env.firebasestorageBucket,
    messagingSenderId: process.env.firebasemessagingSenderId,
    appId: process.env.firebaseappId,
    measurementId: process.env.firebasemeasurementId,
};

const app = initializeApp(firebaseConfig)

export const storage = getStorage(app);
