import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus-visible:outline-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-honey-500 hover:bg-honey-600 active:bg-honey-700 text-white shadow-sm',
    secondary: 'bg-forest-600 hover:bg-forest-700 active:bg-forest-800 text-white shadow-sm',
    danger:    'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-sm',
    ghost:     'bg-transparent hover:bg-honey-50 text-honey-700 hover:text-honey-800',
    outline:   'border-2 border-honey-400 text-honey-700 hover:bg-honey-50 bg-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
}
