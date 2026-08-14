import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { maskName, maskEmail, maskPhone, maskPasscode, maskToken, maskText } from '../utils/maskData';

type MaskType = 'name' | 'email' | 'phone' | 'passcode' | 'token' | 'text';

const maskFns: Record<MaskType, (val: string | null | undefined) => string> = {
  name: maskName,
  email: maskEmail,
  phone: maskPhone,
  passcode: maskPasscode,
  token: maskToken,
  text: maskText,
};

interface RevealableFieldProps {
  value: string | null | undefined;
  type: MaskType;
  label?: string;
  className?: string;
}

export default function RevealableField({ value, type, label, className = '' }: RevealableFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const display = revealed ? (value || '—') : maskFns[type](value);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {label && <span className="text-white/40">{label}</span>}
      <span className={revealed ? 'text-white/90 break-all' : 'text-white/70'}>
        {display}
      </span>
      <button
        type="button"
        onClick={() => setRevealed(!revealed)}
        className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
        title={revealed ? 'Hide' : 'Reveal'}
      >
        {revealed ? <EyeOff size={11} /> : <Eye size={11} />}
      </button>
    </span>
  );
}
