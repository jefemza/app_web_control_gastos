import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const { type, message, duration = 5000 } = event.detail;
      const id = Date.now();
      
      setToasts(prev => [...prev, { id, type, message }]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-500/20 bg-green-500/10';
      case 'error':
        return 'border-red-500/20 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/10';
      default:
        return 'border-blue-500/20 bg-blue-500/10';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 bg-esm-dark border rounded-lg shadow-lg animate-slide-in-right ${getStyles(toast.type)}`}
        >
          {getIcon(toast.type)}
          <p className="text-white text-sm flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Helper function para mostrar toasts
export const showToast = (type, message, duration = 5000) => {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { type, message, duration }
  }));
};