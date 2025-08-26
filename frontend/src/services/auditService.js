// ========================================
// 📋 Servicio de Auditoría - ESM Argentina
// ========================================
// Desarrollado por: Claude AI Assistant
// "Siempre aquí para ayudar y resolver problemas técnicos"
// Última actualización: 2025-08-26
// ========================================

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  limit,
  startAfter,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

class AuditService {
  constructor() {
    this.auditCollection = 'auditoria';
  }

  /**
   * Registrar una acción en el log de auditoría
   * @param {Object} auditData - Datos de la auditoría
   * @returns {Promise<string>} - ID del registro de auditoría
   */
  async logAction(auditData) {
    try {
      const {
        usuarioId,
        usuarioEmail,
        usuarioNombre,
        accion,
        entidad,
        entidadId,
        detalles,
        valorAnterior,
        valorNuevo,
        ip = 'N/A',
        userAgent = 'N/A'
      } = auditData;

      const auditRecord = {
        timestamp: new Date(),
        usuarioId,
        usuarioEmail,
        usuarioNombre,
        accion,
        entidad,
        entidadId,
        detalles,
        valorAnterior: valorAnterior ? JSON.stringify(valorAnterior) : null,
        valorNuevo: valorNuevo ? JSON.stringify(valorNuevo) : null,
        ip,
        userAgent,
        fechaCreacion: new Date()
      };

      const docRef = await addDoc(collection(db, this.auditCollection), auditRecord);
      console.log('Registro de auditoría creado:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error registrando auditoría:', error);
      throw new Error('No se pudo registrar la acción en el log de auditoría');
    }
  }

  /**
   * Registrar creación de gasto
   * @param {Object} user - Usuario que realiza la acción
   * @param {Object} gastoData - Datos del gasto creado
   */
  async logGastoCreado(user, gastoData) {
    await this.logAction({
      usuarioId: user.id || user.uid,
      usuarioEmail: user.email,
      usuarioNombre: user.name,
      accion: 'CREAR_GASTO',
      entidad: 'gastos',
      entidadId: gastoData.id,
      detalles: `Gasto creado: ${gastoData.descripcion} - $${gastoData.monto}`,
      valorNuevo: gastoData
    });
  }

  /**
   * Registrar modificación de gasto
   * @param {Object} user - Usuario que realiza la acción
   * @param {Object} gastoAnterior - Datos anteriores del gasto
   * @param {Object} gastoNuevo - Datos nuevos del gasto
   */
  async logGastoModificado(user, gastoAnterior, gastoNuevo) {
    const cambios = this.detectarCambios(gastoAnterior, gastoNuevo);
    
    await this.logAction({
      usuarioId: user.id || user.uid,
      usuarioEmail: user.email,
      usuarioNombre: user.name,
      accion: 'MODIFICAR_GASTO',
      entidad: 'gastos',
      entidadId: gastoNuevo.id,
      detalles: `Gasto modificado: ${cambios.join(', ')}`,
      valorAnterior: gastoAnterior,
      valorNuevo: gastoNuevo
    });
  }

  /**
   * Registrar eliminación de gasto
   * @param {Object} user - Usuario que realiza la acción
   * @param {Object} gastoEliminado - Datos del gasto eliminado
   */
  async logGastoEliminado(user, gastoEliminado) {
    await this.logAction({
      usuarioId: user.id || user.uid,
      usuarioEmail: user.email,
      usuarioNombre: user.name,
      accion: 'ELIMINAR_GASTO',
      entidad: 'gastos',
      entidadId: gastoEliminado.id,
      detalles: `Gasto eliminado: ${gastoEliminado.descripcion} - $${gastoEliminado.monto}`,
      valorAnterior: gastoEliminado
    });
  }

  /**
   * Registrar aprobación/rechazo de gasto
   * @param {Object} user - Usuario que realiza la acción
   * @param {Object} gasto - Datos del gasto
   * @param {string} accion - 'APROBAR_GASTO' o 'RECHAZAR_GASTO'
   * @param {string} motivo - Motivo del rechazo (opcional)
   */
  async logAprobacionGasto(user, gasto, accion, motivo = '') {
    await this.logAction({
      usuarioId: user.id || user.uid,
      usuarioEmail: user.email,
      usuarioNombre: user.name,
      accion,
      entidad: 'gastos',
      entidadId: gasto.id,
      detalles: `${accion === 'APROBAR_GASTO' ? 'Gasto aprobado' : 'Gasto rechazado'}: ${gasto.descripcion} - $${gasto.monto}${motivo ? ` - Motivo: ${motivo}` : ''}`,
      valorAnterior: gasto,
      valorNuevo: { ...gasto, estado: accion === 'APROBAR_GASTO' ? 'aprobado' : 'rechazado' }
    });
  }

  /**
   * Registrar gestión de fondos
   * @param {Object} user - Usuario que realiza la acción
   * @param {string} accion - Tipo de acción
   * @param {Object} datos - Datos relacionados
   */
  async logGestionFondos(user, accion, datos) {
    await this.logAction({
      usuarioId: user.id || user.uid,
      usuarioEmail: user.email,
      usuarioNombre: user.name,
      accion,
      entidad: 'fondos',
      entidadId: datos.id,
      detalles: `${accion}: $${datos.monto} - ${datos.descripcion || 'Sin descripción'}`,
      valorNuevo: datos
    });
  }

  /**
   * Registrar gestión de usuarios
   * @param {Object} user - Usuario que realiza la acción
   * @param {string} accion - Tipo de acción
   * @param {Object} usuarioGestionado - Datos del usuario gestionado
   */
  async logGestionUsuarios(user, accion, usuarioGestionado) {
    await this.logAction({
      usuarioId: user.id || user.uid,
      usuarioEmail: user.email,
      usuarioNombre: user.name,
      accion,
      entidad: 'usuarios',
      entidadId: usuarioGestionado.id,
      detalles: `${accion}: ${usuarioGestionado.name} (${usuarioGestionado.email}) - Rol: ${usuarioGestionado.role}`,
      valorNuevo: usuarioGestionado
    });
  }

  /**
   * Obtener logs de auditoría
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} - Lista de registros de auditoría
   */
  async getAuditLogs(filters = {}) {
    try {
      let q = collection(db, this.auditCollection);
      
      // Aplicar filtros
      if (filters.usuarioId) {
        q = query(q, where('usuarioId', '==', filters.usuarioId));
      }
      
      if (filters.accion) {
        q = query(q, where('accion', '==', filters.accion));
      }
      
      if (filters.entidad) {
        q = query(q, where('entidad', '==', filters.entidad));
      }
      
      if (filters.fechaDesde) {
        q = query(q, where('timestamp', '>=', filters.fechaDesde));
      }
      
      if (filters.fechaHasta) {
        q = query(q, where('timestamp', '<=', filters.fechaHasta));
      }
      
      // Ordenar por fecha descendente
      q = query(q, orderBy('timestamp', 'desc'));
      
      // Limitar resultados
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }
      
      const querySnapshot = await getDocs(q);
      const logs = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate(),
          fechaCreacion: data.fechaCreacion?.toDate()
        });
      });
      
      return logs;
    } catch (error) {
      console.error('Error obteniendo logs de auditoría:', error);
      throw new Error('No se pudieron obtener los logs de auditoría');
    }
  }

  /**
   * Obtener estadísticas de auditoría
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} - Estadísticas de auditoría
   */
  async getAuditStats(filters = {}) {
    try {
      const logs = await this.getAuditLogs(filters);
      
      const stats = {
        total: logs.length,
        porAccion: {},
        porUsuario: {},
        porEntidad: {},
        ultimas24h: 0,
        ultimaSemana: 0
      };
      
      const ahora = new Date();
      const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
      const haceSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      logs.forEach(log => {
        // Contar por acción
        stats.porAccion[log.accion] = (stats.porAccion[log.accion] || 0) + 1;
        
        // Contar por usuario
        stats.porUsuario[log.usuarioEmail] = (stats.porUsuario[log.usuarioEmail] || 0) + 1;
        
        // Contar por entidad
        stats.porEntidad[log.entidad] = (stats.porEntidad[log.entidad] || 0) + 1;
        
        // Contar últimas 24h
        if (log.timestamp >= hace24h) {
          stats.ultimas24h++;
        }
        
        // Contar última semana
        if (log.timestamp >= haceSemana) {
          stats.ultimaSemana++;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de auditoría:', error);
      throw new Error('No se pudieron obtener las estadísticas de auditoría');
    }
  }

  /**
   * Detectar cambios entre dos objetos
   * @param {Object} anterior - Objeto anterior
   * @param {Object} nuevo - Objeto nuevo
   * @returns {Array} - Lista de cambios detectados
   */
  detectarCambios(anterior, nuevo) {
    const cambios = [];
    const campos = ['descripcion', 'monto', 'categoria', 'estado', 'fecha', 'comprobante'];
    
    campos.forEach(campo => {
      if (anterior[campo] !== nuevo[campo]) {
        cambios.push(`${campo}: "${anterior[campo]}" → "${nuevo[campo]}"`);
      }
    });
    
    return cambios;
  }

  /**
   * Exportar logs de auditoría
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<string>} - CSV con los logs
   */
  async exportAuditLogs(filters = {}) {
    try {
      const logs = await this.getAuditLogs(filters);
      
      // Crear CSV
      const headers = [
        'Fecha',
        'Usuario',
        'Email',
        'Acción',
        'Entidad',
        'ID Entidad',
        'Detalles',
        'IP',
        'User Agent'
      ];
      
      const csvRows = [headers.join(',')];
      
      logs.forEach(log => {
        const row = [
          log.timestamp?.toISOString() || '',
          log.usuarioNombre || '',
          log.usuarioEmail || '',
          log.accion || '',
          log.entidad || '',
          log.entidadId || '',
          `"${(log.detalles || '').replace(/"/g, '""')}"`,
          log.ip || '',
          `"${(log.userAgent || '').replace(/"/g, '""')}"`
        ];
        
        csvRows.push(row.join(','));
      });
      
      return csvRows.join('\n');
    } catch (error) {
      console.error('Error exportando logs de auditoría:', error);
      throw new Error('No se pudieron exportar los logs de auditoría');
    }
  }
}

// Exportar instancia única
export const auditService = new AuditService();
export default auditService;
