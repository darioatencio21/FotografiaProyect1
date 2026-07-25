import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, DollarSign, FileText, AlertCircle, Calendar, Shield } from 'lucide-react';
import { ActiveLanguíage, Booking } from '../types';
import ContractView from './ContractView';
import { PaymentResult } from './StripeCheckout';
import { TRANSLATIONS } from '../data/mockData';

interface BookingApprovalProps {
  booking: Booking;
  lang: ActiveLanguíage;
  onConfirm: (bookingId: string) => void;
  onCheckout: (amount: number, description: string, onDone: (result?: PaymentResult) => void, onCancel?: () => void) => void;
}

export default function BookingApproval({ booking, lang, onConfirm, onCheckout }: BookingApprovalProps) {
  const t = TRANSLATIONS[lang];

  const [contractSigned, setContractSigned] = useState(booking.contractStatus === 'signed');
  const [paymentPaid, setPaymentPaid] = useState(booking.paymentStatus === 'paid');
  const [contractStep, setContractStep] = useState(false);
  const [showSignedContract, setShowSignedContract] = useState(false);

  const depositAmount = booking.depositAmount ?? 0;
  const isExpired = booking.approvalExpiresAt && new Date(booking.approvalExpiresAt) < new Date();

  if (isExpired) {
    return (
      <div className="glass-premium rounded-lg border border-white/10 p-8 md:p-12 max-w-lg mx-auto text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif text-2xl text-white/90 tracking-wide">
            {lang === 'en' ? 'Link Expired' : 'Enlace Expirado'}
          </h3>
          <p className="text-sm text-white/60">
            {lang === 'en'
              ? 'The time to complete your payment and contract has expired. This booking is no longer reserved. Please contact the photographer to arrange a new date.'
              : 'El tiempo para completar el pago y firma del contrato ha expirado. Esta reserva ya no está reservada. Contactá a la fotógrafa para coordinar una nueva fecha.'}
          </p>
        </div>
      </div>
    );
  }

  const handleContractSign = (signature: string) => {
    setContractSigned(true);
    setContractStep(false);
    if (paymentPaid) {
      onConfirm(booking.id);
    }
  };

  const handlePayment = () => {
    onCheckout(
      depositAmount,
      `${booking.packageName || 'Photography Session'} — Deposit (${booking.clientName})`,
      () => {
        setPaymentPaid(true);
        if (contractSigned) {
          onConfirm(booking.id);
        }
      },
      () => {},
    );
  };

  const isAllComplete = contractSigned && paymentPaid;

  return (
    <div className="glass-premium rounded-lg border border-white/10 p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="text-center border-b border-white/10 pb-4">
        <h2 className="font-serif text-2xl md:text-3xl text-white/90 tracking-wide">
          {lang === 'en' ? 'Complete Your Booking' : 'Completá tu Reserva'}
        </h2>
        <p className="text-[11px] text-white/50 mt-1">
          {lang === 'en'
            ? 'Sign the contract and pay the deposit to confirm your session.'
            : 'Firmá el contrato y pagá el depósito para confirmar tu sesión.'}
        </p>
      </div>

      {/* Booking Summary */}
      <div className="bg-dark/40 border border-white/10 rounded-lg p-4 space-y-2">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-white/40 text-[9px] uppercase tracking-wider block">
              {lang === 'en' ? 'Client' : 'Cliente'}
            </span>
            <span className="text-white/90 font-medium">{booking.clientName}</span>
          </div>
          <div>
            <span className="text-white/40 text-[9px] uppercase tracking-wider block">
              {lang === 'en' ? 'Package' : 'Paquete'}
            </span>
            <span className="text-white/90 font-medium">{booking.packageName || '—'}</span>
          </div>
          <div>
            <span className="text-white/40 text-[9px] uppercase tracking-wider block">
              {lang === 'en' ? 'Date' : 'Fecha'}
            </span>
            <span className="text-white/90 font-medium flex items-center gap-1">
              <Calendar size={11} className="text-white/50" />
              {booking.date}
            </span>
          </div>
          <div>
            <span className="text-white/40 text-[9px] uppercase tracking-wider block">
              {lang === 'en' ? 'Time' : 'Horario'}
            </span>
            <span className="text-white/90 font-medium flex items-center gap-1">
              <Clock size={11} className="text-white/50" />
              {booking.timeSlot}
            </span>
          </div>
        </div>
        <div className="border-t border-white/10 pt-2 flex justify-between items-center">
          <span className="text-white/50 text-[10px] font-mono">
            {lang === 'en' ? 'Total' : 'Total'}
          </span>
          <span className="text-white/90 font-serif text-lg font-semibold">
            ${booking.amount || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/50 text-[10px] font-mono">
            {lang === 'en' ? 'Deposit Required' : 'Depósito Requerido'}
          </span>
          <span className="text-[#C7A962] font-serif text-lg font-semibold">
            ${depositAmount}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {/* Step 1: Sign Contract */}
        <div className={`border rounded-lg p-4 ${contractSigned ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/10 bg-dark/20'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText size={16} className={contractSigned ? 'text-emerald-400' : 'text-white/50'} />
              <span className={`text-xs font-semibold ${contractSigned ? 'text-emerald-400' : 'text-white/70'}`}>
                {lang === 'en' ? 'Sign Contract' : 'Firmar Contrato'}
              </span>
            </div>
            {contractSigned ? (
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-mono">
                  <CheckCircle2 size={12} /> {lang === 'en' ? 'Signed' : 'Firmado'}
                </span>
                <button
                  onClick={() => setShowSignedContract(true)}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white/80 border border-white/10 rounded text-[9px] font-mono tracking-wider cursor-pointer transition-all"
                >
                  {lang === 'en' ? 'View' : 'Ver'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setContractStep(true)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded text-[10px] font-mono tracking-wider cursor-pointer transition-all"
              >
                {lang === 'en' ? 'Sign Now' : 'Firmar Ahora'}
              </button>
            )}
          </div>
          {contractStep && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden pt-4 border-t border-white/10 mt-3"
            >
              <ContractView
                booking={booking}
                mode="client-sign"
                lang={lang}
                t={t}
                onClientSign={handleContractSign}
              />
              <button
                onClick={() => setContractStep(false)}
                className="mt-2 text-[10px] font-mono text-white/50 hover:text-white underline cursor-pointer"
              >
                {lang === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
            </motion.div>
          )}
        </div>

        {/* Signed contract viewer */}
        {showSignedContract && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden border border-white/10 rounded-lg bg-dark/20"
          >
            <div className="relative p-4">
              <button
                onClick={() => setShowSignedContract(false)}
                className="absolute top-3 right-3 text-white/50 hover:text-white text-[10px] font-mono cursor-pointer z-10"
              >
                {lang === 'en' ? 'Close' : 'Cerrar'}
              </button>
              <ContractView
                booking={booking}
                mode="view"
                lang={lang}
                t={t}
              />
            </div>
          </motion.div>
        )}

        {/* Step 2: Pay Deposit */}
        <div className={`border rounded-lg p-4 ${paymentPaid ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/10 bg-dark/20'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className={paymentPaid ? 'text-emerald-400' : 'text-white/50'} />
              <span className={`text-xs font-semibold ${paymentPaid ? 'text-emerald-400' : 'text-white/70'}`}>
                {lang === 'en' ? 'Pay Deposit' : 'Pagar Depósito'}
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                ${depositAmount}
              </span>
            </div>
            {paymentPaid ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-mono">
                <CheckCircle2 size={12} /> {lang === 'en' ? 'Paid' : 'Pagado'}
              </span>
            ) : (
              <button
                onClick={handlePayment}
                className="px-3 py-1.5 bg-[#C7A962]/20 hover:bg-[#C7A962]/30 text-[#C7A962] border border-[#C7A962]/20 rounded text-[10px] font-mono tracking-wider cursor-pointer transition-all"
              >
                {lang === 'en' ? 'Pay Now' : 'Pagar Ahora'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation status */}
      {isAllComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-2"
        >
          <div className="inline-flex p-2 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <p className="text-sm text-emerald-400 font-semibold">
            {lang === 'en' ? 'Booking Confirmed!' : 'Reserva Confirmada!'}
          </p>
          <p className="text-xs text-white/60">
            {lang === 'en'
              ? 'You will receive a confirmation email shortly.'
              : 'Recibirás un email de confirmación en breve.'}
          </p>
        </motion.div>
      )}

      <div className="flex items-center justify-center gap-2 text-[10px] text-white/40">
        <Shield size={11} />
        <span>
          {lang === 'en'
            ? 'Secure payment — no charges until you confirm'
            : 'Pago seguro — no hay cargos hasta que confirmes'}
        </span>
      </div>
    </div>
  );
}
