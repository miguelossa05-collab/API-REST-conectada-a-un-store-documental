// La conexión a Atlas y su contraseña permanecen exclusivamente en el servidor.
async function solicitar(ruta, datos) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const respuesta = await fetch(`/api/${ruta}`, {
      method: datos === undefined ? "GET" : "POST",
      headers: datos === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      ...(datos === undefined ? {} : { body: JSON.stringify(datos) }),
      signal: controller.signal
    });
    const contenido = await respuesta.json();
    if (!respuesta.ok) throw new Error(contenido.mensaje || `Error HTTP ${respuesta.status}`);
    return contenido;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("La API tardó demasiado. Si estabas guardando, actualiza la lista antes de reintentar para evitar duplicados.");
    if (error instanceof TypeError) throw new Error("No se pudo contactar con la API. Verifica que el servidor esté encendido.");
    if (error instanceof SyntaxError) throw new Error("El servidor no devolvió JSON. Abre esta página desde /tienda/ en tu API.");
    throw error;
  } finally { clearTimeout(timer); }
}
export const listarAutores = () => solicitar("autores");
export const listarComics = () => solicitar("comics");
export const crearAutor = datos => solicitar("autores", datos);
export const crearComic = datos => solicitar("comics", datos);
