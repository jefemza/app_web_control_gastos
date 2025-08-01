# Resumen del Chat - Aplicación Web Control de Caja Chica ESM Argentina

## Contexto de la Empresa

**ESM Argentina** es una empresa de telecomunicaciones ubicada en Mendoza, Argentina, que se dedica a:
- Portabilidad numérica (principalmente con Movistar Argentina)
- Comercialización de fibra óptica
- Venta telefónica con sistema de discado predictivo Mitrol

### Estructura Societaria
- **Luis Tello** (co-director y responsable estratégico)
- **Juan Pablo Rúa** (socio, encargado del control de caja chica)
- **Eugenio Cavallaro** (socio)
- **Noelia** (administradora/contadora)

## Objetivo del Proyecto

Crear una aplicación web para el control de gastos de caja chica de la empresa, que permita a los socios y a la contadora registrar gastos y a Juan Pablo Rúa supervisar y controlar todo el proceso.

## Requisitos Funcionales Específicos

### Usuarios y Roles

| Usuario | Rol | Permisos |
|---------|-----|----------|
| Juan Pablo Rúa | Admin principal | Acceso total: ver, editar, aprobar, exportar todos los gastos |
| Luis Tello | Socio operador | Cargar y ver solo sus propios gastos |
| Eugenio Cavallaro | Socio operador | Cargar y ver solo sus propios gastos |
| Noelia | Contadora | Cargar gastos y consultar reportes |

### Funcionalidades Principales

#### 1. Registro de Gastos (Socios + Noelia)
- **Formulario con campos:**
  - Fecha del gasto (por defecto: hoy)
  - Monto (numérico, obligatorio)
  - Medio de pago (desplegable: efectivo, transferencia, billetera virtual, tarjeta)
  - Categoría (editable: viáticos, útiles, transporte, etc.)
  - Descripción libre
  - Comprobante adjunto (OPCIONAL)

- **Opciones de comprobante:**
  - Foto desde cámara del navegador
  - Subida desde galería/archivos
  - Captura de pantalla (especialmente para pagos con billetera virtual)
  - Documento PDF

- **Validaciones:**
  - Monto > 0
  - Si monto > $10.000: mostrar alerta (no bloquear)
  - Fecha no puede ser futura
  - Imagen/documento NO obligatorio

#### 2. Panel de Control (Solo Juan Pablo Rúa)
- **Vista en tabla con:**
  - Filtros por: fecha, usuario, categoría, estado
  - Columnas: fecha, usuario, monto, concepto, comprobante, estado
  - Acciones: Aprobar/Rechazar, Comentario interno, Editar gasto
  - Exportar CSV/PDF con todos los atributos

- **Visualizaciones:**
  - Gráficos por categoría/usuario/mes
  - Total por socio y por mes

#### 3. Reportes y Exportación
- **Juan Pablo tiene acceso completo a:**
  - Exportación por mes (CSV o PDF)
  - Filtros por usuario, período, estado
  - Todos los atributos en las exportaciones

#### 4. Funcionalidad de Correo (PENDIENTE)
- Preparado para activación futura
- Mail tipo: gastos@esm.com.ar
- Lógica: Mail con asunto "Nuevo Gasto" → extrae datos → carga automática

## Especificaciones Técnicas

### Base de Datos
**Tabla: gastos**
- id (UUID)
- fecha (Date)
- usuario (String)
- monto (Float)
- medio_pago (String)
- categoria (String)
- descripcion (Text)
- archivo_url (String)
- estado (String: pendiente/aprobado/rechazado)
- comentario_admin (Text)
- timestamp (DateTime)

### Arquitectura Tecnológica Recomendada
- **Frontend:** React + Vite + Tailwind CSS
- **Deploy:** GitHub Pages o Netlify
- **Backend/DB:** Supabase (PostgreSQL + API + storage + auth)
- **Auth:** Supabase Auth
- **Storage:** Supabase Bucket para fotos y documentos

### Flujo de Trabajo
1. Usuario carga gasto desde formulario
2. Gasto queda en estado "pendiente"
3. Juan Pablo revisa, aprueba o rechaza
4. Se genera historial y reportes exportables
5. Integración por correo (futura)

## Requisitos de Diseño

### UX/UI Deseada
- Interfaz tipo dashboard, limpia y moderna
- Inspiración: estilo Notion/Linear/Clean Admin Dashboard
- Compatible con desktop y tablets
- Tipografía clara, espaciado generoso
- Animaciones suaves al validar/rechazar
- Botones grandes y visibles, sin sobrecarga visual

## Proceso de Validación

- **Responsable de pruebas:** Juan Pablo Rúa
- Todos los cambios deben ser testeados por Juan Pablo antes de quedar activos
- Los demás usuarios (Luis, Eugenio, Noelia) pueden usar la app normalmente pero no administran el sistema

## Consideraciones Especiales

1. **Flexibilidad en comprobantes:** No es obligatorio subir ticket al 100%, especialmente para pagos con billetera virtual donde se puede subir captura de pantalla
2. **Acceso a cámara:** Permitir uso de cámara nativa del navegador para capturar comprobantes
3. **Control centralizado:** Juan Pablo Rúa tiene control total sobre aprobaciones y exportaciones
4. **Preparación para correo:** Sistema preparado para integración futura con correo empresarial

## Metodología de Implementación

Basado en proyectos anteriores de ESM, se debe replicar la arquitectura exitosa:
- Despliegue en GitHub Pages o Netlify
- Backend con Supabase para máxima confiabilidad
- Deploy automatizado vía GitHub Actions
- Backup automático en repositorio privado

## Próximos Pasos

1. Crear base técnica en formato repositorio
2. Implementar frontend con React + Tailwind
3. Configurar Supabase para backend y storage
4. Implementar sistema de autenticación
5. Crear panel de administración para Juan Pablo
6. Pruebas con Juan Pablo Rúa
7. Deploy en producción
8. Preparar integración de correo (futura)

