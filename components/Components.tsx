import React from 'react';
import { ChevronLeft, ArrowRight, ShieldCheck } from 'lucide-react';

// --- Header Component ---
export const Header: React.FC<{ 
  title?: string; 
  onBack?: () => void; 
  variant?: 'primary' | 'secondary' | 'transparent';
  rightElement?: React.ReactNode;
}> = ({ title, onBack, variant = 'primary', rightElement }) => {
  const bgClass = variant === 'primary' ? 'bg-[#5f259f] text-white' : 
                 variant === 'secondary' ? 'bg-white text-gray-900 border-b' : 'bg-transparent text-white';

  return (
    <div className={`flex items-center justify-between p-4 h-16 ${bgClass} sticky top-0 z-50 transition-all`}>
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-1 rounded-full hover:bg-white/10">
            <ChevronLeft size={24} />
          </button>
        )}
        {title && <h1 className="text-lg font-semibold tracking-wide">{title}</h1>}
      </div>
      <div>{rightElement}</div>
    </div>
  );
};

// --- Button Component ---
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { fullWidth?: boolean, loading?: boolean }> = ({ 
  children, className = '', fullWidth, loading, ...props 
}) => {
  return (
    <button 
      className={`
        ${fullWidth ? 'w-full' : ''} 
        bg-[#5f259f] hover:bg-[#4b1d7f] text-white font-semibold py-3 px-6 rounded-xl 
        transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg disabled:opacity-70
        ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
};

// --- Secure Badge ---
export const SecureBadge = () => (
  <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md w-fit">
    <ShieldCheck size={12} />
    <span>100% Secure</span>
  </div>
);

// --- Number Pad Key ---
export const NumberPadKey: React.FC<{ value: string | React.ReactNode, onClick: () => void }> = ({ value, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full h-16 text-2xl font-medium text-gray-800 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center"
  >
    {value}
  </button>
);
