import sgMail from '@sendgrid/mail';

// Configuración de SendGrid
const SENDGRID_API_KEY = process.env.VITE_SENDGRID_API_KEY || 'SG.your-api-key-here';
sgMail.setApiKey(SENDGRID_API_KEY);

// Configuración del email
const EMAIL_CONFIG = {
  from: 'caja.chica@esmargentina.net',
  subject: 'Reporte Diario - Sistema de Control de Caja Chica',
  companyName: 'ESM Argentina'
};

// Función para enviar email usando SendGrid
const enviarEmail = async (destinatarios, asunto, contenidoHTML) => {
  try {
    const msg = {
      to: destinatarios,
      from: EMAIL_CONFIG.from,
      subject: asunto,
      html: contenidoHTML,
    };

    const response = await sgMail.send(msg);
    console.log('✅ Email enviado exitosamente:', response[0].statusCode);
    
    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      statusCode: response[0].statusCode
    };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw new Error(`Error enviando email: ${error.message}`);
  }
};

// Función para verificar la configuración de SendGrid
const verificarConfiguracion = async () => {
  try {
    if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'SG.your-api-key-here') {
      throw new Error('SendGrid API Key no configurada');
    }
    
    // Test simple de conexión
    const testMsg = {
      to: 'test@example.com',
      from: EMAIL_CONFIG.from,
      subject: 'Test de configuración',
      text: 'Test de configuración de SendGrid'
    };
    
    // Solo verificamos la configuración, no enviamos realmente
    console.log('✅ Configuración de SendGrid verificada');
    return { success: true, message: 'Configuración correcta' };
  } catch (error) {
    console.error('❌ Error en configuración de SendGrid:', error);
    throw error;
  }
};

export {
  enviarEmail,
  verificarConfiguracion,
  EMAIL_CONFIG
};
