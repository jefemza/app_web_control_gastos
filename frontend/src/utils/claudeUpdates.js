// Utilidad para actualizar la versión cuando Claude hace cambios
export const updateClaudeVersion = () => {
  const newVersion = {
    version: `1.0.${Date.now()}`,
    lastUpdate: new Date().toISOString(),
    message: "Claude ha aplicado nuevos cambios"
  };
  
  // En desarrollo, esto actualizaría el archivo
  // En producción, se haría a través de una API
  console.log('Nueva versión generada:', newVersion);
  
  return newVersion;
};

// Hook para detectar cambios
export const useClaudeUpdates = (callback) => {
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch('/claude-version.json?' + Date.now());
        const data = await response.json();
        const storedVersion = localStorage.getItem('claude-version');
        
        if (storedVersion && storedVersion !== data.version) {
          callback(data);
        }
        
        localStorage.setItem('claude-version', data.version);
      } catch (error) {
        console.error('Error checking updates:', error);
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [callback]);
};