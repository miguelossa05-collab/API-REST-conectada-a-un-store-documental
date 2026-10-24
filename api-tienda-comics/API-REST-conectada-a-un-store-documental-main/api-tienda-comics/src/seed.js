import "dotenv/config";
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import { conectarDB } from "./config/db.js";
import Autor from "./models/Autor.js";
import Comic from "./models/Comic.js";

const leerJSON = async ruta => JSON.parse(await readFile(new URL(ruta, import.meta.url), "utf8"));

try {
  const autores = await leerJSON("../data/autores.json");
  const comics = await leerJSON("../data/comics.json");
  const nombres = new Set(autores.map(a => a.nombre));
  if (comics.some(c => !nombres.has(c.autorNombre))) throw new Error("Autor de ejemplo desconocido");
  await conectarDB();
  await Promise.all([Autor.init(), Comic.init()]);

  // Carga repetible: insertar únicamente si no existe, sin borrar datos del usuario.
  const idPorNombre = new Map();
  for (const datos of autores) {
    const autor = await Autor.findOneAndUpdate(
      { nombre: datos.nombre }, { $setOnInsert: { ...datos, createdAt: new Date(), updatedAt: new Date() } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true, timestamps: false }
    );
    idPorNombre.set(datos.nombre, autor._id);
  }
  for (const { autorNombre, ...datos } of comics) {
    await Comic.findOneAndUpdate(
      { titulo: datos.titulo }, { $setOnInsert: { ...datos, autor: idPorNombre.get(autorNombre), createdAt: new Date(), updatedAt: new Date() } },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true, timestamps: false }
    );
  }
  console.log(`Carga verificada: ${autores.length} autores y ${comics.length} cómics de ejemplo. No se borraron documentos.`);
} catch {
  console.error("No se pudo completar la carga. Revisa los JSON, la conexión y los permisos de Atlas.");
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
