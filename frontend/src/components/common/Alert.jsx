import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Alert({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
  showIcon = true,
}) {
  const config = {
    success: {
      icon: CheckCircle,
      className: 'alert-success',
    },
    error: {
      icon: AlertCircle,
      className: 'alert-error',
    },
    warning: {
      icon: AlertTriangle,
      className: 'alert-warning',
    },
    info: {
      icon: Info,
      className: 'alert-info',
    },
  };

  const { icon: Icon, className: alertClass } = config[type];

  return (
    <div className={`alert ${alertClass} ${className}`}>
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <Icon size={20} />
          </div>
        )}
        <div className={showIcon ? 'ml-3' : ''}>
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          {message && (
            <div className="text-sm">
              {typeof message === 'string' ? <p>{message}</p> : message}
            </div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}