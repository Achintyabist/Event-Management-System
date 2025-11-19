import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { TOAST_TYPES } from '../../utils/constants';

const Toast = ({ toast }) => {
  const { removeToast } = useToast();

  const getToastStyles = (type) => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return 'bg-green-50 border-green-200 text-green-800';
      case TOAST_TYPES.ERROR:
        return 'bg-red-50 border-red-200 text-red-800';
      case TOAST_TYPES.WARNING:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case TOAST_TYPES.ERROR:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case TOAST_TYPES.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className={`
      max-w-sm w-full border rounded-lg shadow-lg p-4 mb-4
      transform transition-all duration-300 ease-in-out
      ${getToastStyles(toast.type)}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon(toast.type)}
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium">
            {toast.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
            onClick={() => removeToast(toast.id)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;