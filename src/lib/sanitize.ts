export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input.trim();
}

export function unescapeHTMLEntities(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&#x2F;/g, '/')
    .replace(/&#x5C;/g, '\\')
    .replace(/&#x60;/g, '`')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') return '';
  return input.trim().toLowerCase().replace(/[^a-z0-9@._+-]/g, '');
}

export function sanitizePhone(input: string): string {
  if (typeof input !== 'string') return '';
  let cleaned = input.trim().replace(/[^0-9+()\-\s]/g, '');
  if (cleaned.startsWith('+1')) cleaned = cleaned.substring(2);
  cleaned = cleaned.replace(/[\s()\-]/g, '');
  if (cleaned.length === 10) cleaned = '+1' + cleaned;
  else if (!cleaned.startsWith('+')) cleaned = '+1' + cleaned;
  return cleaned;
}

export function sanitizeUrl(input: string): string {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('javascript:')) return '';
  return trimmed.replace(/[<>"']/g, '');
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'string') return sanitizeString(item);
      if (typeof item === 'object' && item !== null) return sanitizeObject(item as Record<string, unknown>);
      return item;
    }) as unknown as T;
  }
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}
