import { supabase, ensureActiveSession } from './supabase';

export const SEEDED_FLAG_KEY = 'aurea_firestore_seeded';
const MISSING_TABLES_KEY = 'aurea_missing_tables';

const SAVE_ERROR_EVENT = 'aurea:save-error';

export function dispatchSaveError(detail: { table: string; docId: string; code: string; message: string }) {
  try {
    window.dispatchEvent(new CustomEvent(SAVE_ERROR_EVENT, { detail }));
  } catch { /* ignore in SSR */ }
}

export function onSaveError(cb: (detail: { table: string; docId: string; code: string; message: string }) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent).detail);
  window.addEventListener(SAVE_ERROR_EVENT, handler);
  return () => window.removeEventListener(SAVE_ERROR_EVENT, handler);
}

function getAuthErrorMessage(err: any): string {
  if (!err) return 'Error desconocido al guardar';
  const code = err?.code || '';
  const msg = (err?.message || String(err)).toLowerCase();
  if (code === '401' || msg.includes('401') || msg.includes('unauthorized')) {
    return 'Sesión expirada o no iniciaste sesión. Recargá la página y volvé a iniciar sesión.';
  }
  if (code === '409' || msg.includes('409') || msg.includes('conflict')) {
    return 'Conflicto al guardar: el registro ya existe y no se pudo actualizar.';
  }
  if (code === '42501' || msg.includes('42501') || msg.includes('row-level security')) {
    return 'No tenés permisos para escribir en esta tabla. Iniciá sesión como administrador.';
  }
  if (msg.includes('relation') && msg.includes('does not exist')) {
    return 'La tabla no existe en la base de datos. Ejecutá las migraciones pendientes.';
  }
  return `Error al guardar: ${err?.message || err}`;
}

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

// All columns currently used by the booking workflow.
// Used as a fallback when the Supabase schema is missing newer columns.
const BOOKING_BASE_COLUMNS = new Set([
  'id', 'clientName', 'clientEmail', 'clientPhone', 'date', 'timeSlot',
  'serviceId', 'peopleCount', 'notes', 'status', 'createdAt', 'amount', 'isRead',
  'isPaid', 'depositAmount', 'amountDue', 'travelExpenses',
  'contractData', 'contractAccepted', 'contractSignature', 'contractSignedAt',
  'contractPhotographerSignature', 'contractPhotographerSignedAt',
  'packageName', 'packageDetails', 'contractType', 'invoiceId',
  'reminderSent', 'reminderSentAt',
  'approvalToken', 'approvedAt', 'approvalExpiresAt',
  'paymentStatus', 'contractStatus', 'rejectionReason', 'paymentTxHash',
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
        // Only seed while authenticated. Admin-only tables (bookings, messages,
        // invoices, clientaccounts) have no public READ policy, so anonymous
        // requests legitimately read as empty — seeding then would re-insert the
        // fallback rows on every visit and collide with rows that already exist.
        if (!(await ensureActiveSession())) {
          return fallbackData;
        }
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

export async function saveDocument<T>(collectionPath: string, docId: string, data: T, options?: { silent?: boolean }): Promise<void> {
  const table = tn(collectionPath);

  const payload = { id: docId, ...(data as Record<string, unknown>) };

  const doUpsert = async (row: Record<string, unknown>) => {
    const { error } = await supabase
      .from(table)
      .upsert(row, { onConflict: 'id', ignoreDuplicates: false });
    if (error) throw error;
  };

  // Block the write up front when there is no active session instead of firing a
  // pointless request that Supabase would reject with 401 anyway.
  if (!(await ensureActiveSession())) {
    dispatchSaveError({ table, docId, code: '401', message: 'Sesión expirada o no iniciaste sesión. Recargá la página y volvé a iniciar sesión.' });
    if (!options?.silent) throw new Error(`No active Supabase session for ${table}/${docId}`);
    return;
  }

  try {
    await doUpsert(payload);
    return;
  } catch (err: any) {
    const code = err?.code || err?.status || '';
    const msg = err?.message || String(err);
    console.error(`[saveDocument] ${table}/${docId} failed:`, code, msg, err?.details);

    if (code === '401' || err?.status === 401 || /unauthorized|invalid.?jwt|expired/i.test(msg)) {
      // Access token expired mid-session: refresh once and retry before surfacing
      // the error. Only reached when a session existed (the pre-check above blocks
      // logged-out writes), so a refresh token is available — no phantom requests.
      try {
        const { data: refreshed } = await supabase.auth.refreshSession();
        if (refreshed.session) {
          try {
            await doUpsert(payload);
            return;
          } catch (retryErr: any) {
            if (isMissingTableError(retryErr)) {
              markTableMissing(table);
              return;
            }
            dispatchSaveError({ table, docId, code: String(retryErr?.code || retryErr?.status || ''), message: retryErr?.message || String(retryErr) });
            if (!options?.silent) throw retryErr;
            return;
          }
        }
      } catch { /* refresh failed — fall through to the auth error below */ }
      dispatchSaveError({ table, docId, code: '401', message: msg });
      if (!options?.silent) throw err;
      return;
    }

    dispatchSaveError({ table, docId, code: String(code), message: msg });

    if (table === 'bookings' && isSchemaMismatchError(err)) {
      const compatibleData = getCompatiblePayload(table, data as Record<string, unknown>);
      try {
        await doUpsert({ id: docId, ...compatibleData });
        return;
      } catch (retryErr: any) {
        if (isMissingTableError(retryErr)) {
          markTableMissing(table);
          return;
        }
        if (!options?.silent) throw retryErr;
        return;
      }
    }
    if (isMissingTableError(err)) {
      markTableMissing(table);
      return;
    }
    if (!options?.silent) throw err;
  }
}

export async function deleteDocument(collectionPath: string, docId: string): Promise<void> {
  const table = tn(collectionPath);
  if (isTableMissing(table)) return;
  if (!(await ensureActiveSession())) {
    throw new Error(`No active Supabase session for ${table}/${docId}`);
  }

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
      cacheControl: '31536000',
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

export async function getSessionToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export { supabase };
