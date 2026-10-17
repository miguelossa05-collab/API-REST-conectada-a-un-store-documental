export function manejarErrores(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ mensaje: "El cuerpo contiene JSON inválido" });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ mensaje: "El cuerpo supera el límite de 100 KB" });
  }
  if (error.code === 11000) {
    return res.status(409).json({ mensaje: "Ya existe un cómic con ese título" });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ mensaje: "Datos inválidos", detalle: error.message });
  }
  // No devolver trazas internas o información de conexión al cliente.
  console.error("Error interno:", error.name);
  res.status(500).json({ mensaje: "Error interno del servidor" });
}
