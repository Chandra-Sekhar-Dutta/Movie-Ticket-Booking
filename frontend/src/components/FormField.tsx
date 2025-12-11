import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  icon: Icon,
  disabled = false,
  autoComplete,
  required = false,
  showPassword = false,
  onTogglePassword,
}) => {
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="label">{label}</label>
        {required && <span className="text-red-500 text-sm font-semibold">*</span>}
      </div>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`input-base ${Icon ? 'pl-10' : ''} ${
            onTogglePassword ? 'pr-10' : ''
          } ${error ? 'input-error' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
        {onTogglePassword && type === 'password' && (
          <button
            type="button"
            onClick={onTogglePassword}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-error text-sm">✕ {error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;
