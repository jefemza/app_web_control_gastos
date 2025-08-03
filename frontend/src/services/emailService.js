import emailjs from '@emailjs/browser';

// Configuración de EmailJS
const EMAIL_SERVICE_ID = 'service_esm_gastos';
const EMAIL_TEMPLATE_ID_APPROVAL = 'template_approval';
const EMAIL_TEMPLATE_ID_REJECTION = 'template_rejection';
const EMAIL_TEMPLATE_ID_PENDING = 'template_pending';
const EMAIL_PUBLIC_KEY = 'public_key_placeholder';

// Inicializar EmailJS
emailjs.init(EMAIL_PUBLIC_KEY);

// Plantillas de email
const EMAIL_TEMPLATES = {
  approval: {
    subject: '✅ Gasto Aprobado - Control de Caja Chica ESM',
    getBody: (gasto, comentario = '') => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #000000, #1a1a1a); color: #D4AF37; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
        .amount { font-size: 24px; font-weight: bold; color: #10b981; }
        .details { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #D4AF37; }
        .comment { background: #e6f7ff; padding: 15px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 ESM Argentina</h1>
            <h2>Control de Caja Chica</h2>
        </div>
        <div class="content">
            <h2 style="color: #10b981;">✅ Gasto Aprobado</h2>
            <p>Estimado/a <strong>${gasto.usuario}</strong>,</p>
            <p>Su gasto ha sido <strong style="color: #10b981;">APROBADO</strong> por el administrador.</p>
            
            <div class="details">
                <h3>Detalles del Gasto:</h3>
                <p><strong>Monto:</strong> <span class="amount">$${gasto.monto?.toLocaleString('es-AR')}</span></p>
                <p><strong>Categoría:</strong> ${gasto.categoria}</p>
                <p><strong>Descripción:</strong> ${gasto.descripcion}</p>
                <p><strong>Fecha:</strong> ${new Date(gasto.fecha).toLocaleDateString('es-AR')}</p>
                <p><strong>Medio