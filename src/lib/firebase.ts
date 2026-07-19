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
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

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
export const storage = getStorage(app);

export async function uploadImageBlob(
  path: string,
  blob: Blob
): Promise<string> {
  const ref = storageRef(storage, path);
  await uploadBytes(ref, blob, { contentType: blob.type || 'image/jpeg' });
  return await getDownloadURL(ref);
}

export async function deleteImageByUrl(url: string): Promise<void> {
  try {
    if (!url || !url.startsWith('https://')) return;
    const decoded = decodeURIComponent(url.split('/o/')[1]?.split('?')[0] || '');
    if (!decoded) return;
    await deleteObject(storageRef(storage, decoded));
  } catch (err) {
    console.warn('Storage delete skipped:', err);
  }
}

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
        try {
          const batch = writeBatch(db);
          for (const item of fallbackData) {
            const docRef = doc(db, collectionPath, item.id);
            batch.set(docRef, item as Record<string, unknown>);
          }
          await batch.commit();
          localStorage.setItem(SEEDED_FLAG_KEY, 'true');
        } catch (seedErr: any) {
          console.warn(
            `⚠️ Seed skipped for "${collectionPath}" (likely doc size > 1 MiB). Run "npm run seed" from a privileged machine instead.`,
            seedErr?.code || seedErr?.message || seedErr
          );
        }
      }

      const freshSnapshot = await getDocs(colRef);
      const freshItems: T[] = [];
      freshSnapshot.forEach((d) => {
        freshItems.push({ id: d.id, ...d.data() } as T);
      });
      if (freshItems.length > 0) return freshItems;
    }

    const items: T[] = [];
    querySnapshot.forEach((d) => {
      items.push({ id: d.id, ...d.data() } as T);
    });
    return items.length > 0 ? items : fallbackData;
  } catch (err: any) {
    console.error(`🔥 Firestore error for "${collectionPath}":`, err?.code || err?.message || err);
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
