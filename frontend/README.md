# 🏢 Sistema de Control de Caja Chica - ESM Argentina

Sistema web profesional para el control y gestión de gastos de caja chica de ESM Argentina, desarrollado con React 18 y Firebase.

![Estado](https://img.shields.io/badge/Estado-En%20Producción-success)
![Versión](https://img.shields.io/badge/Versión-2.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Firebase](https://img.shields.io/badge/Firebase-10.14.1-orange)

## 🌟 Características Principales

- **🔐 Autenticación segura** con Firebase Auth
- **👥 Sistema de roles** (Admin, Socio Operador, Contadora)
- **💰 Gestión completa de gastos** con flujo de aprobación
- **📊 Dashboard con gráficos interactivos** usando Recharts
- **📸 Carga de comprobantes** con compresión automática
- **💳 Gestión de fondos** y control presupuestario
- **🔔 Sistema de notificaciones** en tiempo real
- **📱 Diseño responsive** con tema "Cristal Noir"
- **💱 Formato de moneda argentina** ($1.000.000)

## 🏗️ Arquitectura

### Stack Tecnológico
```
Frontend:
├── React 18 + Vite
├── Tailwind CSS
├── React Router v6
├── Recharts (gráficos)
└── Lucide React (iconos)

Backend:
├── Firebase Authentication
├── Firebase Firestore
├── Firebase Storage
└── Firebase Analytics

Deploy:
├── Netlify/Vercel ready
└── Firebase Hosting
```

### Estructura del Proyecto
```
frontend/
├── src/
│   ├── components/
│   │   ├── charts/         # Gráficos del dashboard
│   │   ├── notifications/  # Sistema de notificaciones
│   │   ├── ui/            # Componentes UI reutilizables
│   │   └── upload/        # Componentes de carga
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── RegistroGastos.jsx
│   │   ├── PanelControl.jsx
│   │   ├── VistaGastos.jsx
│   │   ├── GestionFondos.jsx
│   │   └── GestionUsuarios.jsx
│   ├── services/
│   │   ├── gastosService.js
│   │   ├── fondosService.js
│   │   ├── userService.js
│   │   └── storageService.js
│   ├── utils/
│   │   ├── formatters.js   # Formato pesos argentinos
│   │   └── csvExport.js    # Exportación de datos
│   └── config/
│       └── firebase.js     # Configuración Firebase
├── public/
├── package.json
└── vite.config.js
```

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 16+ 
- npm 8+
- Cuenta de Firebase

### Configuración rápida
```bash
# Clonar repositorio
git clone [URL-DEL-REPOSITORIO]
cd app_web_control_gastos/frontend

# Instalar dependencias
npm install

# Configurar Firebase
cp src/config/firebase.example.js src/config/firebase.js
# Editar firebase.js con tus credenciales

# Iniciar desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Scripts disponibles
```bash
npm run dev          # Servidor de desarrollo
npm run dev:network  # Desarrollo con acceso en red
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linter ESLint
```

## 👥 Sistema de Usuarios

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Admin Principal** | • Gestión completa del sistema<br>• Aprobación/rechazo de gastos<br>• Gestión de usuarios<br>• Control de fondos<br>• Visualización de todas las métricas |
| **Socio Operador** | • Registro de gastos propios<br>• Vista de sus gastos<br>• Dashboard personalizado |
| **Contadora** | • Registro de gastos<br>• Vista de todos los gastos<br>• Generación de reportes |

### Usuarios de Desarrollo
```javascript
// Admin Principal
Email: juan.pablo@esm.com.ar
Password: admin123

// Socio Operador
Email: luis.tello@esm.com.ar
Password: socio123

// Contadora
Email: noelia@esm.com.ar
Password: conta123
```

## 💡 Funcionalidades Destacadas

### 📊 Dashboard Interactivo
- Gráficos de torta por categoría
- Barras comparativas mensuales
- Líneas de tendencia temporal
- Métricas en tiempo real
- Filtros por período

### 💰 Gestión de Gastos
- Formulario intuitivo con validaciones
- Categorías predefinidas (Librería, Supermercado, Premios, etc.)
- Múltiples medios de pago
- Carga de comprobantes con vista previa
- Flujo de aprobación completo

### 📸 Carga de Archivos
- Soporte para imágenes y PDFs
- Captura directa desde cámara
- Compresión automática
- Almacenamiento seguro en Firebase Storage
- Vista previa integrada

### 🎨 Diseño "Cristal Noir"
- Tema oscuro elegante
- Acentos dorados (#D4AF37)
- Animaciones suaves
- Responsive design
- Experiencia móvil optimizada

## 🔧 Configuración de Firebase

### 1. Crear proyecto Firebase
1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear nuevo proyecto: `control-caja-chica-esm`
3. Habilitar Authentication, Firestore y Storage

### 2. Configurar Authentication
```javascript
// Métodos habilitados
- Email/Password
- Google (opcional)
```

### 3. Reglas de Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas de usuarios
    match /usuarios/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas de gastos
    match /gastos/{gastoId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Reglas de Storage
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /comprobantes/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 Deploy en Producción

### Netlify
```bash
# Build
npm run build

# Deploy manual o conectar con GitHub
# Directorio: dist/
# Comando build: npm run build
```

### Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Firebase Hosting
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login y configurar
firebase login
firebase init hosting

# Deploy
npm run build
firebase deploy
```

## 🧪 Testing

### Flujo de Testing Recomendado
1. **Login y roles** - Verificar acceso según permisos
2. **CRUD de gastos** - Crear, editar, aprobar, rechazar
3. **Carga de archivos** - Subir comprobantes y validar storage
4. **Dashboard** - Verificar gráficos y métricas
5. **Responsive** - Probar en diferentes dispositivos

## 📈 Roadmap

### ✅ Completado
- Sistema de autenticación
- CRUD completo de gastos
- Dashboard con gráficos
- Carga de archivos
- Gestión de fondos
- Sistema de notificaciones básico

### 🔄 En Desarrollo
- [ ] Notificaciones por email
- [ ] Exportación a Excel avanzada
- [ ] Búsqueda y filtros avanzados
- [ ] Control de presupuestos

### 🎯 Futuro
- [ ] PWA con modo offline
- [ ] Integración contable
- [ ] API REST
- [ ] Sistema de reembolsos
- [ ] Auditoría completa

## 🤝 Contribución

### Flujo de desarrollo
1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Convención de commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato/estilo
refactor: refactoring
test: tests
chore: mantenimiento
```

## 📞 Soporte

### Issues y Bugs
- Crear issue en GitHub con:
  - Descripción detallada
  - Pasos para reproducir
  - Screenshots si aplica
  - Información del browser

### Documentación
- **Manual de Usuario**: `/docs/manual-usuario.md`
- **Guía de Admin**: `/docs/guia-admin.md`
- **API Docs**: `/docs/api.md`

## 📄 Licencia

Este proyecto es propiedad de **ESM Argentina**. Todos los derechos reservados.

---

**Desarrollado con ❤️ para ESM Argentina**

*Versión 2.0.0 - Agosto 2025*
