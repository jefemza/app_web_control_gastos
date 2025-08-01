# 📋 INSTRUCCIONES PARA CONTINUAR - Control de Caja Chica ESM

**Fecha**: 29 de Julio 2025
**Proyecto**: Control de Caja Chica ESM Argentina
**Ubicación**: D:\app_web_control_gastos

## 🎯 CONTEXTO RÁPIDO
Sistema web de control de gastos para ESM Argentina con React + Firebase. Tema oscuro "Cristal Noir" (negro/dorado).

## ✅ COMPLETADO RECIENTEMENTE
1. **Sistema de carga real de archivos a Firebase Storage** 
   - Subida, compresión, vista previa y descarga funcionando
   - Archivos creados: `storageService.js`
   - Páginas actualizadas: `RegistroGastos.jsx`, `VistaGastos.jsx`

## 🚀 SIGUIENTE TAREA: Dashboard con Gráficos

### Implementar:
1. **Instalar Recharts**:
   ```bash
   cd D:\app_web_control_gastos
   npm install recharts
   ```

2. **Crear componentes de gráficos**:
   - `PieChartGastos.jsx` - Gastos por categoría
   - `BarChartMensual.jsx` - Gastos por mes
   - `LineChartTendencia.jsx` - Tendencia temporal

3. **Actualizar Dashboard** (`src/pages/Dashboard.jsx`):
   - Reemplazar cards estáticas con datos reales
   - Agregar gráficos interactivos
   - Filtros por período (mes, trimestre, año)
   - Mantener diseño Cristal Noir

### Datos necesarios desde Firebase:
- Agrupar gastos por categoría
- Sumar montos por mes
- Calcular tendencias
- Solo mostrar gastos "aprobados" en estadísticas

## 📁 ARCHIVOS CLAVE
- `/SEGUIMIENTO_PROYECTO.md` - Lista completa de funcionalidades
- `/src/services/gastosService.js` - Para obtener datos
- `/src/config/firebase.js` - Configuración Firebase

## 🎨 DISEÑO
- Colores para gráficos: 
  - Dorado principal: #D4AF37
  - Escala de grises: #4a4a4a, #6a6a6a, #8a8a8a
  - Acentos: verde (#10b981), rojo (#ef4444), azul (#3b82f6)
- Fondo oscuro para todos los gráficos
- Tooltips personalizados

## 👥 USUARIOS DE PRUEBA
- Admin: juan.pablo@esm.com.ar / admin123
- Socio: luis.tello@esm.com.ar / socio123
- Contadora: noelia@esm.com.ar / conta123

## 💡 NOTAS IMPORTANTES
1. El Dashboard debe ser responsive
2. Los gráficos deben actualizarse en tiempo real
3. Admin ve todos los gastos, socios solo los suyos
4. Incluir período seleccionable (mes actual por defecto)

## 🔄 DESPUÉS DE GRÁFICOS
Siguiente prioridad: Sistema de Notificaciones

---
**INSTRUCCIÓN PARA CLAUDE:**
"Necesito continuar con el proyecto de Control de Caja Chica ESM. Ya completé la carga de archivos a Firebase Storage. Ahora necesito implementar el Dashboard con gráficos usando Recharts. El proyecto está en D:\app_web_control_gastos. Por favor revisa las instrucciones en este archivo y el SEGUIMIENTO_PROYECTO.md para continuar donde quedamos."