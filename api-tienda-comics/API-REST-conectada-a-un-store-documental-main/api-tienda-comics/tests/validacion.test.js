import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/http.js";
import Autor from "../src/models/Autor.js";
import Comic from "../src/models/Comic.js";

test("Autor requiere nombre y valida la fecha", async () => {
  await assert.rejects(new Autor({ nombre: " " }).validate());
  await assert.rejects(new Autor({ nombre: "Autor", fechaNacimiento: "incorrecta" }).validate());
  const autor = new Autor({ nombre: "  Miguel  ", nacionalidad: "Colombiana" });
  await autor.validate();
  assert.equal(autor.nombre, "Miguel");
});

test("Comic requiere título, autor y precio y aplica el stock predeterminado", async () => {
  const base = { titulo: "Prueba", autor: "507f1f77bcf86cd799439011", precio: 5000 };
  const comic = new Comic(base);
  await comic.validate();
  assert.equal(comic.stock, 0);
  for (const campo of ["titulo", "autor", "precio"]) {
    const datos = { ...base };
    delete datos[campo];
    await assert.rejects(new Comic(datos).validate());
  }
});

test("Comic rechaza importes negativos, año anterior a 1900 y cantidades fraccionarias", async () => {
  const base = { titulo: "Prueba", autor: "507f1f77bcf86cd799439011", precio: 5000 };
  for (const cambio of [{ precio: -1 }, { stock: -2 }, { stock: 1.2 }, { anioPublicacion: 1800 }, { anioPublicacion: 2000.5 }]) {
    await assert.rejects(new Comic({ ...base, ...cambio }).validate());
  }
});

test("Rutas raíz e inexistentes responden con JSON", async () => {
  const res = await request(app).get("/").expect(200);
  assert.match(res.body.mensaje, /Cómics/);
  await request(app).get("/desconocida").expect(404).expect("Content-Type", /json/);
});

test("La API rechaza identificadores y filtros inválidos antes de consultar MongoDB", async () => {
  for (const ruta of ["/api/autores/mal-id", "/api/comics/mal-id", "/api/comics?autor=mal-id", "/api/comics?editorial=A&editorial=B"]) {
    await request(app).get(ruta).expect(400);
  }
  await request(app).post("/api/comics").send({ titulo: "Prueba", autor: "mal-id", precio: 0 }).expect(400);
});

test("La API rechaza cuerpos incorrectos y JSON mal formado", async () => {
  await request(app).post("/api/autores").set("Content-Type", "application/json").expect(400);
  await request(app).post("/api/autores").send([]).expect(400);
  await request(app).post("/api/autores").set("Content-Type", "application/json").send('{"nombre":').expect(400);
  await request(app).post("/api/comics").type("text").send("prueba").expect(415);
});
