import React from 'react';
import { Loading } from './Loading';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    warning: 'btn-warning',
    error: 'btn-error',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  };

  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        btn ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Loading size="sm" text="" className="mr-2" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon size={16} className="mr-2" />
      ) : null}
      
      <span>{children}</span>
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon size={16} className="ml-2" />
      )}
    </button>
  );
}