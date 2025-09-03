# 🚀 GUÍA DE DEPLOYMENT A PRODUCCIÓN - VERCEL

## 📋 Información del Proyecto

- **Plataforma**: Vercel
- **Team**: esm-argentina  
- **Proyecto**: frontend
- **Dominio**: https://esmargentina.net
- **Framework**: React + Vite

## 🔧 Requisitos Previos

1. **Vercel CLI instalado**:
```bash
npm install -g vercel
```

2. **Autenticación en Vercel**:
```bash
vercel login
```

3. **Variables de entorno configuradas en Vercel Dashboard**

## 📦 Variables de Entorno Requeridas

Las siguientes variables deben estar configuradas en Vercel Dashboard:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# SendGrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=caja.chica@esmargentina.net
SENDGRID_FROM_NAME=ESM Argentina - Caja Chica
```

## 🚀 Proceso de Deployment

### 1. Build Local
```bash
cd frontend
npm install
npm run build
```

### 2. Deploy a Producción
```bash
# Deploy directo a producción
vercel --prod

# O con force para saltar caché
vercel --prod --force
```

### 3. Actualizar Alias del Dominio
```bash
# Reemplazar [deployment-url] con la URL del nuevo deployment
vercel alias set [deployment-url] esmargentina.net
```

### 4. Verificar Deployment
```bash
# Ver lista de deployments
vercel list

# Ver estado del dominio
vercel domains inspect esmargentina.net
```

## 🔄 Comandos Útiles

### Promocionar un Deployment Específico
```bash
vercel promote [deployment-url]
```

### Rollback a Versión Anterior
```bash
vercel rollback [deployment-url]
```

### Ver Logs en Tiempo Real
```bash
vercel logs
```

### Inspeccionar Variables de Entorno
```bash
vercel env ls
```

## 📊 Monitoreo

### Dashboard de Vercel
- URL: https://vercel.com/esm-argentina/frontend
- Métricas de performance
- Logs de funciones
- Analytics

### Verificación de Cron Jobs
- Función: `/api/cron/daily-report`
- Horario: 0 0 * * * (21:00 Argentina)
- Logs: Disponibles en Vercel Dashboard

## 🐛 Troubleshooting

### Problema: Deployment no se actualiza
```bash
# Forzar nuevo deployment sin caché
vercel --prod --force --skip-domain

# Promocionar manualmente
vercel promote [deployment-url]

# Actualizar alias
vercel alias set [deployment-url] esmargentina.net
```

### Problema: Variables de entorno no funcionan
1. Verificar en Vercel Dashboard
2. Re-deploy después de cambiar variables
3. Verificar nombres (deben empezar con VITE_ para frontend)

### Problema: Dominio no resuelve
```bash
# Verificar nameservers
vercel domains inspect esmargentina.net

# Verificar DNS
nslookup esmargentina.net
```

### Limpiar Caché del Navegador
- Chrome: Ctrl+Shift+R
- Firefox: Ctrl+Shift+R  
- Safari: Cmd+Shift+R
- O abrir en modo incógnito

## 📝 Checklist Pre-Deployment

- [ ] Código testeado localmente
- [ ] Build sin errores
- [ ] Variables de entorno verificadas
- [ ] Firebase rules actualizadas
- [ ] SendGrid configurado
- [ ] Backup de base de datos realizado

## 🔒 Seguridad

1. **Nunca commitear credenciales**
2. **Usar variables de entorno de Vercel**
3. **Mantener Firebase rules restrictivas**
4. **Monitorear logs regularmente**

## 📞 Soporte

### Documentación Oficial
- Vercel: https://vercel.com/docs
- Firebase: https://firebase.google.com/docs
- SendGrid: https://docs.sendgrid.com

### Proyecto
- GitHub: https://github.com/[tu-usuario]/app_web_control_gastos
- Producción: https://esmargentina.net

## 🎯 Comandos Rápidos

```bash
# Deploy completo desde cero
cd frontend
npm install
npm run build
vercel --prod --force
vercel alias set [nueva-url] esmargentina.net

# Verificar estado
vercel list
vercel domains inspect esmargentina.net
```

---

*Última actualización: 26 de Agosto de 2025*
*Sistema desplegado y operativo en https://esmargentina.net*