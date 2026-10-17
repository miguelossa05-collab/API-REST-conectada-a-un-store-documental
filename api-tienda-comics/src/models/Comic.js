import mongoose from "mongoose";

const comicSchema = new mongoose.Schema({
  titulo: { type: String, trim: true, required: [true, "El título es obligatorio"], unique: true },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: "Autor", required: [true, "El autor es obligatorio"] },
  editorial: { type: String, trim: true },
  anioPublicacion: {
    type: Number, min: [1900, "El año mínimo es 1900"],
    validate: { validator: Number.isInteger, message: "El año debe ser entero" }
  },
  precio: { type: Number, required: [true, "El precio es obligatorio"], min: [0, "El precio no puede ser negativo"] },
  stock: {
    type: Number, default: 0, min: [0, "El stock no puede ser negativo"],
    validate: { validator: Number.isInteger, message: "El stock debe ser entero" }
  }
}, { timestamps: true });

export default mongoose.model("Comic", comicSchema, "comics");
