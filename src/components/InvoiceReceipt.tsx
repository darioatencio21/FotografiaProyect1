import React from 'react';
import { CheckCircle2, Clock3, FileText, Printer } from 'lucide-react';
import { ActiveLanguíage, Invoice } from '../types';
import { TRANSLATIONS } from '../data/mockData';

interface InvoiceReceiptProps {
  invoice: Invoice;
  lang: ActiveLanguíage;
  compact?: boolean;
}

function formatDate(value: string, lang: ActiveLanguíage) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

const InvoiceReceipt: React.FC<InvoiceReceiptProps> = ({ invoice, lang, compact = false }) => {
  const t = TRANSLATIONS[lang];
  const isPaid = invoice.status === 'paid';
  const statusLabel = isPaid ? t.invoiceStatusPaid : invoice.status === 'partial' ? t.invoiceStatusPartial : invoice.status === 'cancelled' ? t.invoiceStatusCancelled : t.invoiceStatusUnpaid;

  return (
    <article className={`invoice-receipt bg-[#F6F0E8] text-[#2D2A28] rounded-lg overflow-hidden shadow-2xl text-left print:shadow-none print:rounded-none ${compact ? 'max-w-2xl' : 'max-w-3xl'} mx-auto`}>
      <div className="h-1.5 bg-gradient-to-r from-[#B58A4A] via-[#CFC3B6] to-[#B58A4A]" />
      <div className="p-5 sm:p-8 md:p-10 space-y-7">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-b border-[#2D2A28]/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#B58A4A]">
              <FileText size={16} />
              <span className="font-mono text-[9px] tracking-[0.28em] uppercase">{t.invoiceTitle}</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl tracking-wide text-[#2D2A28]">Miriam Campos</h3>
            <p className="text-[10px] text-[#8C8076] tracking-wide">Fine Art Photography Studio</p>
          </div>
          <div className="sm:text-right space-y-2">
            <p className="font-mono text-[10px] text-[#8C8076] uppercase tracking-widest">{t.invoiceNumber}</p>
            <p className="font-mono text-sm font-semibold text-[#B58A4A]">{invoice.invoiceNumber}</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-wider ${isPaid ? 'bg-emerald-700/10 text-emerald-800' : 'bg-[#B58A4A]/10 text-[#B58A4A]'}`}>
              {isPaid ? <CheckCircle2 size={11} /> : <Clock3 size={11} />}
              {statusLabel}
            </span>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-[11px]">
          <div className="space-y-1">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#B58A4A]">{t.invoiceClient}</p>
            <p className="font-medium">{invoice.clientName}</p>
            <p className="text-[#8C8076] break-all">{invoice.clientEmail}</p>
          </div>
          <div className="sm:text-right space-y-1">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#B58A4A]">{t.invoiceDate}</p>
            <p>{formatDate(invoice.createdAt, lang)}</p>
            <p className="text-[#8C8076]">{t.invoiceBookingId}: {invoice.bookingId}</p>
          </div>
        </section>

        <section className="border-y border-[#2D2A28]/10 py-4 space-y-3">
          <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-[#8C8076]">
            <span>{t.invoiceItemás}</span>
            <span>{t.invoiceSubtotal}</span>
          </div>
          {invoice.items.map((item, index) => (
            <div key={`${item.description}-${index}`} className="flex justify-between gap-4 text-[11px]">
              <span className="leading-relaxed">{item.description}</span>
              <span className="font-mono whitespace-nowrap">${Math.abs(item.amount).toLocaleString()}</span>
            </div>
          ))}
        </section>

        <section className="flex flex-col sm:flex-row sm:justify-end gap-5">
          <div className="w-full sm:w-64 space-y-2 text-[11px]">
            <div className="flex justify-between text-[#8C8076]"><span>{t.invoiceSubtotal}</span><span>${invoice.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-emerald-800"><span>{t.invoiceDeposit}</span><span>-${invoice.amountPaid.toLocaleString()}</span></div>
            <div className="border-t border-[#2D2A28]/15 pt-2 flex justify-between font-semibold text-base"><span>{t.invoiceBalance}</span><span>${invoice.balanceDue.toLocaleString()}</span></div>
            <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-[#B58A4A]"><span>{t.invoiceTotal}</span><span>${invoice.total.toLocaleString()}</span></div>
          </div>
        </section>

        <footer className="border-t border-[#2D2A28]/10 pt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1 text-[10px] text-[#8C8076]">
            <p>{t.invoicePaymentMethod}: <span className="text-[#2D2A28]">{invoice.paymentMethod || '-'}</span></p>
            {invoice.paidAt && <p>{t.invoicePaidOn}: <span className="text-[#2D2A28]">{formatDate(invoice.paidAt, lang)}</span></p>}
            {invoice.stripeTxHash && <p className="font-mono break-all">Ref: {invoice.stripeTxHash}</p>}
          </div>
          <button onClick={() => window.print()} className="print:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2D2A28] text-[#F6F0E8] rounded-lg font-mono text-[9px] tracking-widest uppercase hover:bg-[#B58A4A] transition-colors">
            <Printer size={13} />
            {t.invoiceDownload}
          </button>
        </footer>
      </div>
    </article>
  );
};

export default InvoiceReceipt;
