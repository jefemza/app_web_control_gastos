# 🤖 Guía de Automatización de Deployment

Este directorio contiene scripts automatizados para deployment sin intervención manual.

## 📁 Archivos de Configuración

### `.vercelrc`
Configuración global de Vercel para deployment automático:
- `autoConfirm: true` - Confirma automáticamente las acciones
- `defaultTeam: "esm-argentina"` - Team por defecto
- `silent: false` - Mantiene output visible

### `vercel.json` (Optimizado)
Configuración del proyecto con:
- Framework Vite configurado
- Headers de seguridad
- Rutas SPA configuradas
- Variables de entorno de producción

## 🚀 Scripts de Automatización

### 1. `deploy-complete.ps1` (RECOMENDADO)
**Script maestro que hace todo automáticamente**

```powershell
# Deployment completo (variables + build + deploy)
.\deploy-complete.ps1

# Solo deployment (omite configuración de variables)
.\deploy-complete.ps1 -SkipEnv

# Solo deployment (omite build)
.\deploy-complete.ps1 -SkipBuild

# Deployment forzado
.\deploy-complete.ps1 -Force
```

### 2. `setup-env-vercel.ps1`
**Solo configura variables de entorno**

```powershell
.\setup-env-vercel.ps1
```

### 3. `deploy-auto.ps1`
**Solo hace build y deployment**

```powershell
.\deploy-auto.ps1
```

## 🔧 Configuración Inicial

### 1. Verificar Vercel CLI
```powershell
# Verificar instalación
vercel --version

# Login si es necesario
vercel login
```

### 2. Configurar Variables de Entorno
Asegúrate de que `.env.production` contenga todas las variables necesarias:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
# ... otras variables
```

### 3. Permisos de Ejecución
```powershell
# Habilitar ejecución de scripts (si es necesario)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🎯 Flujo de Trabajo Automatizado

### Para Deployment Completo:
```powershell
# Un solo comando hace todo:
.\deploy-complete.ps1
```

Este script:
1. ✅ Lee variables de `.env.production`
2. ✅ Configura todas las variables en Vercel
3. ✅ Limpia cache y reinstala dependencias
4. ✅ Ejecuta build del proyecto
5. ✅ Despliega a Vercel en producción
6. ✅ Muestra URLs del deployment

### Para Updates Rápidos:
```powershell
# Solo redeploy (variables ya configuradas)
.\deploy-complete.ps1 -SkipEnv
```

## 🔍 Troubleshooting

### Error: "Execution Policy"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "vercel command not found"
```powershell
npm install -g vercel
```

### Error: "Project not linked"
```powershell
vercel link
```

### Variables no se configuran
- Verificar que `.env.production` existe
- Verificar formato: `VARIABLE=valor` (sin espacios)
- Verificar permisos de Vercel team

## 📊 Monitoreo

### Ver deployments:
```powershell
vercel ls
```

### Ver variables configuradas:
```powershell
vercel env ls
```

### Ver logs:
```powershell
vercel logs [deployment-url]
```

## 🎉 Beneficios de la Automatización

- ✅ **Cero intervención manual** - Un comando hace todo
- ✅ **Configuración consistente** - Mismos pasos siempre
- ✅ **Manejo de errores** - Scripts detectan y reportan problemas
- ✅ **Velocidad** - Proceso optimizado y paralelo
- ✅ **Confiabilidad** - Elimina errores humanos
- ✅ **Trazabilidad** - Logs detallados de cada paso

## 🔗 URLs Importantes

- **Producción:** https://app-web-control-gastos.vercel.app
- **Dashboard Vercel:** https://vercel.com/esm-argentina/app-web-control-gastos
- **Documentación Vercel:** https://vercel.com/docs

---

**💡 Tip:** Guarda este README para referencia futura y compártelo con el equipo.