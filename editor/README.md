# Bienvenido a tu Editor Markdown ✨

Este editor funciona tanto en **local (`file:///`)** como publicado en **GitHub Pages**, con vista dividida en tiempo real, rutas relativas por defecto para imágenes e índice navegable.

Publicado en: https://jc-csl.github.io/git-github-practico/editor/

Forma parte del repositorio [git-github-practico](../README.md): 📚 [apuntes de Git y GitHub](../apuntes/README.md) · 🧪 [laboratorio de ejercicios](../laboratorio/).


## Leer los apuntes y carpetas de Markdown

El navegador no le dice al editor de qué carpeta viene un archivo abierto con **Abrir .md**, así que en ese modo las imágenes y los enlaces relativos (`../imagenes/logo.png`, `ejercicio_6.md`) se buscan junto al editor y no junto al documento. Para leer documentos que enlazan a otros o llevan imágenes:

- **📚 Apuntes**: en la web publicada abre `apuntes/README.md` directamente. En local te pide la carpeta: elige la carpeta del repositorio `git-github-practico`.
- **Abrir carpeta**: lee una carpeta entera (sin `.git`). Las imágenes relativas se ven, los enlaces a otros `.md` se abren dentro del editor, el desplegable de la vista previa lista todos los documentos y **← Atrás** vuelve al anterior.
- Enlace directo (solo en la web): `editor/?doc=../apuntes/README.md#seccion`.

Si cambias un documento y vas a abrir otro, el editor te avisa. Para conservar los cambios, usa **Guardar como...**

## Tabla de contenidos

- [Características principales](#características-principales)
- [Flujo con GitHub Pages](#flujo-con-github-pages)
- [Imágenes con ruta relativa](#imágenes-con-ruta-relativa)
- [Bloques de código y tablas](#bloques-de-código-y-tablas)

## Características principales

- **Vista dividida sincronizada**: Escribe Markdown a la izquierda y revisa el resultado formateado a la derecha.
- **Archivos locales**: Abre archivos `.md` con `Ctrl+O` y guárdalos con `Ctrl+S`.
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
| `Ctrl + S` | Guardar documento |
| `Ctrl + Shift + I` | Importar / insertar imagen |
| `Ctrl + K` | Insertar enlace |
