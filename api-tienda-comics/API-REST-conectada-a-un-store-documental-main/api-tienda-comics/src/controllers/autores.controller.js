import Autor from "../models/Autor.js";
import { idValido, seleccionarCampos } from "../middleware/validacion.js";

export async function crearAutor(req, res) {
  const datos = seleccionarCampos(req.body, ["nombre", "nacionalidad", "fechaNacimiento"]);
  const autor = await Autor.create(datos);
  res.status(201).location(`/api/autores/${autor._id}`).json(autor);
}

export async function listarAutores(req, res) {
  res.json(await Autor.find().sort({ nombre: 1 }));
}

export async function obtenerAutor(req, res) {
  if (!idValido(req.params.id)) return res.status(400).json({ mensaje: "ID inválido" });
  const autor = await Autor.findById(req.params.id);
  if (!autor) return res.status(404).json({ mensaje: "Autor no encontrado" });
  res.json(autor);
}
