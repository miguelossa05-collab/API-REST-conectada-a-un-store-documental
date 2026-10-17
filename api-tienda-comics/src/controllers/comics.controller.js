import Comic from "../models/Comic.js";
import Autor from "../models/Autor.js";
import { idValido, seleccionarCampos } from "../middleware/validacion.js";

export async function crearComic(req, res) {
  const datos = seleccionarCampos(req.body, ["titulo", "autor", "editorial", "anioPublicacion", "precio", "stock"]);
  if (!idValido(datos.autor) || !(await Autor.exists({ _id: datos.autor }))) {
    return res.status(400).json({ mensaje: "El autor indicado no existe o su ID es inválido" });
  }
  const comic = await Comic.create(datos);
  res.status(201).location(`/api/comics/${comic._id}`).json(comic);
}

export async function listarComics(req, res) {
  const filtro = {};
  const { editorial, autor } = req.query;
  if (editorial !== undefined) {
    if (typeof editorial !== "string" || !editorial.trim()) {
      return res.status(400).json({ mensaje: "La editorial debe ser un texto no vacío" });
    }
    filtro.editorial = editorial.trim();
  }
  if (autor !== undefined) {
    if (!idValido(autor)) return res.status(400).json({ mensaje: "ID de autor inválido" });
    filtro.autor = autor;
  }
  res.json(await Comic.find(filtro).populate("autor", "nombre nacionalidad").sort({ titulo: 1 }));
}

export async function obtenerComic(req, res) {
  if (!idValido(req.params.id)) return res.status(400).json({ mensaje: "ID inválido" });
  const comic = await Comic.findById(req.params.id).populate("autor", "nombre nacionalidad");
  if (!comic) return res.status(404).json({ mensaje: "Cómic no encontrado" });
  res.json(comic);
}
