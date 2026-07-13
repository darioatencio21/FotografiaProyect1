/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Lock, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface StripeCheckoutProps {
  isOpen: boolean;
  amount: number;
  description: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StripeCheckout({ isOpen, amount, description, onClose, onSuccess }: StripeCheckoutProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');

    // Simulate 3D Secure Verification & stripe charge completion
    setTimeout(() => {
      const generatedHash = 'ch_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setTxHash(generatedHash);
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setStatus('idle');
        // Reset fields
        setCardNumber('');
        setExpiry('');
        setCvc('');
        setName('');
      }, 3000);
    }, 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-dark/85 backdrop-blur-sm">
        <motion.div
          className="bg-charcoal border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          {/* Header */}
          <div className="bg-dark/40 p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-gold-400">
              <Lock size={14} />
              <span className="text-xs font-mono tracking-widest font-bold uppercase">SECURE STRIPE CHECKOUT</span>
            </div>
            <button 
              onClick={onClose} 
              disabled={status === 'processing'}
              className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/5"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.form key="payment-form" onSubmit={handlePay} className="space-y-4 text-left">
                  {/* Order summary info */}
                  <div className="bg-dark/30 p-3.5 rounded-lg border border-white/5 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-white/40 uppercase">ITEM DESCRIPTION</span>
                      <span className="text-xs font-semibold text-white/95 max-w-[240px] truncate">{description}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-mono text-white/40 uppercase">TOTAL AMOUNT</span>
                      <span className="text-sm font-mono font-bold text-gold-400">${amount}</span>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Johnathan Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-dark/60 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={19}
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={(e) => {
                            // Format card spacing beautifully
                            const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                            const matches = val.match(/\d{4,16}/g);
                            const match = (matches && matches[0]) || '';
                            const parts = [];
                            for (let i = 0, len = match.length; i < len; i += 4) {
                              parts.push(match.substring(i, i + 4));
                            }
                            if (parts.length > 0) {
                              setCardNumber(parts.join(' '));
                            } else {
                              setCardNumber(val);
                            }
                          }}
                          className="w-full bg-dark/60 border border-white/10 rounded pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold-400 font-mono"
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
                            if (val.length >= 2) {
                              val = val.substring(0, 2) + '/' + val.substring(2, 4);
                            }
                            setExpiry(val);
                          }}
                          className="w-full bg-dark/60 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold-400 font-mono text-center"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest">Security CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          placeholder="382"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full bg-dark/60 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold-400 font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-dark font-mono text-xs tracking-widest uppercase font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 shadow-xl cursor-pointer mt-4"
                  >
                    <span>Authorize & Pay ${amount}</span>
                  </button>
                </motion.form>
              )}

              {status === 'processing' && (
                <motion.div
                  key="processing-view"
                  className="py-12 text-center space-y-4 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-gold-400/20 border-t-gold-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-gold-400">
                      <Lock size={14} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-gold-400 font-bold uppercase tracking-wider">SECURE AUTHORIZATION IN PROGRESS</p>
                    <p className="text-[10px] text-white/50">COMMUNICATING WITH STRIPE ENDPOINTS...</p>
                  </div>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  key="success-view"
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
                    <p className="text-[10px] font-mono text-gold-400 uppercase tracking-widest">TRANSACTION REFERENCE</p>
                    <p className="text-[9px] font-mono text-white/55 bg-dark/60 border border-white/5 px-2 py-1.5 rounded truncate max-w-[280px] select-all">
                      {txHash}
                    </p>
                  </div>
                  <p className="text-[10px] text-white/45 max-w-xs leading-relaxed">
                    Stripe has settled the funds. An official invoice receipt and tracking reference has been dispatched.
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
