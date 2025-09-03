# 💼 Sistema de Control de Caja Chica - ESM Argentina

Sistema web integral para la gestión y control de gastos de caja chica para ESM Argentina.

## 🌐 Acceso al Sistema

**URL de Producción**: https://esmargentina.net

## 🎯 Características Principales

### Gestión de Gastos
- Registro detallado de gastos con categorización
- Carga de comprobantes (fotos/PDF)
- Sistema de aprobación/rechazo
- Exportación e importación masiva (CSV/Excel)

### Control de Fondos
- Seguimiento en tiempo real del saldo disponible
- Registro de ingresos y egresos
- Alertas automáticas de fondos bajos
- Dashboard ejecutivo con métricas clave

### Sistema de Roles
- **SUPERADMIN**: Control total + auditoría
- **ADMIN**: Gestión operativa completa
- **SOCIO**: Visualización de información
- **USER**: Registro de gastos propios

### Notificaciones y Reportes
- Notificaciones en tiempo real
- Reportes diarios automáticos por email (21:00 hs)
- Resumen ejecutivo para socios
- Sistema de auditoría completo

## 🚀 Tecnologías Utilizadas

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel
- **Email Service**: SendGrid
- **Cron Jobs**: Vercel Functions

## 📱 Características Especiales

### Para Administradores (Noelia)
- Flujo de aprobación simplificado (aprobados automáticamente)
- Dashboard ejecutivo con control de fondos prominente
- Importación/exportación masiva de datos
- Gestión de usuarios operativos

### Para Socios
- Visualización completa de gastos y fondos
- Recepción de reportes diarios por email
- Acceso a estadísticas y gráficos

### Mobile Responsive
- Diseño optimizado para dispositivos móviles
- Tutorial interactivo para nuevos usuarios
- Interfaz adaptativa para iPhone y Android

## 🔒 Seguridad

- Autenticación mediante Firebase Auth
- Control de acceso basado en roles
- Auditoría completa de cambios
- Variables de entorno protegidas

## 📊 Estado del Sistema

- **Estado**: ✅ Operativo
- **Versión**: 2.0.0
- **Última actualización**: 28 de Agosto de 2025
 - **Nota**: Se descartó el intento de “multi-empresa (Bröd)” y la app continúa operando únicamente para ESM.

## 📝 Documentación

### Archivos principales de documentación:
- **`ESTADO_ACTUAL.md`** - Estado completo y actual del sistema
- **`USUARIOS_Y_ROLES.md`** - Información detallada de usuarios y permisos
- **`FUNCIONALIDADES.md`** - Lista completa de características implementadas
- **`DEPLOYMENT_PRODUCTION.md`** - Guía de deployment con Vercel
- **`PARA_NUEVO_CHAT.md`** - Perfil/rol y plantilla para iniciar nuevos chats
- **`AUTORIZACIONES.md`** - Esquema de permisos y plantilla de aprobación
- **`docs/CONFIGURACION_COMPLETA.md`** - Configuración técnica detallada

## 👨‍💻 Desarrollo

```bash
# Instalación
cd frontend
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Deploy a Vercel
vercel --prod
```

## 🤝 Soporte

Para soporte técnico, consulte la documentación en `/docs` o contacte al administrador del sistema.

---

**ESM Argentina** - Sistema de Control de Caja Chica  
*Desarrollado con asistencia de Claude AI Assistant*