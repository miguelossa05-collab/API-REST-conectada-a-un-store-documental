import express from "express";
import { fileURLToPath } from "node:url";
import autoresRoutes from "./routes/autores.routes.js";
import comicsRoutes from "./routes/comics.routes.js";
import { manejarErrores } from "./middleware/errores.js";

// Separar la aplicación del puerto permite probarla sin abrir un servidor permanente.
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
// Cliente web servido por la misma API: no requiere CORS ni expone credenciales.
app.use("/tienda", express.static(fileURLToPath(new URL("../public/", import.meta.url))));
app.get("/", (req, res) => res.json({ mensaje: "API de la Tienda de Cómics funcionando" }));
app.use("/api/autores", autoresRoutes);
app.use("/api/comics", comicsRoutes);
app.use((req, res) => res.status(404).json({ mensaje: "Ruta no encontrada" }));
app.use(manejarErrores);
export default app;
