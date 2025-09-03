# 📊 ESTADO ACTUAL DEL PROYECTO - ESM ARGENTINA
*Última actualización: 28 de Agosto de 2025*

## 🚀 Información de Despliegue

### URL de Producción
- **Dominio Principal**: https://esmargentina.net
- **Plataforma**: Vercel
- **Estado**: ✅ Activo y funcionando

### Configuración Técnica
- **Frontend**: React + Vite
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Almacenamiento**: Firebase Storage
- **Email Service**: SendGrid (configurado)
- **Cron Jobs**: Vercel Functions (reportes diarios a las 21:00 hs Argentina)

## 👥 Usuarios del Sistema

### Usuarios Activos
| Nombre | Email | Rol | Contraseña | Permisos |
|--------|-------|-----|------------|----------|
| Luis Sergio Tello | luis.tello@esm.com.ar | SUPERADMIN | esm2025 | Acceso total + Auditoría |
| Noelia Albornoz | noeliaalbornoz1@gmail.com | ADMIN | esm2025 | Control total operativo |
| Juan Pablo Rua | juanpablorua@hotmail.com | SOCIO | esm2025 | Solo visualización |
| Eugenio Cavallaro | eugeniocavallaro@hotmail.com | SOCIO | esm2025 | Solo visualización |

## 🎯 Funcionalidades Principales Implementadas

### 1. Sistema de Roles y Permisos
- **SUPERADMIN**: Control total + auditoría de cambios
- **ADMIN**: Gestión completa de gastos, fondos y usuarios operativos
- **SOCIO**: Solo visualización de información
- **USER**: Registro y visualización de gastos propios

### 2. Gestión de Gastos
- ✅ Registro de gastos con archivos adjuntos
- ✅ Categorización automática
- ✅ Sistema de aprobación/rechazo (nuevos gastos se aprueban automáticamente)
- ✅ Exportación a CSV
- ✅ Importación masiva desde Excel (solo ADMIN)

### 3. Gestión de Fondos
- ✅ Control de ingresos y egresos
- ✅ Saldo en tiempo real
- ✅ Alertas de fondos bajos
- ✅ **Sección especial para Noelia en Dashboard**

### 4. Sistema de Notificaciones
- ✅ Notificaciones en tiempo real
- ✅ Resumen de notificaciones
- ✅ Alertas por gastos pendientes
- ✅ Botón "Volver al Dashboard" en todas las secciones
 - ✅ Banner de anuncio en encabezado (editable por SUPERADMIN)

### 5. Auditoría (Solo SUPERADMIN)
- ✅ Registro de todas las acciones
- ✅ Seguimiento de modificaciones
- ✅ Exportación de logs
- ✅ Filtros por fecha y usuario

### 6. Reportes Automáticos
- ✅ Email diario a las 21:00 hs (Argentina)
- ✅ Enviado a los 3 socios
- ✅ Resumen de gastos del día
- ✅ Estado de fondos

- ✅ Flujo de aprobación simplificado (los gastos ingresan aprobados)
- ✅ **Sección Prominente de Fondos en Dashboard**
  - Total ingresado
  - Saldo disponible
  - Total gastado
  - Porcentaje de uso
- ✅ **Importación/Exportación Masiva**
- ✅ **Gestión de Usuarios Operativos**

### 8. Mobile Responsive
- ✅ Diseño adaptativo para móviles
- ✅ Tutorial interactivo para nuevos usuarios
- ✅ Interfaz optimizada para iPhone y Android

## 🔧 Configuraciones Importantes

### Firebase
- **Proyecto**: control-gastos-esm
- **Región**: us-central1
- **Colecciones principales**:
  - `gastos`: Registro de gastos
  - `fondos`: Control de fondos
  - `users`: Usuarios del sistema
  - `notificaciones`: Sistema de notificaciones
  - `auditoria`: Logs de auditoría
  - `config`: Configuración del sistema (incluye `announcement` para el banner)

### SendGrid
- **Email de envío**: caja.chica@esmargentina.net
- **Configurado para**: Reportes diarios automáticos

### Vercel
- **Proyecto**: frontend
- **Team**: esm-argentina
- **Dominio personalizado**: esmargentina.net
- **Variables de entorno**: Configuradas en Vercel Dashboard

## 📝 Notas Importantes

1. **Backup**: Se recomienda hacer backup regular de Firebase
2. **Seguridad**: Las credenciales están en variables de entorno
3. **Mantenimiento**: Sistema de limpieza de datos de prueba disponible
4. **Auditoría**: Todos los cambios críticos son registrados
5. **Fechas**: Corregido manejo de zona horaria de Argentina para registro y visualización.
6. **Cámara móvil**: La carga de archivos permite tomar fotos desde el móvil (botón "Tomar foto").
7. **Nota**: Se descartó el intento de “multi-empresa (Bröd)” y se revirtió al comportamiento original de una sola empresa (ESM), sin afectar datos existentes.

## 🚨 Puntos de Atención

1. **Límite de SendGrid**: 100 emails/día en plan gratuito
2. **Storage Firebase**: Monitorear uso de almacenamiento
3. **Cron Jobs**: Verificar ejecución diaria a las 21:00 hs

## 📞 Soporte Técnico

Para cualquier consulta técnica sobre el sistema, la documentación completa está disponible en la carpeta `/docs`.

---

*Sistema desarrollado con asistencia de Claude AI Assistant*
*"Siempre aquí para ayudar y resolver problemas técnicos"*
