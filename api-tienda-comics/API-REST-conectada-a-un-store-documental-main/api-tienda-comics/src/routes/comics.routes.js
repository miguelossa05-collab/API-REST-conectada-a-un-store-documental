import { Router } from "express";
import { crearComic, listarComics, obtenerComic } from "../controllers/comics.controller.js";
import { requerirObjetoJSON } from "../middleware/validacion.js";

const router = Router();
router.post("/", requerirObjetoJSON, crearComic);
router.get("/", listarComics);
router.get("/:id", obtenerComic);
export default router;
