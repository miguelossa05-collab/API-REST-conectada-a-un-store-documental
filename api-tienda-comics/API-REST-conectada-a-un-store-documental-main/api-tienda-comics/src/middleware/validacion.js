import mongoose from "mongoose";

// Solo se aceptan identificadores hexadecimales de 24 caracteres.
export function idValido(id) {
  return typeof id === "string" && mongoose.isObjectIdOrHexString(id);
}

export function requerirObjetoJSON(req, res, next) {
  if (!req.is("application/json")) {
    return res.status(415).json({ mensaje: "Usa Content-Type: application/json" });
  }
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ mensaje: "Envía un objeto JSON" });
  }
  next();
}

// Evita aceptar _id, fechas de auditoría u otros campos del cliente.
export function seleccionarCampos(body, campos) {
  return Object.fromEntries(campos.filter(campo => Object.hasOwn(body, campo)).map(campo => [campo, body[campo]]));
}
