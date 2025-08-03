# Guía de Deployment para Producción

## 📋 Preparación Completada

El proyecto ha sido optimizado para producción con las siguientes mejoras:

### ✅ Configuraciones de Seguridad
- Firebase configurado con variables de entorno
- Headers de seguridad implementados
- Sourcemaps desactivados en producción

### ✅ Optimizaciones de Build
- Chunks manuales para mejor caching
- Minificación con Terser
- Límite de tamaño de chunks aumentado
- Separación de vendors (React, Firebase, UI)

### ✅ Archivos de Configuración
- `.env.production` - Variables de entorno para producción
- `netlify.toml` - Configuración para Netlify
- `vercel.json` - Configuración para Vercel
- Scripts de deploy en `package.json`

## 🚀 Opciones de Deployment

### 1. Netlify (Recomendado)
```bash
cd frontend
npm install
npm run build
# Subir carpeta dist/ a Netlify o usar CLI:
npm run deploy:netlify
```

### 2. Vercel
```bash
cd frontend
npm install
npm run build
# Usar Vercel CLI:
npm run deploy:vercel
```

### 3. GitHub Pages
```bash
cd frontend
npm install
npm run build
# Subir contenido de dist/ a rama gh-pages
```

### 4. AWS Amplify
1. Conectar repositorio GitHub
2. Configurar build settings:
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

## 🔧 Variables de Entorno Requeridas

Configurar en el servicio de hosting:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

## 📊 Verificación Post-Deployment

1. **Funcionalidad**:
   - Login/logout funciona
   - CRUD de gastos operativo
   - Reportes se generan correctamente
   - Exportación a Excel funciona

2. **Performance**:
   - Lighthouse Score > 90
   - Tiempo de carga < 3 segundos
   - Assets optimizados

3. **Seguridad**:
   - HTTPS habilitado
   - Headers de seguridad activos
   - Variables de entorno protegidas

## 🔍 Comandos Útiles

```bash
# Build para producción
npm run build:prod

# Preview local del build
npm run preview

# Análisis de bundle
npm run analyze

# Lint y fix
npm run lint:fix
```

## 📝 Notas Importantes

- El proyecto está configurado como SPA (Single Page Application)
- Los redirects están configurados para manejar rutas del cliente
- Firebase está configurado para desarrollo y producción
- Se recomienda configurar un dominio personalizado
- Monitorear logs de Firebase para errores en producción

## 🆘 Troubleshooting

### Error de rutas 404
- Verificar configuración de redirects en netlify.toml/vercel.json

### Variables de entorno no funcionan
- Asegurar que empiecen con `VITE_`
- Verificar configuración en el panel del hosting

### Errores de Firebase
- Verificar configuración de dominio en Firebase Console
- Revisar reglas de Firestore y Storage