# Ejercicio Guiado 3: Publicar en GitHub Pages

Este ejercicio te guiará para tomar el editor y un documento Markdown que tengas en tu ordenador, y publicarlo gratis en internet.

## Objetivo
Subir archivos estáticos a un repositorio público y activar la publicación web.

---

## Paso 1: Creación del repositorio
1. Entra a [GitHub](https://github.com/) e inicia sesión.
2. Haz clic en **New repository**.
3. Nombre: `mi-web-markdown`.
4. Visibilidad: **Public**.
5. Haz clic en **Create repository**.

## Paso 2: Subida local de archivos
Abre tu terminal (Git Bash) y dirígete a la carpeta donde guardaste el `index.html` (el editor) y tus notas `.md` (ej. `notas.md`):

```bash
cd ruta/a/tu/carpeta
git init
git add index.html notas.md
git commit -m "Primera subida de mi editor y notas"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/mi-web-markdown.git
git push -u origin main
```
*(Recuerda cambiar `TU-USUARIO` por tu nombre de usuario real en GitHub).*

## Paso 3: Activar GitHub Pages
1. Ve a la página de tu repositorio en GitHub.
2. Haz clic en la pestaña **Settings** (Ajustes).
3. En la barra lateral izquierda, baja hasta encontrar **Pages**.
4. En la sección *Build and deployment*, bajo **Branch**, selecciona `main` y la carpeta `/ (root)`.
5. Haz clic en **Save**.

## Paso 4: Comprobación
1. Espera entre 1 y 2 minutos.
2. Recarga la página de *Pages*. Verás un mensaje verde indicando que tu sitio está en vivo.
3. Entra a tu URL (ej. `https://tu-usuario.github.io/mi-web-markdown/`). Verás el editor.
4. Si quieres leer tu archivo markdown con el editor, simplemente descárgalo usando los botones que programamos, haz cambios, y vuelve a hacer `git commit` y `git push`.