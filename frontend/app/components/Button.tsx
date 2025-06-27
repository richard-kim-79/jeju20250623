import { ButtonHTMLAttributes } from 'react';

export default function Button({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      className={
        'px-4 py-2 rounded-full font-medium transition-colors ' +
        'bg-[#1d9bf0] text-white hover:bg-[#007AFF] focus:ring-2 focus:ring-[#1d9bf0] ' +
        'disabled:opacity-50 disabled:cursor-not-allowed ' +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
} 