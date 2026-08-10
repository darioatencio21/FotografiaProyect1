import React from 'react';
import { Printer, CheckCircle } from 'lucide-react';
import { Booking, ActiveLanguíage } from '../types';
import { sanitizeHTML } from '../lib/sanitize';
import { CONTACT } from '../config/site';

interface Props {
  booking: Booking;
  lang: ActiveLanguíage;
  t: Record<string, string>;
  mode?: 'client-sign' | 'view' | 'admin-sign';
  onClientSign?: (signature: string) => void;
  onPhotographerSign?: () => void;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ContractView({ booking, lang, t, mode = 'view', onClientSign, onPhotographerSign }: Props) {
  const cd = booking.contractData;
  const isSession = booking.contractType === 'session';
  const [signature, setSignature] = React.useState('');
  const [signed, setSigned] = React.useState(false);

  const handlePrint = () => {
    if (mode !== 'view') {
      window.print();
      return;
    }
    const cd = booking.contractData;
    const isSession = booking.contractType === 'session';
    const clauses = isSession ? sessionClauses : weddingClauses;
    const pl = lang === 'es' ? 'Fotógrafa' : 'Photographer';
    const win = window.open('', '_blank');
    if (!win) { window.print(); return; }
    const priceRow = (label: string, val: string) => `<div style="text-align:center"><p style="font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:#8C8076;margin:0 0 4px">${sanitizeHTML(label)}</p><p style="font-size:18px;font-family:Georgia,serif;color:#2D2A28;margin:0">${sanitizeHTML(val)}</p></div>`;
    const labelVal = (l: string, v: string) => `<p style="margin:0;font-size:11px;color:#2D2A28"><span style="color:#8C8076">${sanitizeHTML(l)}:</span> ${sanitizeHTML(v)}</p>`;
    win.document.write('<!DOCTYPE html>' +
'<html><head><meta charset="utf-8">' +
'<style>' +
'  @page { margin: 10mm; }' +
'  body { margin:0; font-family:Inter,Segoe UI,sans-serif; color:#2D2A28; background:#fff; font-size:12px; line-height:1.5; }' +
'  .wrap { max-width:700px; margin:0 auto; }' +
'  h1 { font-family:Georgia,serif; font-size:20px; text-align:center; margin:0; font-weight:500; letter-spacing:0.02em; }' +
'  .sub { text-align:center; font-size:11px; color:#8C8076; margin:4px 0 0; }' +
'  .hr { border:0; border-top:1px solid #ddd; margin:20px 0; }' +
'  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; font-size:12px; }' +
'  .box { border:1px solid #ddd; border-radius:4px; padding:12px; }' +
'  .box-title { font-size:9px; text-transform:uppercase; letter-spacing:0.15em; color:#B58A4A; margin:0 0 6px; font-weight:600; }' +
'  .price-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }' +
'  .clause { border-left:2px solid #ddd; padding-left:12px; margin-bottom:8px; }' +
'  .clause h4 { font-size:10px; letter-spacing:0.05em; margin:0 0 2px; color:#555; }' +
'  .clause p { font-size:10px; color:#888; margin:0; line-height:1.4; }' +
'  .sig-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }' +
'  .sig-line { border-bottom:1px solid #ddd; padding-bottom:4px; font-family:Georgia,serif; font-size:16px; color:#2D2A28; }' +
'  .sig-label { font-size:9px; text-transform:uppercase; letter-spacing:0.15em; color:#B58A4A; margin:0 0 8px; font-weight:600; }' +
'  .sig-date { font-size:9px; color:#8C8076; margin:4px 0 0; }' +
'  .clauses-wrap { margin-top:24px; }' +
'  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }' +
'</style></head><body>' +
'<div class="wrap">' +
`<h1>${isSession ? t.contractSessionTitle : t.contractTitle}</h1>` +
`<p class="sub">${isSession ? t.contractSessionSubtitle : t.contractSubtitle}</p>` +
'<hr class="hr"/>' +
'<div class="grid2">' +
'<div>' +
`<p style="font-size:9px;text-transform:uppercase;letter-spacing:0.15em;color:#B58A4A;margin:0 0 4px;font-weight:600">${pl}</p>` +
'<p style="margin:0;font-size:13px;color:#2D2A28">Miriam Campos</p>' +
`<p style="margin:0;font-size:11px;color:#8C8076">${CONTACT.email}</p>` +
'</div>' +
'<div style="text-align:right">' +
`<p style="font-size:9px;text-transform:uppercase;letter-spacing:0.15em;color:#B58A4A;margin:0 0 4px;font-weight:600">${isSession ? t.contractSessionDate : t.contractWeddingDate}</p>` +
`<p style="margin:0;font-size:16px;font-family:Georgia,serif;color:#2D2A28">${booking.date ? formatDate(booking.date) : '—'}</p>` +
    (isSession && booking.timeSlot ? `<p style="margin:2px 0 0;font-size:11px;color:#8C8076">${t.contractSessionTime}: ${sanitizeHTML(booking.timeSlot)}</p>` : '') +
'</div>' +
'</div>' +
(cd ? (isSession ?
'<div class="box">' +
`<p class="box-title">${t.contractClient}</p>` +
`<p style="margin:0;font-size:13px;color:#2D2A28">${sanitizeHTML(cd.brideName || '—')}</p>` +
`<p style="margin:0;font-size:11px;color:#8C8076">${sanitizeHTML(cd.brideEmail || '—')}</p>` +
`<p style="margin:0;font-size:11px;color:#8C8076">${sanitizeHTML(cd.groomPhone || '—')}</p>` +
'</div>' +
'<div class="box" style="margin-top:12px">' +
`<p class="box-title">${t.contractSessionInfo}</p>` +
`${labelVal(t.contractSessionDate, booking.date ? formatDate(booking.date) : '—')}` +
(booking.timeSlot ? labelVal(t.contractSessionTime, booking.timeSlot) : '') +
(booking.packageName ? labelVal(t.contractSessionPackage, booking.packageName) : '') +
'</div>' :
'<div class="grid2">' +
'<div class="box">' +
`<p class="box-title">${t.contractBride}</p>` +
`<p style="margin:0;font-size:13px;color:#2D2A28">${sanitizeHTML(cd.brideName || '—')}</p>` +
`<p style="margin:0;font-size:11px;color:#8C8076">${sanitizeHTML(cd.brideEmail || '—')}</p>` +
`<p style="margin:0;font-size:11px;color:#8C8076">${sanitizeHTML(cd.brideAddress || '—')}</p>` +
'</div>' +
'<div class="box">' +
`<p class="box-title">${t.contractGroom}</p>` +
`<p style="margin:0;font-size:13px;color:#2D2A28">${sanitizeHTML(cd.groomName || '—')}</p>` +
`<p style="margin:0;font-size:11px;color:#8C8076">${sanitizeHTML(cd.groomPhone || '—')}</p>` +
'</div>' +
'</div>' +
'<div class="grid2" style="margin-top:12px">' +
'<div class="box">' +
`<p class="box-title">${t.contractCeremony}</p>` +
`<p style="margin:0;font-size:12px;color:#2D2A28">${sanitizeHTML(cd.ceremonyLocation || '—')}</p>` +
`<p style="margin:0;font-size:11px;color:#8C8076">${sanitizeHTML(cd.ceremonyAddress || '—')}</p>` +
`<p style="margin:0;font-size:11px;color:#8C8076;margin-top:4px">${sanitizeHTML(cd.ceremonyStart ? cd.ceremonyStart + ' — ' + (cd.ceremonyEnd || '') : '—')}</p>` +
'</div>' +
'<div class="box">' +
`<p class="box-title">${t.contractReception}</p>` +
`<p style="margin:0;font-size:12px;color:#2D2A28">${sanitizeHTML(cd.receptionLocation || '—')}</p>` +
`<p style="margin:0;font-size:11px;color:#8C8076">${sanitizeHTML(cd.receptionAddress || '—')}</p>` +
`<p style="margin:0;font-size:11px;color:#8C8076;margin-top:4px">${sanitizeHTML(cd.receptionStart ? cd.receptionStart + ' — ' + (cd.receptionEnd || '') : '—')}</p>` +
'</div>' +
'</div>') : '') +
'<hr class="hr"/>' +
'<div class="box">' +
`<p class="box-title">${t.contractPackage}</p>` +
`<p style="margin:0;font-size:16px;font-family:Georgia,serif;color:#2D2A28">${sanitizeHTML(booking.packageName || '—')}</p>` +
(booking.packageDetails ? `<p style="margin:4px 0 0;font-size:11px;color:#8C8076">${sanitizeHTML(booking.packageDetails)}</p>` : '') +
'<hr style="border:0;border-top:1px solid #ddd;margin:12px 0"/>' +
'<div class="price-grid">' +
`${priceRow(t.contractAmountAgreed, '$' + (Number(booking.amount) || 0).toLocaleString())}` +
(Number(booking.travelExpenses) ? `${priceRow(t.contractTravelExpenses, '$' + (Number(booking.travelExpenses) || 0).toLocaleString())}` : '') +
`${priceRow(t.contractDeposit, '$' + (Number(booking.depositAmount) || 0).toLocaleString())}` +
`${priceRow(t.contractAmountDue, '$' + Math.max(0, (Number(booking.amount) || 0) + (Number(booking.travelExpenses) || 0) - (Number(booking.depositAmount) || 0)).toLocaleString())}` +
'</div>' +
'</div>' +
'<hr class="hr"/>' +
'<div class="clauses-wrap">' +
clauses.map(c => `<div class="clause"><h4>${c.title}</h4><p>${c.text}</p></div>`).join('') +
'</div>' +
'<hr class="hr"/>' +
'<div class="sig-grid">' +
'<div>' +
`<p class="sig-label">${t.contractSignatureClient}</p>` +
(booking.contractSignature ? `<div class="sig-line">${sanitizeHTML(booking.contractSignature)}</div><p class="sig-date">${t.contractSignatureDate}: ${booking.contractSignedAt ? formatDate(booking.contractSignedAt) : '—'}</p>` : '<p style="color:#aaa;font-style:italic">—</p>') +
'</div>' +
'<div>' +
`<p class="sig-label">${t.contractSignaturePhotographer}</p>` +
(booking.contractPhotographerSignature ? `<div class="sig-line">${sanitizeHTML(booking.contractPhotographerSignature)}</div><p class="sig-date">${t.contractSignatureDate}: ${booking.contractPhotographerSignedAt ? formatDate(booking.contractPhotographerSignedAt) : '—'}</p>` : '<p style="color:#aaa;font-style:italic">—</p>') +
'</div>' +
'</div>' +
'</div>' +
'</body></html>');
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 500);
  };

  const handleSign = () => {
    if (signature.trim() && onClientSign) {
      onClientSign(signature.trim());
      setSigned(true);
    }
  };

  const sessionClauses = [
    { title: t.contractSessionClauseCopyright, text: t.contractSessionClauseCopyrightText },
    { title: t.contractSessionClausePayment, text: t.contractSessionClausePaymentText },
    { title: t.contractSessionClauseSchedule, text: t.contractSessionClauseScheduleText },
    { title: t.contractSessionClauseLiability, text: t.contractSessionClauseLiabilityText },
    { title: t.contractSessionClauseUsage, text: t.contractSessionClauseUsageText },
  ];

  const weddingClauses = [
    { title: t.contractClauseCooperation, text: t.contractClauseCooperationText },
    { title: t.contractClauseSchedule, text: t.contractClauseScheduleText },
    { title: t.contractClauseGuests, text: t.contractClauseGuestsText },
    { title: t.contractClauseCopyright, text: t.contractClauseCopyrightText },
    { title: t.contractClauseModelRelease, text: t.contractClauseModelReleaseText },
    { title: t.contractClauseLiability, text: t.contractClauseLiabilityText },
    { title: t.contractClauseCancellation, text: t.contractClauseCancellationText },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center border-b border-white/10 pb-6">
        <h2 className="font-serif text-2xl text-white/90 tracking-wide">{isSession ? t.contractSessionTitle : t.contractTitle}</h2>
        <p className="text-xs text-white/50 mt-1">{isSession ? t.contractSessionSubtitle : t.contractSubtitle}</p>
      </div>

      {/* Parties & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono text-white/70">
        <div className="space-y-1">
          <p className="text-white/70 font-semibold uppercase tracking-widest text-[10px]">{lang === 'es' ? 'Fotógrafa' : 'Photographer'}</p>
          <p>Miriam Campos</p>
          <p>{CONTACT.email}</p>
          <p>(559) 756-1144</p>
        </div>
        <div className="space-y-1">
          <p className="text-white/70 font-semibold uppercase tracking-widest text-[10px]">{isSession ? t.contractSessionDate : t.contractWeddingDate}</p>
          <p className="font-serif text-base text-white/90">{booking.date ? formatDate(booking.date) : '—'}</p>
          {isSession && booking.timeSlot && <p className="text-xs text-white/50 mt-1">{t.contractSessionTime}: {booking.timeSlot}</p>}
        </div>
      </div>

      {/* Client Info (session) or Bride & Groom (wedding) */}
      {cd && isSession ? (
        <div className="border border-white/10 rounded p-4 text-xs font-mono text-white/70 space-y-2">
          <p className="text-white/70 font-semibold uppercase tracking-widest text-[10px]">{t.contractClient}</p>
          <p>{cd.brideName || '—'}</p>
          <p>{cd.brideEmail || '—'}</p>
          <p>{cd.groomPhone || '—'}</p>
        </div>
      ) : cd ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono text-white/70">
          <div className="space-y-2 border border-white/10 rounded p-4">
            <p className="text-white/70 font-semibold uppercase tracking-widest text-[10px]">{t.contractBride}</p>
            <p>{cd.brideName || '—'}</p>
            <p>{cd.brideEmail || '—'}</p>
            <p>{cd.brideAddress || '—'}</p>
          </div>
          <div className="space-y-2 border border-white/10 rounded p-4">
            <p className="text-white/70 font-semibold uppercase tracking-widest text-[10px]">{t.contractGroom}</p>
            <p>{cd.groomName || '—'}</p>
            <p>{cd.groomPhone || '—'}</p>
          </div>
        </div>
      ) : null}

      {/* Session info (session) or Ceremony & Reception (wedding) */}
      {cd && isSession ? (
        <div className="border border-white/10 rounded p-4 text-xs font-mono text-white/70 space-y-2">
          <p className="text-white/70 font-semibold uppercase tracking-widest text-[10px]">{t.contractSessionInfo}</p>
          <p><span className="text-white/50">{t.contractSessionDate}:</span> {booking.date ? formatDate(booking.date) : '—'}</p>
          <p><span className="text-white/50">{t.contractSessionTime}:</span> {booking.timeSlot || '—'}</p>
          <p><span className="text-white/50">{t.contractSessionPackage}:</span> {booking.packageName || '—'}</p>
        </div>
      ) : cd ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono text-white/70">
          <div className="space-y-2 border border-white/10 rounded p-4">
            <p className="text-white/70 font-semibold uppercase tracking-widest text-[10px]">{t.contractCeremony}</p>
            <p>{cd.ceremonyLocation || '—'}</p>
            <p>{cd.ceremonyAddress || '—'}</p>
            <p>{t.contractCeremonyStart}: {cd.ceremonyStart || '—'}</p>
            <p>{t.contractCeremonyEnd}: {cd.ceremonyEnd || '—'}</p>
          </div>
          <div className="space-y-2 border border-white/10 rounded p-4">
            <p className="text-white/70 font-semibold uppercase tracking-widest text-[10px]">{t.contractReception}</p>
            <p>{cd.receptionLocation || '—'}</p>
            <p>{cd.receptionAddress || '—'}</p>
            <p>{t.contractReceptionStart}: {cd.receptionStart || '—'}</p>
            <p>{t.contractReceptionEnd}: {cd.receptionEnd || '—'}</p>
          </div>
        </div>
      ) : null}

      {/* Package & Pricing */}
      <div className="border border-white/10 rounded p-4 text-xs font-mono text-white/70 space-y-2">
        <p className="text-white/70 font-semibold uppercase tracking-widest text-[10px]">{t.contractPackage}</p>
        <p className="font-serif text-base text-white/90">{booking.packageName || '—'}</p>
        {booking.packageDetails && <p className="text-white/50 leading-relaxed">{booking.packageDetails}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-white/10 mt-3">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/30">{t.contractAmountAgreed}</p>
            <p className="font-serif text-lg text-white/90">${(Number(booking.amount) || 0).toLocaleString()}</p>
          </div>
          {Number(booking.travelExpenses) ? (
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/30">{t.contractTravelExpenses}</p>
              <p className="font-serif text-lg text-white/90">+ ${(Number(booking.travelExpenses) || 0).toLocaleString()}</p>
            </div>
          ) : <div />}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/30">{t.contractDeposit}</p>
            <p className="font-serif text-lg text-white/90">${(Number(booking.depositAmount) || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/30">{t.contractAmountDue}</p>
            <p className="font-serif text-lg text-white/90">${Math.max(0, (Number(booking.amount) || 0) + (Number(booking.travelExpenses) || 0) - (Number(booking.depositAmount) || 0)).toLocaleString()}</p>
          </div>
        </div>
        {booking.invoiceId && (
          <p className="text-[9px] uppercase tracking-widest text-white/30 pt-2">
            {lang === 'en' ? 'Invoice reference' : 'Referencia de factura'}: {booking.invoiceId}
          </p>
        )}
      </div>

      {mode !== 'view' && (
        <div className="space-y-6 text-xs text-white/70 leading-relaxed">
          {(isSession ? sessionClauses : weddingClauses).map((clause) => (
            <div key={clause.title} className="border-l-2 border-white/10 pl-4">
              <h4 className="font-semibold text-white/70 text-[10px] tracking-widest mb-1">{clause.title}</h4>
              <p className="text-white/50">{clause.text}</p>
            </div>
          ))}
        </div>
      )}
      {mode === 'view' && (
        <details className="text-xs border border-white/10 rounded-lg">
          <summary className="text-white/50 hover:text-white/70 cursor-pointer px-4 py-2.5 text-[10px] font-mono tracking-wider uppercase select-none">
            {lang === 'es' ? 'Términos y condiciones' : 'Terms & Conditions'}
          </summary>
          <div className="border-t border-white/10 px-4 py-3 space-y-4">
            {(isSession ? sessionClauses : weddingClauses).map((clause) => (
              <div key={clause.title}>
                <h4 className="font-semibold text-white/60 text-[10px] tracking-widest mb-0.5">{clause.title}</h4>
                <p className="text-white/40 text-[11px]">{clause.text}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Signatures */}
      <div className="border-t border-white/10 pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client signature */}
          <div className="space-y-3">
            <p className="text-white/70 font-semibold uppercase tracking-widest text-[10px]">{t.contractSignatureClient}</p>
            {booking.contractSignature ? (
              <div>
                <p className="font-serif text-lg text-white/90 border-b border-white/10 pb-2">{booking.contractSignature}</p>
                <p className="text-[9px] font-mono text-white/30 mt-1">{t.contractSignatureDate}: {booking.contractSignedAt ? formatDate(booking.contractSignedAt) : '—'}</p>
              </div>
            ) : mode === 'client-sign' ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder={t.contractSignHere}
                  className="w-full bg-dark-gray border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 font-serif"
                />
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signed}
                    onChange={(e) => setSigned(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-white/50">{t.contractIAccept}</span>
                </label>
                <button
                  onClick={handleSign}
                  disabled={!signature.trim() || !signed}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/10 rounded font-mono text-[10px] tracking-widest uppercase hover:bg-white/15 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={14} />
                  {t.contractSignBtn}
                </button>
              </div>
            ) : (
              <p className="text-white/30 italic">—</p>
            )}
          </div>

          {/* Photographer signature */}
          <div className="space-y-3">
            <p className="text-white/70 font-semibold uppercase tracking-widest text-[10px]">{t.contractSignaturePhotographer}</p>
            {booking.contractPhotographerSignature ? (
              <div>
                <p className="font-serif text-lg text-white/90 border-b border-white/10 pb-2">{booking.contractPhotographerSignature}</p>
                <p className="text-[9px] font-mono text-white/30 mt-1">{t.contractSignatureDate}: {booking.contractPhotographerSignedAt ? formatDate(booking.contractPhotographerSignedAt) : '—'}</p>
              </div>
            ) : mode === 'admin-sign' ? (
              <button
                onClick={onPhotographerSign}
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-white/70 rounded font-mono text-[10px] tracking-widest uppercase hover:bg-white/5 transition-all duration-300"
              >
                <CheckCircle size={14} />
                {t.contractAdminSign}
              </button>
            ) : (
              <p className="text-white/30 italic">—</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded font-mono text-[10px] tracking-widest uppercase text-white hover:border-white/30 hover:text-white transition-all duration-300"
          >
            <Printer size={14} />
            {t.contractDownloadBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
