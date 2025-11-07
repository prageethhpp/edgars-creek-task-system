// Reusable UI Components

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  children, 
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:scale-105 active:scale-95',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:scale-105 active:scale-95',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 
          text-gray-900 dark:text-white placeholder-gray-400 
          transition-all duration-200 
          ${error 
            ? 'border-red-500 focus:ring-2 focus:ring-red-500 animate-shake' 
            : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 animate-fade-in">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function TextArea({ label, error, helperText, className = '', ...props }: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 
          text-gray-900 dark:text-white placeholder-gray-400 
          transition-all duration-200 resize-none
          ${error 
            ? 'border-red-500 focus:ring-2 focus:ring-red-500 animate-shake' 
            : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 
      p-6 transition-all duration-200
      ${hover ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400',
    error: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',
    neutral: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg className="animate-spin h-full w-full text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );
}

interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  onClose?: () => void;
}

export function Alert({ children, variant = 'info', onClose }: AlertProps) {
  const variants = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400'
  };

  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ'
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${variants[variant]} fade-in`}>
      <span className="text-lg font-bold">{icons[variant]}</span>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
}
