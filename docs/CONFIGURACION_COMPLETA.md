# ⚙️ CONFIGURACIÓN COMPLETA DEL SISTEMA

## 🔥 Firebase Configuration

### Proyecto Firebase
- **Project ID**: control-gastos-esm
- **Project Name**: Control de Gastos ESM
- **Default Region**: us-central1
- **Console**: https://console.firebase.google.com/project/control-gastos-esm

### Servicios Habilitados
1. **Authentication**
   - Email/Password habilitado
   - Recuperación de contraseña configurada

2. **Firestore Database**
   - Modo: Production
   - Ubicación: nam5 (us-central)
   - Colecciones principales:
     - `gastos` - Registro de todos los gastos
     - `fondos` - Control de ingresos y saldos
     - `users` - Información de usuarios
     - `notificaciones` - Sistema de notificaciones
     - `auditoria` - Logs de auditoría
     - `configuracion` - Configuración del sistema

3. **Storage**
   - Bucket: control-gastos-esm.appspot.com
   - Carpetas:
     - `/gastos` - Comprobantes de gastos
   - Reglas: Autenticación requerida

### Firebase Security Rules

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios autenticados pueden leer
    match /{document=**} {
      allow read: if request.auth != null;
    }
    
    // Escritura según roles
    match /gastos/{document} {
      allow write: if request.auth != null && 
        (request.auth.token.role in ['admin', 'superadmin', 'user']);
    }
    
    match /fondos/{document} {
      allow write: if request.auth != null && 
        (request.auth.token.role in ['admin', 'superadmin']);
    }
    
    match /users/{userId} {
      allow write: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.role in ['admin', 'superadmin']);
    }
  }
}
```

## 📧 SendGrid Configuration

### Cuenta SendGrid
- **API Key**: Configurada en variables de entorno
- **Sender Email**: caja.chica@esmargentina.net
- **Sender Name**: ESM Argentina - Caja Chica
- **Plan**: Free (100 emails/día)

### Templates de Email
- Reporte diario HTML responsive
- Notificaciones de gastos
- Alertas de sistema

## 🌐 Vercel Configuration

### Proyecto
- **Team**: esm-argentina
- **Project Name**: frontend
- **Framework Preset**: Vite
- **Node Version**: 18.x

### Build Settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### Environment Variables
```bash
# Firebase (todas con prefijo VITE_)
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID

# SendGrid (para funciones serverless)
SENDGRID_API_KEY
SENDGRID_FROM_EMAIL
SENDGRID_FROM_NAME
```

### Cron Jobs
```json
{
  "crons": [{
    "path": "/api/cron/daily-report",
    "schedule": "0 0 * * *"
  }]
}
```

### Functions Configuration
```json
{
  "functions": {
    "api/cron/daily-report.js": {
      "maxDuration": 10
    }
  }
}
```

## 🌍 Domain Configuration

### Dominio Principal
- **Domain**: esmargentina.net
- **DNS Provider**: Vercel DNS
- **SSL**: Automático con Let's Encrypt

### DNS Records
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### Nameservers (en Hostinger)
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

## 📱 Frontend Configuration

### Vite Config
```javascript
// vite.config.js
export default {
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
}
```

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'esm-gold': '#D4AF37',
        'esm-gray': '#1a1a1a'
      }
    }
  }
}
```

## 🔐 Seguridad

### Autenticación
- Firebase Auth con email/password
- Tokens JWT con roles custom
- Sesiones de 24 horas
- Refresh automático de tokens

### Autorización
- RBAC (Role-Based Access Control)
- Roles: SUPERADMIN, ADMIN, SOCIO, USER
- Validación en frontend y backend
- Rutas protegidas por rol

### Datos Sensibles
- Todas las credenciales en variables de entorno
- No hay secretos en el código
- HTTPS obligatorio en producción
- Sanitización de inputs

## 📊 Monitoreo

### Vercel Analytics
- Performance metrics
- Web Vitals
- Error tracking
- Usage statistics

### Firebase Console
- Firestore usage
- Authentication metrics
- Storage bandwidth
- Cloud Functions logs

### SendGrid Dashboard
- Email delivery rates
- Bounce/spam reports
- Monthly usage

## 🔧 Mantenimiento

### Backups
- Firestore: Export automático disponible
- Storage: Sincronización con bucket
- Código: GitHub repository

### Actualizaciones
1. Test en desarrollo local
2. Build y verificación
3. Deploy a Vercel staging
4. Promoción a producción
5. Verificación post-deploy

### Logs y Debugging
- Vercel Logs: `vercel logs`
- Firebase Console: Logs en tiempo real
- Browser Console: Para debugging frontend
- Network Tab: Para verificar API calls

---

*Configuración actualizada: 26 de Agosto de 2025*
*Sistema completamente operativo*
