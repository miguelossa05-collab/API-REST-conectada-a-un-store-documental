import { Router } from "express";
import { crearAutor, listarAutores, obtenerAutor } from "../controllers/autores.controller.js";
import { requerirObjetoJSON } from "../middleware/validacion.js";

const router = Router();
router.post("/", requerirObjetoJSON, crearAutor);
router.get("/", listarAutores);
router.get("/:id", obtenerAutor);
export default router;
