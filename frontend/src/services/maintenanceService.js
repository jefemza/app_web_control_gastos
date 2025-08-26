// ========================================
// 🧹 Servicio de Mantenimiento - Reset de Aplicación
// ========================================
import { deleteAllGastos } from './gastosService';
import { deleteAllFondos } from './fondosService';
import { auditService } from './auditService';

class MaintenanceService {
  async resetApp(user) {
    if (!user || user.role !== 'superadmin') {
      throw new Error('Solo SUPERADMIN puede resetear la aplicación');
    }

    // 1) Eliminar gastos
    const gastosRes = await deleteAllGastos(user);

    // 2) Eliminar fondos
    const fondosRes = await deleteAllFondos(user, auditService);

    // 3) Auditoría del reset
    try {
      await auditService.logAction({
        usuarioId: user.id || user.uid,
        usuarioEmail: user.email,
        usuarioNombre: user.name,
        accion: 'RESET_APLICACION',
        entidad: 'sistema',
        entidadId: 'reset-total',
        detalles: `Reset total: gastos eliminados=${gastosRes.deletedCount}, fondos eliminados=${fondosRes.deletedCount}`
      });
    } catch (e) {
      console.error('Audit reset error', e);
    }

    return { success: true, gastos: gastosRes.deletedCount, fondos: fondosRes.deletedCount };
  }
}

export const maintenanceService = new MaintenanceService();
export default maintenanceService;
