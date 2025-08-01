# Plan de Desarrollo - Aplicación Web Control de Caja Chica ESM Argentina

## 1. Introducción

Este documento presenta el plan de desarrollo para la aplicación web de control de caja chica de ESM Argentina, basado en la especificación técnica detallada previamente definida. El objetivo es establecer una hoja de ruta clara y estructurada que incorpore las mejores prácticas de desarrollo de software, asegurando la entrega de una solución de alta calidad, eficiente y que cumpla con todos los requisitos funcionales y no funcionales. Este plan está diseñado para ser iterativo y flexible, permitiendo la adaptación a medida que el proyecto avanza y se recibe retroalimentación.

## 2. Metodología de Desarrollo

Se adoptará una metodología de desarrollo ágil, preferentemente **Scrum**, para gestionar el proyecto. Este enfoque facilitará la colaboración, la transparencia y la capacidad de respuesta a los cambios. El desarrollo se dividirá en sprints cortos, cada uno con objetivos claros y entregables funcionales.

### 2.1. Fases del Proyecto (Sprints)

El proyecto se estructurará en las siguientes fases o sprints principales, cada uno con un conjunto de tareas y objetivos específicos:

-   **Sprint 0: Configuración e Infraestructura (1-2 semanas)**
-   **Sprint 1: Módulo de Registro de Gastos (2-3 semanas)**
-   **Sprint 2: Módulo de Panel de Control (Juan Pablo Rúa) (3-4 semanas)**
-   **Sprint 3: Módulo de Reportes y Exportación (2-3 semanas)**
-   **Sprint 4: Refinamiento, Pruebas y Despliegue (2-3 semanas)**
-   **Fase Posterior: Integración de Correo Electrónico (Tiempo a definir)**

Cada sprint culminará con una revisión de sprint donde se presentarán los avances a Juan Pablo Rúa para su validación y retroalimentación.

## 3. Herramientas y Tecnologías

Las herramientas y tecnologías a utilizar se alinean con la arquitectura definida en la especificación técnica, priorizando soluciones modernas, escalables y eficientes.

| Categoría | Herramienta/Tecnología | Propósito | Justificación de la Mejor Práctica |
|---|---|---|---|
| **Gestión de Proyectos** | Jira / Trello (o similar) | Seguimiento de tareas, bugs, y progreso del sprint. | Facilita la organización, transparencia y comunicación del equipo. Permite priorizar el backlog. |
| **Control de Versiones** | Git / GitHub | Gestión del código fuente, colaboración y control de cambios. | Estándar de la industria para desarrollo colaborativo. Permite ramas, fusiones y seguimiento de historial. |
| **Frontend** | React.js (con Vite) | Construcción de la interfaz de usuario. | Rendimiento, ecosistema robusto, componentes reutilizables. Vite optimiza el proceso de desarrollo. |
| **Estilos** | Tailwind CSS | Framework CSS utilitario. | Desarrollo rápido de UI, personalización profunda, minimiza el CSS no utilizado en producción. |
| **Backend & DB** | Supabase | Base de datos, autenticación, almacenamiento, APIs. | Solución "Backend-as-a-Service" (BaaS) que acelera el desarrollo, gestiona la infraestructura y ofrece escalabilidad. |
| **Despliegue** | GitHub Pages / Netlify (Frontend) | Hosting estático para la aplicación web. | Despliegue continuo (CI/CD) automatizado, alta disponibilidad, bajo costo, integración con GitHub. |
| **CI/CD** | GitHub Actions | Automatización de pruebas y despliegues. | Integración nativa con GitHub, permite pipelines de CI/CD robustos y personalizables. |
| **Pruebas** | Jest / React Testing Library (Frontend) | Pruebas unitarias y de integración para componentes React. | Asegura la calidad del código, previene regresiones y facilita el refactoring. |
| **Pruebas** | Supertest / Postman (Backend) | Pruebas de API para el backend de Supabase. | Valida la correcta funcionalidad de los endpoints y la lógica de negocio. |

## 4. Plan Detallado por Sprint

### 4.1. Sprint 0: Configuración e Infraestructura

**Objetivo:** Establecer el entorno de desarrollo, configurar los servicios base y el repositorio del proyecto.

**Tareas:**

-   **Creación del Repositorio:** Inicializar un repositorio privado en GitHub para el proyecto (`caja-chica-esm`).
-   **Configuración de Supabase:**
    -   Crear un nuevo proyecto en Supabase.
    -   Configurar la base de datos PostgreSQL: crear la tabla `gastos` con el esquema definido en la especificación técnica.
    -   Configurar Supabase Auth: habilitar proveedores de autenticación (ej. email/password).
    -   Configurar Supabase Storage: crear el bucket `comprobantes-caja-chica`.
    -   Definir las políticas de Row Level Security (RLS) iniciales para la tabla `gastos` y el bucket de almacenamiento.
-   **Inicialización del Proyecto Frontend:**
    -   Crear un nuevo proyecto React con Vite (`npx create-vite@latest caja-chica-frontend --template react-ts`).
    -   Instalar dependencias de Tailwind CSS y configurar (`npm install -D tailwindcss postcss autoprefixer`).
    -   Instalar el SDK de Supabase para JavaScript (`npm install @supabase/supabase-js`).
-   **Configuración de CI/CD (Básico):**
    -   Configurar un flujo de trabajo básico de GitHub Actions para el despliegue automático del frontend a GitHub Pages o Netlify en la rama `main`.
-   **Documentación Inicial:** Crear un archivo `README.md` en el repositorio con instrucciones básicas de configuración y ejecución del proyecto.

**Entregables:**

-   Repositorio de GitHub inicializado y configurado.
-   Proyecto Supabase con DB, Auth y Storage configurados.
-   Proyecto React/Vite con Tailwind CSS y Supabase SDK instalados.
-   Pipeline de CI/CD básico para el frontend.

### 4.2. Sprint 1: Módulo de Registro de Gastos

**Objetivo:** Implementar la funcionalidad principal de registro de gastos, incluyendo el formulario, validaciones y carga de comprobantes.

**Tareas:**

-   **Diseño de Componentes UI:**
    -   Crear componentes React para el formulario de registro de gastos (Input, Select, DatePicker, FileInput, CameraInput).
    -   Implementar el diseño UI/UX "acojonante" utilizando Tailwind CSS, siguiendo la inspiración de Notion/Linear.
-   **Lógica del Formulario:**
    -   Implementar la lógica de estado para el formulario (React `useState`, `useReducer` o una librería de formularios como `React Hook Form`).
    -   Implementar las validaciones de frontend (monto > 0, fecha no futura, alerta de monto > $10.000).
-   **Integración con Supabase:**
    -   Desarrollar la función para insertar nuevos gastos en la tabla `gastos` de Supabase.
    -   Implementar la lógica para subir archivos de comprobantes a Supabase Storage y guardar la `archivo_url` en la base de datos.
    -   Manejo de errores y feedback al usuario tras el envío del formulario.
-   **Autenticación Básica:**
    -   Implementar la pantalla de login/registro de usuarios utilizando Supabase Auth.
    -   Asegurar que solo usuarios autenticados puedan acceder al formulario de registro de gastos.
-   **Pruebas Unitarias:** Escribir pruebas unitarias para los componentes del formulario y la lógica de inserción de datos.

**Entregables:**

-   Formulario de registro de gastos funcional y estilizado.
-   Carga de comprobantes a Supabase Storage.
-   Autenticación de usuarios básica.
-   Pruebas unitarias para el módulo de registro.

### 4.3. Sprint 2: Módulo de Panel de Control (Juan Pablo Rúa)

**Objetivo:** Desarrollar la interfaz administrativa para Juan Pablo Rúa, permitiéndole visualizar, filtrar, aprobar, rechazar y editar gastos.

**Tareas:**

-   **Diseño de Componentes UI:**
    -   Crear componentes React para la tabla de gastos (Tabla, Paginación, Filtros, Botones de Acción).
    -   Implementar los gráficos de resumen (ej. usando una librería como Chart.js o Recharts) para "Total Gastado por Socio" y "Categorías con Más Consumo".
-   **Lógica del Panel:**
    -   Desarrollar la lógica para obtener todos los gastos de Supabase (con filtros y paginación).
    -   Implementar las funciones para actualizar el `estado` de un gasto (aprobar/rechazar) y añadir `comentario_admin`.
    -   Implementar la funcionalidad de edición de gastos para Juan Pablo Rúa.
-   **Gestión de Roles:**
    -   Asegurar que solo los usuarios con el rol `admin_principal` (Juan Pablo Rúa) puedan acceder a este panel.
    -   Refinar las políticas de RLS en Supabase para aplicar los permisos de visualización y edición según el rol.
-   **Pruebas de Integración:** Escribir pruebas de integración para el panel de control, verificando la interacción con el backend y la correcta aplicación de filtros y acciones.

**Entregables:**

-   Panel de control funcional para Juan Pablo Rúa con tabla de gastos, filtros y gráficos.
-   Funcionalidades de aprobación, rechazo y edición de gastos.
-   Control de acceso basado en roles.

### 4.4. Sprint 3: Módulo de Reportes y Exportación

**Objetivo:** Implementar las funcionalidades de generación y exportación de reportes en formatos CSV y PDF.

**Tareas:**

-   **Lógica de Exportación CSV:**
    -   Desarrollar una función en el frontend (o una función de Supabase/Edge Function si la lógica es compleja) para consultar los datos de gastos según los filtros seleccionados.
    -   Formatear los datos obtenidos en una cadena CSV, incluyendo todos los atributos de la tabla `gastos`.
    -   Implementar la descarga del archivo CSV en el navegador.
-   **Lógica de Exportación PDF:**
    -   Investigar y seleccionar una librería de JavaScript para la generación de PDF en el cliente (ej. `jsPDF` o `react-pdf`).
    -   Diseñar el layout del PDF, incluyendo una tabla con los datos de los gastos y posiblemente un encabezado/pie de página con la información de la empresa.
    -   Implementar la generación y descarga del archivo PDF.
-   **Interfaz de Usuario para Exportación:**
    -   Crear un modal o sección en el panel de control de Juan Pablo Rúa para seleccionar el formato de exportación y aplicar filtros específicos para el reporte.
-   **Pruebas de Funcionalidad:** Realizar pruebas exhaustivas de las exportaciones para asegurar que los datos son correctos y completos en ambos formatos.

**Entregables:**

-   Funcionalidad de exportación de gastos a CSV.
-   Funcionalidad de exportación de gastos a PDF.
-   Interfaz de usuario para la configuración de reportes.

### 4.5. Sprint 4: Refinamiento, Pruebas y Despliegue

**Objetivo:** Realizar pruebas finales, optimizaciones, corregir errores y preparar la aplicación para el despliegue en producción.

**Tareas:**

-   **Pruebas de Aceptación de Usuario (UAT):**
    -   Desplegar la aplicación en un entorno de staging/pruebas.
    -   Juan Pablo Rúa realizará pruebas exhaustivas de todas las funcionalidades, reportando cualquier bug o sugerencia de mejora.
    -   Recopilar y priorizar el feedback de Juan Pablo Rúa.
-   **Corrección de Bugs y Mejoras:**
    -   Resolver todos los bugs identificados durante las pruebas internas y UAT.
    -   Implementar mejoras menores de UI/UX basadas en el feedback.
-   **Optimización de Rendimiento:**
    -   Revisar el código para posibles optimizaciones de rendimiento (ej. lazy loading de componentes, optimización de consultas a Supabase).
-   **Seguridad:**
    -   Realizar una revisión final de las políticas de RLS y la seguridad de la API.
    -   Asegurar que las credenciales de Supabase estén configuradas de forma segura (variables de entorno).
-   **Documentación Final:**
    -   Actualizar la documentación técnica con cualquier cambio o adición realizada durante el desarrollo.
    -   Crear un manual de usuario básico para Juan Pablo Rúa y los socios.
-   **Despliegue en Producción:**
    -   Realizar el despliegue final de la aplicación en los entornos de producción (GitHub Pages/Netlify para el frontend, Supabase para el backend).
    -   Verificar la funcionalidad post-despliegue.

**Entregables:**

-   Aplicación web estable y funcional en entorno de producción.
-   Reporte de pruebas de aceptación con validación de Juan Pablo Rúa.
-   Documentación técnica y manual de usuario actualizados.

### 4.6. Fase Posterior: Integración de Correo Electrónico

**Objetivo:** Implementar la funcionalidad de registro de gastos vía correo electrónico.

**Tareas:**

-   **Investigación de Soluciones:** Evaluar opciones para procesar correos electrónicos (ej. Supabase Edge Functions con un servicio de parsing de email, Zapier/Make, o un microservicio dedicado).
-   **Configuración de Casilla de Correo:** Configurar `gastos@esm.com.ar` y asegurar su accesibilidad programática.
-   **Desarrollo del Procesador de Email:** Implementar la lógica para:
    -   Detectar remitente autorizado.
    -   Extraer monto y descripción del cuerpo del correo.
    -   Descargar y subir adjuntos a Supabase Storage.
    -   Crear el registro de gasto en estado "pendiente".
-   **Pruebas:** Pruebas exhaustivas de la integración de correo.

**Entregables:**

-   Funcionalidad de registro de gastos vía correo electrónico operativa.

## 5. Mejores Prácticas Aplicadas

Este plan de desarrollo integra diversas mejores prácticas para asegurar la calidad, eficiencia y sostenibilidad del proyecto:

-   **Desarrollo Ágil:** Permite la adaptación, la retroalimentación temprana y la entrega incremental de valor.
-   **Arquitectura Desacoplada:** Frontend y backend separados facilitan el mantenimiento, la escalabilidad y la reutilización de componentes.
-   **Uso de BaaS (Supabase):** Acelera el desarrollo al abstraer la gestión de la base de datos, autenticación y almacenamiento, permitiendo al equipo enfocarse en la lógica de negocio.
-   **Control de Versiones (Git/GitHub):** Esencial para la colaboración, el seguimiento de cambios y la gestión de versiones del código.
-   **CI/CD:** Automatiza los procesos de construcción, prueba y despliegue, reduciendo errores manuales y acelerando las entregas.
-   **Pruebas Automatizadas:** Garantizan la calidad del código y previenen regresiones, lo que es crucial para un sistema financiero.
-   **Diseño UI/UX Centrado en el Usuario:** Asegura una experiencia intuitiva y agradable, lo que fomenta la adopción y el uso correcto de la aplicación.
-   **Seguridad desde el Diseño:** Implementación de RLS, validaciones en el backend y uso de HTTPS para proteger los datos.
-   **Documentación:** Mantenimiento de una documentación clara y actualizada para facilitar el entendimiento y el futuro mantenimiento del sistema.
-   **Validación por el Usuario Clave (Juan Pablo Rúa):** La participación activa de Juan Pablo Rúa en las pruebas de aceptación asegura que la aplicación cumpla con las expectativas y necesidades reales del negocio.

## 6. Consideraciones de Recursos y Tiempos

Los tiempos estimados para cada sprint son aproximados y pueden variar según la disponibilidad del equipo y la complejidad real de las tareas. Se recomienda un equipo de desarrollo ágil, idealmente con un desarrollador frontend/fullstack y un especialista en Supabase/backend, o un desarrollador fullstack con experiencia en ambas áreas.

## 7. Conclusión

Este plan de desarrollo proporciona una hoja de ruta completa para la creación de la aplicación web de control de caja chica de ESM Argentina. Al seguir estas directrices y aplicar las mejores prácticas, se espera entregar una solución robusta, eficiente y adaptada a las necesidades específicas de la empresa, con Juan Pablo Rúa como el validador clave de su éxito.

--- 

**Autor:** Manus AI
**Fecha:** 26 de julio de 2025



