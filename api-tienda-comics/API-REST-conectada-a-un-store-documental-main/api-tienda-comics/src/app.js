import "dotenv/config";
import mongoose from "mongoose";
import app from "./http.js";
import { conectarDB } from "./config/db.js";
import Autor from "./models/Autor.js";
import Comic from "./models/Comic.js";

try {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Puerto inválido");
  await conectarDB();
  await Promise.all([Autor.init(), Comic.init()]);
  const server = app.listen(port, () => {
    console.log("Conexión a MongoDB establecida");
    console.log(`API disponible en http://localhost:${port}`);
  });
  server.on("error", async () => {
    console.error("No se pudo abrir el puerto. Revisa PORT o cierra otro servidor.");
    await mongoose.disconnect();
    process.exitCode = 1;
  });
  const cerrar = () => server.close(async () => {
    await mongoose.disconnect();
    process.exitCode = 0;
  });
  process.once("SIGINT", cerrar);
  process.once("SIGTERM", cerrar);
} catch {
  console.error("No se pudo iniciar la API. Revisa PORT, MONGODB_URI, el usuario y el acceso de red en Atlas.");
  await mongoose.disconnect();
  process.exitCode = 1;
}
