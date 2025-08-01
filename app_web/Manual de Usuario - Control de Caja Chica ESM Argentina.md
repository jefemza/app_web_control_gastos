# Manual de Usuario - Control de Caja Chica ESM Argentina

## Información General

**URL de la Aplicación:** https://yutcfxxe.manus.space

**Desarrollado para:** ESM Argentina  
**Fecha de Desarrollo:** Julio 2025  
**Versión:** 1.0

## Descripción del Sistema

La aplicación de Control de Caja Chica es una herramienta web diseñada específicamente para ESM Argentina que permite gestionar de manera eficiente los gastos menores de la empresa. El sistema incluye funcionalidades de registro, aprobación, seguimiento y reportes de gastos.

## Usuarios del Sistema

### Usuarios Registrados:
1. **Juan Pablo Rúa** (Administrador)
   - Email: juan.pablo@esm.com.ar
   - Contraseña: password123
   - Permisos: Acceso completo al panel de control y aprobación de gastos

2. **Luis Tello** (Usuario)
   - Email: luis.tello@esm.com.ar
   - Contraseña: password123
   - Permisos: Registro y consulta de gastos propios

3. **Eugenio Cavallaro** (Usuario)
   - Email: eugenio.cavallaro@esm.com.ar
   - Contraseña: password123
   - Permisos: Registro y consulta de gastos propios

4. **Noelia** (Usuario)
   - Email: noelia@esm.com.ar
   - Contraseña: password123
   - Permisos: Registro y consulta de gastos propios

## Funcionalidades Principales

### 1. Inicio de Sesión
- Acceder a la aplicación con email y contraseña
- Interfaz con logo de ESM Argentina
- Validación de credenciales

### 2. Registro de Gastos
**Campos disponibles:**
- Fecha del gasto (automática o manual)
- Monto en pesos argentinos
- Medio de pago: Efectivo, Transferencia, Billetera, Tarjeta
- Categoría: Viáticos, Útiles, Transporte, Alimentación, Mantenimiento, Otros
- Descripción detallada del gasto
- Comprobante (opcional): Subida de archivo o captura con cámara

**Validaciones:**
- Alerta automática para montos elevados (>$10,000)
- Todos los campos obligatorios excepto comprobante
- Formato de fecha y monto validado

### 3. Consulta de Gastos Propios ("Mis Gastos")
- Visualización de todos los gastos registrados por el usuario
- Estados: Pendiente, Aprobado, Rechazado
- Información completa de cada gasto
- Posibilidad de ver comentarios del administrador

### 4. Panel de Control (Solo Administradores)
**Gráficos y Estadísticas:**
- Gráfico de barras: Gastos por usuario
- Gráfico circular: Distribución por categorías
- Totales y resúmenes automáticos

**Filtros Avanzados:**
- Por usuario específico
- Por categoría de gasto
- Por estado (pendiente, aprobado, rechazado)
- Por rango de fechas
- Función "Limpiar Filtros"

**Gestión de Gastos:**
- Tabla completa de todos los gastos registrados
- Botones de acción: Aprobar (verde) y Rechazar (rojo)
- Posibilidad de agregar comentarios
- Exportación a CSV de los datos filtrados

### 5. Exportación de Datos
- Generación de archivos CSV con los gastos filtrados
- Incluye todos los campos relevantes
- Descarga automática al navegador

## Categorías de Gastos Disponibles

1. **Viáticos**: Gastos de comida y hospedaje en viajes de trabajo
2. **Útiles**: Material de oficina y suministros
3. **Transporte**: Taxis, combustible, peajes
4. **Alimentación**: Comidas de trabajo y reuniones
5. **Mantenimiento**: Reparaciones menores y mantenimiento
6. **Otros**: Gastos diversos no clasificados en las categorías anteriores

## Medios de Pago Soportados

1. **Efectivo**: Pagos en dinero en efectivo
2. **Transferencia**: Transferencias bancarias
3. **Billetera**: Pagos con billeteras digitales (MercadoPago, etc.)
4. **Tarjeta**: Pagos con tarjeta de débito o crédito

## Flujo de Trabajo

### Para Usuarios Regulares:
1. Iniciar sesión en el sistema
2. Ir a "Registrar Gasto"
3. Completar todos los campos obligatorios
4. Adjuntar comprobante si está disponible
5. Guardar el gasto
6. Consultar estado en "Mis Gastos"

### Para Administradores:
1. Iniciar sesión en el sistema
2. Acceder al "Panel de Control"
3. Revisar gastos pendientes de aprobación
4. Aplicar filtros según necesidad
5. Aprobar o rechazar gastos con comentarios
6. Generar reportes y exportar datos

## Estados de los Gastos

- **Pendiente**: Gasto registrado, esperando aprobación
- **Aprobado**: Gasto aprobado por el administrador
- **Rechazado**: Gasto rechazado con comentarios explicativos

## Características Técnicas

- **Interfaz**: Tema oscuro profesional
- **Responsivo**: Compatible con dispositivos móviles y desktop
- **Gráficos**: Visualizaciones interactivas en tiempo real
- **Validaciones**: Controles automáticos de datos
- **Seguridad**: Autenticación por usuario y roles diferenciados

## Soporte y Contacto

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo o al administrador del sistema Juan Pablo Rúa.

---

**Nota**: Este manual corresponde a la versión 1.0 del sistema. Las funcionalidades pueden expandirse en futuras versiones según las necesidades de ESM Argentina.

