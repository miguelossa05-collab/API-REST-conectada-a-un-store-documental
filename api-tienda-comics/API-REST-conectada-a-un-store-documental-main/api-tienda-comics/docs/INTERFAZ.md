# Cliente web — Entre Viñetas

Interfaz de consulta y registro de autores y cómics, desarrollada con HTML, CSS y JavaScript.

## Acceso

El cliente está disponible en `http://localhost:3000/tienda/` mientras el servidor está en ejecución. Comparte origen con la API, por lo que no requiere configuración CORS adicional.

## Componentes

| Archivo | Responsabilidad |
|---|---|
| `public/index.html` | Estructura semántica, formularios y listados |
| `public/styles.css` | Estilos y adaptación a pantallas pequeñas |
| `public/api.js` | Peticiones fetch con async/await y manejo de errores |
| `public/app.js` | Eventos, DOM, filtros y actualización de listados |

## Funcionamiento

El inicio de la página consulta `GET /api/autores` y `GET /api/comics`. El catálogo permite buscar por título y filtrar localmente por autor y editorial.

El formulario de autores envía `POST /api/autores`. Tras una respuesta exitosa, actualiza los listados y selecciona el autor creado en el formulario de cómics.

El formulario de cómics envía `POST /api/comics` con título, identificador de autor, editorial, año, precio y stock. Los registros se almacenan mediante la API en MongoDB Atlas.

Los formularios presentan mensajes de carga, éxito y error. Durante el envío se deshabilita el botón para evitar solicitudes repetidas. Si falla la actualización posterior a un guardado, la interfaz distingue ese fallo del resultado de creación.

## Presentación y seguridad

- Precios expresados en pesos colombianos.
- Cubiertas tipográficas ilustrativas, no portadas editoriales oficiales.
- Etiquetas asociadas a los controles, navegación por teclado y mensajes con aria-live.
- Inserción de textos mediante textContent, sin interpretar HTML de los registros.
- Credenciales de MongoDB gestionadas exclusivamente en el servidor.
- Tiempo máximo de espera del cliente: 15 segundos.
- Conservación de los datos visibles si falla una consulta posterior.

## Pruebas del cliente

```bash
node --test tests/frontend.test.js
```

La suite comprueba la entrega de archivos estáticos, los métodos y cuerpos de las peticiones y el manejo de errores mediante respuestas simuladas. No accede a MongoDB Atlas.
