# Ejercicio guiado 4: resolución de conflictos con git merge

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left">
> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

Un **conflicto** ocurre cuando dos ramas modifican la **misma línea** de un archivo de forma distinta. Git no sabe con qué versión quedarse y te pide que decidas tú.

## Objetivo

Provocar un conflicto al fusionar una rama, leer los marcadores de conflicto y resolverlo editando el archivo.

**Teoría de apoyo:** [10. Ramas y merge](GIT_Resumen_comandos_de_interes.md#10-ramas-y-merge) · **Requisito:** [Ejercicio 1](ejercicio_1_git_merge_vs_rebase.md)

🧪 **Laboratorio** (terminal simulada en el navegador, con *Comprobar* y solución): [Conflicto entre dos ramas](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-conf-ramas)

---

## Parte A: preparar el conflicto

1. **Crea un repositorio y un archivo base:**

   ```bash
   mkdir prueba-conflictos
   cd prueba-conflictos
   git init -b main
   echo "Color favorito: Azul" > preferencias.txt
   git add preferencias.txt
   git commit -m "Commit inicial: Color azul"
   ```

2. **Crea una rama y modifica esa línea:**

   ```bash
   git switch -c rama-verde
   echo "Color favorito: Verde" > preferencias.txt
   git commit -am "Cambiar color a verde"
   ```

3. **Vuelve a `main` y modifica la misma línea de otra forma:**

   ```bash
   git switch main
   echo "Color favorito: Rojo" > preferencias.txt
   git commit -am "Cambiar color a rojo"
   ```

Ahora hay dos historias divergentes: `main` dice *Rojo* y `rama-verde` dice *Verde*.

---

## Parte B: provocar y resolver el conflicto

1. **Intenta fusionar `rama-verde` en `main`:**

   ```bash
   git merge rama-verde
   ```

   ```text
   CONFLICT (content): Merge conflict in preferencias.txt
   Automatic merge failed; fix conflicts and then commit the result.
   ```

2. **Mira el estado.** El archivo aparece como `both modified` y Git te recuerda las dos salidas posibles: resolver y hacer commit, o abortar.

   ```bash
   git status
   ```

3. **Abre `preferencias.txt`** en tu editor:

   ```text
   <<<<<<< HEAD
   Color favorito: Rojo
   =======
   Color favorito: Verde
   >>>>>>> rama-verde
   ```

   | Marcador | Significado |
   |---|---|
   | `<<<<<<< HEAD` | Empieza tu versión (la rama en la que estás: `main`) |
   | `=======` | Separador |
   | `>>>>>>> rama-verde` | Termina la versión que llega de la otra rama |

4. **Resuelve:** borra las tres líneas de marcadores y deja el texto final. Puedes quedarte con una versión o combinarlas:

   ```text
   Color favorito: Rojo oscuro y Verde claro
   ```

5. **Finaliza la fusión:** `git add` marca el conflicto como resuelto y `git commit` crea el commit de merge.

   ```bash
   git add preferencias.txt
   git commit -m "Conflicto resuelto: combinación de colores"
   git log --oneline --graph --all
   ```

---

## Parte C (opcional): abortar un merge

Repite las Partes A y B en otra carpeta, pero en el paso 4 imagina que te has liado. Cancela todo y vuelve al estado anterior al merge:

```bash
git merge --abort
git status          # árbol limpio, como antes del merge
cat preferencias.txt
```

---

## Comprueba lo que has aprendido

1. ¿Por qué Git no pudo fusionar solo? ¿Habría conflicto si una rama hubiese cambiado `preferencias.txt` y la otra `otro.txt`?
2. ¿Qué indica `HEAD` en los marcadores de un merge?
3. ¿Qué ocurre si haces `git add` sin haber borrado los marcadores? (Pruébalo y mira el archivo final).

<details>
<summary><b>Soluciones</b></summary>

1. Porque las dos ramas cambiaron **la misma línea** desde su ancestro común y Git no puede decidir cuál vale. Si cada rama hubiera cambiado un archivo distinto, Git fusionaría sola, sin conflicto.
2. La rama en la que estás, la que **recibe** el merge (aquí, `main`).
3. Git lo da por resuelto y el commit guarda las líneas `<<<<<<<`, `=======` y `>>>>>>>` dentro del archivo. Git no lo comprueba: revisa siempre con `git diff --staged` antes de confirmar.

</details>

▶ **Siguiente:** el mismo conflicto, pero con rebase → [Ejercicio 5](ejercicio_5_conflictos_en_rebase.md).
