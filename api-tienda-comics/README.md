# API REST — Tienda de cómics

**Estudiante:** Miguel Ángel Ossa  
**Asignatura:** Programación Orientada a la Web  
**Universidad:** Universidad Santiago de Cali  
**Entrega:** Individual

API con Node.js, Express y MongoDB Atlas para crear y consultar autores y cómics. Implementación del ejercicio de [la guía del docente](https://github.com/dfloaizab/WebProgramming/blob/main/2026B/Unidad2/ComicsStore_APIRest/readme.md).

## Alcance

- Store documental `tienda_comics`, colecciones `autores` y `comics`.
- Crear, listar y consultar por identificador ambas entidades.
- Filtrar cómics por editorial, autor o ambos.
- Cada cómic referencia un autor mediante `ObjectId`; las consultas incluyen nombre y nacionalidad con `populate()`.
- Datos iniciales de la guía: cinco autores y diez cómics, con precios de ejemplo en COP.
- Validación de campos, identificadores, stock, precio, fechas y títulos duplicados.

## Requisitos

Node.js 22 o posterior, npm y una cuenta de MongoDB Atlas. Se puede trabajar en VS Code o GitHub Codespaces. Esta es una API de backend: no se abre con Live Server ni con un archivo `index.html`.

## 1. Configurar MongoDB Atlas

1. Abre [MongoDB Atlas](https://cloud.mongodb.com/) y selecciona el proyecto de este ejercicio.
2. Si no existe un clúster, crea uno **gratuito M0**. No hace falta un plan de pago.
3. En **Database Access**, crea un usuario de base de datos. Dale `readWrite` sobre `tienda_comics`. El usuario de base de datos es distinto de la cuenta con la que entras a Atlas.
4. En **Network Access**, agrega la IP pública del equipo desde el que ejecutarás la API. En Codespaces, si la IP cambia, actualiza el acceso; la guía propone `0.0.0.0/0` exclusivamente para la práctica, lo que permite conexiones desde cualquier IP. Prefiere una IP concreta cuando sea posible.
5. En **Connect → Drivers → Node.js**, copia la URI. Debe incluir `/tienda_comics` antes de `?`.
6. Conserva una contraseña segura. Si contiene caracteres reservados, codifícala para una URL en el campo de contraseña de la URI; por ejemplo, `@` se convierte en `%40`. No publiques la URI con credenciales.

MongoDB materializa la base y sus colecciones al escribir datos. Revisa [docs/ESTADO.md](docs/ESTADO.md) para distinguir lo comprobado de lo que falta configurar.

## 2. Instalar y configurar la API

Abre la carpeta que contiene `package.json` en VS Code. En una terminal:

```bash
npm ci
```

Duplica `.env.example` y renombra la copia como `.env`. También puedes hacerlo desde la terminal:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**Codespaces, Linux o macOS:**

```bash
cp .env.example .env
```

En `.env`, reemplaza la URI de ejemplo por la URI real de tu clúster y conserva:

```env
PORT=3000
MONGODB_URI=mongodb+srv://USUARIO:CLAVE_CODIFICADA@TU_CLUSTER.mongodb.net/tienda_comics?retryWrites=true&w=majority
```

`.env` queda excluido de Git. En Codespaces también puedes usar un secreto llamado `MONGODB_URI` y omitir el archivo. Nunca guardes contraseñas en el código, en capturas o en el README.

## 3. Comprobar la conexión, cargar y ejecutar

```bash
npm run db:check
npm run seed
npm run dev
```

Ejecuta los comandos en orden. `db:check` hace un `ping` a la base. `seed` carga los cinco autores y diez cómics y convierte `autorNombre` en una referencia real al autor. Puedes repetirlo sin duplicar los ejemplos ni sobrescribir documentos existentes. No ejecutes varias cargas simultáneamente.

`npm run dev` mantiene la API encendida y la reinicia cuando guardas cambios. Para iniciarla sin vigilancia de archivos usa `npm start`.

Abre `http://localhost:3000/api/comics`. En Codespaces abre el puerto 3000 desde **PORTS**; la dirección externa será diferente. Mantén el puerto privado: el ejercicio no incluye autenticación de usuarios.

## 4. Endpoints

| Método | Ruta | Resultado |
|---|---|---|
| GET | `/` | Mensaje de funcionamiento |
| POST | `/api/autores` | Crear autor |
| GET | `/api/autores` | Listar autores por nombre |
| GET | `/api/autores/:id` | Consultar un autor |
| POST | `/api/comics` | Crear cómic con autor existente |
| GET | `/api/comics` | Listar cómics con información del autor |
| GET | `/api/comics/:id` | Consultar un cómic con su autor |

Filtros: `/api/comics?editorial=DC%20Comics` y `/api/comics?autor=ID_DEL_AUTOR`. Se pueden combinar con `&`. Un filtro sin coincidencias devuelve `[]`.

### Crear un autor

En Postman o Thunder Client selecciona `POST`, URL `http://localhost:3000/api/autores` y **Body → JSON**:

```json
{
  "nombre": "Hayao Miyazaki",
  "nacionalidad": "Japonesa",
  "fechaNacimiento": "1941-01-05"
}
```

Respuesta esperada: **201**. Copia el `_id` recibido.

### Crear un cómic

Envía `POST http://localhost:3000/api/comics`, sustituyendo `ID_DEL_AUTOR` por el identificador anterior:

```json
{
  "titulo": "Nausicaä del Valle del Viento",
  "autor": "ID_DEL_AUTOR",
  "editorial": "Tokuma Shoten",
  "anioPublicacion": 1982,
  "precio": 68000,
  "stock": 4
}
```

Respuesta esperada: **201**. Luego consulta `/api/comics/ID_DEL_COMIC`; el campo `autor` contendrá su `_id`, nombre y nacionalidad.

Todos los POST requieren `Content-Type: application/json`. Puedes importar `docs/ComicsStore.postman_collection.json` en Postman: la petición de creación de autor guarda automáticamente `autorId` para crear el cómic. El título de prueba cambia en cada ejecución.

| Código | Uso |
|---|---|
| 200 | Consulta exitosa |
| 201 | Documento creado |
| 400 | JSON, identificador o datos inválidos; autor inexistente al crear cómic |
| 404 | Documento o ruta no encontrados |
| 409 | Título de cómic duplicado |
| 413 | Cuerpo superior a 100 KB |
| 415 | POST sin formato JSON |
| 500 | Error inesperado del servidor |

## Modelo documental

| Colección | Campo | Tipo y regla |
|---|---|---|
| autores | nombre | String, obligatorio, sin espacios extremos |
| autores | nacionalidad | String, opcional |
| autores | fechaNacimiento | Date, opcional |
| comics | titulo | String obligatorio, índice único |
| comics | autor | ObjectId obligatorio, referencia a autores |
| comics | editorial | String, opcional |
| comics | anioPublicacion | Número entero desde 1900, opcional |
| comics | precio | Número obligatorio, mínimo 0, expresado en COP |
| comics | stock | Entero mínimo 0, predeterminado 0 |
| ambas | _id | ObjectId generado por MongoDB |
| ambas | createdAt / updatedAt | Fechas automáticas |

## Organización del código

| Ruta | Responsabilidad |
|---|---|
| `src/app.js` | Conectar la base, preparar índices y escuchar en el puerto |
| `src/http.js` | Configurar Express, JSON, rutas y errores |
| `src/config/db.js` | Conexión mediante MONGODB_URI |
| `src/models/` | Esquemas de Autor y Comic |
| `src/controllers/` | Crear, consultar y filtrar documentos |
| `src/routes/` | Asociar métodos y URLs con controladores |
| `src/middleware/` | Validar peticiones y responder errores |
| `src/seed.js` | Carga repetible de los ejemplos |
| `src/probar-conexion.js` | Comprobar conexión con ping |
| `data/` | Datos de ejemplo de la guía |
| `tests/` | Pruebas de validación, HTTP e integración |
| `docs/` | Colección Postman, estado y guía de entrega |

Express 5 propaga los errores de los controladores asíncronos al middleware de errores. Los modelos validan los documentos y el controlador comprueba que el autor exista antes de crear un cómic.

## Pruebas

```bash
npm run test:unit
npm run test:integration
```

- `test:unit`: seis pruebas de validación y respuestas HTTP, sin conexión a Atlas.
- `test:integration`: nueve pruebas contra un MongoDB real temporal mediante `mongodb-memory-server`. Incluyen persistencia, referencias, filtros, duplicados y repetición del seed. Requiere que el entorno permita descargar y ejecutar el binario de MongoDB.
- `npm test`: ejecuta ambos archivos. No usa la URI de Atlas para las pruebas ni modifica sus datos.

El estado de ejecución real está en `docs/ESTADO.md`; que una prueba exista no implica que se haya podido ejecutar en todos los entornos.

## Diferencias pequeñas respecto a la guía

Se conservan entidades, campos, rutas y datos de ejemplo. Se añaden validaciones de cantidades enteras, manejo central de errores y HTTP 409 para duplicados. El seed usa inserción condicional para conservar los datos, en lugar del borrado de colecciones de la guía. `http.js` separa la aplicación del arranque para permitir pruebas.

## Entrega

Sigue [docs/ENTREGA.md](docs/ENTREGA.md) para subir el proyecto y revisar la entrega. El enlace a entregar es el del repositorio personal con el código, no el ZIP, la página del docente ni la URL de Atlas. GitHub almacena este código; GitHub Pages no ejecuta un servidor Node.js con MongoDB.
