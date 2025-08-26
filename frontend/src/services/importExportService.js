// ========================================
// 📊 Servicio de Importación/Exportación - ESM Argentina
// ========================================
// Desarrollado por: Claude AI Assistant
// "Siempre aquí para ayudar y resolver problemas técnicos"
// Última actualización: 2025-08-26
// ========================================

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createGasto } from './gastosService';
import { auditService } from './auditService';
import { CATEGORIAS_GASTOS, MEDIOS_PAGO } from '../constants/categorias';

class ImportExportService {
  /**
   * Exportar gastos a CSV con formato para importación
   * @param {Array} gastos - Lista de gastos a exportar
   * @returns {string} - CSV con formato para importación
   */
  exportGastosForImport(gastos = []) {
    // Headers para el template de importación
    const headers = [
      'fecha',
      'monto',
      'categoria',
      'descripcion',
      'medioPago',
      'comprobante'
    ];

    // Crear filas de ejemplo
    const exampleRows = [
      {
        fecha: '2025-01-15',
        monto: '1500.00',
        categoria: 'supermercado',
        descripcion: 'Compra de insumos para oficina',
        medioPago: 'efectivo',
        comprobante: 'Factura A-001-00000001'
      },
      {
        fecha: '2025-01-16',
        monto: '2500.00',
        categoria: 'libreria',
        descripcion: 'Material de oficina',
        medioPago: 'transferencia',
        comprobante: 'Factura B-001-00000002'
      }
    ];

    // Crear CSV
    const csvRows = [
      headers.join(','),
      ...exampleRows.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value !== undefined && value !== null ? value : '';
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  /**
   * Validar datos de importación
   * @param {Array} data - Datos a validar
   * @returns {Object} - Resultado de validación
   */
  validateImportData(data) {
    const errors = [];
    const warnings = [];
    const validData = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 porque la primera fila es header
      const rowErrors = [];
      const rowWarnings = [];

      // Validar campos requeridos
      if (!row.fecha) {
        rowErrors.push('Fecha es requerida');
      } else {
        const fecha = new Date(row.fecha);
        if (isNaN(fecha.getTime())) {
          rowErrors.push('Fecha inválida');
        }
      }

      if (!row.monto) {
        rowErrors.push('Monto es requerido');
      } else {
        const monto = parseFloat(row.monto);
        if (isNaN(monto) || monto <= 0) {
          rowErrors.push('Monto debe ser un número positivo');
        }
      }

      if (!row.categoria) {
        rowErrors.push('Categoría es requerida');
      } else if (!CATEGORIAS_GASTOS.includes(row.categoria.toLowerCase())) {
        rowErrors.push(`Categoría inválida. Opciones válidas: ${CATEGORIAS_GASTOS.join(', ')}`);
      }

      if (!row.descripcion) {
        rowErrors.push('Descripción es requerida');
      }

      if (!row.medioPago) {
        rowErrors.push('Medio de pago es requerido');
      } else if (!MEDIOS_PAGO.includes(row.medioPago.toLowerCase())) {
        rowErrors.push(`Medio de pago inválido. Opciones válidas: ${MEDIOS_PAGO.join(', ')}`);
      }

      // Normalizar datos
      const normalizedRow = {
        fecha: row.fecha ? new Date(row.fecha).toISOString().split('T')[0] : null,
        monto: row.monto ? parseFloat(row.monto) : null,
        categoria: row.categoria ? row.categoria.toLowerCase() : null,
        descripcion: row.descripcion ? row.descripcion.trim() : null,
        medioPago: row.medioPago ? row.medioPago.toLowerCase() : null,
        comprobante: row.comprobante ? row.comprobante.trim() : null
      };

      if (rowErrors.length > 0) {
        errors.push({
          row: rowNumber,
          errors: rowErrors,
          data: row
        });
      } else {
        // Advertencias
        if (normalizedRow.monto > 10000) {
          rowWarnings.push('Monto muy alto - verificar');
        }
        if (normalizedRow.descripcion.length < 5) {
          rowWarnings.push('Descripción muy corta');
        }

        if (rowWarnings.length > 0) {
          warnings.push({
            row: rowNumber,
            warnings: rowWarnings,
            data: normalizedRow
          });
        }

        validData.push(normalizedRow);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      validData,
      totalRows: data.length,
      validRows: validData.length,
      errorRows: errors.length
    };
  }

  /**
   * Importar gastos masivamente
   * @param {Array} gastosData - Datos validados de gastos
   * @param {Object} user - Usuario que realiza la importación
   * @returns {Object} - Resultado de la importación
   */
  async importGastos(gastosData, user) {
    try {
      const results = {
        success: 0,
        errors: 0,
        details: []
      };

      // Importar cada gasto
      for (const gastoData of gastosData) {
        try {
          const gastoToCreate = {
            ...gastoData,
            usuarioId: user.id || user.uid,
            usuario: user.name,
            estado: 'pendiente',
            comentarioAdmin: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          await createGasto(gastoToCreate, user);
          results.success++;
          results.details.push({
            gasto: gastoData,
            status: 'success',
            message: 'Gasto importado correctamente'
          });
        } catch (error) {
          results.errors++;
          results.details.push({
            gasto: gastoData,
            status: 'error',
            message: error.message
          });
        }
      }

      // Registrar en auditoría
      try {
        await auditService.logAction({
          usuarioId: user.id || user.uid,
          usuarioEmail: user.email,
          usuarioNombre: user.name,
          accion: 'IMPORTAR_GASTOS_MASIVO',
          entidad: 'gastos',
          entidadId: 'masivo',
          detalles: `Importación masiva: ${results.success} exitosos, ${results.errors} errores`,
          valorNuevo: {
            totalImportados: results.success,
            totalErrores: results.errors,
            gastos: gastosData
          }
        });
      } catch (auditError) {
        console.error('Error registrando auditoría de importación:', auditError);
      }

      return results;
    } catch (error) {
      console.error('Error en importación masiva:', error);
      throw error;
    }
  }

  /**
   * Procesar archivo CSV
   * @param {File} file - Archivo CSV a procesar
   * @returns {Promise<Array>} - Datos procesados
   */
  async processCSVFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csv = event.target.result;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const data = [];
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
              const row = {};
              
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              
              data.push(row);
            }
          }
          
          resolve(data);
        } catch (error) {
          reject(new Error('Error procesando archivo CSV: ' + error.message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error leyendo archivo'));
      };
      
      reader.readAsText(file);
    });
  }
}

export const importExportService = new ImportExportService();
export default importExportService;
