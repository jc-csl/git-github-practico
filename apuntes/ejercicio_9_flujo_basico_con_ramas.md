# Ejercicio guiado 9: flujo de trabajo básico con ramas

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left"> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

Las **ramas** son la característica fundamental de Git. Permiten trabajar en una función o idea **de forma aislada**, sin tocar la línea principal (`main`). Son como universos paralelos para tu código.

## Objetivo

Recorrer el **ciclo de vida completo de una rama**: crearla para una nueva función, trabajar en ella, fusionarla de vuelta a `main` y eliminarla.

**Escenario:** vamos a añadir una página "Acerca de" a una web. Para no tocar `main` directamente, crearemos una rama solo para esta tarea.

**Teoría de apoyo:** [10. Ramas y merge](GIT_Resumen_comandos_de_interes.md#10-ramas-y-merge)

🧪 **Laboratorio** (terminal simulada en el navegador, con *Comprobar* y solución): [Rama de funcionalidad y merge](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-rama-ff) · [Eliminar ramas: -d y -D](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-borrar-ramas)

---

## Preparación

```bash
mkdir mi-web
cd mi-web
git init -b main
echo "<h1>Inicio</h1>" > index.html
git add index.html
git commit -m "Commit inicial"
```

---

## Paso 1: comprobar en qué rama estás

Antes de hacer nada, conviene saber dónde estás.

```bash
git status          # On branch main
git branch          # lista de ramas; la actual, marcada con *
```

```text
* main
```

## Paso 2: crear una rama nueva y cambiarte a ella

Crearemos `feature/pagina-acerca-de`. El prefijo `feature/` es una **convención** habitual para ramas que añaden funcionalidades (otras: `fix/` para arreglos, `docs/` para documentación).

```bash
git switch -c feature/pagina-acerca-de      # -c = create
```

Es un atajo de dos comandos:

```bash
git branch feature/pagina-acerca-de         # crea la rama
git switch feature/pagina-acerca-de         # se cambia a ella
```

*Comprobación:*

```bash
git branch
```

```text
* feature/pagina-acerca-de
  main
```

## Paso 3: trabajar en la rama (hacer commits)

```bash
echo "<h1>Página Acerca de Nosotros</h1>" > acerca-de.html
git add acerca-de.html
git commit -m "Añadida la estructura inicial de la página 'Acerca de'"
git log --oneline --graph --all
```

```text
* 2b3a4c5 (HEAD -> feature/pagina-acerca-de) Añadida la estructura inicial de la página 'Acerca de'
* a1b2c3d (main) Commit inicial
```

El commit nuevo **solo existe en la rama** `feature/pagina-acerca-de`; `main` sigue apuntando al commit anterior.

## Paso 4: fusionar los cambios en main

El proceso **siempre** es:

1. Cámbiate a la rama que va a **recibir** los cambios.
2. Ejecuta `merge` con la rama que **contiene** los cambios.

```bash
git switch main                             # Switched to branch 'main'
ls                                          # ¡acerca-de.html ha desaparecido!
```

No te preocupes: es normal. Al cambiar de rama, Git deja la carpeta **exactamente como está esa rama**, y en `main` la página aún no existe.

```bash
git merge feature/pagina-acerca-de
```

```text
Updating a1b2c3d..2b3a4c5
Fast-forward
 acerca-de.html | 1 +
```

Como `main` no había avanzado desde que creaste la rama, Git solo tiene que "adelantar" el puntero: es un merge **fast-forward**.

*Comprobación final:*

```bash
ls                                          # acerca-de.html ha vuelto
git log --oneline                           # HEAD, main y la rama apuntan al mismo commit
```

## Paso 5: limpieza, eliminar la rama fusionada

Una rama ya fusionada no hace falta. Borrarla mantiene el repositorio ordenado.

```bash
git branch -d feature/pagina-acerca-de      # -d = delete
```

```text
Deleted branch feature/pagina-acerca-de (was 2b3a4c5).
```

```bash
git branch                                  # * main
```

---

## Paso 6: ¿y si la rama no está fusionada?

```bash
git switch -c experimento
echo "prueba" > prueba.txt
git add prueba.txt
git commit -m "Experimento"
git switch main
git branch -d experimento
```

```text
error: the branch 'experimento' is not fully merged
```

Git te protege: `-d` solo borra ramas fusionadas. Si de verdad quieres tirar ese trabajo, usa `-D` (⚠️ mayúscula, fuerza el borrado):

```bash
git branch -D experimento
```

> ¿Te has arrepentido? El commit aún se puede recuperar con `git reflog` (ver [ejercicio 6](ejercicio_6_deshacer_cambios.md), Parte E).

---

## Comprueba lo que has aprendido

1. ¿Por qué desaparece `acerca-de.html` al volver a `main`? ¿Se ha borrado?
2. ¿En qué rama tienes que estar para fusionar `feature/x` en `main`?
3. ¿Qué es un merge *fast-forward*? ¿Por qué no se creó commit de merge?
4. ¿Qué diferencia hay entre `git branch -d` y `git branch -D`?

<details>
<summary><b>Soluciones</b></summary>

1. No se ha borrado: solo existe en el commit de la otra rama. Al cambiar a `main`, Git deja la carpeta exactamente como está `main`.
2. En `main`, la que recibe: `git switch main` y después `git merge feature/x`.
3. Que `main` no había avanzado desde que se creó la rama: Git solo mueve el puntero de `main` hasta el último commit. No hay dos historias que unir, así que no hace falta commit de merge.
4. `-d` solo borra ramas ya fusionadas; `-D` la borra aunque tenga commits sin fusionar (recuperables durante un tiempo con `git reflog`).

</details>

▶ **Siguiente:** ¿qué ocurre si `main` **sí** ha avanzado mientras trabajabas en la rama? → [Ejercicio 1. Merge vs rebase](ejercicio_1_git_merge_vs_rebase.md).
