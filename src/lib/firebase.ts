/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

const dbId = import.meta.env.VITE_FIREBASE_DATABASE_ID;

export const db = dbId && dbId !== '(default)'
  ? getFirestore(app, dbId)
  : getFirestore(app);

// Validate Connection to Firestore on boot as requested by skill
async function testConnection() {
  try {
    // Attempting to read a test document to verify config and connectivity
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection validated successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firebase connection error: Client appears offline. Please check your Firebase configuration.', error);
    } else {
      console.log('Firebase connection checked:', error);
    }
  }
}
testConnection();

/**
 * Fetch a whole collection from Firestore.
 * If the collection is empty, it will seed it with the provided default fallback data.
 */
export async function getCollectionWithFallback<T extends { id: string }>(
  collectionPath: string,
  fallbackData: T[]
): Promise<T[]> {
  try {
    const colRef = collection(db, collectionPath);
    const querySnapshot = await getDocs(colRef);
    
    if (querySnapshot.empty && fallbackData && fallbackData.length > 0) {
      console.log(`Collection "${collectionPath}" is empty. Seeding with fallback data...`);
      const batch = writeBatch(db);
      for (const item of fallbackData) {
        const docRef = doc(db, collectionPath, item.id);
        batch.set(docRef, item);
      }
      await batch.commit();
      return fallbackData;
    }
    
    const items: T[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as T);
    });
    return items;
  } catch (err) {
    console.error(`Error fetching collection "${collectionPath}":`, err);
    return fallbackData;
  }
}

/**
 * Fetch a single document by ID from Firestore, or returns null if not found.
 */
export async function getSingleDocument<T>(collectionPath: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionPath, docId);
    const querySnapshot = await getDocFromServer(docRef);
    if (querySnapshot.exists()) {
      return querySnapshot.data() as T;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching document ${collectionPath}/${docId}:`, err);
    return null;
  }
}

/**
 * Save or update a document in Firestore.
 */
export async function saveDocument<T>(collectionPath: string, docId: string, data: T): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await setDoc(docRef, data as any, { merge: true });
    console.log(`Document saved successfully: ${collectionPath}/${docId}`);
  } catch (err) {
    console.error(`Error saving document ${collectionPath}/${docId}:`, err);
    throw err;
  }
}

/**
 * Delete a document from Firestore.
 */
export async function deleteDocument(collectionPath: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
    console.log(`Document deleted successfully: ${collectionPath}/${docId}`);
  } catch (err) {
    console.error(`Error deleting document ${collectionPath}/${docId}:`, err);
    throw err;
  }
}
