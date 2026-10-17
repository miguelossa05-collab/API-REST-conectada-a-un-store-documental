# Entrega individual

**Miguel Ángel Ossa — Programación Orientada a la Web**

## Publicar en un repositorio nuevo

1. Entra a [GitHub](https://github.com/new) con tu cuenta personal.
2. Crea un repositorio llamado `api-tienda-comics`. Si el docente debe abrirlo sin invitación, selecciona público. No añadas README, licencia ni gitignore desde GitHub si usarás los comandos de abajo.
3. Abre la terminal en la carpeta local del proyecto y ejecuta:

```bash
git init
git add .
git status
git commit -m "Implementar API REST de tienda de comics"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/api-tienda-comics.git
git push -u origin main
```

Sustituye `TU_USUARIO` por tu usuario real. Revisa que `git status` no incluya `.env` ni `node_modules`. Si Git pide tu identidad, configura tu nombre y el correo asociado a tu cuenta antes de repetir el commit. Autentícate con el flujo de GitHub/VS Code; no pegues contraseñas o tokens en el código.

Alternativa sin Git instalado: usa **Add file → Upload files** en el repositorio. Sube el contenido descomprimido, incluidas las carpetas `src`, `data`, `tests` y `docs`, `package.json`, `package-lock.json`, `.gitignore`, `.env.example` y `README.md`. No subas solamente el ZIP. No subas `.env` ni `node_modules`.

## Verificación de la entrega

- [ ] El repositorio es personal y el docente puede acceder.
- [ ] Se ven el README, `package.json`, los modelos, los controladores y las rutas.
- [ ] Existe la base `tienda_comics` en Atlas con sus dos colecciones.
- [ ] La API del estudiante ejecuta `npm run db:check` y muestra `ping=1`.
- [ ] `npm run seed` termina correctamente.
- [ ] GET de autores y cómics devuelve datos.
- [ ] POST crea un autor y un cómic relacionado.
- [ ] GET por ID y filtros funcionan.
- [ ] El repositorio no contiene credenciales.
- [ ] Se entrega el enlace real del repositorio en la plataforma del curso.

Puedes adjuntar capturas de las colecciones de Atlas y de las respuestas GET/POST, ocultando credenciales. El archivo `docs/ESTADO.md` indica lo comprobado durante la preparación; actualízalo cuando completes la conexión y la publicación.
