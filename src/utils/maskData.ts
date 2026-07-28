export function maskName(name: string | null | undefined): string {
  if (!name) return '—';
  const first = name.charAt(0);
  return first + '***';
}

export function maskEmail(email: string | null | undefined): string {
  if (!email) return '—';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return local.charAt(0) + '***@' + domain;
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '****';
  return phone.slice(0, phone.length - digits.length) + '**** ' + digits.slice(-4);
}

export function maskPasscode(code: string | null | undefined): string {
  if (!code) return '—';
  return '•'.repeat(Math.min(code.length, 8));
}

export function maskToken(token: string | null | undefined): string {
  if (!token) return '—';
  return '•'.repeat(12);
}

export function maskText(text: string | null | undefined): string {
  if (!text) return '—';
  return '•'.repeat(Math.min(text.length, 16));
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
