import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock3, FileText, Printer, Download, Loader2 } from 'lucide-react';
import { ActiveLanguage, Invoice } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { sanitizeHTML } from '../lib/sanitize';

interface InvoiceReceiptProps {
  invoice: Invoice;
  lang: ActiveLanguage;
  compact?: boolean;
}

function formatDate(value: string, lang: ActiveLanguage) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function formatCurrency(amount: number, lang: ActiveLanguage) {
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  return `$${Math.abs(amount).toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const InvoiceReceipt: React.FC<InvoiceReceiptProps> = ({ invoice, lang, compact = false }) => {
  const t = TRANSLATIONS[lang];
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const isPaid = invoice.status === 'paid';
  const isPartial = invoice.status === 'partial';
  const statusLabel = isPaid ? t.invoiceStatusPaid : isPartial ? t.invoiceStatusPartial : invoice.status === 'cancelled' ? t.invoiceStatusCancelled : t.invoiceStatusUnpaid;

  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      const win = window.open('', '_blank');
      if (!win) {
        window.print();
        return;
      }
      win.document.write(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  @page { margin: 12mm; }
  body { margin: 0; font-family: 'Inter', 'Segoe UI', sans-serif; color: #2D2A28; }
  .receipt { max-width: 640px; margin: 0 auto; background: #F6F0E8; }
  .gold-bar { height: 3px; background: linear-gradient(90deg, #B58A4A, #CFC3B6, #B58A4A); }
  .content { padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .header-left h2 { font-family: 'Georgia', serif; font-size: 22px; margin: 8px 0 2px; font-weight: 500; letter-spacing: 0.02em; }
  .header-left .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: #B58A4A; }
  .header-left .sub { font-size: 10px; color: #8C8076; margin: 0; }
  .header-right { text-align: right; }
  .header-right .inv-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: #8C8076; margin: 0 0 4px; }
  .header-right .inv-num { font-size: 14px; color: #B58A4A; font-family: monospace; margin: 0 0 8px; }
  .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border: 1px solid; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600; }
  .status-paid { border-color: #065f4622; color: #065f46; background: #065f4608; }
  .status-partial { border-color: #d9770622; color: #92400e; background: #d9770608; }
  .status-other { border-color: #B58A4A22; color: #B58A4A; background: #B58A4A08; }
  .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; font-size: 11px; margin-bottom: 32px; }
  .client-grid .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: #B58A4A; margin: 0 0 4px; }
  .client-grid .name { font-size: 13px; font-weight: 500; margin: 0; }
  .client-grid .email { color: #8C8076; margin: 2px 0 0; }
  .client-right { text-align: right; }
  .items { margin-bottom: 24px; }
  .items-header { display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid #2D2A2810; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: #8C8076; }
  .item-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #2D2A2806; font-size: 12px; }
  .item-desc { color: #2D2A28CC; }
  .item-amount { font-family: monospace; font-size: 13px; }
  .totals { display: flex; justify-content: flex-end; margin-bottom: 24px; }
  .totals-inner { width: 220px; }
  .total-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
  .total-row .amount { font-family: monospace; }
  .total-row.green { color: #065f46; }
  .total-row.balance { border-top: 1px solid #2D2A2810; padding-top: 6px; font-weight: 600; font-size: 15px; margin-top: 4px; }
  .total-row.gold { color: #B58A4A; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; }
  .footer { border-top: 1px solid #2D2A2810; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px; color: #8C8076; }
  .footer strong { color: #2D2A28; }
  .footer-mono { font-family: monospace; font-size: 8px; color: #8C807680; text-align: right; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head>
<body>
<div class="receipt">
<div class="gold-bar"></div>
<div class="content">
<div class="header">
<div class="header-left">
<div class="label">${t.invoiceTitle}</div>
<h2>Miriam Campos</h2>
<p class="sub">Fine Art Photography Studio</p>
</div>
<div class="header-right">
<p class="inv-label">${t.invoiceNumber}</p>
<p class="inv-num">${sanitizeHTML(invoice.invoiceNumber)}</p>
<div class="status-badge ${isPaid ? 'status-paid' : isPartial ? 'status-partial' : 'status-other'}">${isPaid ? t.invoiceStatusPaid : isPartial ? t.invoiceStatusPartial : invoice.status === 'cancelled' ? t.invoiceStatusCancelled : t.invoiceStatusUnpaid}</div>
</div>
</div>
<div class="client-grid">
<div>
<p class="label">${t.invoiceClient}</p>
<p class="name">${sanitizeHTML(invoice.clientName)}</p>
<p class="email">${sanitizeHTML(invoice.clientEmail)}</p>
</div>
<div class="client-right">
<p class="label">${t.invoiceDate}</p>
<p class="name">${formatDate(invoice.createdAt, lang)}</p>
<p class="email">#${sanitizeHTML(invoice.bookingId)}</p>
</div>
</div>
<div class="items">
<div class="items-header"><span>${t.invoiceItems}</span><span>${t.invoiceSubtotal}</span></div>
${invoice.items.map((item) => `<div class="item-row"><span class="item-desc">${sanitizeHTML(item.description)}</span><span class="item-amount">${formatCurrency(item.amount, lang)}</span></div>`).join('')}
</div>
<div class="totals">
<div class="totals-inner">
<div class="total-row"><span>${t.invoiceSubtotal}</span><span class="amount">${formatCurrency(invoice.subtotal, lang)}</span></div>
${invoice.depositPaid > 0 ? `<div class="total-row green"><span>${t.invoiceDeposit}</span><span class="amount">-${formatCurrency(invoice.depositPaid, lang)}</span></div>` : ''}
<div class="total-row balance"><span>${t.invoiceBalance}</span><span class="amount">${formatCurrency(invoice.balanceDue, lang)}</span></div>
<div class="total-row gold"><span>${t.invoiceTotal}</span><span class="amount">${formatCurrency(invoice.total, lang)}</span></div>
</div>
</div>
<div class="footer">
<div>
<p>${t.invoicePaymentMethod}: <strong>${sanitizeHTML(invoice.paymentMethod || '-')}</strong></p>
${invoice.paidAt ? `<p>${t.invoicePaidOn}: <strong>${formatDate(invoice.paidAt, lang)}</strong></p>` : ''}
${invoice.stripeTxHash ? `<p style="font-family:monospace;font-size:8px;word-break:break-all;color:#8C8076">Ref: ${sanitizeHTML(invoice.stripeTxHash)}</p>` : ''}
</div>
<div class="footer-mono"><p>${sanitizeHTML(invoice.invoiceNumber)}</p></div>
</div>
</div>
</div>
</body></html>`);
      win.document.close();
      setTimeout(() => {
        win.focus();
        win.print();
        setDownloading(false);
      }, 500);
    } catch {
      window.print();
      setDownloading(false);
    }
  };

  return (
    <div className={`${compact ? 'max-w-2xl' : 'max-w-[640px]'} mx-auto`}>
      <article
        className="invoice-receipt bg-[#F6F0E8] text-[#2D2A28] shadow-2xl print:shadow-none"
      >
        <div className="h-[3px] bg-gradient-to-r from-[#B58A4A] via-[#CFC3B6] to-[#B58A4A]" />

        <div className="px-10 py-10 space-y-8">
          <header className="flex items-start justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#B58A4A]">
                <FileText size={12} />
                <span className="text-[8px] font-sans font-semibold tracking-[0.3em] uppercase">{t.invoiceTitle}</span>
              </div>
              <h2 className="font-serif text-[22px] leading-tight tracking-wide text-[#2D2A28]">Miriam Campos</h2>
              <p className="text-[10px] text-[#8C8076] font-sans tracking-wide">Fine Art Photography Studio</p>
            </div>
            <div className="text-right shrink-0 space-y-2">
              <p className="text-[8px] font-sans font-semibold tracking-[0.3em] uppercase text-[#8C8076]">{t.invoiceNumber}</p>
              <p className="text-sm font-mono font-medium text-[#B58A4A]">{invoice.invoiceNumber}</p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 border text-[9px] font-sans font-semibold tracking-[0.15em] uppercase ${
                isPaid
                  ? 'border-emerald-700/20 text-emerald-800 bg-emerald-700/5'
                  : isPartial
                    ? 'border-amber-600/20 text-amber-800 bg-amber-600/5'
                    : 'border-[#B58A4A]/20 text-[#B58A4A] bg-[#B58A4A]/5'
              }`}>
                {isPaid ? <CheckCircle2 size={10} /> : <Clock3 size={10} />}
                {statusLabel}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-8 text-[11px]">
            <div className="space-y-1">
              <p className="text-[8px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B58A4A]">{t.invoiceClient}</p>
              <p className="font-medium text-[13px]">{invoice.clientName}</p>
              <p className="text-[#8C8076]">{invoice.clientEmail}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[8px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B58A4A]">{t.invoiceDate}</p>
              <p className="text-[13px]">{formatDate(invoice.createdAt, lang)}</p>
              <p className="text-[#8C8076] font-mono text-[10px]">#{invoice.bookingId}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between pb-2 border-b border-[#2D2A28]/10 text-[8px] font-sans font-semibold tracking-[0.3em] uppercase text-[#8C8076]">
              <span>{t.invoiceItems}</span>
              <span>{t.invoiceSubtotal}</span>
            </div>
            <div className="divide-y divide-[#2D2A28]/6">
              {invoice.items.map((item, index) => (
                <div key={`${item.description}-${index}`} className="flex justify-between py-3 text-[12px]">
                  <span className="text-[#2D2A28]/80 leading-snug pr-4">{item.description}</span>
                  <span className="font-mono text-[13px] tabular-nums whitespace-nowrap">{formatCurrency(item.amount, lang)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-[220px] space-y-1.5 text-[12px]">
              <div className="flex justify-between text-[#8C8076]">
                <span>{t.invoiceSubtotal}</span>
                <span className="font-mono tabular-nums">{formatCurrency(invoice.subtotal, lang)}</span>
              </div>
              {invoice.depositPaid > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>{t.invoiceDeposit}</span>
                  <span className="font-mono tabular-nums">-{formatCurrency(invoice.depositPaid, lang)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#2D2A28]/10 pt-1.5 font-semibold text-[15px] text-[#2D2A28]">
                <span>{t.invoiceBalance}</span>
                <span className="font-mono tabular-nums">{formatCurrency(invoice.balanceDue, lang)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-[#B58A4A] font-sans font-semibold tracking-[0.1em]">
                <span>{t.invoiceTotal}</span>
                <span className="font-mono tabular-nums">{formatCurrency(invoice.total, lang)}</span>
              </div>
            </div>
          </div>

          <footer className="border-t border-[#2D2A28]/10 pt-5 flex items-end justify-between gap-4">
            <div className="space-y-1 text-[10px] text-[#8C8076]">
              <p>{t.invoicePaymentMethod}: <span className="text-[#2D2A28] font-medium">{invoice.paymentMethod || '-'}</span></p>
              {invoice.paidAt && (
                <p>{t.invoicePaidOn}: <span className="text-[#2D2A28] font-medium">{formatDate(invoice.paidAt, lang)}</span></p>
              )}
              {invoice.stripeTxHash && (
                <p className="font-mono text-[8px] break-all text-[#8C8076]/70">Ref: {invoice.stripeTxHash}</p>
              )}
            </div>
            <div className="text-right text-[8px] text-[#8C8076]/50 font-mono">
              <p>INV-{invoice.invoiceNumber?.replace('INV-', '') || invoice.id}</p>
            </div>
          </footer>
        </div>
      </article>

      <div className="mt-4 flex items-center justify-center gap-3 print:hidden">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2D2A28] text-[#F6F0E8] rounded-lg text-[10px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-[#B58A4A] disabled:opacity-50 transition-colors"
        >
          {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          {downloading ? 'Generating...' : t.invoiceDownload}
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-[#2D2A28]/20 text-[#2D2A28] rounded-lg text-[10px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-[#2D2A28]/5 transition-colors"
        >
          <Printer size={13} />
          Print
        </button>
      </div>

      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-receipt {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
          }
          @page {
            margin: 12mm;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceReceipt;
