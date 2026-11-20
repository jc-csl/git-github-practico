# Git y GitHub en la práctica

<img src="imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**Cloud, IoT and Quantum Computing · CFGS ASIR · Centro San Luis · curso 2026-27 · Juan Carlos San Román**

> <img src="imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left"> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

Un único repositorio práctico para aprender Git y GitHub, con tres partes independientes que se enlazan entre sí:

| Parte | Qué es | Abrir |
|---|---|---|
| 🧪 [laboratorio/](laboratorio/) | Web de **50 ejercicios por situaciones** en 12 unidades, con **terminal Git simulada** en el navegador, botón *Comprobar* y **soluciones** con la salida esperada. Modo presentación para el aula. | [Web](https://jc-csl.github.io/git-github-practico/laboratorio/) |
| 📚 [apuntes/](apuntes/README.md) | **Apuntes en Markdown**: chuleta de bolsillo, resumen completo de comandos, **17 ejercicios guiados** para la terminal real con soluciones desplegables, y retos finales. Cada ejercicio enlaza con su laboratorio. | [Itinerario](apuntes/README.md) |
| ✎ [editor/](editor/) | **Editor Markdown** de vista dividida para escribir apuntes y README (abrir y descargar `.md`, imágenes relativas, tablas, índice). | [Web](https://jc-csl.github.io/git-github-practico/editor/) |

Portada publicada: **<https://jc-csl.github.io/git-github-practico/>**

## Cómo estudiar cada tema

1. **Teoría:** la sección correspondiente de la [chuleta](apuntes/GIT_acciones_habituales.md) o del [resumen completo](apuntes/GIT_Resumen_comandos_de_interes.md).
2. **Práctica sin riesgo:** el ejercicio del [laboratorio](https://jc-csl.github.io/git-github-practico/laboratorio/). Si algo se rompe, *Reiniciar*.
3. **Práctica real:** el ejercicio guiado de los [apuntes](apuntes/README.md), en Git Bash o en Linux.
4. **Comprobación:** *Comprobar* en el laboratorio y las soluciones desplegables de los apuntes. Al final, los [retos finales](apuntes/ejercicio_17_retos_finales.md).

## Estructura

```text
git-github-practico/
├── .githooks/          pre-commit: regenera editor/apuntes-datos.js
├── index.html          portada (GitHub Pages)
├── laboratorio/        web de ejercicios y simulador
│   ├── index.html      diapositivas: situación → tareas → solución
│   ├── lab.js          terminal simulada (Git, gh, bash) y comprobaciones (SPECS)
│   ├── lab.test.js     autocomprobación: node lab.test.js
│   └── img/
├── apuntes/            Markdown
│   ├── README.md                       itinerario y mapa apuntes ↔ laboratorio
│   ├── GIT_acciones_habituales.md      chuleta de bolsillo
│   ├── GIT_Resumen_comandos_de_interes.md  referencia completa
│   ├── ejercicio_*.md                  17 ejercicios guiados con soluciones
│   └── recursos/                       PDF del ejercicio 2, solución, scripts
├── editor/             editor Markdown (index.html)
│   ├── apuntes-datos.js        los .md de apuntes/ para el editor (generado)
│   └── generar-apuntes.mjs     lo regenera (solo al hacer commit con el hook de .githooks/)
└── imagenes/           logo, semáforo IA y diagramas
```

## Mantenimiento

- **Comprobar el laboratorio** tras tocar `laboratorio/lab.js` o sus ejercicios (necesita Node.js):

  ```bash
  cd laboratorio
  node lab.test.js
  ```

  Ejecuta una solución modelo por ejercicio, exige que pasen todas las comprobaciones, que ningún ejercicio se apruebe sin hacer nada y que los scripts del ejercicio de configuración persistente coincidan con los de `apuntes/recursos/scripts/`.
- **Apuntes en el editor:** el editor lee los apuntes de `editor/apuntes-datos.js` para abrirlos sin la ventana de archivos del navegador, también en local, donde una página no puede ver qué archivos hay en el disco. Ese archivo se genera con Node.js a partir de los `.md` de `apuntes/` y del `README.md`:
  - **Al hacer commit se regenera solo** con el hook `.githooks/pre-commit`, usando los `.md` tal como van en el commit. Hay que activarlo **una vez en cada copia** del repositorio:

    ```bash
    git config core.hooksPath .githooks
    ```

  - **Mientras escribes apuntes**, para verlos en el editor local sin hacer commit, deja abierto en una terminal:

    ```bash
    node editor/generar-apuntes.mjs --vigilar    # regenera al guardar cualquier .md; Ctrl+C para salir
    ```

    Tras cada cambio, recarga el editor.
  - A mano: `node editor/generar-apuntes.mjs` (regenera) o `node editor/generar-apuntes.mjs --comprobar` (falla si no está al día).
- **Enlaces de los apuntes al laboratorio:** apuntan a `https://jc-csl.github.io/git-github-practico/laboratorio/#lab-<id>`; el `<id>` es el de la sección del ejercicio en `laboratorio/index.html`.
- **GitHub Pages** publica la rama `main` desde la raíz. El archivo `.nojekyll` hace que los archivos se sirvan tal cual.

## Origen

Este repositorio fusiona, **conservando el historial de ambos**, dos repositorios anteriores que siguen disponibles sin cambios:

- [jc-csl/Git_Github_apuntes_practicos](https://github.com/jc-csl/Git_Github_apuntes_practicos) → `laboratorio/`
- [jc-csl/editor-markdown-git](https://github.com/jc-csl/editor-markdown-git) → `apuntes/`, `editor/` e `imagenes/`
