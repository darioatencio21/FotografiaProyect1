import { supabase } from './supabase';

export const SEEDED_FLAG_KEY = 'aurea_firestore_seeded';
const MISSING_TABLES_KEY = 'aurea_missing_tables';

function tn(table: string): string {
  return table.toLowerCase();
}

function isTableMissing(table: string): boolean {
  try {
    const missing = JSON.parse(sessionStorage.getItem(MISSING_TABLES_KEY) || '[]');
    return missing.includes(table);
  } catch {
    return false;
  }
}

function markTableMissing(table: string): void {
  try {
    const missing = JSON.parse(sessionStorage.getItem(MISSING_TABLES_KEY) || '[]');
    if (!missing.includes(table)) {
      missing.push(table);
      sessionStorage.setItem(MISSING_TABLES_KEY, JSON.stringify(missing));
    }
  } catch { /* ignore */ }
}

function isMissingTableError(err: any): boolean {
  const msg = err?.message || String(err);
  return /relation.*does not exist|not found.*table|PGRST(?:104|205|301)/i.test(msg);
}

function isSchemaMismatchError(err: any): boolean {
  const message = err?.message || String(err);
  return err?.status === 400 || err?.code === 'PGRST204' || /column .* does not exist|could not find the .* column/i.test(message);
}

// Keep public booking creation working while an older Supabase schema is being migrated.
const BOOKING_BASE_COLUMNS = new Set([
  'id', 'clientName', 'clientEmail', 'clientPhone', 'date', 'timeSlot',
  'serviceId', 'peopleCount', 'notes', 'status', 'createdAt', 'amount', 'isRead'
]);

function getCompatiblePayload(table: string, data: Record<string, unknown>): Record<string, unknown> {
  if (table !== 'bookings') return data;
  return Object.fromEntries(Object.entries(data).filter(([key]) => BOOKING_BASE_COLUMNS.has(key)));
}

export async function getCollectionWithFallback<T extends { id: string }>(
  collectionPath: string,
  fallbackData: T[]
): Promise<T[]> {
  const table = tn(collectionPath);
  if (isTableMissing(table)) return fallbackData;

  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;

    if (!data || data.length === 0) {
      if (fallbackData && fallbackData.length > 0) {
        const seededFlag = localStorage.getItem(SEEDED_FLAG_KEY);
        if (!seededFlag) {
          const { error: insertError } = await supabase.from(table).insert(fallbackData as any[]);
          if (!insertError) {
            localStorage.setItem(SEEDED_FLAG_KEY, 'true');
          }
        }
        const { data: fresh } = await supabase.from(table).select('*');
        if (fresh && fresh.length > 0) return fresh as T[];
      }
      return fallbackData;
    }

    return data as T[];
  } catch {
    markTableMissing(table);
    return fallbackData;
  }
}

export async function getSingleDocument<T>(collectionPath: string, docId: string): Promise<T | null> {
  const table = tn(collectionPath);
  if (isTableMissing(table)) return null;

  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', docId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as T;
  } catch (err: any) {
    if (isMissingTableError(err)) markTableMissing(table);
    return null;
  }
}

export async function saveDocument<T>(collectionPath: string, docId: string, data: T): Promise<void> {
  const table = tn(collectionPath);
  // Don't skip on missing-table: try always, since RLS is fixed.

  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}`;
  const apikey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  const body = JSON.stringify({ id: docId, ...(data as Record<string, unknown>) });

  const doUpsert = async (payload: string) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': apikey,
        'Authorization': `Bearer ${apikey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: payload,
    });
    if (!res.ok) {
      const text = await res.text();
      throw Object.assign(new Error(`saveDocument ${table} failed: ${res.status} ${text}`), {
        status: res.status,
        body: text,
      });
    }
  };

  try {
    await doUpsert(body);
    if (table === 'bookings' && (data as any)?.approvalToken) {
      console.log(`[saveDocument] OK bookings/${docId} token=${(data as any).approvalToken}`);
    }
    return;
  } catch (err: any) {
    console.error(`[saveDocument] ${table}/${docId} first attempt failed:`, err?.message ?? err);
    if (table === 'bookings' && isSchemaMismatchError(err)) {
      const compatibleData = getCompatiblePayload(table, data as Record<string, unknown>);
      const compatibleBody = JSON.stringify({ id: docId, ...compatibleData });
      try {
        await doUpsert(compatibleBody);
        return;
      } catch (retryErr: any) {
        if (isMissingTableError(retryErr)) {
          markTableMissing(table);
          return;
        }
        throw retryErr;
      }
    }
    if (isMissingTableError(err)) {
      markTableMissing(table);
      return;
    }
    throw err;
  }
}

export async function deleteDocument(collectionPath: string, docId: string): Promise<void> {
  const table = tn(collectionPath);
  if (isTableMissing(table)) return;

  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', docId);
    if (error) throw error;
  } catch (err: any) {
    if (isMissingTableError(err)) {
      markTableMissing(table);
      return;
    }
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
    if (!match) return;

    const bucket = match[1];
    const filePath = decodeURIComponent(match[2]);

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;
  } catch { /* ignore */ }
}

export async function loginWithSupabase(email: string, password: string): Promise<any> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function logoutFromSupabase(): Promise<void> {
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
