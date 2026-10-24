import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/http.js";
import { listarAutores, listarComics, crearAutor, crearComic } from "../public/api.js";

test("Cliente web disponible y API raíz conservada", async () => {
  const pagina = await request(app).get("/tienda/").expect(200).expect("Content-Type", /html/);
  assert.match(pagina.text, /form-autor/);
  assert.match(pagina.text, /form-comic/);
  for (const archivo of ["styles.css", "api.js", "app.js"]) await request(app).get(`/tienda/${archivo}`).expect(200);
  await request(app).get("/").expect(200).expect("Content-Type", /json/);
  await request(app).get("/tienda/.env").expect(404);
});

test("Cliente envía GET y POST JSON a las rutas existentes", async t => {
  const llamadas = [];
  t.mock.method(globalThis, "fetch", async (ruta, opciones) => {
    llamadas.push([ruta, opciones]);
    return { ok: true, json: async () => ({ _id: "123" }) };
  });
  await listarAutores(); await listarComics();
  await crearAutor({ nombre: "Prueba" }); await crearComic({ titulo: "Prueba", precio: 10 });
  assert.deepEqual(llamadas.map(([r, o]) => [r, o.method]), [["/api/autores", "GET"], ["/api/comics", "GET"], ["/api/autores", "POST"], ["/api/comics", "POST"]]);
  assert.deepEqual(JSON.parse(llamadas[2][1].body), { nombre: "Prueba" });
  assert.equal(llamadas[3][1].headers["Content-Type"], "application/json");
});

test("Cliente muestra errores del servidor y de red", async t => {
  const mock = t.mock.method(globalThis, "fetch", async () => ({ ok: false, status: 409, json: async () => ({ mensaje: "Título duplicado" }) }));
  await assert.rejects(crearComic({}), /Título duplicado/);
  mock.mock.mockImplementation(async () => { throw new TypeError("fetch failed"); });
  await assert.rejects(listarAutores(), /No se pudo contactar/);
  mock.mock.mockImplementation(async () => { throw new DOMException("timeout", "AbortError"); });
  await assert.rejects(listarComics(), /actualiza la lista/);
});
