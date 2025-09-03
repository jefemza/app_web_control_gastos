import { useState, useEffect } from 'react';
import Joyride from 'react-joyride';
import { HelpCircle, X } from 'lucide-react';

const TutorialInteractivo = ({ user, isFirstTime }) => {
  const [runTutorial, setRunTutorial] = useState(false);
  const [showHelpButton, setShowHelpButton] = useState(false);

  useEffect(() => {
    // Mostrar tutorial solo si es la primera vez
    if (isFirstTime) {
      setRunTutorial(true);
    }
    
    // Mostrar botón de ayuda después de 5 segundos
    const timer = setTimeout(() => {
      setShowHelpButton(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isFirstTime]);

  // Pasos del tutorial según el rol del usuario
  const getTutorialSteps = () => {
    const baseSteps = [
      {
        target: 'body',
        content: (
          <div className="text-center">
            <h3 className="text-lg font-bold text-esm-gold mb-2">¡Bienvenido al Sistema de Control de Caja Chica!</h3>
            <p className="text-sm">Te guiaremos a través de las principales funciones del sistema.</p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '.dashboard-stats',
        content: (
          <div>
            <h4 className="font-bold text-esm-gold mb-2">📊 Dashboard Principal</h4>
            <p className="text-sm">Aquí verás un resumen completo de:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Fondos disponibles</li>
              <li>• Gastos pendientes</li>
              <li>• Estadísticas del mes</li>
              <li>• Gráficos de tendencias</li>
            </ul>
          </div>
        ),
        placement: 'bottom',
      },
      {
        target: '.nav-menu',
        content: (
          <div>
            <h4 className="font-bold text-esm-gold mb-2">🧭 Navegación Principal</h4>
            <p className="text-sm">Accede rápidamente a todas las funciones:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• <strong>Registrar Gasto:</strong> Crear nuevos gastos</li>
              <li>• <strong>Vista Gastos:</strong> Ver y gestionar gastos</li>
              <li>• <strong>Panel Control:</strong> Aprobar/rechazar gastos</li>
              <li>• <strong>Gestión Fondos:</strong> Administrar ingresos</li>
            </ul>
          </div>
        ),
        placement: 'bottom',
      }
    ];

    // Pasos específicos según el rol
    if (user?.role === 'superadmin') {
      return [
        ...baseSteps,
        {
          target: '.admin-tools',
          content: (
            <div>
              <h4 className="font-bold text-esm-gold mb-2">⚙️ Herramientas de Administración</h4>
              <p className="text-sm">Como SUPERADMIN tienes acceso a:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• <strong>Auditoría:</strong> Ver todos los cambios del sistema</li>
                <li>• <strong>Gestión Usuarios:</strong> Crear y administrar usuarios</li>
                <li>• <strong>Reset Total:</strong> Restaurar la aplicación</li>
                <li>• <strong>Importar/Exportar:</strong> Gestión masiva de datos</li>
              </ul>
            </div>
          ),
          placement: 'left',
        },
        {
          target: '.user-management',
          content: (
            <div>
              <h4 className="font-bold text-esm-gold mb-2">👥 Gestión de Usuarios</h4>
              <p className="text-sm">Puedes:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Crear nuevos usuarios</li>
                <li>• Asignar roles y permisos</li>
                <li>• Activar/desactivar cuentas</li>
                <li>• Ver estadísticas de uso</li>
              </ul>
            </div>
          ),
          placement: 'left',
        }
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...baseSteps,
        {
          target: '.admin-tools',
          content: (
            <div>
              <h4 className="font-bold text-esm-gold mb-2">⚙️ Herramientas de Contaduría</h4>
              <p className="text-sm">Como ADMIN puedes:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• <strong>Gestionar Fondos:</strong> Controlar ingresos y saldos</li>
                <li>• <strong>Importar/Exportar:</strong> Gestión masiva de gastos</li>
                <li>• <strong>Crear Usuarios:</strong> Agregar operadores</li>
                <li>• <strong>Aprobar Gastos:</strong> Control total de aprobaciones</li>
              </ul>
            </div>
          ),
          placement: 'left',
        }
      ];
    }

    if (user?.role === 'socio') {
      return [
        ...baseSteps,
        {
          target: '.expense-tracking',
          content: (
            <div>
              <h4 className="font-bold text-esm-gold mb-2">📈 Seguimiento de Gastos</h4>
              <p className="text-sm">Como SOCIO puedes:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• <strong>Registrar Gastos:</strong> Crear nuevos gastos</li>
                <li>• <strong>Ver Todos los Gastos:</strong> Seguimiento completo</li>
                <li>• <strong>Adjuntar Comprobantes:</strong> Subir imágenes</li>
                <li>• <strong>Ver Estadísticas:</strong> Gráficos y reportes</li>
              </ul>
            </div>
          ),
          placement: 'left',
        }
      ];
    }

    // Usuario básico
    return [
      ...baseSteps,
      {
        target: '.basic-functions',
        content: (
          <div>
            <h4 className="font-bold text-esm-gold mb-2">📝 Funciones Básicas</h4>
            <p className="text-sm">Como USUARIO puedes:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• <strong>Registrar Gastos:</strong> Crear nuevos gastos</li>
              <li>• <strong>Ver Tus Gastos:</strong> Seguimiento personal</li>
              <li>• <strong>Adjuntar Comprobantes:</strong> Subir imágenes</li>
              <li>• <strong>Ver Estado:</strong> Pendiente/Aprobado/Rechazado</li>
            </ul>
          </div>
        ),
        placement: 'left',
      }
    ];
  };

  const handleTutorialComplete = () => {
    setRunTutorial(false);
    // Marcar que ya vio el tutorial
    localStorage.setItem('tutorialCompleted', 'true');
  };

  const handleTutorialSkip = () => {
    setRunTutorial(false);
    localStorage.setItem('tutorialCompleted', 'true');
  };

  const restartTutorial = () => {
    setRunTutorial(true);
  };

  return (
    <>
      {/* Tutorial principal */}
      <Joyride
        steps={getTutorialSteps()}
        run={runTutorial}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        styles={{
          options: {
            primaryColor: '#f59e0b', // esm-gold
            backgroundColor: '#1f2937', // dark background
            textColor: '#f9fafb',
            arrowColor: '#1f2937',
            overlayColor: 'rgba(0, 0, 0, 0.8)',
          },
          tooltip: {
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            padding: '16px',
          },
          buttonNext: {
            backgroundColor: '#f59e0b',
            color: '#1f2937',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontWeight: 'bold',
          },
          buttonBack: {
            color: '#f59e0b',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            padding: '8px 16px',
          },
          buttonSkip: {
            color: '#9ca3af',
            border: 'none',
          },
          buttonClose: {
            color: '#9ca3af',
          },
        }}
        locale={{
          back: 'Anterior',
          close: 'Cerrar',
          last: 'Finalizar',
          next: 'Siguiente',
          skip: 'Saltar',
        }}
        callback={(data) => {
          const { action, status } = data;
          if (action === 'close' || action === 'skip') {
            handleTutorialSkip();
          } else if (status === 'finished') {
            handleTutorialComplete();
          }
        }}
      />

      {/* Botón de ayuda flotante */}
      {showHelpButton && !runTutorial && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={restartTutorial}
            className="bg-esm-gold hover:bg-yellow-500 text-gray-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
            title="Ver tutorial de nuevo"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Ver tutorial
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default TutorialInteractivo;
