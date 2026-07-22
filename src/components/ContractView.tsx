import React from 'react';
import { Printer, CheckCircle } from 'lucide-react';
import { Booking, ActiveLanguage } from '../types';

interface Props {
  booking: Booking;
  lang: ActiveLanguage;
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

  const handlePrint = () => window.print();

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
        <h2 className="font-serif text-2xl text-gold-50 tracking-wide">{isSession ? t.contractSessionTitle : t.contractTitle}</h2>
        <p className="text-xs text-white/50 mt-1">{isSession ? t.contractSessionSubtitle : t.contractSubtitle}</p>
      </div>

      {/* Parties & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono text-white/70">
        <div className="space-y-1">
          <p className="text-gold-400 font-bold uppercase tracking-widest text-[10px]">Photographer</p>
          <p>Miriam Tellez</p>
          <p>miriamtellezphotography@gmail.com</p>
          <p>(559) 756-1144</p>
        </div>
        <div className="space-y-1">
          <p className="text-gold-400 font-bold uppercase tracking-widest text-[10px]">{isSession ? t.contractSessionDate : 'Wedding Date'}</p>
          <p className="font-serif text-base text-gold-50">{booking.date ? formatDate(booking.date) : '—'}</p>
          {isSession && booking.timeSlot && <p className="text-xs text-white/50 mt-1">{t.contractSessionTime}: {booking.timeSlot}</p>}
        </div>
      </div>

      {/* Client Info (session) or Bride & Groom (wedding) */}
      {cd && isSession ? (
        <div className="border border-white/10 rounded p-4 text-xs font-mono text-white/70 space-y-2">
          <p className="text-gold-400 font-bold uppercase tracking-widest text-[10px]">{t.contractClient}</p>
          <p>{cd.brideName || '—'}</p>
          <p>{cd.brideEmail || '—'}</p>
          <p>{cd.groomPhone || '—'}</p>
        </div>
      ) : cd ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono text-white/70">
          <div className="space-y-2 border border-white/10 rounded p-4">
            <p className="text-gold-400 font-bold uppercase tracking-widest text-[10px]">{t.contractBride}</p>
            <p>{cd.brideName || '—'}</p>
            <p>{cd.brideEmail || '—'}</p>
            <p>{cd.brideAddress || '—'}</p>
          </div>
          <div className="space-y-2 border border-white/10 rounded p-4">
            <p className="text-gold-400 font-bold uppercase tracking-widest text-[10px]">{t.contractGroom}</p>
            <p>{cd.groomName || '—'}</p>
            <p>{cd.groomPhone || '—'}</p>
          </div>
        </div>
      ) : null}

      {/* Session info (session) or Ceremony & Reception (wedding) */}
      {cd && isSession ? (
        <div className="border border-white/10 rounded p-4 text-xs font-mono text-white/70 space-y-2">
          <p className="text-gold-400 font-bold uppercase tracking-widest text-[10px]">{t.contractSessionInfo}</p>
          <p><span className="text-white/50">{t.contractSessionDate}:</span> {booking.date ? formatDate(booking.date) : '—'}</p>
          <p><span className="text-white/50">{t.contractSessionTime}:</span> {booking.timeSlot || '—'}</p>
          <p><span className="text-white/50">{t.contractSessionPackage}:</span> {booking.packageName || '—'}</p>
        </div>
      ) : cd ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono text-white/70">
          <div className="space-y-2 border border-white/10 rounded p-4">
            <p className="text-gold-400 font-bold uppercase tracking-widest text-[10px]">{t.contractCeremony}</p>
            <p>{cd.ceremonyLocation || '—'}</p>
            <p>{cd.ceremonyAddress || '—'}</p>
            <p>{t.contractCeremonyStart}: {cd.ceremonyStart || '—'}</p>
            <p>{t.contractCeremonyEnd}: {cd.ceremonyEnd || '—'}</p>
          </div>
          <div className="space-y-2 border border-white/10 rounded p-4">
            <p className="text-gold-400 font-bold uppercase tracking-widest text-[10px]">{t.contractReception}</p>
            <p>{cd.receptionLocation || '—'}</p>
            <p>{cd.receptionAddress || '—'}</p>
            <p>{t.contractReceptionStart}: {cd.receptionStart || '—'}</p>
            <p>{t.contractReceptionEnd}: {cd.receptionEnd || '—'}</p>
          </div>
        </div>
      ) : null}

      {/* Package & Pricing */}
      <div className="border border-white/10 rounded p-4 text-xs font-mono text-white/70 space-y-2">
        <p className="text-gold-400 font-bold uppercase tracking-widest text-[10px]">{t.contractPackage}</p>
        <p className="font-serif text-base text-gold-50">{booking.packageName || '—'}</p>
        {booking.packageDetails && <p className="text-white/50 leading-relaxed">{booking.packageDetails}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/10 mt-3">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/30">{t.contractAmountAgreed}</p>
            <p className="font-serif text-lg text-gold-50">${(booking.amount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/30">{t.contractDeposit}</p>
            <p className="font-serif text-lg text-gold-50">${(booking.depositAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/30">{t.contractAmountDue}</p>
            <p className="font-serif text-lg text-gold-50">${(booking.amountDue || 0).toLocaleString()}</p>
          </div>
        </div>
        {booking.travelExpenses && (
          <p className="text-[9px] uppercase tracking-widest text-white/30 pt-2">
            {t.contractTravelExpenses}: {booking.travelExpenses}
          </p>
        )}
        {booking.invoiceId && (
          <p className="text-[9px] uppercase tracking-widest text-white/30 pt-2">
            {lang === 'en' ? 'Invoice reference' : 'Referencia de factura'}: {booking.invoiceId}
          </p>
        )}
      </div>

      {/* Clauses */}
      <div className="space-y-6 text-xs text-white/70 leading-relaxed">
        {(isSession ? sessionClauses : weddingClauses).map((clause) => (
          <div key={clause.title} className="border-l-2 border-gold-500/30 pl-4">
            <h4 className="font-bold text-gold-400 text-[10px] tracking-widest mb-1">{clause.title}</h4>
            <p className="text-white/50">{clause.text}</p>
          </div>
        ))}
      </div>

      {/* Signatures */}
      <div className="border-t border-white/10 pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client signature */}
          <div className="space-y-3">
            <p className="text-gold-400 font-bold uppercase tracking-widest text-[10px]">{t.contractSignatureClient}</p>
            {booking.contractSignature ? (
              <div>
                <p className="font-serif text-lg text-gold-50 border-b border-gold-500/30 pb-2">{booking.contractSignature}</p>
                <p className="text-[9px] font-mono text-white/30 mt-1">{t.contractSignatureDate}: {booking.contractSignedAt ? formatDate(booking.contractSignedAt) : '—'}</p>
              </div>
            ) : mode === 'client-sign' ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder={t.contractSignHere}
                  className="w-full bg-dark-gray border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold-400 font-serif"
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-dark rounded font-mono text-[10px] tracking-widest uppercase hover:bg-gold-400 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
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
            <p className="text-gold-400 font-bold uppercase tracking-widest text-[10px]">{t.contractSignaturePhotographer}</p>
            {booking.contractPhotographerSignature ? (
              <div>
                <p className="font-serif text-lg text-gold-50 border-b border-gold-500/30 pb-2">{booking.contractPhotographerSignature}</p>
                <p className="text-[9px] font-mono text-white/30 mt-1">{t.contractSignatureDate}: {booking.contractPhotographerSignedAt ? formatDate(booking.contractPhotographerSignedAt) : '—'}</p>
              </div>
            ) : mode === 'admin-sign' ? (
              <button
                onClick={onPhotographerSign}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gold-500/30 text-gold-400 rounded font-mono text-[10px] tracking-widest uppercase hover:bg-gold-500/10 transition-all duration-300"
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
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded font-mono text-[10px] tracking-widest uppercase text-white hover:border-gold-400 hover:text-gold-400 transition-all duration-300"
          >
            <Printer size={14} />
            {t.contractDownloadBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
