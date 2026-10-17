import mongoose from "mongoose";

const autorSchema = new mongoose.Schema({
  nombre: { type: String, trim: true, required: [true, "El nombre es obligatorio"] },
  nacionalidad: { type: String, trim: true },
  fechaNacimiento: { type: Date }
}, { timestamps: true });

export default mongoose.model("Autor", autorSchema, "autores");
