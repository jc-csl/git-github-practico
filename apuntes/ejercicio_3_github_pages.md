# Ejercicio guiado 3: publicar en GitHub Pages

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left"> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Objetivo

Subir el editor (`index.html`) y el documento Markdown del [ejercicio 2](ejercicio_2_markdown_desde_pdf.md) a un repositorio **público** de GitHub y publicarlos gratis en internet con **GitHub Pages**.

**Teoría de apoyo:** [3. Autenticación SSH](GIT_Resumen_comandos_de_interes.md#3-autenticación-ssh-con-github) · [5. Crear o clonar un repositorio](GIT_Resumen_comandos_de_interes.md#5-crear-o-clonar-un-repositorio) · [7. Ciclo diario](GIT_Resumen_comandos_de_interes.md#7-ciclo-diario-add-commit-push-pull)

🧪 **Laboratorio** (terminal simulada en el navegador, con *Comprobar* y solución): [Publicar con GitHub Pages](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-pages)

**Antes de empezar:** cuenta de GitHub y autenticación configurada (clave SSH o `gh auth login`).

Estructura de la carpeta que vas a publicar:

```text
mi-web-markdown/
├── index.html        ← el editor
├── README.md         ← tu documento del ejercicio 2
└── img/
    └── logo-centro-san-luis.jpg
```

---

## Paso 1: crear el repositorio en GitHub

1. Entra en [GitHub](https://github.com/) e inicia sesión.
2. Pulsa **New repository**.
3. Nombre: `mi-web-markdown` · Visibilidad: **Public** (GitHub Pages gratuito exige repo pública).
4. **No** marques README, .gitignore ni licencia: la repo debe nacer vacía.
5. Pulsa **Create repository**.

> **Alternativa con GitHub CLI:** sáltate este paso y en el paso 2 sustituye las tres últimas líneas por `gh repo create mi-web-markdown --public --source=. --remote=origin --push` (ver [Ejercicio 8](ejercicio_8_github_cli.md)).

## Paso 2: subir los archivos desde local

En Git Bash, dentro de la carpeta:

```bash
cd ruta/a/mi-web-markdown
git init -b main
git add index.html README.md img/
git commit -m "Primera subida de mi editor y notas"
git remote add origin git@github.com:TU-USUARIO/mi-web-markdown.git
git push -u origin main
```

Sustituye `TU-USUARIO` por tu usuario de GitHub. Si trabajas por HTTPS, la URL es `https://github.com/TU-USUARIO/mi-web-markdown.git`.

*Verificación:* recarga la página de la repo en GitHub y comprueba que aparecen los archivos y que `README.md` se muestra formateado.

## Paso 3: activar GitHub Pages

1. En la repo, pestaña **Settings**.
2. En la barra lateral, **Pages**.
3. En *Build and deployment* → *Branch*: selecciona `main` y la carpeta `/ (root)`.
4. Pulsa **Save**.

## Paso 4: comprobar

1. Espera 1-2 minutos y recarga *Settings → Pages*: aparece el aviso *"Your site is live at…"*.
2. Abre `https://TU-USUARIO.github.io/mi-web-markdown/`: verás el editor.
3. Con el botón **Abrir .md** del editor carga tu `README.md` y comprueba que se ve igual que en local.

## Paso 5: actualizar la web

Cada cambio se publica con el ciclo diario:

```bash
# ... editar README.md con el editor y guardarlo ...
git add .
git commit -m "Actualizar documento"
git push
```

Tras un par de minutos, la web muestra la versión nueva.

---

## Comprueba lo que has aprendido

1. ¿Por qué la repo debe crearse vacía si después haces `git push` desde local?
2. ¿Qué hace exactamente `-u` en `git push -u origin main`? ¿Hace falta en los siguientes `push`?
3. Si la imagen se ve en tu ordenador pero no en la web, ¿qué dos cosas comprobarías? (Pista: ruta relativa y `git status`).

<details>
<summary><b>Soluciones</b></summary>

1. Porque si la repo remota ya tuviera un commit (README, licencia…), su historia y la tuya no tendrían ningún commit en común y el `push` se rechazaría (*historias no relacionadas*).
2. `-u` vincula tu `main` con `origin/main` (*upstream*). A partir de ahí basta con `git push` y `git pull` sin argumentos; no hace falta repetirlo.
3. Que la ruta sea **relativa** (`img/logo.png`, nunca `C:\Users\…`) y escrita con las mismas mayúsculas que el archivo (GitHub Pages las distingue); y que la imagen esté **confirmada y subida** (`git status`, `git ls-files img/`).

</details>
