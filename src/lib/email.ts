import type { EmailConfig } from '../types';

function getFunctionUrl(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL not set');
  return `${supabaseUrl}/functions/v1/send-email`;
}

function getApiKey(): string {
  const key = import.meta.env.VITE_SEND_EMAIL_SECRET;
  if (!key) console.warn('VITE_SEND_EMAIL_SECRET not set — email sending may fail');
  return key || '';
}

async function callSendEmail(to: string, subject: string, text: string): Promise<boolean> {
  try {
    const html = text.replace(/\n/g, '<br>');
    const res = await fetch(getFunctionUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getApiKey(),
      },
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
  emailConfig: EmailConfig,
  clientName: string,
  clientEmail: string,
  approvalLink: string,
  sessionDate: string,
  depositAmount: number,
  packageName: string,
): Promise<boolean> {
  const subject = 'Tu reserva fue aprobada — Completá el pago y firma';
  const text = `Hola ${clientName},

Tu solicitud de reserva para ${packageName} el ${sessionDate} fue aprobada por Miriam.

Ingresá a este link para firmar el contrato y pagar el depósito de $${depositAmount}:

${approvalLink}

Una vez que firmes y pagues, tu reserva quedará confirmada automáticamente.

Saludos,
Miriam Campos
Miriam Campos Photography`;
  return callSendEmail(clientEmail, subject, text);
}

export async function sendRejectionEmail(
  emailConfig: EmailConfig,
  clientName: string,
  clientEmail: string,
  sessionDate: string,
  reason?: string,
): Promise<boolean> {
  const subject = 'Reserva no disponible';
  const text = reason
    ? `Hola ${clientName},

Lamentamos informarte que la fotógrafa no puede tomar tu sesión del ${sessionDate}.

Motivo: ${reason}

No se realizó ningún cobro. Si querés coordinar otra fecha, contactanos.

Saludos,
Miriam Campos
Miriam Campos Photography`
    : `Hola ${clientName},

Lamentamos informarte que la fotógrafa no puede tomar tu sesión del ${sessionDate}.

No se realizó ningún cobro. Si querés coordinar otra fecha, contactanos.

Saludos,
Miriam Campos
Miriam Campos Photography`;
  return callSendEmail(clientEmail, subject, text);
}

export async function sendConfirmationEmail(
  emailConfig: EmailConfig,
  clientName: string,
  clientEmail: string,
  photographerEmail: string,
  sessionDate: string,
  sessionTime: string,
  amountPaid: number,
  packageName: string,
): Promise<boolean> {
  const subject = 'Reserva confirmada — Aurea Studio';
  const clientText = `Hola ${clientName},

Tu reserva para ${packageName} el ${sessionDate} a las ${sessionTime} fue confirmada.

Pagaste $${amountPaid}. Te esperamos!

Saludos,
Miriam Campos
Miriam Campos Photography`;

  const photographerText = `Nueva reserva confirmada

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
  emailConfig: EmailConfig,
  clientName: string,
  clientEmail: string,
  sessionDate: string,
): Promise<boolean> {
  const subject = 'El enlace para pagar tu reserva expiró';
  const text = `Hola ${clientName},

El enlace para confirmar tu reserva del ${sessionDate} expiró y el horario ya no está reservado.

Contactanos si querés coordinar otra fecha.

Saludos,
Miriam Campos
Miriam Campos Photography`;
  return callSendEmail(clientEmail, subject, text);
}

export async function sendPendingPaymentReminder(
  emailConfig: EmailConfig,
  clientName: string,
  clientEmail: string,
  approvalLink: string,
  sessionDate: string,
): Promise<boolean> {
  const subject = 'Solo falta el pago para confirmar tu reserva';
  const text = `Hola ${clientName},

Firmaste el contrato pero falta el pago para confirmar tu reserva del ${sessionDate}.

Ingresá de nuevo con tu link para completar el pago:

${approvalLink}

Saludos,
Miriam Campos
Miriam Campos Photography`;
  return callSendEmail(clientEmail, subject, text);
}
