Esquema de Autorizaciones para Ejecuciones

Tipos de autorización
- Código: creación/edición de archivos, refactors.
- Datos: migraciones, borrados masivos, restauraciones.
- Deploy: preproducción/producción, alias de dominio, rollbacks.
- Infra/servicios: Firebase (Auth/Rules/Firestore/Storage), Vercel, SendGrid/cron.
- Credenciales/secretos: creación/rotación de claves y variables de entorno.
- Facturación/costos: planes, cuotas, límites.
- Soporte/emergencia: hotfix en producción, revert inmediato.

Formato estándar de solicitud (para pedir permiso)
- Acción: qué haré (claro y concreto).
- Alcance: repositorio/servicio/colección afectada.
- Impacto: riesgo, downtime estimado, datos afectados.
- Backout: cómo revertir si algo sale mal.
- Ventana: cuándo ejecutarlo (fecha/hora, duración).
- Logs: dónde quedará registrado (commits, auditoría, .md).

Plantilla de aprobación rápida (copiar/pegar)
```
Autorizar: [acción concreta]
Alcance: [repos/servicios/colecciones]
Impacto: [riesgo/downtime]
Backout: [cómo vuelvo]
Ventana: [fecha-hora y duración]
```
Ejemplo: “Autorizar: Deploy prod frontend (Vercel). Impacto: sin datos, 0 downtime. Backout: rollback al deploy anterior. Ventana: hoy 19:00-19:10.”

Niveles y tiempos
- Bajo riesgo: estilos/UI/copias de contenido – ejecución inmediata tras “OK”.
- Medio riesgo: cambios de lógica/filtros – ventana 15–30 min y punto de rollback.
- Alto riesgo: datos, reglas de seguridad, credenciales – ventana planificada + backup + verificación posterior.

Política de ejecución
- Por defecto: no tocar producción sin “Autorizar: …”.
- Emergencias: hotfix mínimo y aviso inmediato. Registrar backout.

Auditoría
- Commits descriptivos referenciando autorización.
- Notas en `ESTADO_ACTUAL.md` y `docs/project-config.json`.
- Registro de despliegues (Vercel) y cambios de reglas (Firestore).

Gestión de secretos
- Variables en Vercel por ambiente.
- Principio de menor privilegio.
- Rotación periódica; nunca en el código.

Ventanas y comunicación
- Recomendado fuera de horario pico.
- Antes: solicitud con plantilla.
- Después: confirmación de resultado y verificación (smoke test).

