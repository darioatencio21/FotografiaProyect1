import type { ActiveLanguage, EmailConfig } from '../types';
import { getSessionToken } from './db';

function getFunctionUrl(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL not set');
  return `${supabaseUrl}/functions/v1/send-email`;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function callSendEmail(to: string, subject: string, text: string): Promise<boolean> {
  try {
    const html = text.replace(/\n/g, '<br>');
    const headers = await getAuthHeaders();
    const res = await fetch(getFunctionUrl(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ to, subject, html, text }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('send-email failed:', err);
      return false;
    }
    return true;
  } catch (err) {
    console.error('send-email error:', err);
    return false;
  }
}

export async function sendApprovalEmail(
  _emailConfig: EmailConfig,
  clientName: string,
  clientEmail: string,
  approvalLink: string,
  sessionDate: string,
  depositAmount: number,
  packageName: string,
  lang: ActiveLanguage = 'en',
): Promise<boolean> {
  const isEn = lang === 'en';
  const subject = isEn
    ? 'Booking Approved — Complete Payment & Sign'
    : 'Tu reserva fue aprobada — Completá el pago y firma';
  const text = isEn
    ? `Hi ${clientName},

Your booking request for ${packageName} on ${sessionDate} has been approved by Miriam.

Click the link below to sign the contract and pay the deposit of $${depositAmount}:

${approvalLink}

Once you sign and pay, your booking will be automatically confirmed.

Best regards,
Miriam Tellez
Miriam Tellez Photography`
    : `Hola ${clientName},

Tu solicitud de reserva para ${packageName} el ${sessionDate} fue aprobada por Miriam.

Ingresá a este link para firmar el contrato y pagar el depósito de $${depositAmount}:

${approvalLink}

Una vez que firmes y pagues, tu reserva quedará confirmada automáticamente.

Saludos,
Miriam Tellez
Miriam Tellez Photography`;
  return callSendEmail(clientEmail, subject, text);
}

export async function sendRejectionEmail(
  _emailConfig: EmailConfig,
  clientName: string,
  clientEmail: string,
  sessionDate: string,
  reason?: string,
  lang: ActiveLanguage = 'en',
): Promise<boolean> {
  const isEn = lang === 'en';
  const subject = isEn ? 'Booking Not Available' : 'Reserva no disponible';
  const greeting = isEn ? `Hi ${clientName},` : `Hola ${clientName},`;
  const body = isEn
    ? `We regret to inform you that the photographer is unable to take your session on ${sessionDate}.`
    : `Lamentamos informarte que la fotógrafa no puede tomar tu sesión del ${sessionDate}.`;
  const reasonLine = isEn ? `Reason: ${reason}` : `Motivo: ${reason}`;
  const noCharge = isEn
    ? 'No charges have been made. If you would like to coordinate another date, please contact us.'
    : 'No se realizó ningún cobro. Si querés coordinar otra fecha, contactanos.';
  const closing = isEn
    ? 'Best regards,\nMiriam Tellez\nMiriam Tellez Photography'
    : 'Saludos,\nMiriam Tellez\nMiriam Tellez Photography';

  const text = reason
    ? `${greeting}\n\n${body}\n\n${reasonLine}\n\n${noCharge}\n\n${closing}`
    : `${greeting}\n\n${body}\n\n${noCharge}\n\n${closing}`;
  return callSendEmail(clientEmail, subject, text);
}

export async function sendConfirmationEmail(
  _emailConfig: EmailConfig,
  clientName: string,
  clientEmail: string,
  photographerEmail: string,
  sessionDate: string,
  sessionTime: string,
  amountPaid: number,
  packageName: string,
  lang: ActiveLanguage = 'en',
): Promise<boolean> {
  const isEn = lang === 'en';
  const subject = isEn ? 'Booking Confirmed — Miriam Tellez Photography' : 'Reserva confirmada — Miriam Tellez Photography';

  const clientText = isEn
    ? `Hi ${clientName},

Your booking for ${packageName} on ${sessionDate} at ${sessionTime} has been confirmed.

You paid $${amountPaid}. We look forward to seeing you!

Best regards,
Miriam Tellez
Miriam Tellez Photography`
    : `Hola ${clientName},

Tu reserva para ${packageName} el ${sessionDate} a las ${sessionTime} fue confirmada.

Pagaste $${amountPaid}. Te esperamos!

Saludos,
Miriam Tellez
Miriam Tellez Photography`;

  const photographerText = isEn
    ? `New confirmed booking

Client: ${clientName}
Package: ${packageName}
Date: ${sessionDate}
Time: ${sessionTime}
Paid: $${amountPaid}

The booking is confirmed.`
    : `Nueva reserva confirmada

Cliente: ${clientName}
Paquete: ${packageName}
Fecha: ${sessionDate}
Horario: ${sessionTime}
Pagado: $${amountPaid}

La reserva está confirmada.`;

  const clientOk = await callSendEmail(clientEmail, subject, clientText);
  const photographerOk = await callSendEmail(photographerEmail, subject, photographerText);
  return clientOk && photographerOk;
}

export async function sendExpirationEmail(
  _emailConfig: EmailConfig,
  clientName: string,
  clientEmail: string,
  sessionDate: string,
  lang: ActiveLanguage = 'en',
): Promise<boolean> {
  const isEn = lang === 'en';
  const subject = isEn ? 'Your booking link has expired' : 'El enlace para pagar tu reserva expiró';
  const text = isEn
    ? `Hi ${clientName},

The link to confirm your booking on ${sessionDate} has expired and the slot is no longer reserved.

Please contact us if you would like to coordinate another date.

Best regards,
Miriam Tellez
Miriam Tellez Photography`
    : `Hola ${clientName},

El enlace para confirmar tu reserva del ${sessionDate} expiró y el horario ya no está reservado.

Contactanos si querés coordinar otra fecha.

Saludos,
Miriam Tellez
Miriam Tellez Photography`;
  return callSendEmail(clientEmail, subject, text);
}

export async function sendDepositReceivedEmail(
  _emailConfig: EmailConfig,
  clientName: string,
  clientEmail: string,
  photographerEmail: string,
  amount: number,
  packageName: string,
  lang: ActiveLanguage = 'en',
): Promise<boolean> {
  const isEn = lang === 'en';
  const subject = isEn ? 'Deposit Received — Miriam Tellez Photography' : 'Depósito recibido — Miriam Tellez Photography';
  const text = isEn
    ? `New deposit received

Client: ${clientName}
Email: ${clientEmail}
Package: ${packageName}
Amount: $${amount}

The payment has been processed successfully. Check the admin panel for details.`
    : `Nuevo depósito recibido

Cliente: ${clientName}
Email: ${clientEmail}
Paquete: ${packageName}
Monto: $${amount}

El pago fue procesado exitosamente. Revisá el panel de administración para más detalles.`;
  return callSendEmail(photographerEmail, subject, text);
}

export async function sendPendingPaymentReminder(
  _emailConfig: EmailConfig,
  clientName: string,
  clientEmail: string,
  approvalLink: string,
  sessionDate: string,
  lang: ActiveLanguage = 'en',
): Promise<boolean> {
  const isEn = lang === 'en';
  const subject = isEn ? 'Payment pending to confirm your booking' : 'Solo falta el pago para confirmar tu reserva';
  const text = isEn
    ? `Hi ${clientName},

You signed the contract but the payment is still pending to confirm your booking on ${sessionDate}.

Click your link again to complete the payment:

${approvalLink}

Best regards,
Miriam Tellez
Miriam Tellez Photography`
    : `Hola ${clientName},

Firmaste el contrato pero falta el pago para confirmar tu reserva del ${sessionDate}.

Ingresá de nuevo con tu link para completar el pago:

${approvalLink}

Saludos,
Miriam Tellez
Miriam Tellez Photography`;
  return callSendEmail(clientEmail, subject, text);
}
