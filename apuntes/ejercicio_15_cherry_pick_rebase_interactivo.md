# Ejercicio guiado 15: cherry-pick y rebase interactivo

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left">
> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Objetivo

- **Cherry-pick:** copiar un commit concreto de una rama a otra (un arreglo urgente, o un commit hecho en la rama equivocada).
- **Rebase interactivo:** dejar el historial limpio **antes de subirlo**: unir commits, cambiar mensajes, reordenar.

**Teoría de apoyo:** [15.2 Rebase interactivo](GIT_Resumen_comandos_de_interes.md#152-rebase-interactivo) · [15.3 Cherry-pick](GIT_Resumen_comandos_de_interes.md#153-cherry-pick)

**Antes de empezar:** configura un editor que sepas usar, porque el rebase interactivo lo abre. Por ejemplo `git config --global core.editor nano` (o `"code --wait"` para VS Code).

---

## Parte A: cherry-pick de un arreglo urgente

```bash
mkdir practica-cherry
cd practica-cherry
git init -b main
echo "app v1" > app.txt
git add .
git commit -m "Versión inicial"

git switch -c desarrollo
echo "A" > funcionA.txt && git add . && git commit -m "Añade función A"
echo "login corregido" > login.txt && git add . && git commit -m "Arregla error crítico en login"
echo "B" > funcionB.txt && git add . && git commit -m "Añade función B"
git log --oneline
```

Las funciones A y B aún no están listas, pero el arreglo del login hace falta **ya** en `main`. Un `merge` traería todo; `cherry-pick` trae solo ese commit:

```bash
git switch main
git cherry-pick <hash-de-"Arregla error crítico en login">
ls                                   # app.txt  login.txt  (sin funcionA ni funcionB)
git log --oneline --graph --all
```

```text
* 1b7d89a (desarrollo) Añade función B
* 8ea92e3 Arregla error crítico en login
* c08d37c Añade función A
| * deedd11 (HEAD -> main) Arregla error crítico en login
|/
* 0a3cbdb Versión inicial
```

El commit se ha **copiado** con otro hash (`deedd11`): mismos cambios, commit distinto.

---

## Parte B: commit en la rama equivocada

Haces un commit en `main` que debía ir en `desarrollo`:

```bash
echo "doc" > docs.txt
git add docs.txt
git commit -m "Documenta la función B"     # ¡en main, por error!
git log --oneline -1                       # anota el hash
```

Lo **copias** a la rama buena y lo **quitas** de la equivocada:

```bash
git switch desarrollo
git cherry-pick <hash>
git switch main
git reset --hard HEAD~1                    # ⚠️ solo si NO lo habías subido
ls                                         # docs.txt ya no está en main
```

---

## Parte C: rebase interactivo, limpiar el historial antes de subir

1. **Crea un historial "sucio"** en `desarrollo`:

   ```bash
   git switch desarrollo
   echo "<form>" > formulario.html && git add . && git commit -m "Añade formulario"
   echo "<form></form>" > formulario.html && git commit -am "typo"
   echo "<label>Nombre</label>" >> formulario.html && git commit -am "arreglos"
   git log --oneline -3
   ```

   "typo" y "arreglos" no dicen nada útil a quien lea el historial.

2. **Abre el rebase interactivo** de los 3 últimos commits:

   ```bash
   git rebase -i HEAD~3
   ```

   Se abre el editor, con el commit **más antiguo arriba**:

   ```text
   pick 57a4adb Añade formulario
   pick bcd5fda typo
   pick 2573307 arreglos
   ```

3. **Cambia la palabra inicial** de las líneas 2 y 3, guarda y cierra:

   ```text
   pick   57a4adb Añade formulario
   fixup  bcd5fda typo          ← se funde con el anterior y descarta su mensaje
   reword 2573307 arreglos      ← se conserva, pero pedirá un mensaje nuevo
   ```

4. Se abre otra vez el editor con el mensaje "arreglos": cámbialo por `Añade etiqueta Nombre al formulario`, guarda y cierra.

5. **Comprueba:**

   ```bash
   git log --oneline -3
   ```

   ```text
   54dcc56 Añade etiqueta Nombre al formulario
   954a822 Añade formulario
   8c1a1d8 Documenta la función B
   ```

   De 3 commits confusos a 2 claros. Si algo sale mal a mitad: `git rebase --abort`.

> ⚠️ El rebase interactivo **reescribe la historia** (cambian los hashes). Úsalo solo con commits que **no has subido**.

---

## Comprueba lo que has aprendido

1. ¿Por qué el commit copiado con `cherry-pick` tiene un hash diferente al original?
2. ¿Qué diferencia hay entre `squash` y `fixup`? ¿Y entre `reword` y `edit`?
3. En el editor del rebase interactivo, ¿el commit de arriba es el más antiguo o el más reciente?
4. ¿Por qué no debes hacer `rebase -i` de commits que ya están en GitHub y usan tus compañeros?
