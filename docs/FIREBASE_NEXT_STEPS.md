# 🎯 SIGUIENTE PASO EN FIREBASE CONSOLE

## ✅ Ya completaste:
1. ✓ Registrar app
2. ✓ Agregar SDK (copiaste la configuración)
3. ✓ Instalaste Firebase con npm
4. ✓ Creaste los archivos de configuración

## 📌 AHORA en Firebase Console debes:

### 1️⃣ **Habilitar Authentication**
1. En el menú lateral, click en **"Authentication"**
2. Click en **"Get started"**
3. En la pestaña **"Sign-in method"**
4. Habilita **"Email/Password"** (el primero de la lista)
5. Click en el switch para activarlo
6. **NO** actives "Email link" 
7. Click en **"Save"**

### 2️⃣ **Crear Firestore Database**
1. En el menú lateral, click en **"Firestore Database"**
2. Click en **"Create database"**
3. Selecciona **"Start in production mode"**
4. Elige la ubicación más cercana (ej: us-central)
5. Click en **"Create"**

### 3️⃣ **Crear Storage**
1. En el menú lateral, click en **"Storage"**
2. Click en **"Get started"**
3. Selecciona **"Start in production mode"**
4. Click en **"Next"**
5. Elige la misma ubicación que Firestore
6. Click en **"Done"**

## 🚀 DESPUÉS DE COMPLETAR ESOS 3 PASOS:

### Opción A - Usar la herramienta automática:
1. Asegúrate que el servidor esté corriendo (`npm run dev`)
2. Abre en tu navegador: http://localhost:3000/firebase-init.html
3. Click en "Inicializar Firebase"
4. Verás el progreso en pantalla

### Opción B - Desde la consola del navegador:
1. Abre http://localhost:3000
2. Abre las DevTools (F12)
3. En la consola, pega:
```javascript
import('./src/scripts/initializeFirebase.js').then(m => m.initializeFirebase())
```

## ⚠️ IMPORTANTE:
- Primero DEBES completar los 3 pasos en Firebase Console
- El servidor de desarrollo debe estar corriendo
- Si hay errores, revisa que Authentication esté habilitado

## 🎉 Una vez que todo esté listo:
- Los usuarios podrán hacer login con Firebase
- Los datos se guardarán en la nube
- Los archivos se subirán a Storage

¿Necesitas ayuda con algún paso?