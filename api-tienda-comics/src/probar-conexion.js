import "dotenv/config";
import mongoose from "mongoose";
import { conectarDB } from "./config/db.js";

try {
  await conectarDB();
  const resultado = await mongoose.connection.db.command({ ping: 1 });
  console.log(`Conexión comprobada: ping=${resultado.ok}; base=${mongoose.connection.name}`);
} catch {
  console.error("No se pudo conectar. Revisa MONGODB_URI, credenciales y Network Access en Atlas.");
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
