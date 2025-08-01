# Guía de Despliegue a Producción - Control de Caja Chica ESM

## 🚀 Opciones de Despliegue

### 1. **Netlify** (Recomendado para empezar)
Es la opción más simple y rápida:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Build de producción
npm run build

# Desplegar
netlify deploy --prod --dir=dist
```

**Ventajas:**
- Deploy automático desde GitHub
- HTTPS gratuito
- CDN global
- Preview deployments
- Formularios y funciones serverless

### 2. **Vercel**
Excelente para aplicaciones React:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel --prod
```

**Ventajas:**
- Integración perfecta con GitHub
- Analytics incluido
- Edge Functions
- Previews automáticos

### 3. **GitHub Pages** (Para pruebas)
```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Agregar en package.json:
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Desplegar
npm run deploy
```

### 4. **AWS Amplify** (Profesional)
Para una solución más robusta:

```bash
# Instalar Amplify CLI
npm install -g @aws-amplify/cli

# Configurar
amplify init
amplify add hosting
amplify publish
```

## 📋 Pasos para Producción

### 1. **Configurar Variables de Entorno**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus credenciales reales
```

### 2. **Integrar Supabase**
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. **Configurar Base de Datos**
```sql
-- Crear tabla de usuarios (si no usas Supabase Auth)
CREATE TABLE usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Crear tabla de gastos
CREATE TABLE gastos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fecha DATE NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  monto DECIMAL(10,2) NOT NULL,
  medio_pago VARCHAR(50) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descripcion TEXT,
  archivo_url TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente',
  comentario_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Crear políticas RLS
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- Política para admin
CREATE POLICY "Admin ve todo" ON gastos
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin_principal'
  );

-- Política para socios
CREATE POLICY "Socios ven sus gastos" ON gastos
  FOR SELECT USING (
    usuario_id = auth.uid() OR 
    auth.jwt() ->> 'role' = 'contadora'
  );
```

### 4. **Optimizaciones de Producción**

#### Seguridad
- [ ] Implementar autenticación real con Supabase Auth
- [ ] Configurar CORS correctamente
- [ ] Usar HTTPS siempre
- [ ] Sanitizar inputs de usuario
- [ ] Implementar rate limiting

#### Performance
- [ ] Lazy loading de componentes
- [ ] Optimizar imágenes
- [ ] Implementar PWA
- [ ] Cache de API calls
- [ ] Comprimir assets

#### Código para optimización:
```javascript
// Lazy loading de páginas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RegistroGastos = lazy(() => import('./pages/RegistroGastos'));

// En App.jsx
<Suspense fallback={<div>Cargando...</div>}>
  <Routes>
    {/* rutas */}
  </Routes>
</Suspense>
```

## 🔧 Scripts de Producción

### package.json actualizado:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:analyze": "vite build --mode analyze",
    "deploy:netlify": "npm run build && netlify deploy --prod --dir=dist",
    "deploy:vercel": "npm run build && vercel --prod"
  }
}
```

## 📊 Monitoreo en Producción

### 1. **Sentry** para errores
```bash
npm install @sentry/react
```

```javascript
// main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

### 2. **Google Analytics**
```html
<!-- En index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## 🚨 Checklist Pre-Despliegue

- [ ] Variables de entorno configuradas
- [ ] Build de producción sin errores
- [ ] Pruebas en local con `npm run preview`
- [ ] Imágenes optimizadas
- [ ] Sin console.logs en producción
- [ ] HTTPS configurado
- [ ] Dominio configurado
- [ ] Backup de base de datos
- [ ] Políticas de seguridad configuradas
- [ ] Términos y condiciones agregados

## 📱 Progressive Web App (PWA)

Para convertir en PWA, agregar:

1. **manifest.json** en public/
```json
{
  "name": "Control de Caja Chica ESM",
  "short_name": "Caja Chica",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#D4AF37",
  "background_color": "#1a1a1a",
  "icons": [
    {
      "src": "/logo192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

2. **Service Worker** con Vite PWA
```bash
npm install -D vite-plugin-pwa
```

## 🔗 Comandos Rápidos

```bash
# Development
npm run dev

# Build producción
npm run build

# Preview producción local
npm run preview

# Deploy a Netlify
npm run deploy:netlify

# Deploy a Vercel
npm run deploy:vercel
```

## 💡 Recomendaciones Finales

1. **Empezar con Netlify**: Es gratis y fácil para MVP
2. **Supabase**: Perfecto para el backend (auth + db + storage)
3. **Monitoreo**: Implementar Sentry desde el día 1
4. **CI/CD**: Configurar GitHub Actions para deploy automático
5. **Backups**: Automatizar backups de Supabase

¿Necesitas ayuda con algún paso específico del despliegue?