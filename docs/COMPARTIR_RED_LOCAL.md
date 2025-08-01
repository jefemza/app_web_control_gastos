# 🌐 Compartir la App en Red Local

## Configuración para Acceso en Red Local

### 1. **Configuración del Servidor (Ya Aplicada)**
En `vite.config.js` se agregó `host: true` para permitir acceso desde otros dispositivos.

### 2. **Iniciar el Servidor**
```bash
cd D:\app_web_control_gastos
npm run dev
```

### 3. **Obtener tu IP Local**

#### Opción A - Desde la Terminal:
```bash
# En Windows (Command Prompt o PowerShell)
ipconfig

# Busca "IPv4 Address" bajo tu adaptador de red activo
# Ejemplo: 192.168.1.100
```

#### Opción B - Desde la UI de Windows:
1. Click derecho en el ícono de red (esquina inferior derecha)
2. "Abrir configuración de red e Internet"
3. "Ver propiedades de red"
4. Buscar "Dirección IPv4"

### 4. **URLs de Acceso**

Cuando ejecutes `npm run dev`, verás algo así:
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
  ➜  Network: http://[::1]:3000/
```

### 5. **Compartir con tus Socios**

Comparte esta información:
```
================================
ACCESO A CONTROL DE CAJA CHICA
================================

URL: http://[TU-IP-LOCAL]:3000
Ejemplo: http://192.168.1.100:3000

CREDENCIALES:
- Admin: juan.pablo@esm.com.ar / admin123
- Socio: luis.tello@esm.com.ar / socio123
- Contadora: noelia@esm.com.ar / conta123

IMPORTANTE: 
- Deben estar en la misma red WiFi/LAN
- El servidor debe estar corriendo
================================
```

## 🔧 Solución de Problemas

### Si no pueden acceder:

1. **Firewall de Windows**
   - Windows Defender puede bloquear el acceso
   - Cuando inicies el servidor, acepta el diálogo de firewall
   - O agrega manualmente el puerto 3000:
   ```bash
   # PowerShell como Admin
   New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
   ```

2. **Antivirus**
   - Algunos antivirus bloquean servidores locales
   - Agrega una excepción para Node.js

3. **Verificar Conexión**
   - Asegúrate de que estén en la misma red
   - Prueba hacer ping a tu IP desde sus computadoras:
   ```bash
   ping 192.168.1.100
   ```

4. **Puerto Ocupado**
   - Si el puerto 3000 está ocupado, cambia en vite.config.js:
   ```javascript
   server: {
     port: 3001, // o cualquier puerto libre
     host: true
   }
   ```

## 🚀 Script de Inicio Rápido

Crea un archivo `iniciar-servidor.bat`:
```batch
@echo off
echo ========================================
echo INICIANDO CONTROL DE CAJA CHICA ESM
echo ========================================
echo.
echo Obteniendo IP local...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do set IP=%%i
set IP=%IP:~1%
echo.
echo ========================================
echo SERVIDOR INICIADO
echo ========================================
echo.
echo Acceso Local: http://localhost:3000
echo Acceso en Red: http://%IP%:3000
echo.
echo Compartir esta URL con los socios:
echo http://%IP%:3000
echo.
echo ========================================
echo CREDENCIALES:
echo Admin: juan.pablo@esm.com.ar / admin123
echo Socio: luis.tello@esm.com.ar / socio123
echo ========================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
npm run dev
```

## 📱 Acceso desde Móviles

Los socios también pueden acceder desde sus celulares:
1. Conectarse al mismo WiFi
2. Abrir el navegador
3. Ingresar: `http://[TU-IP]:3000`
4. La app es responsive y funciona perfectamente

## 🔒 Consideraciones de Seguridad

⚠️ **IMPORTANTE**: Este método es solo para uso en red local durante desarrollo.

Para producción real:
- No expongas el servidor de desarrollo a Internet
- Usa HTTPS siempre
- Implementa autenticación real con Supabase
- Despliega en un servidor seguro (Netlify/Vercel)

## 💡 Alternativa: ngrok (Acceso Temporal desde Internet)

Si necesitas compartir temporalmente fuera de la red local:
```bash
# Instalar ngrok
npm install -g ngrok

# En una terminal
npm run dev

# En otra terminal
ngrok http 3000

# Te dará una URL pública temporal como:
# https://abc123.ngrok.io
```

**Nota**: ngrok es solo para pruebas temporales, no para uso permanente.