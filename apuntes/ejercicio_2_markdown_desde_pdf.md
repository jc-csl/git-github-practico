# Ejercicio 2: reproduce un documento en Markdown

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left"> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Objetivo

Aprender la sintaxis de Markdown **reconstruyendo un documento ya maquetado**: miras el resultado final (un PDF de una cara) y escribes el Markdown que lo genera. Es lo mismo que harás después con cualquier `README.md` de GitHub.

**Material:** [📄 ejercicio_2_documento.pdf](recursos/ejercicio_2_documento.pdf) (README de un proyecto ficticio: *Estación meteorológica del aula*).

**Herramienta:** el editor Markdown de vista dividida (`index.html` en la raíz de este repositorio) o VS Code con la vista previa (`Ctrl + Shift + V`).

🧪 **Laboratorio** (terminal simulada en el navegador, con *Comprobar* y solución): [README.md en Markdown](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-readme). Allí escribes un `README.md` en la terminal y el laboratorio comprueba cada elemento de Markdown.

**Entrega:** una carpeta con `README.md` y `img/logo-centro-san-luis.jpg` (la imagen está en la carpeta [`imagenes`](../imagenes/) del repositorio). En el [ejercicio 3](ejercicio_3_github_pages.md) la publicarás en GitHub Pages.

---

## Chuleta mínima de Markdown

| Quiero… | Escribo… |
|---|---|
| Título de nivel 1 / 2 / 3 | `# Título` · `## Sección` · `### Apartado` |
| **Negrita** / *cursiva* / ~~tachado~~ | `**texto**` · `*texto*` · `~~texto~~` |
| `código` en línea | `` `código` `` |
| Enlace | `[texto visible](https://direccion)` |
| Imagen | `![texto alternativo](img/archivo.jpg)` |
| Cita | `> texto` |
| Lista con viñetas / subnivel | `- elemento` · dos espacios antes: `  - subelemento` |
| Lista numerada | `1. primero` · `2. segundo` |
| Lista de tareas | `- [x] hecha` · `- [ ] pendiente` |
| Línea horizontal | `---` (en una línea sola, con una línea en blanco antes) |
| Bloque de código | tres comillas invertidas y el lenguaje: ` ```bash `, el código y ` ``` ` para cerrar |
| Tabla | `\| A \| B \|` · fila separadora `\|---\|---\|` · alineación `:---` izquierda, `:---:` centro, `---:` derecha |

> **Regla de oro:** deja una **línea en blanco** entre bloques distintos (párrafo, lista, tabla, código, cita). Muchos errores de formato se deben a que falta.

---

## Paso 1: analiza el documento antes de escribir

Abre el PDF y localiza cada elemento. Copia esta tabla en tu cuaderno y complétala:

| Elemento del PDF | ¿Qué elemento de Markdown es? | Sintaxis |
|---|---|---|
| "Estación meteorológica del aula" | | |
| El logo | | |
| "1º de Bachillerato", "temperatura" | | |
| "ver repositorio" | | |
| El recuadro con "Aviso" | | |
| La tabla de componentes (fíjate en la alineación de cada columna) | | |
| Los pasos 1, 2, 3 | | |
| `git clone …` | | |
| Las casillas de "Estado del proyecto" | | |
| "usar un sensor DHT11" | | |
| "Montaje y cableado" | | |
| La línea gruesa antes de la fecha | | |

## Paso 2: prepara la carpeta

```text
ejercicio-markdown/
├── README.md
└── img/
    └── logo-centro-san-luis.jpg
```

## Paso 3: escribe el Markdown

Abre `README.md` en el editor y reprodúcelo de arriba abajo. Puedes copiar el **texto** del PDF, pero todo el **formato** debe salir de tu Markdown.

Atajos útiles del editor:

| Atajo / botón | Acción |
|---|---|
| `Ctrl + B` / `Ctrl + I` | Negrita / cursiva sobre el texto seleccionado |
| `Ctrl + K` | Insertar enlace |
| `Ctrl + Shift + I` | Insertar imagen (elige **Ruta relativa**: `./img/…`) |
| Botones **Tabla**, **Tarea**, **Bloque de código** | Insertan la plantilla del elemento |
| `Ctrl + O` / `Ctrl + S` | Abrir / guardar el archivo `.md` |

## Paso 4: compara y corrige

Pon el PDF y la vista previa uno al lado del otro y revisa la lista de autoevaluación:

- [ ] El título es de nivel 1 y las cuatro secciones de nivel 2.
- [ ] La imagen se ve, y su ruta es **relativa** (`img/…`), no `C:\Users\…`.
- [ ] Negritas, cursivas, tachado y código en línea están donde en el PDF.
- [ ] El enlace funciona al hacer clic.
- [ ] El aviso es una cita.
- [ ] La tabla tiene la alineación correcta en sus tres columnas.
- [ ] La lista numerada y el bloque de código (con lenguaje `bash`) están separados.
- [ ] Las tareas hechas aparecen marcadas y las pendientes sin marcar.
- [ ] La lista del equipo tiene un subnivel bajo "Hardware".
- [ ] Hay una línea horizontal antes de la fecha, que va en cursiva.

## Paso 5 (ampliación)

1. Coloca el cursor bajo el título y pulsa el botón **Índice** del editor: se genera una tabla de contenidos con enlaces a cada sección. Comprueba que funcionan.
2. Añade una sección `## Datos de ejemplo` con una tabla de 3 lecturas (hora, temperatura, humedad).
3. Convierte la carpeta en un repositorio Git y haz tu primer commit:

   ```bash
   cd ejercicio-markdown
   git init -b main
   git add .
   git commit -m "README de la estación meteorológica"
   ```

<details>
<summary><b>Solución</b></summary>

El Markdown completo que genera el PDF está en [recursos/ejercicio_2_solucion.md](recursos/ejercicio_2_solucion.md). Compáralo con el tuyo línea a línea: lo importante es que el resultado se vea igual, no que el texto sea idéntico (por ejemplo, `*cursiva*` y `_cursiva_` dan lo mismo).

</details>

▶ **Siguiente:** publica tu documento en internet → [Ejercicio 3. GitHub Pages](ejercicio_3_github_pages.md).
