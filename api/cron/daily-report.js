// Función del servidor para el cron job de envío automático de reportes
// Se ejecuta diariamente a las 00:00 UTC (21:00 hora Argentina)

import sgMail from '@sendgrid/mail';

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configuración del email
const EMAIL_CONFIG = {
  from: 'caja.chica@esmargentina.net',
  subject: 'Reporte Diario - Sistema de Control de Caja Chica',
  companyName: 'ESM Argentina'
};

// Destinatarios fijos (los tres socios)
const DESTINATARIOS = [
  'luistelloiphone@gmail.com',     // Luis Sergio Tello (SUPERADMIN)
  'pablorua@hotmail.com',          // Juan Pablo Rúa (SOCIO)
  'eugenion.cavallaro@gmail.com'   // Eugenio Cavallaro (SOCIO)
];

// Función para obtener datos del día desde Firestore
const obtenerDatosDelDia = async () => {
  // Aquí se conectaría a Firestore para obtener los datos
  // Por ahora, simulamos los datos
  return {
    gastos: [],
    fondos: [],
    fecha: new Date().toLocaleDateString('es-AR')
  };
};

// Función para generar el HTML del reporte
const generarHTMLReporte = (datos) => {
  const fechaFormateada = new Date().toLocaleDateString('es-AR', {
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
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 0.9em;
        }
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

// Función principal del cron job
export default async function handler(req, res) {
  // Verificar que es una llamada del cron job
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('⏰ Ejecutando cron job de reporte diario...');
    
    // Obtener datos del día
    const datos = await obtenerDatosDelDia();
    
    // Generar HTML del reporte
    const htmlContent = generarHTMLReporte(datos);
    
    // Configurar el email
    const asunto = `${EMAIL_CONFIG.subject} - ${datos.fecha}`;
    
    // Enviar email a todos los destinatarios
    const msg = {
      to: DESTINATARIOS,
      from: EMAIL_CONFIG.from,
      subject: asunto,
      html: htmlContent,
    };

    const response = await sgMail.send(msg);
    
    console.log('✅ Reporte diario enviado exitosamente a', DESTINATARIOS.length, 'destinatarios');
    console.log('📧 Status:', response[0].statusCode);
    
    return res.status(200).json({
      success: true,
      message: 'Reporte diario enviado correctamente',
      destinatarios: DESTINATARIOS.length,
      statusCode: response[0].statusCode,
      messageId: response[0].headers['x-message-id']
    });
    
  } catch (error) {
    console.error('❌ Error en cron job de reporte diario:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
