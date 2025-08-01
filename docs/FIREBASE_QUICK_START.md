# 🚀 Guía Rápida - Firebase para Control de Caja Chica

## 1️⃣ Crear Proyecto en Firebase

1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. "Crear proyecto" → Nombre: `control-caja-chica-esm`
3. Desactivar Google Analytics (opcional)
4. Crear proyecto

## 2️⃣ Configurar Servicios

### En Firebase Console:
1. **Authentication** → Habilitar "Email/Password"
2. **Firestore Database** → Crear base de datos (modo producción)
3. **Storage** → Crear bucket de almacenamiento

## 3️⃣ Obtener Credenciales

1. Configuración del proyecto → General
2. Agregar app → Web → Registrar app
3. Copiar configuración

## 4️⃣ Instalar en tu App

```bash
npm install firebase
```

## 5️⃣ Configurar Variables de Entorno

Crear archivo `.env` en la raíz:
```
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=control-caja-chica-esm.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=control-caja-chica-esm
VITE_FIREBASE_STORAGE_BUCKET=control-caja-chica-esm.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
VITE_FIREBASE_APP_ID=tu-app-id
```

## 6️⃣ Copiar Reglas de Seguridad

### Firestore Rules:
Copiar el contenido de la sección "Reglas de Seguridad" del archivo `FIREBASE_SETUP_GUIDE.md`

### Storage Rules:
Copiar las reglas de Storage del mismo archivo

## 7️⃣ Crear Usuarios Iniciales

### Opción A - Manual en Console:
Authentication → Users → Add user

### Opción B - Script (una sola vez):
```javascript
// Ejecutar esto una vez para crear usuarios
import { initializeUsers } from './src/utils/initializeUsers';
initializeUsers();
```

## 8️⃣ Actualizar Componentes

1. Reemplazar `Login.jsx` con `LoginFirebase.jsx`
2. Actualizar servicios de datos para usar Firebase
3. Cambiar localStorage por Firestore

## 📁 Archivos Clave Creados:

- `FIREBASE_SETUP_GUIDE.md` - Guía completa detallada
- `.env.firebase.example` - Plantilla de variables
- `src/config/firebase.example.js` - Configuración
- `src/components/LoginFirebase.jsx` - Login actualizado

## ⚠️ Importante:

- **Costos**: Firebase cobra por uso (tiene capa gratuita generosa)
- **Seguridad**: Nunca subas las credenciales a Git
- **Testing**: Usa Firebase Emulator para desarrollo local

## 🎯 Próximos Pasos:

1. Crear proyecto en Firebase Console
2. Configurar servicios necesarios
3. Copiar credenciales
4. Instalar dependencias
5. Configurar reglas
6. Crear usuarios
7. Probar login

---
*¿Necesitas ayuda con algún paso específico?*