# Bienvenido a tu Editor Markdown ✨

Este editor funciona tanto en **local (`file:///`)** como publicado en **GitHub Pages**, con vista dividida en tiempo real, rutas relativas por defecto para imágenes e índice navegable.

Publicado en: https://jc-csl.github.io/git-github-practico/editor/

Forma parte del repositorio [git-github-practico](../README.md): 📚 [apuntes de Git y GitHub](../apuntes/README.md) · 🧪 [laboratorio de ejercicios](../laboratorio/).


## Leer los apuntes y carpetas de Markdown

- **Abrir .md** (`Ctrl+O`) muestra la **lista de los apuntes** del repositorio, con buscador: pulsa uno y se abre, sin pasar por la ventana de archivos del navegador. Funciona igual en local (`file:///`) y en la web, en Chrome, Edge y Firefox. Se ven sus imágenes, los enlaces a otros apuntes se abren dentro del editor, el **desplegable de la vista previa** cambia de apunte y **← Atrás** vuelve al anterior.
- Abajo en esa ventana, **¿Algo tuyo?** abre la ventana del navegador para lo que no está en la lista:
  - **Un archivo .md...**: un `.md` cualquiera. El navegador no le dice al editor de qué carpeta viene, así que sus imágenes y enlaces relativos no se ven; para eso usa **Una carpeta...**.
  - **Una carpeta...**: lee una carpeta entera (sin `.git`), por ejemplo el repositorio de un proyecto tuyo. Las imágenes relativas se ven, los enlaces a otros `.md` se abren dentro del editor, el desplegable de la vista previa lista todos los documentos y **← Atrás** vuelve al anterior. Al volver a abrir esa carpeta, empieza en el último documento que leíste.
- En la ventana del navegador **se elige la carpeta, no un archivo**: aunque marques un ejercicio, se abre la carpeta. El documento se elige después en el **desplegable de la vista previa** (o con los enlaces del índice).
- Al elegir la carpeta, **el navegador pide permiso** con su propio aviso. Firefox dice *«¿Está seguro de que desea enviar todos los archivos de "apuntes"?»* y Chrome *«¿Ver archivos?»* o *«¿Subir archivos?»*. Acepta: **no se envía nada a internet**, los archivos solo los lee la pestaña del editor en tu equipo.
- Enlace directo: `editor/index.html?doc=../apuntes/README.md#seccion` (en local, solo para los apuntes de la lista).

Si cambias un documento y vas a abrir otro, el editor te avisa.

**Descargar .md** (`Ctrl+S`) descarga el documento con su nombre, igual en todos los navegadores, en local y en la web. Una página web no puede escribir en el disco de forma fiable (en algunos equipos la ventana de guardar de Chrome se cierra sin guardar nada), así que el editor siempre descarga:

- El archivo va a la carpeta *Descargas*. Para sustituir el original, muévelo a su sitio.
- Para **elegir la carpeta cada vez** (y sobrescribir el original), activa en el navegador que pregunte dónde guardar las descargas. Chrome: *Configuración → Descargas → Preguntar dónde guardar cada archivo antes de descargarlo*. Firefox: *Ajustes → General → Archivos y aplicaciones → Preguntar siempre dónde guardar archivos*.
- Si modificas un **apunte de la lista**, el cambio se ve en el editor hasta que recargues. Para que quede en la lista, sustituye el archivo en `apuntes/` y ejecuta `node editor/generar-apuntes.mjs` (o haz commit con el hook activado).

## Tabla de contenidos

- [Características principales](#características-principales)
- [Flujo con GitHub Pages](#flujo-con-github-pages)
- [Imágenes con ruta relativa](#imágenes-con-ruta-relativa)
- [Bloques de código y tablas](#bloques-de-código-y-tablas)

## Características principales

- **Vista dividida sincronizada**: Escribe Markdown a la izquierda y revisa el resultado formateado a la derecha.
- **Archivos**: abre los apuntes o tus `.md` con `Ctrl+O` y descárgalos con `Ctrl+S`.
- **Índice automático y anclas**: Haz clic en cualquier enlace del índice superior o usa el botón **Índice** en la barra de herramientas.
- **Atajos rápidos**: Negrita (`Ctrl+B`), cursiva (`Ctrl+I`), enlace (`Ctrl+K`) e imagen (`Ctrl+Shift+I`).

## Flujo con GitHub Pages

1. Guarda este archivo como `index.html` en la raíz de tu repositorio.
2. Edita tu documento `notas.md` y guarda tus imágenes en la carpeta `img/`.
3. Sube los cambios con:

```bash
git add .
git commit -m "Actualizar contenido e imágenes"
git push
```

## Imágenes con ruta relativa

Al pulsar **Imagen** (o arrastrar/pegar una captura), el editor selecciona **Ruta relativa** por defecto (por ejemplo, `./img/captura.png`) y muestra la imagen al instante en la vista previa durante tu sesión.

> "La simplicidad es la máxima sofisticación." — *Leonardo da Vinci*

## Bloques de código y tablas

| Atajo | Acción |
| :--- | :--- |
| `Ctrl + O` | Abrir archivo `.md` |
| `Ctrl + S` | Descargar documento |
| `Ctrl + Shift + I` | Importar / insertar imagen |
| `Ctrl + K` | Insertar enlace |
