// ========================================
// 🧹 Botón de Limpieza y Creación de Usuarios
// ========================================
// Desarrollado por: Claude AI Assistant
// "Siempre aquí para ayudar y resolver problemas técnicos"
// Última actualización: 2025-08-26
// ========================================

import { useState } from 'react';
import { RefreshCw, Users, AlertTriangle } from 'lucide-react';
import { executeUserCleanup } from '../scripts/cleanupAndCreateUsers';
import { auditService } from '../services/auditService';

export default function UserCleanupButton({ user }) {
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleCleanup = async () => {
    if (!user || user.role !== 'superadmin') {
      alert('Solo SUPERADMIN puede ejecutar esta acción');
      return;
    }

    const confirmacion = confirm(
      '⚠️ ATENCIÓN: Esta acción eliminará TODOS los usuarios existentes y creará los 4 usuarios correctos.\n\n' +
      'Usuarios que se crearán:\n' +
      '• Luis Sergio Tello (superadmin)\n' +
      '• Noelia Albornoz (admin)\n' +
      '• Juan Pablo Rua (socio)\n' +
      '• Eugenio Cavallaro (socio)\n\n' +
      'Contraseña para todos: "esm2025"\n\n' +
      '¿Confirmas que quieres proceder?'
    );

    if (!confirmacion) return;

    try {
      setProcesando(true);
      setResultado(null);

      console.log('🚀 Iniciando limpieza y creación de usuarios...');
      
      const resultado = await executeUserCleanup();
      
      // Auditoría
      await auditService.logAction({
        usuarioId: user.id || user.uid,
        usuarioEmail: user.email,
        usuarioNombre: user.name,
        accion: 'LIMPIEZA_USUARIOS',
        entidad: 'usuarios',
        entidadId: 'cleanup-completo',
        detalles: `Limpieza completa: ${resultado.deletedCount} eliminados, ${resultado.createdUsers.length} creados`,
        valorNuevo: resultado
      });

      setResultado(resultado);
      
      alert(
        '✅ Limpieza completada exitosamente!\n\n' +
        `📊 Resumen:\n` +
        `• Usuarios eliminados: ${resultado.deletedCount}\n` +
        `• Usuarios creados: ${resultado.createdUsers.length}\n\n` +
        '🔑 Contraseña para todos: "esm2025"\n\n' +
        'La página se recargará en 3 segundos...'
      );

      // Recargar página después de 3 segundos
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('❌ Error en limpieza:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setProcesando(false);
    }
  };

  // Solo mostrar para SUPERADMIN
  if (user?.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="bg-black/20 rounded-lg p-4">
      <h4 className="text-white font-medium mb-2 flex items-center">
        <Users className="w-5 h-5 mr-2 text-yellow-400" />
        🧹 Limpiar y Crear Usuarios
      </h4>
      <p className="text-gray-400 text-sm mb-3">
        Elimina todos los usuarios existentes y crea los 4 usuarios correctos con contraseña "esm2025".
      </p>
      
      <div className="space-y-2 mb-3">
        <div className="text-xs text-gray-500">
          <strong>Usuarios a crear:</strong>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <div>• Luis Sergio Tello (superadmin) - luistelloiphone@gmail.com</div>
          <div>• Noelia Albornoz (admin) - noeliaalbornoz1@gmail.com</div>
          <div>• Juan Pablo Rua (socio) - pablorua@hotmail.com</div>
          <div>• Eugenio Cavallaro (socio) - eugenion.cavallaro@gmail.com</div>
        </div>
      </div>

      <button
        onClick={handleCleanup}
        disabled={procesando}
        className="w-full px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        {procesando ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Procesando...</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4" />
            <span>Ejecutar Limpieza Completa</span>
          </>
        )}
      </button>

      {resultado && (
        <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded text-xs">
          <div className="text-green-400 font-medium">✅ Completado</div>
          <div className="text-green-400">
            Eliminados: {resultado.deletedCount} | Creados: {resultado.createdUsers.length}
          </div>
        </div>
      )}
    </div>
  );
}
