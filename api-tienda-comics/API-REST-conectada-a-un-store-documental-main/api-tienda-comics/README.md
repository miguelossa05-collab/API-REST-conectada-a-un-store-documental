# API REST — Tienda de cómics

**Estudiante:** Miguel Ángel Ossa  
**Asignatura:** Programación Orientada a la Web  
**Universidad:** Universidad Santiago de Cali

Aplicación de gestión de autores y cómics basada en el ejercicio de [la guía del docente](https://github.com/dfloaizab/WebProgramming/blob/main/2026B/Unidad2/ComicsStore_APIRest/readme.md).

## Tecnologías

Node.js, Express, Mongoose, MongoDB Atlas, HTML, CSS y JavaScript.

## Instalación y configuración

Requisitos: Node.js 22 o posterior, npm y una instancia de MongoDB Atlas accesible desde el servidor.

Desde la carpeta `api-tienda-comics`:

```bash
npm ci
```

La configuración utiliza un archivo local `.env`, basado en `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://USUARIO:CLAVE_CODIFICADA@TU_CLUSTER.mongodb.net/tienda_comics?retryWrites=true&w=majority
```

La URI requiere un usuario con permisos sobre `tienda_comics` y acceso de red autorizado en Atlas. Los caracteres reservados de las credenciales requieren codificación de URL. El archivo `.env` está excluido de Git.

```bash
npm start
```

Cliente web: http://localhost:3000/tienda/  
API: http://localhost:3000/api/comics

El puerto corresponde a la variable `PORT`. El cliente se sirve desde Express; no funciona como aplicación independiente al abrir el HTML directamente. El proyecto no incluye autenticación y está destinado a un entorno de práctica con acceso controlado.

## Comandos

| Comando | Función |
|---|---|
| `npm start` | Iniciar el servidor |
| `npm run dev` | Iniciar con reinicio al modificar archivos |
| `npm run db:check` | Comprobar la conexión mediante ping |
| `npm run seed` | Cargar cinco autores y diez cómics de ejemplo |
| `npm run test:unit` | Pruebas de validación y respuestas HTTP |
| `npm run test:integration` | Pruebas con MongoDB temporal |
| `npm test` | Ejecutar todos los archivos de pruebas |

La carga inicial usa inserción condicional: conserva documentos existentes y permite repetir la carga de los ejemplos sin duplicarlos. No está diseñada para ejecuciones simultáneas.

## Endpoints

| Método | Ruta | Resultado |
|---|---|---|
| GET | `/` | Mensaje de funcionamiento |
| GET | `/tienda/` | Cliente web |
| POST | `/api/autores` | Crear autor |
| GET | `/api/autores` | Listar autores |
| GET | `/api/autores/:id` | Consultar autor |
| POST | `/api/comics` | Crear cómic |
| GET | `/api/comics` | Listar cómics con datos del autor |
| GET | `/api/comics/:id` | Consultar cómic |

Filtros combinables: `/api/comics?editorial=DC%20Comics&autor=ID_DEL_AUTOR`. Una consulta sin coincidencias devuelve `[]`.

### Autor — cuerpo de POST

```json
{
  "nombre": "Hayao Miyazaki",
  "nacionalidad": "Japonesa",
  "fechaNacimiento": "1941-01-05"
}
```

### Cómic — cuerpo de POST

```json
{
  "titulo": "Nausicaä del Valle del Viento",
  "autor": "ID_DE_UN_AUTOR_EXISTENTE",
  "editorial": "Tokuma Shoten",
  "anioPublicacion": 1982,
  "precio": 68000,
  "stock": 4
}
```

Las peticiones POST requieren `Content-Type: application/json`. El campo `autor` contiene el identificador de un autor existente. La colección `docs/ComicsStore.postman_collection.json` incluye peticiones de ejemplo y captura el identificador del autor para la creación del cómic.

| Código | Significado |
|---|---|
| 200 | Consulta exitosa |
| 201 | Documento creado |
| 400 | Datos, identificador o JSON inválidos |
| 404 | Documento o ruta no encontrados |
| 409 | Título duplicado |
| 413 | Cuerpo superior a 100 KB |
| 415 | Formato distinto de JSON |
| 500 | Error del servidor |

## Modelo documental

Base de datos: `tienda_comics`.

| Colección | Campo | Tipo y validación |
|---|---|---|
| autores | nombre | String obligatorio |
| autores | nacionalidad | String opcional |
| autores | fechaNacimiento | Date opcional |
| comics | titulo | String obligatorio y único |
| comics | autor | ObjectId obligatorio, referencia a autores |
| comics | editorial | String opcional |
| comics | anioPublicacion | Entero desde 1900, opcional |
| comics | precio | Número obligatorio, mínimo 0, en COP |
| comics | stock | Entero mínimo 0, predeterminado 0 |
| ambas | _id | ObjectId generado por MongoDB |
| ambas | createdAt / updatedAt | Fechas automáticas |

Las consultas de cómics incluyen nombre y nacionalidad del autor mediante `populate()`.

## Estructura

| Ruta | Responsabilidad |
|---|---|
| `public/` | HTML, CSS y JavaScript del cliente |
| `src/app.js` | Conexión, índices e inicio del servidor |
| `src/http.js` | Aplicación Express y rutas |
| `src/config/` | Configuración de MongoDB |
| `src/models/` | Esquemas de Autor y Comic |
| `src/controllers/` | Operaciones de creación y consulta |
| `src/routes/` | Rutas REST |
| `src/middleware/` | Validación y manejo de errores |
| `data/` | Datos de ejemplo |
| `tests/` | Pruebas automatizadas |
| `docs/` | Documentación del cliente y colección Postman |

## Pruebas

- `tests/validacion.test.js`: validación de modelos y respuestas HTTP sin Atlas.
- `tests/frontend.test.js`: archivos estáticos y cliente HTTP con respuestas simuladas.
- `tests/api.test.js`: persistencia, referencias, filtros, duplicados y carga inicial con `mongodb-memory-server`. Requiere descargar y ejecutar un binario temporal de MongoDB.

Pruebas sin base de datos:

```bash
node --test tests/validacion.test.js tests/frontend.test.js
```

Las pruebas automatizadas no usan la URI de Atlas ni modifican sus registros. Las pruebas simuladas del cliente no sustituyen una comprobación de extremo a extremo.

## Referencia

[Guía de ComicsStore API REST — WebProgramming](https://github.com/dfloaizab/WebProgramming/blob/main/2026B/Unidad2/ComicsStore_APIRest/readme.md).
