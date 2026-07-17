/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export const SEEDED_FLAG_KEY = 'aurea_firestore_seeded';

export async function getCollectionWithFallback<T extends { id: string }>(
  collectionPath: string,
  fallbackData: T[]
): Promise<T[]> {
  try {
    const colRef = collection(db, collectionPath);
    const querySnapshot = await getDocs(colRef);

    if (querySnapshot.empty && fallbackData && fallbackData.length > 0) {
      const seededFlag = localStorage.getItem(SEEDED_FLAG_KEY);
      if (!seededFlag) {
        console.log(`Collection "${collectionPath}" is empty. Seeding with fallback data...`);
        const batch = writeBatch(db);
        for (const item of fallbackData) {
          const docRef = doc(db, collectionPath, item.id);
          batch.set(docRef, item);
        }
        await batch.commit();
        localStorage.setItem(SEEDED_FLAG_KEY, 'true');
      }
      return fallbackData;
    }

    const items: T[] = [];
    querySnapshot.forEach((d) => {
      const data = d.data() as T;
      items.push(data);
    });
    return items;
  } catch (err: any) {
    console.warn(`Firestore fetch error for "${collectionPath}":`, err?.code || err?.message || err);
    return fallbackData;
  }
}

export async function getSingleDocument<T>(collectionPath: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionPath, docId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as T;
    }
    return null;
  } catch (err: any) {
    console.warn(`Firestore read error for "${collectionPath}/${docId}":`, err?.code || err?.message || err);
    return null;
  }
}

export async function saveDocument<T>(collectionPath: string, docId: string, data: T): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await setDoc(docRef, data as Record<string, unknown>, { merge: true });
  } catch (err: any) {
    console.error(`Firestore write error for "${collectionPath}/${docId}":`, err?.code || err?.message || err);
    throw err;
  }
}

export async function deleteDocument(collectionPath: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.error(`Firestore delete error for "${collectionPath}/${docId}":`, err?.code || err?.message || err);
    throw err;
  }
}

export async function loginWithFirebase(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export function logoutFromFirebase(): Promise<void> {
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
