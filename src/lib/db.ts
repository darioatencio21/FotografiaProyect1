import { supabase } from './supabase';

export const SEEDED_FLAG_KEY = 'aurea_firestore_seeded';

function tn(table: string): string {
  return table.toLowerCase();
}

export async function getCollectionWithFallback<T extends { id: string }>(
  collectionPath: string,
  fallbackData: T[]
): Promise<T[]> {
  try {
    const { data, error } = await supabase.from(tn(collectionPath)).select('*');
    if (error) throw error;

    if (!data || data.length === 0) {
      if (fallbackData && fallbackData.length > 0) {
        const seededFlag = localStorage.getItem(SEEDED_FLAG_KEY);
        if (!seededFlag) {
          console.log(`Collection "${collectionPath}" is empty. Seeding with fallback data...`);
          const { error: insertError } = await supabase.from(tn(collectionPath)).insert(fallbackData as any[]);
          if (insertError) {
            console.warn(`Seed skipped for "${collectionPath}":`, insertError.message);
          } else {
            localStorage.setItem(SEEDED_FLAG_KEY, 'true');
          }
        }
        const { data: fresh } = await supabase.from(tn(collectionPath)).select('*');
        if (fresh && fresh.length > 0) return fresh as T[];
      }
      return fallbackData;
    }

    return data as T[];
  } catch (err: any) {
    console.error(`DB read error for "${collectionPath}":`, err?.message || err);
    return fallbackData;
  }
}

export async function getSingleDocument<T>(collectionPath: string, docId: string): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from(tn(collectionPath))
      .select('*')
      .eq('id', docId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as T;
  } catch (err: any) {
    console.warn(`DB read error for "${collectionPath}/${docId}":`, err?.message || err);
    return null;
  }
}

export async function saveDocument<T>(collectionPath: string, docId: string, data: T): Promise<void> {
  try {
    const { error } = await supabase
      .from(tn(collectionPath))
      .upsert({ id: docId, ...data as any });
    if (error) throw error;
  } catch (err: any) {
    console.error(`DB write error for "${collectionPath}/${docId}":`, err?.message || err);
    throw err;
  }
}

export async function deleteDocument(collectionPath: string, docId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(tn(collectionPath))
      .delete()
      .eq('id', docId);
    if (error) throw error;
  } catch (err: any) {
    console.error(`DB delete error for "${collectionPath}/${docId}":`, err?.message || err);
    throw err;
  }
}

export async function uploadImageBlob(path: string, blob: Blob): Promise<string> {
  const parts = path.split('/');
  const bucket = parts[0];
  const filePath = parts.slice(1).join('/');

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: true,
    });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteImageByUrl(url: string): Promise<void> {
  try {
    if (!url || !url.startsWith('https://')) return;

    const supabasePattern = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)/;
    const match = url.match(supabasePattern);
    if (!match) {
      console.warn('Could not parse Supabase Storage URL:', url);
      return;
    }

    const bucket = match[1];
    const filePath = decodeURIComponent(match[2]);

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;
  } catch (err) {
    console.warn('Storage delete skipped:', err);
  }
}

export async function loginWithFirebase(email: string, password: string): Promise<any> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function logoutFromFirebase(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthChange(callback: (user: any | null) => void): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}

export { supabase };
