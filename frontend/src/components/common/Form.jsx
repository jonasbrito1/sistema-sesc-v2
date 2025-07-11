import React from 'react';
import { useForm } from 'react-hook-form';
import Button from './Button';

export function Form({ onSubmit, children, className = '', ...props }) {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`} {...props}>
      {children}
    </form>
  );
}

export function FormField({ 
  label, 
  error, 
  helpText, 
  required = false, 
  children, 
  className = '' 
}) {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="form-error">{error}</p>}
      {helpText && <p className="form-help">{helpText}</p>}
    </div>
  );
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={`
        form-input ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''} ${className}
      `}
      {...props}
    />
  );
}

export function Textarea({
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      rows={rows}
      className={`
        form-textarea ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''} ${className}
      `}
      {...props}
    />
  );
}

export function Select({
  options = [],
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  placeholder = 'Selecione...',
  className = '',
  ...props
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={`
        form-select ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''} ${className}
      `}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({
  checked,
  onChange,
  onBlur,
  label,
  error,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`form-checkbox ${className}`}
        {...props}
      />
      {label && (
        <label className="ml-2 text-sm text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
}

export function Radio({
  options = [],
  value,
  onChange,
  onBlur,
  name,
  error,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className="form-radio"
            {...props}
          />
          <label className="ml-2 text-sm text-gray-700">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
}