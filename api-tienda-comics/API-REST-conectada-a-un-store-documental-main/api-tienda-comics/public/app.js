import { listarAutores, listarComics, crearAutor, crearComic } from "./api.js";

const $ = selector => document.querySelector(selector);
let autores = [], comics = [];
const moneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" });
// textContent evita interpretar HTML proveniente de los registros de la API.
function elemento(tag, texto, clase) {
  const nodo = document.createElement(tag);
  if (texto !== undefined) nodo.textContent = texto;
  if (clase) nodo.className = clase;
  return nodo;
}
function opciones(selector, filas, primero) {
  const select = $(selector), anterior = select.value;
  select.replaceChildren(new Option(primero, ""), ...filas.map(([id, nombre]) => new Option(nombre, id)));
  if (filas.some(([id]) => id === anterior)) select.value = anterior;
}
function mostrarAutores() {
  $("#total-autores").textContent = autores.length;
  const lista = $("#lista-autores");
  lista.replaceChildren();
  for (const autor of autores) {
    const tarjeta = elemento("article", undefined, "autor");
    tarjeta.append(elemento("span", autor.nombre.slice(0, 1).toUpperCase(), "inicial"));
    const texto = elemento("div");
    texto.append(elemento("h3", autor.nombre), elemento("p", autor.nacionalidad || "Nacionalidad no registrada"));
    if (autor.fechaNacimiento) texto.append(elemento("small", `Nacimiento: ${new Date(autor.fechaNacimiento).toLocaleDateString("es-CO", { timeZone: "UTC" })}`));
    tarjeta.append(texto); lista.append(tarjeta);
  }
  if (!autores.length) lista.append(elemento("p", "Aún no hay autores. Registra el primero abajo.", "vacio"));
  const filas = autores.map(a => [a._id, a.nombre]);
  opciones("#autor-comic", filas, "Selecciona un autor");
  opciones("#filtro-autor", filas, "Todos los autores");
}
function mostrarComics() {
  const termino = $("#buscar").value.trim().toLocaleLowerCase("es");
  const autor = $("#filtro-autor").value, editorial = $("#filtro-editorial").value;
  const filtrados = comics.filter(c => c.titulo.toLocaleLowerCase("es").includes(termino) && (!autor || (c.autor?._id || c.autor) === autor) && (!editorial || c.editorial === editorial));
  $("#total-comics").textContent = comics.length;
  $("#resultado").textContent = `${filtrados.length} de ${comics.length} cómics`;
  const lista = $("#comics"); lista.replaceChildren();
  for (const [i, comic] of filtrados.entries()) {
    const tarjeta = elemento("article", undefined, "comic");
    const portada = elemento("div", undefined, `miniportada tono-${i % 4}`);
    portada.append(elemento("small", comic.editorial || "INDEPENDIENTE"), elemento("strong", comic.titulo), elemento("span", "✦", "simbolo"));
    const detalle = elemento("div", undefined, "detalle");
    const nombre = comic.autor?.nombre || autores.find(a => a._id === comic.autor)?.nombre || "Autor no disponible";
    detalle.append(elemento("h3", comic.titulo), elemento("p", `${nombre}${comic.anioPublicacion ? ` · ${comic.anioPublicacion}` : ""}`));
    const pie = elemento("div", undefined, "pie-comic");
    pie.append(elemento("strong", moneda.format(comic.precio)), elemento("span", comic.stock > 0 ? `${comic.stock} disponibles` : "Agotado", "stock"));
    detalle.append(pie); tarjeta.append(portada, detalle); lista.append(tarjeta);
  }
  if (!filtrados.length) lista.append(elemento("p", comics.length ? "No hay coincidencias. Prueba otros filtros." : "La colección está vacía. Agrega tu primer cómic.", "vacio"));
}
async function cargar() {
  const boton = $("#actualizar"); boton.disabled = true;
  $("#estado").textContent = "Consultando autores y cómics…";
  $("#estado").className = "estado";
  try {
    const datos = await Promise.all([listarAutores(), listarComics()]);
    [autores, comics] = datos;
    mostrarAutores();
    opciones("#filtro-editorial", [...new Set(comics.map(c => c.editorial).filter(Boolean))].sort().map(e => [e, e]), "Todas las editoriales");
    mostrarComics();
    $("#estado").textContent = "● Colección actualizada · Datos consultados en la API";
    return true;
  } catch (error) {
    $("#estado").textContent = `${error.message} Usa «Actualizar datos» para reintentar. Las listas anteriores, si existen, se conservan.`;
    $("#estado").className = "estado error";
    return false;
  } finally { boton.disabled = false; }
}
function conectarFormulario(selector, tipo, crear) {
  $(selector).addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget, boton = form.querySelector("button[type=submit]"), mensaje = $(`#mensaje-${tipo}`);
    if (boton.disabled || !form.reportValidity()) return;
    const datos = Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, v.trim()]));
    for (const campo of ["nombre", "titulo"]) {
      if (campo in datos && !datos[campo]) { mensaje.textContent = "Completa los campos obligatorios sin usar solo espacios."; mensaje.className = "mensaje error"; return; }
    }
    for (const clave of Object.keys(datos)) if (datos[clave] === "") delete datos[clave];
    for (const clave of ["precio", "stock", "anioPublicacion"]) if (clave in datos) datos[clave] = Number(datos[clave]);
    boton.disabled = true; mensaje.textContent = "Guardando…"; mensaje.className = "mensaje";
    try {
      const creado = await crear(datos);
      form.reset();
      const actualizado = await cargar();
      if (tipo === "autor" && actualizado) $("#autor-comic").value = creado._id;
      mensaje.textContent = actualizado ? "Registro guardado correctamente. La colección ya está actualizada." : "Registro guardado, pero no se pudo actualizar la lista. Pulsa «Actualizar datos»; no vuelvas a enviarlo.";
    } catch (error) { mensaje.textContent = error.message; mensaje.className = "mensaje error"; }
    finally { boton.disabled = false; }
  });
}
$("#buscar").addEventListener("input", mostrarComics);
$("#filtro-autor").addEventListener("change", mostrarComics);
$("#filtro-editorial").addEventListener("change", mostrarComics);
$("#actualizar").addEventListener("click", cargar);
conectarFormulario("#form-autor", "autor", crearAutor);
conectarFormulario("#form-comic", "comic", crearComic);
cargar();
