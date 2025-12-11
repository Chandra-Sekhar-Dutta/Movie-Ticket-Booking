import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, Zap } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  className = '',
}) => {
  const alertConfig = {
    success: {
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
      border: 'border-green-300',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      title: 'text-green-900 font-bold',
      text: 'text-green-800',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-50 to-rose-50',
      border: 'border-red-300',
      icon: XCircle,
      iconColor: 'text-red-600',
      title: 'text-red-900 font-bold',
      text: 'text-red-800',
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
      border: 'border-amber-300',
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      title: 'text-amber-900 font-bold',
      text: 'text-amber-800',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      border: 'border-blue-300',
      icon: Info,
      iconColor: 'text-blue-600',
      title: 'text-blue-900 font-bold',
      text: 'text-blue-800',
    },
  };

  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} border-2 rounded-xl p-4 flex gap-4 items-start ${className} animate-slideUp shadow-lg`}
    >
      <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1">
        {title && <h3 className={`${config.title} mb-1`}>{title}</h3>}
        <p className={`${config.text} text-sm font-medium`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`text-xl font-bold ${config.text} hover:opacity-50 transition-opacity`}
        >
          ×
        </button>
      )}
    </div>
  );
};

interface LoadingProps {
  fullPage?: boolean;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ fullPage = false, text = 'Loading...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative w-12 h-12">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent border-r-accent animate-spin"></div>
        {/* Center dot */}
        <div className="absolute inset-3 rounded-full bg-accent/10 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
        </div>
      </div>
      <p className="text-gray-600 font-semibold">{text}</p>
      <div className="flex gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">{content}</div>
      </div>
    );
  }

  return content;
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon && (
        <div className="mb-6 text-6xl text-gray-300 animate-bounce opacity-70">{icon}</div>
      )}
      <h3 className="text-3xl font-bold text-gray-900 mb-2 text-center">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-8 text-center max-w-md font-medium">{description}</p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn btn-primary btn-lg flex items-center gap-2">
          <Zap className="w-5 h-5" />
          {action.label}
        </button>
      )}
    </div>
  );
};

interface FormGroupProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  error,
  required = false,
  children,
}) => {
  return (
    <div className="mb-5">
      <label className="label">
        {label}
        {required && <span className="text-secondary ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-error animate-slideUp">{error}</p>}
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>

      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="btn btn-secondary btn-sm hover:bg-gray-200">
            1
          </button>
          {startPage > 2 && <span className="px-2 text-gray-500 font-semibold">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`btn btn-sm ${
            page === currentPage 
              ? 'btn-primary shadow-lg shadow-blue-500/30' 
              : 'btn-secondary hover:bg-gray-200'
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-gray-500 font-semibold">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="btn btn-secondary btn-sm hover:bg-gray-200"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
};

export default Alert;
