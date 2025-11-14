import { FirebaseApp, initializeApp, getApps } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

const requiredEnvVars: Array<keyof FirebaseConfig> = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

function readConfig(): FirebaseConfig {
  const config: Partial<FirebaseConfig> = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missing = requiredEnvVars.filter((key) => !config[key]);

  if (missing.length) {
    throw new Error(
      `Missing Firebase configuration values: ${missing.join(", ")}. Please check your environment variables.`
    );
  }

  return config as FirebaseConfig;
}

let firebaseApp: FirebaseApp | undefined;
let firestore: Firestore | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    const config = readConfig();
    firebaseApp = getApps().length ? getApps()[0]! : initializeApp(config);
  }

  return firebaseApp;
}

export function getDb(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }

  return firestore;
}
