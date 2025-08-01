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
echo Socio: eugenio.cavallaro@esm.com.ar / socio123
echo Contadora: noelia@esm.com.ar / conta123
echo ========================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
npm run dev