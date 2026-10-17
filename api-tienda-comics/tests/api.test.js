import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/http.js";
import Autor from "../src/models/Autor.js";
import Comic from "../src/models/Comic.js";

const ejecutar = promisify(execFile);
let mongo;
let autorId;
let comicId;
before(async () => {
  // MongoDB real y temporal; nunca usa la URI de Atlas ni borra sus documentos.
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri("comics_pruebas"));
  await Promise.all([Autor.init(), Comic.init()]);
});
after(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test("GET / y ruta inexistente", async () => {
  await request(app).get("/").expect(200);
  const res = await request(app).get("/no-existe").expect(404);
  assert.equal(res.body.mensaje, "Ruta no encontrada");
});

test("POST autor guarda datos y GET los recupera", async () => {
  const res = await request(app).post("/api/autores").send({
    nombre: "  Autora de prueba  ", nacionalidad: "Colombiana", fechaNacimiento: "1990-01-01"
  }).expect(201);
  autorId = res.body._id;
  assert.equal(res.body.nombre, "Autora de prueba");
  assert.ok(res.body.createdAt);
  assert.equal(await Autor.countDocuments(), 1);
  const listado = await request(app).get("/api/autores").expect(200);
  assert.equal(listado.body.length, 1);
  const detalle = await request(app).get(`/api/autores/${autorId}`).expect(200);
  assert.equal(detalle.body.nacionalidad, "Colombiana");
});

test("Autor: nombre vacío, fecha inválida, ID inválido e inexistente", async () => {
  await request(app).post("/api/autores").send({ nombre: "   " }).expect(400);
  await request(app).post("/api/autores").send({ nombre: "X", fechaNacimiento: "no-fecha" }).expect(400);
  await request(app).get("/api/autores/mal-id").expect(400);
  await request(app).get("/api/autores/000000000000000000000000").expect(404);
});

test("POST cómic persiste la referencia y GET incorpora los datos del autor", async () => {
  const res = await request(app).post("/api/comics").send({
    titulo: "Cómic de prueba", autor: autorId, editorial: "Editorial Prueba", anioPublicacion: 2020, precio: 15000
  }).expect(201);
  comicId = res.body._id;
  assert.equal(res.body.autor, autorId);
  assert.equal(res.body.stock, 0);
  const detalle = await request(app).get(`/api/comics/${comicId}`).expect(200);
  assert.equal(detalle.body.autor.nombre, "Autora de prueba");
  assert.equal(detalle.body.autor.nacionalidad, "Colombiana");
  assert.equal(await Comic.countDocuments(), 1);
});

test("Filtros por editorial, autor y ambos combinados", async () => {
  for (const query of [{ editorial: "Editorial Prueba" }, { autor: autorId }, { autor: autorId, editorial: "Editorial Prueba" }]) {
    const res = await request(app).get("/api/comics").query(query).expect(200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0]._id, comicId);
  }
  const vacio = await request(app).get("/api/comics").query({ editorial: "Otra editorial" }).expect(200);
  assert.deepEqual(vacio.body, []);
  await request(app).get("/api/comics?autor=mal-id").expect(400);
  await request(app).get("/api/comics?editorial=A&editorial=B").expect(400);
});

test("Cómic: autor inexistente, precio negativo, fracciones y campos obligatorios", async () => {
  const base = { titulo: "Rechazado", autor: autorId, precio: 1000 };
  for (const cambio of [
    { autor: "000000000000000000000000" }, { autor: "incorrecto" },
    { titulo: "" }, { precio: -1 }, { precio: null }, { stock: -1 },
    { stock: 1.5 }, { anioPublicacion: 1800 }, { anioPublicacion: 2000.5 }
  ]) {
    await request(app).post("/api/comics").send({ ...base, ...cambio }).expect(400);
  }
  await request(app).post("/api/comics").send({ titulo: "Sin precio", autor: autorId }).expect(400);
  assert.equal(await Comic.countDocuments(), 1);
});

test("Título duplicado devuelve 409; búsquedas fallidas devuelven 400 o 404", async () => {
  await request(app).post("/api/comics").send({ titulo: "Cómic de prueba", autor: autorId, precio: 0 }).expect(409);
  await request(app).get("/api/comics/no-id").expect(400);
  await request(app).get("/api/comics/000000000000000000000000").expect(404);
});

test("Cuerpos ausentes, arrays, JSON mal formado y formato incorrecto", async () => {
  await request(app).post("/api/autores").set("Content-Type", "application/json").expect(400);
  await request(app).post("/api/autores").send([]).expect(400);
  const res = await request(app).post("/api/autores").set("Content-Type", "application/json").send('{"nombre":').expect(400);
  assert.equal(res.body.mensaje, "El cuerpo contiene JSON inválido");
  await request(app).post("/api/comics").type("text").send("prueba").expect(415);
});

test("La carga de ejemplo se puede repetir y conserva documentos y cambios existentes", async () => {
  const options = {
    cwd: new URL("../", import.meta.url),
    env: { ...process.env, MONGODB_URI: mongo.getUri("comics_pruebas") },
    timeout: 30000
  };
  await ejecutar(process.execPath, ["src/seed.js"], options);
  assert.equal(await Autor.countDocuments(), 6);
  assert.equal(await Comic.countDocuments(), 11);
  await Comic.updateOne({ titulo: "Watchmen" }, { $set: { stock: 99 } });
  await ejecutar(process.execPath, ["src/seed.js"], options);
  assert.equal(await Autor.countDocuments(), 6);
  assert.equal(await Comic.countDocuments(), 11);
  assert.equal((await Comic.findOne({ titulo: "Watchmen" })).stock, 99);
  const watchmen = await Comic.findOne({ titulo: "Watchmen" }).populate("autor");
  assert.equal(watchmen.autor.nombre, "Alan Moore");
  assert.ok(await Comic.exists({ _id: comicId }));
});
