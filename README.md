# 🏢 ESM Argentina - Control de Caja Chica

## 📋 Descripción del Proyecto

Sistema completo de control de caja chica para ESM Argentina, desarrollado con React, Firebase y Vercel. Permite la gestión integral de gastos, fondos, usuarios y auditoría con roles granulares.

## 🚀 Características Principales

### 👥 Sistema de Usuarios y Roles
- **SUPERADMIN**: Control total + desarrollo (Luis Sergio Tello)
- **ADMIN**: Control total - Contaduría (Noelia Albornoz)
- **SOCIO**: Solo visualización (Juan Pablo Rua, Eugenio Cavallaro)
- **USER**: Operación básica (operadores/diligencieros)

### 💰 Gestión de Fondos
- Registro de ingresos de caja chica
- Control de saldos disponibles
- Historial completo de transacciones
- Alertas de fondos bajos

### 📊 Gestión de Gastos
- Registro de gastos con categorías
- Aprobación/rechazo de gastos
- Adjuntar comprobantes
- Exportación a CSV
- Importación masiva de gastos

### 🔍 Auditoría y Reportes
- Auditoría completa de todas las acciones
- Reportes por período
- Gráficos y estadísticas
- Exportación de datos

### 📧 Notificaciones (Próximamente)
- Informes diarios automáticos
- Alertas por email
- Notificaciones SMS

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel
- **Autenticación**: Firebase Auth
- **Base de Datos**: Firestore
- **Iconos**: Lucide React

## 📁 Estructura del Proyecto

```
app_web_control_gastos/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # Servicios de Firebase
│   │   ├── utils/           # Utilidades y helpers
│   │   └── config/          # Configuración de Firebase
│   ├── public/              # Archivos estáticos
│   └── package.json
├── docs/                    # Documentación
├── backend/                 # Configuración backend
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Firebase
- Cuenta de Vercel

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/jefemza/app_web_control_gastos.git
cd app_web_control_gastos/frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**
- Copiar `src/config/firebase.example.js` a `src/config/firebase.js`
- Configurar las credenciales de Firebase

4. **Variables de entorno**
```bash
# Crear archivo .env.local
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

6. **Desplegar a producción**
```bash
npm run build
vercel --prod
```

## 👥 Usuarios del Sistema

### Usuarios Principales
- **Luis Sergio Tello** (superadmin)
  - Email: luistelloiphone@gmail.com
  - Teléfono: 2617000835

- **Noelia Albornoz** (admin)
  - Email: noeliaalbornoz1@gmail.com
  - Teléfono: 2616620283

- **Juan Pablo Rua** (socio)
  - Email: pablorua@hotmail.com
  - Teléfono: 2612494500

- **Eugenio Cavallaro** (socio)
  - Email: eugenion.cavallaro@gmail.com
  - Teléfono: 2616946211

### Contraseña Temporal
- **Contraseña para todos**: `esm2025`

## 🌐 URLs de Producción

- **Aplicación Principal**: https://frontend-3xqyhmgna-esm-argentina.vercel.app
- **Dashboard Vercel**: https://vercel.com/esm-argentina/frontend

## 📊 Funcionalidades por Rol

### SUPERADMIN
- ✅ Control total del sistema
- ✅ Gestión completa de usuarios
- ✅ Auditoría completa
- ✅ Reset total de aplicación
- ✅ Todas las funcionalidades

### ADMIN (Contaduría)
- ✅ Crear usuarios "user"
- ✅ Editar usuarios "user"
- ✅ Gestionar fondos
- ✅ Importar/exportar gastos
- ✅ Ver todos los gastos
- ❌ No puede eliminar usuarios
- ❌ No puede cambiar roles existentes

### SOCIO
- ✅ Registrar gastos
- ✅ Ver todos los gastos
- ✅ Acceso limitado al dashboard
- ❌ No puede gestionar fondos
- ❌ No puede gestionar usuarios

### USER (Operadores)
- ✅ Registrar gastos
- ✅ Ver sus propios gastos
- ✅ Acceso básico
- ❌ Acceso limitado a reportes

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Previsualizar build

# Deployment
vercel               # Desplegar a Vercel
vercel --prod        # Desplegar a producción
vercel --dev         # Desplegar a desarrollo

# Git
git add .            # Agregar cambios
git commit -m "msg"  # Commit cambios
git push             # Subir cambios
```

## 📝 Notas de Desarrollo

### Características Implementadas
- ✅ Sistema de autenticación completo
- ✅ Gestión de usuarios con roles
- ✅ Control de fondos y gastos
- ✅ Auditoría automática
- ✅ Importación/exportación masiva
- ✅ Gráficos y reportes
- ✅ Interfaz responsive
- ✅ Sistema de notificaciones

### Próximas Funcionalidades
- 📧 Informes automáticos por email
- 📱 Notificaciones SMS
- 🔔 Alertas en tiempo real
- 📊 Reportes avanzados

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Crear un Pull Request

## 📄 Licencia

Este proyecto es privado para ESM Argentina.

## 👨‍💻 Desarrollado por

**Claude AI Assistant** - "Siempre aquí para ayudar y resolver problemas técnicos"

---

**Última actualización**: 26 de Agosto, 2025
**Versión**: 2.0.0
**Estado**: Producción