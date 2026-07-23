import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Lock, CheckCircle2, X, AlertCircle, Wallet, Shield } from 'lucide-react';

export interface PaymentResult {
  txHash: string;
  amount: number;
  paymentMethod: string;
  status: 'success';
}

interface StripeCheckoutProps {
  isOpen: boolean;
  amount: number;
  description: string;
  onClose: () => void;
  onSuccess: (result?: PaymentResult) => void;
}

type PaymentMethod = 'stripe' | 'paypal';

export default function StripeCheckout({ isOpen, amount, description, onClose, onSuccess }: StripeCheckoutProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const [method, setMethod] = useState<PaymentMethod>('stripe');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [txHash, setTxHash] = useState('');

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setStatus('idle');
    setFormError('');
    setCardName('');
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setTxHash('');
  };

  const simulatePayment = (methodType: PaymentMethod) => {
    setStatus('processing');
    setFormError('');

    const delay = 2000 + Math.random() * 1500;

    setTimeout(() => {
      const hash = methodType === 'stripe'
        ? 'pi_' + Math.random().toString(36).substring(2, 12)
        : 'PAYID-' + Math.random().toString(36).substring(2, 12).toUpperCase();

      setTxHash(hash);
      setStatus('success');

      setTimeout(() => {
        const result: PaymentResult = {
          txHash: hash,
          amount,
          paymentMethod: methodType === 'stripe' ? 'Visa •••• 4242' : 'PayPal',
          status: 'success',
        };
        onSuccess(result);
        onClose();
        resetForm();
      }, 2500);
    }, delay);
  };

  const handleStripePay = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cardNumber.replace(/\s/g, '');

    if (!cardName.trim() || !/^\d{13,19}$/.test(digits) || !/^\d{2}\/\d{2}$/.test(expiry) || !/^\d{3,4}$/.test(cvc)) {
      setFormError('Please enter a valid card number, expiration date, security code, and cardholder name.');
      return;
    }
    simulatePayment('stripe');
  };

  const handlePayPalPay = () => {
    simulatePayment('paypal');
  };

  if (!isOpen) return null;

  const TEST_CARD = '4242 4242 4242 4242';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-dark/85 backdrop-blur-sm">
        <motion.div
          className="bg-charcoal border border-white/10 rounded-lg max-w-md w-full overflow-hidden shadow-2xl relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="bg-dark/40 p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/70">
              <Lock size={14} />
              <span className="text-xs font-mono tracking-widest font-bold uppercase">SECURE CHECKOUT</span>
            </div>
            <button
              onClick={() => { onClose(); resetForm(); }}
              disabled={status === 'processing'}
              className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/5"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div
                  key="checkout-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <div className="bg-dark/30 p-3.5 rounded-lg border border-white/10 flex justify-between items-center">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-mono text-white/40 uppercase">ITEM</span>
                      <span className="text-xs font-semibold text-white/95 truncate">{description}</span>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-4">
                      <span className="text-[9px] font-mono text-white/40 uppercase">AMOUNT</span>
                      <span className="text-sm font-mono font-semibold text-white/70">${amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 p-1 bg-dark/40 rounded-lg border border-white/5">
                    <button
                      onClick={() => setMethod('stripe')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-mono font-semibold tracking-wider uppercase transition-colors ${
                        method === 'stripe'
                          ? 'bg-white/10 text-white border border-white/10'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      <CreditCard size={13} />
                      Stripe
                    </button>
                    <button
                      onClick={() => setMethod('paypal')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-mono font-semibold tracking-wider uppercase transition-colors ${
                        method === 'paypal'
                          ? 'bg-white/10 text-white border border-white/10'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      <Wallet size={13} />
                      PayPal
                    </button>
                  </div>

                  {method === 'stripe' ? (
                    <form onSubmit={handleStripePay} className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Johnathan Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full bg-dark/60 border border-white/10 rounded px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            maxLength={19}
                            placeholder={TEST_CARD}
                            value={cardNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                              const parts = [];
                              for (let i = 0, len = Math.min(val.length, 16); i < len; i += 4) {
                                parts.push(val.substring(i, i + 4));
                              }
                              setCardNumber(parts.length ? parts.join(' ') : val);
                            }}
                            className="w-full bg-dark/60 border border-white/10 rounded pl-9 pr-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 font-mono transition-colors"
                          />
                          <div className="absolute inset-y-0 left-3 flex items-center text-white/35">
                            <CreditCard size={13} />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest">Expiration</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9]/g, '');
                              if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                              setExpiry(val);
                            }}
                            className="w-full bg-dark/60 border border-white/10 rounded px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 font-mono text-center transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest">CVC</label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            placeholder="123"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-dark/60 border border-white/10 rounded px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30 font-mono text-center transition-colors"
                          />
                        </div>
                      </div>

                      {formError && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-[10px] text-red-300" role="alert">
                          <AlertCircle size={13} className="mt-0.5 shrink-0" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <div className="pt-1 space-y-2">
                        <p className="text-[8px] font-mono text-white/25 text-center tracking-wider">
                          Test mode — use {TEST_CARD} with any future date and CVC
                        </p>
                        <button
                          type="submit"
                          className="w-full py-3 bg-[#B58A4A]/20 hover:bg-[#B58A4A]/30 text-[#B58A4A] border border-[#B58A4A]/20 font-mono text-xs tracking-widest uppercase font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Lock size={12} />
                          Pay ${amount.toLocaleString()}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-dark/40 rounded-lg border border-white/5 p-4 text-center space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-full bg-[#002F86]/20 border border-[#002F86]/20 flex items-center justify-center">
                          <Wallet size={20} className="text-[#009CDE]" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-white/80 font-medium">PayPal Checkout</p>
                          <p className="text-[10px] text-white/40">You will be redirected to PayPal</p>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-white/30">
                          <span className="flex items-center gap-1"><Shield size={10} /> Protected</span>
                          <span className="flex items-center gap-1"><Lock size={10} /> Encrypted</span>
                        </div>
                      </div>

                      <p className="text-[8px] font-mono text-white/25 text-center tracking-wider">
                        Sandbox mode — no real transaction will occur
                      </p>

                      <button
                        onClick={handlePayPalPay}
                        className="w-full py-3 bg-[#0070BA] hover:bg-[#003087] text-white font-sans text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Wallet size={14} />
                        Pay with PayPal
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {status === 'processing' && (
                <motion.div
                  key="processing"
                  className="py-12 text-center space-y-4 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-white/30 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-white/70">
                      {method === 'paypal' ? <Wallet size={14} /> : <Lock size={14} />}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-white/70 font-semibold uppercase tracking-wider">
                      {method === 'paypal' ? 'REDIRECTING TO PAYPAL' : 'PROCESSING PAYMENT'}
                    </p>
                    <p className="text-[10px] text-white/50">
                      {method === 'paypal' ? 'PLEASE DO NOT CLOSE THIS WINDOW' : 'AUTHORIZING TRANSACTION'}
                    </p>
                  </div>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  key="success"
                  className="py-8 text-center space-y-5 flex flex-col items-center justify-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400">
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-serif text-xl text-white font-semibold">Payment Completed</h4>
                    <p className="text-[10px] font-mono text-white/70 uppercase tracking-widest">TRANSACTION REFERENCE</p>
                    <p className="text-[9px] font-mono text-white/55 bg-dark/60 border border-white/10 px-2 py-1.5 rounded truncate max-w-[280px] select-all">
                      {txHash}
                    </p>
                  </div>
                  <p className="text-[10px] text-white/45 max-w-xs leading-relaxed">
                    {method === 'paypal'
                      ? 'PayPal has confirmed the transaction. Your invoice receipt will be available shortly.'
                      : 'Stripe has settled the funds. An official invoice receipt and tracking reference has been dispatched.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
