import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { enviarEmail, verificarConfiguracion } from './sendGridService';
import { crearCronJob, verificarCronJob, CRON_CONFIG } from './cronJobService';

// Configuración del email oficial
const EMAIL_CONFIG = {
  from: 'caja.chica@esmargentina.net',
  subject: 'Reporte Diario - Sistema de Control de Caja Chica',
  companyName: 'ESM Argentina'
};

// Función para obtener datos del día
const getDatosDelDia = async (fecha = new Date()) => {
  const inicioDia = new Date(fecha);
  inicioDia.setHours(0, 0, 0, 0);
  
  const finDia = new Date(fecha);
  finDia.setHours(23, 59, 59, 999);

  try {
    // Obtener gastos del día
    const gastosQuery = query(
      collection(db, 'gastos'),
      where('fecha', '>=', inicioDia),
      where('fecha', '<=', finDia),
      orderBy('fecha', 'desc')
    );
    
    const gastosSnapshot = await getDocs(gastosQuery);
    const gastos = gastosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Obtener fondos del día
    const fondosQuery = query(
      collection(db, 'fondos'),
      where('fecha', '>=', inicioDia),
      where('fecha', '<=', finDia),
      orderBy('fecha', 'desc')
    );
    
    const fondosSnapshot = await getDocs(fondosQuery);
    const fondos = fondosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { gastos, fondos };
  } catch (error) {
    console.error('Error obteniendo datos del día:', error);
    throw error;
  }
};

// Función para generar el HTML del reporte
const generarHTMLReporte = (datos, fecha) => {
  const fechaFormateada = fecha.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalGastos = datos.gastos.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);
  const totalFondos = datos.fondos.reduce((sum, f) => sum + parseFloat(f.monto || 0), 0);
  const balance = totalFondos - totalGastos;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reporte Diario - ${EMAIL_CONFIG.companyName}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .header {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
          margin-bottom: 0;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 0 0 10px 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .stat-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border-left: 4px solid #f59e0b;
        }
        .stat-number {
          font-size: 2em;
          font-weight: bold;
          color: #f59e0b;
          margin-bottom: 5px;
        }
        .stat-label {
          color: #666;
          font-size: 0.9em;
        }
        .section {
          margin: 30px 0;
        }
        .section-title {
          color: #f59e0b;
          border-bottom: 2px solid #f59e0b;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .gasto-item {
          background: #f8f9fa;
          padding: 15px;
          margin: 10px 0;
          border-radius: 6px;
          border-left: 3px solid #28a745;
        }
        .fondo-item {
          background: #f8f9fa;
          padding: 15px;
          margin: 10px 0;
          border-radius: 6px;
          border-left: 3px solid #007bff;
        }
        .amount {
          font-weight: bold;
          color: #f59e0b;
        }
        .status-pendiente { color: #ffc107; }
        .status-aprobado { color: #28a745; }
        .status-rechazado { color: #dc3545; }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 0.9em;
        }
        .balance-positive { color: #28a745; }
        .balance-negative { color: #dc3545; }
        .balance-zero { color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Reporte Diario</h1>
        <h2>Sistema de Control de Caja Chica</h2>
        <p><strong>${EMAIL_CONFIG.companyName}</strong></p>
        <p>${fechaFormateada}</p>
      </div>
      
      <div class="content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${datos.gastos.length}</div>
            <div class="stat-label">Gastos Registrados</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">$${totalGastos.toLocaleString('es-AR')}</div>
            <div class="stat-label">Total Gastos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${datos.fondos.length}</div>
            <div class="stat-label">Ingresos de Fondos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">$${totalFondos.toLocaleString('es-AR')}</div>
            <div class="stat-label">Total Ingresos</div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">💰 Balance del Día</h3>
          <div class="stat-card">
            <div class="stat-number ${balance > 0 ? 'balance-positive' : balance < 0 ? 'balance-negative' : 'balance-zero'}">
              $${balance.toLocaleString('es-AR')}
            </div>
            <div class="stat-label">
              ${balance > 0 ? 'Superávit' : balance < 0 ? 'Déficit' : 'Balance Cero'}
            </div>
          </div>
        </div>

        ${datos.gastos.length > 0 ? `
        <div class="section">
          <h3 class="section-title">📝 Gastos Registrados</h3>
          ${datos.gastos.map(gasto => `
            <div class="gasto-item">
              <strong>${gasto.descripcion}</strong><br>
              <span class="amount">$${parseFloat(gasto.monto).toLocaleString('es-AR')}</span> - 
              ${gasto.categoria}<br>
              <small>
                Registrado por: ${gasto.usuarioNombre || 'N/A'} | 
                Estado: <span class="status-${gasto.estado}">${gasto.estado.toUpperCase()}</span> |
                ${gasto.fecha ? new Date(gasto.fecha.toDate()).toLocaleString('es-AR') : 'Sin fecha'}
              </small>
            </div>
          `).join('')}
        </div>
        ` : '<div class="section"><h3 class="section-title">📝 Gastos Registrados</h3><p>No se registraron gastos hoy.</p></div>'}

        ${datos.fondos.length > 0 ? `
        <div class="section">
          <h3 class="section-title">💵 Ingresos de Fondos</h3>
          ${datos.fondos.map(fondo => `
            <div class="fondo-item">
              <strong>${fondo.descripcion}</strong><br>
              <span class="amount">$${parseFloat(fondo.monto).toLocaleString('es-AR')}</span><br>
              <small>
                Registrado por: ${fondo.usuarioNombre || 'N/A'} |
                ${fondo.fecha ? new Date(fondo.fecha.toDate()).toLocaleString('es-AR') : 'Sin fecha'}
              </small>
            </div>
          `).join('')}
        </div>
        ` : '<div class="section"><h3 class="section-title">💵 Ingresos de Fondos</h3><p>No se registraron ingresos hoy.</p></div>'}

        <div class="footer">
          <p>Este reporte fue generado automáticamente por el Sistema de Control de Caja Chica</p>
          <p>Para consultas, contactar a la administración</p>
          <p><strong>${EMAIL_CONFIG.companyName}</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Función para enviar el reporte por email
const enviarReporteDiario = async (destinatarios, fecha = new Date()) => {
  try {
    // Verificar configuración de SendGrid
    await verificarConfiguracion();
    
    // Obtener datos del día
    const datos = await getDatosDelDia(fecha);
    
    // Generar HTML del reporte
    const htmlContent = generarHTMLReporte(datos, fecha);
    
    // Configurar el email
    const asunto = `${EMAIL_CONFIG.subject} - ${fecha.toLocaleDateString('es-AR')}`;
    
    // Enviar email usando SendGrid
    const resultado = await enviarEmail(destinatarios, asunto, htmlContent);
    
    // Guardar registro del envío en Firestore
    const registroEnvio = {
      fecha: serverTimestamp(),
      destinatarios: destinatarios,
      asunto: asunto,
      success: resultado.success,
      messageId: resultado.messageId,
      statusCode: resultado.statusCode,
      datos: {
        gastos: datos.gastos.length,
        fondos: datos.fondos.length,
        totalGastos: datos.gastos.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0),
        totalFondos: datos.fondos.reduce((sum, f) => sum + parseFloat(f.monto || 0), 0)
      }
    };
    
    await addDoc(collection(db, 'reportes_enviados'), registroEnvio);
    
    console.log('📧 Reporte diario enviado exitosamente a', destinatarios.length, 'destinatarios');
    
    return {
      success: true,
      message: 'Reporte enviado correctamente',
      destinatarios: destinatarios.length,
      fecha: fecha.toLocaleDateString('es-AR'),
      messageId: resultado.messageId,
      datos: registroEnvio.datos
    };

  } catch (error) {
    console.error('Error enviando reporte diario:', error);
    
    // Guardar registro de error
    try {
      await addDoc(collection(db, 'reportes_enviados'), {
        fecha: serverTimestamp(),
        destinatarios: destinatarios,
        success: false,
        error: error.message
      });
    } catch (dbError) {
      console.error('Error guardando registro de error:', dbError);
    }
    
    throw error;
  }
};

// Función para programar envío automático
const programarReporteAutomatico = async (destinatarios, horaEnvio = '21:00') => {
  try {
    // Verificar configuración de SendGrid
    await verificarConfiguracion();
    
    // Crear cron job en Vercel
    const cronJobResult = await crearCronJob();
    
    // Guardar configuración del cron job en Firestore
    const configuracionCron = {
      fecha: serverTimestamp(),
      destinatarios: destinatarios,
      horaEnvio: horaEnvio,
      schedule: CRON_CONFIG.schedule,
      timezone: CRON_CONFIG.timezone,
      active: true
    };
    
    await addDoc(collection(db, 'configuracion_cron'), configuracionCron);
    
    console.log(`⏰ Reporte automático programado para las ${horaEnvio} (hora Argentina)`);
    console.log(`🌍 Cron job: ${CRON_CONFIG.schedule} (${CRON_CONFIG.timezone})`);
    console.log(`📧 Destinatarios: ${destinatarios.join(', ')}`);
    console.log(`📅 Frecuencia: Diario`);
    
    return {
      success: true,
      message: `Reporte automático programado correctamente para las ${horaEnvio} (hora Argentina)`,
      horaEnvio: horaEnvio,
      schedule: CRON_CONFIG.schedule,
      timezone: CRON_CONFIG.timezone,
      destinatarios,
      cronJobId: cronJobResult.success ? 'active' : 'pending'
    };
    
  } catch (error) {
    console.error('Error programando reporte automático:', error);
    throw error;
  }
};

// Función para obtener estadísticas de reportes
const obtenerEstadisticasReportes = async (fechaInicio, fechaFin) => {
  try {
    const reportesQuery = query(
      collection(db, 'reportes_enviados'),
      where('fecha', '>=', fechaInicio),
      where('fecha', '<=', fechaFin),
      orderBy('fecha', 'desc')
    );
    
    const reportesSnapshot = await getDocs(reportesQuery);
    const reportes = reportesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      totalEnviados: reportes.length,
      exitosos: reportes.filter(r => r.success).length,
      fallidos: reportes.filter(r => !r.success).length,
      reportes
    };
    
  } catch (error) {
    console.error('Error obteniendo estadísticas de reportes:', error);
    throw error;
  }
};

// Función para verificar el estado del cron job
const verificarEstadoCronJob = async () => {
  try {
    const estado = await verificarCronJob();
    return estado;
  } catch (error) {
    console.error('Error verificando estado del cron job:', error);
    throw error;
  }
};

export {
  enviarReporteDiario,
  programarReporteAutomatico,
  obtenerEstadisticasReportes,
  verificarEstadoCronJob,
  getDatosDelDia,
  generarHTMLReporte,
  EMAIL_CONFIG
};
