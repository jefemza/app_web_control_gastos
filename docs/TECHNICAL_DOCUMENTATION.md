# 📚 Documentación Técnica - ESM Control de Caja Chica

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel
- **Autenticación**: Firebase Auth
- **Base de Datos**: Firestore
- **Estado**: React Hooks + Context
- **Iconos**: Lucide React

### Estructura de Datos

#### Colecciones Firestore

**usuarios**
```javascript
{
  uid: string,
  name: string,
  email: string,
  role: 'superadmin' | 'admin' | 'socio' | 'user',
  telefono: string,
  estado: 'activo' | 'inactivo',
  fechaCreacion: timestamp,
  fechaActualizacion: timestamp,
  creadoPor: string
}
```

**fondos**
```javascript
{
  monto: number,
  fecha: timestamp,
  entregadoPor: string,
  activo: boolean,
  saldoActual: number,
  montoInicial: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**gastos**
```javascript
{
  monto: number,
  categoria: string,
  descripcion: string,
  fecha: timestamp,
  estado: 'pendiente' | 'aprobado' | 'rechazado',
  usuarioId: string,
  usuarioNombre: string,
  comprobante: string,
  aprobadoPor: string,
  fechaAprobacion: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**auditoria**
```javascript
{
  usuarioId: string,
  usuarioEmail: string,
  usuarioNombre: string,
  accion: string,
  entidad: string,
  entidadId: string,
  detalles: string,
  valorAnterior: object,
  valorNuevo: object,
  timestamp: timestamp
}
```

## 🔐 Sistema de Autenticación y Autorización

### Roles y Permisos

#### SUPERADMIN
- Control total del sistema
- Gestión completa de usuarios
- Auditoría completa
- Reset total de aplicación
- Todas las funcionalidades

#### ADMIN (Contaduría)
- Crear usuarios "user"
- Editar usuarios "user"
- Gestionar fondos
- Importar/exportar gastos
- Ver todos los gastos
- **Restricciones**: No puede eliminar usuarios ni cambiar roles existentes

#### SOCIO
- Registrar gastos
- Ver todos los gastos
- Acceso limitado al dashboard
- **Restricciones**: No puede gestionar fondos ni usuarios

#### USER (Operadores)
- Registrar gastos
- Ver sus propios gastos
- Acceso básico
- **Restricciones**: Acceso limitado a reportes

### Flujo de Autenticación
1. Usuario ingresa email/contraseña
2. Firebase Auth valida credenciales
3. Se obtiene información del usuario desde Firestore
4. Se establece el rol y permisos en el contexto de la aplicación
5. Se redirige según permisos

## 📊 Gestión de Datos

### Servicios Principales

#### userService.js
- Crear, actualizar, eliminar usuarios
- Validación de roles
- Gestión de permisos
- Estadísticas de usuarios

#### gastosService.js
- CRUD de gastos
- Aprobación/rechazo
- Filtros y búsquedas
- Exportación a CSV
- Auditoría automática

#### fondosService.js
- Gestión de ingresos
- Control de saldos
- Historial de transacciones
- Cálculo de disponibilidad

#### auditService.js
- Logging de todas las acciones
- Consulta de auditoría
- Exportación de logs
- Estadísticas de actividad

#### maintenanceService.js
- Reset total de aplicación
- Limpieza de datos
- Creación masiva de usuarios

## 🎨 Interfaz de Usuario

### Componentes Principales

#### Páginas
- **Dashboard**: Vista principal con métricas y navegación
- **Login**: Autenticación de usuarios
- **RegistroGastos**: Formulario de registro de gastos
- **VistaGastos**: Lista y gestión de gastos
- **PanelControl**: Aprobación y gestión de gastos
- **GestionFondos**: Control de ingresos y saldos
- **GestionUsuarios**: Administración de usuarios
- **Auditoria**: Consulta de logs del sistema
- **Notificaciones**: Sistema de notificaciones

#### Componentes Reutilizables
- **Header**: Navegación principal
- **Charts**: Gráficos y estadísticas
- **ImportExportGastos**: Importación/exportación masiva
- **UserCleanupButton**: Limpieza de usuarios
- **RolePermissionsTest**: Debug de roles
- **Toast**: Notificaciones temporales

### Diseño y UX
- **Tema**: Dark mode con colores corporativos
- **Responsive**: Mobile-first design
- **Accesibilidad**: Navegación por teclado
- **Feedback**: Confirmaciones y mensajes de error
- **Loading**: Estados de carga y procesamiento

## 🔧 Configuración y Deployment

### Variables de Entorno
```bash
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### Configuración Firebase
- Autenticación habilitada (email/password)
- Firestore en modo de producción
- Reglas de seguridad configuradas
- Storage para comprobantes

### Deployment Vercel
- Build automático desde GitHub
- Variables de entorno configuradas
- Dominio personalizado
- SSL automático

## 📈 Métricas y Monitoreo

### Métricas de Uso
- Usuarios activos
- Gastos registrados
- Fondos disponibles
- Actividad de auditoría

### Logs y Debugging
- Console logs para desarrollo
- Auditoría automática
- Error tracking
- Performance monitoring

## 🔒 Seguridad

### Medidas Implementadas
- Autenticación Firebase
- Reglas de Firestore
- Validación de roles
- Auditoría completa
- Sanitización de datos

### Reglas de Firestore
```javascript
// Ejemplo de reglas de seguridad
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden leer su propio documento
    match /usuarios/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role in ['superadmin', 'admin']);
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role in ['superadmin', 'admin'];
    }
    
    // Gastos según rol
    match /gastos/{gastoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role in ['superadmin', 'admin'];
    }
  }
}
```

## 🚀 Optimizaciones

### Performance
- Lazy loading de componentes
- Optimización de imágenes
- Caching de datos
- Bundle splitting

### SEO
- Meta tags
- Open Graph
- Sitemap
- Robots.txt

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Componentes Adaptativos
- Navegación colapsable
- Tablas scrollables
- Formularios optimizados
- Gráficos responsivos

## 🔄 Flujos de Trabajo

### Registro de Gasto
1. Usuario selecciona "Registrar Gasto"
2. Completa formulario con datos
3. Adjunta comprobante (opcional)
4. Sistema valida datos
5. Gasto se guarda como "pendiente"
6. Se registra en auditoría
7. Notificación a administradores

### Aprobación de Gasto
1. Admin revisa gastos pendientes
2. Aprueba o rechaza gasto
3. Sistema actualiza estado
4. Se ajusta saldo de fondos
5. Se registra en auditoría
6. Notificación al usuario

### Gestión de Fondos
1. Admin registra ingreso
2. Sistema calcula saldo disponible
3. Se actualiza historial
4. Se registra en auditoría
5. Alertas si fondos bajos

## 🐛 Debugging y Troubleshooting

### Problemas Comunes
- **Error de autenticación**: Verificar credenciales Firebase
- **Permisos denegados**: Verificar rol del usuario
- **Datos no cargan**: Verificar conexión Firestore
- **Build falla**: Verificar variables de entorno

### Herramientas de Debug
- Firebase Console
- Vercel Dashboard
- Browser DevTools
- React DevTools

## 📋 Checklist de Deployment

### Pre-deployment
- [ ] Variables de entorno configuradas
- [ ] Firebase configurado
- [ ] Tests pasando
- [ ] Build exitoso
- [ ] Documentación actualizada

### Post-deployment
- [ ] Aplicación accesible
- [ ] Autenticación funcionando
- [ ] Datos cargando correctamente
- [ ] Roles funcionando
- [ ] Auditoría activa

---

**Última actualización**: 26 de Agosto, 2025
**Versión**: 2.0.0
**Mantenido por**: Claude AI Assistant
