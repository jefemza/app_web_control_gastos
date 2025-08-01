import { useState, useEffect } from 'react';
import { Bot, RefreshCw, X, Bell } from 'lucide-react';

export default function ClaudePresence() {
  const [isOnline, setIsOnline] = useState(true);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Verificar actualizaciones
  useEffect(() => {
    // Verificar el archivo de versión cada 5 segundos
    const checkForUpdates = async () => {
      try {
        const response = await fetch('/claude-version.json?' + new Date().getTime());
        const data = await response.json();
        const storedVersion = localStorage.getItem('claude-version');
        
        if (storedVersion && storedVersion !== data.version) {
          setHasUpdate(true);
          setShowNotification(true);
          // Auto-ocultar notificación después de 10 segundos
          setTimeout(() => setShowNotification(false), 10000);
        }
        
        localStorage.setItem('claude-version', data.version);
      } catch (error) {
        // El archivo no existe aún, es normal
      }
    };

    const interval = setInterval(checkForUpdates, 5000);
    return () => clearInterval(interval);
  }, []);

  // Manejadores de arrastre
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isMinimized) {
    return (
      <div
        className="fixed z-50 cursor-pointer"
        style={{ right: '20px', bottom: '20px' }}
        onClick={() => setIsMinimized(false)}
      >
        <div className="relative">
          <div className="bg-esm-gray/90 backdrop-blur-sm p-3 rounded-full border border-gray-700 hover:border-esm-gold transition-all duration-300 shadow-lg hover:shadow-esm-gold/20">
            <Bot className="w-6 h-6 text-esm-gold" />
          </div>
          {hasUpdate && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Widget Principal */}
      <div
        className="fixed z-50"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div className="bg-esm-gray/95 backdrop-blur-md rounded-lg border border-gray-700 shadow-xl overflow-hidden">
          {/* Header */}
          <div 
            className="bg-gradient-to-r from-esm-gray to-esm-darker p-3 border-b border-gray-700 flex items-center justify-between"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-esm-gold animate-pulse" />
              <span className="text-sm font-medium text-white">Claude AI</span>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Contenido */}
          <div className="p-4">
            <p className="text-xs text-gray-400 mb-2">
              {isOnline ? 'Sistema sincronizado' : 'Verificando conexión...'}
            </p>
            
            {hasUpdate && (
              <div className="bg-esm-darker/50 rounded-md p-3 border border-esm-gold/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Bell className="w-4 h-4 text-esm-gold animate-bounce" />
                  <p className="text-sm text-esm-gold font-medium">
                    ¡Actualización disponible!
                  </p>
                </div>
                <p className="text-xs text-gray-300 mb-3">
                  Claude ha aplicado cambios. Refresca para ver las mejoras.
                </p>
                <button
                  onClick={handleRefresh}
                  className="w-full bg-esm-gold text-black text-sm font-medium py-2 px-3 rounded-md hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refrescar ahora</span>
                </button>
              </div>
            )}
            
            {!hasUpdate && (
              <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <span>Asistente activo</span>
                <span className="text-esm-gold">✨</span>
                </div>
              <p className="text-xs text-gray-600 mt-1 italic">
                "Siempre aquí para ayudar"
              </p>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Notificación Toast */}
      {showNotification && hasUpdate && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-esm-gray/95 backdrop-blur-md rounded-lg border border-esm-gold/50 shadow-xl p-4 max-w-sm">
            <div className="flex items-start space-x-3">
              <Bot className="w-6 h-6 text-esm-gold flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white mb-1">
                  Claude AI actualizó la aplicación
                </h4>
                <p className="text-xs text-gray-300 mb-3">
                  Se han aplicado mejoras. Refresca la página para ver los cambios.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleRefresh}
                    className="bg-esm-gold text-black text-xs font-medium py-1.5 px-3 rounded hover:bg-yellow-400 transition-colors"
                  >
                    Refrescar
                  </button>
                  <button
                    onClick={() => setShowNotification(false)}
                    className="text-gray-400 text-xs hover:text-white transition-colors"
                  >
                    Más tarde
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}