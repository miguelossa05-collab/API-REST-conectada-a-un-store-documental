# Estado de preparación y comprobaciones

## Completado

- Código de la API basado en la guía: modelos, controladores, rutas GET/POST, filtros, conexión y carga inicial.
- Dependencias instaladas y versiones fijadas en `package-lock.json`.
- Seis pruebas de validación y HTTP ejecutadas correctamente con `npm run test:unit`.
- Proyecto de MongoDB Atlas creado: **Tienda Comics - Miguel Ossa**.
- Clúster **ComicsStore**, gratuito M0, AWS US_EAST_1, operativo.
- Base **tienda_comics** con **5 autores** y **10 cómics**.
- Conteos comprobados directamente en Atlas.
- Los diez campos `autor` son de tipo BSON ObjectId y cada uno enlaza exactamente con un autor existente; comprobado con una agregación `$lookup`.
- `fechaNacimiento` almacenada como BSON Date, no como texto ni objeto anidado.

Host del clúster, sin credenciales: `comicsstore.qj6affu.mongodb.net`.

## Pendiente de ejecutar desde el equipo o Codespace del estudiante

- Crear/configurar el usuario de base de datos para la API con acceso `readWrite` a `tienda_comics`.
- Autorizar la IP de ese equipo en Network Access.
- Completar `.env` y comprobar la conexión con `npm run db:check`.
- Iniciar la API y probar GET/POST contra Atlas mediante Postman.
- Publicar el código en el repositorio personal de esta entrega y entregar su URL.

La preparación de datos en Atlas se realizó mediante la conexión de administración, no ejecutando la API Node.js contra Atlas. Por eso no se presenta esa comprobación como una prueba de extremo a extremo.

## Límite de la prueba de integración

Se incluyeron nueve pruebas de integración en `tests/api.test.js`. Se intentó ejecutarlas en el entorno de preparación, pero el proceso temporal de MongoDB no pudo iniciar: `open: Operation not permitted`, salida 100. La suite no llegó a comprobar persistencia por HTTP. Ejecuta `npm run test:integration` en un equipo o Codespace que permita iniciar MongoDB. No se debe reportar que esas nueve pruebas pasaron hasta ejecutarlas correctamente.
