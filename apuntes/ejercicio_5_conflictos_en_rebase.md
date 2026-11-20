# Ejercicio guiado 5: resolución de conflictos con git rebase

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left">
> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

Resolver un conflicto en un `rebase` es distinto que en un `merge`: no hay commit de fusión al final. Git **se detiene en cada commit conflictivo**, esperas a resolverlo y le dices que **continúe** con el resto.

## Objetivo

Provocar un conflicto al rebasar una rama sobre `main` y terminar el proceso con `git rebase --continue`.

**Teoría de apoyo:** [15.1 Rebase](GIT_Resumen_comandos_de_interes.md#151-rebase) · **Requisito:** [Ejercicio 4](ejercicio_4_conflictos_en_merge.md)

---

## Parte A: preparar el escenario

1. **Crea un repositorio limpio:**

   ```bash
   mkdir prueba-rebase-conflicto
   cd prueba-rebase-conflicto
   git init -b main
   echo "Sistema Operativo: Windows" > config.txt
   git add config.txt
   git commit -m "Commit inicial: Windows"
   ```

2. **Crea la rama `feature-linux` y modifica el archivo:**

   ```bash
   git switch -c feature-linux
   echo "Sistema Operativo: Linux" > config.txt
   git commit -am "Cambiar OS a Linux"
   ```

3. **Vuelve a `main` y cambia la misma línea:**

   ```bash
   git switch main
   echo "Sistema Operativo: macOS" > config.txt
   git commit -am "Cambiar OS a macOS"
   ```

---

## Parte B: ejecutar el rebase y resolver

1. **Sitúate en la rama que quieres mover** (`feature-linux`) e inicia el rebase sobre `main`:

   ```bash
   git switch feature-linux
   git rebase main
   ```

   ```text
   CONFLICT (content): Merge conflict in config.txt
   Could not apply f9fbc19... Cambiar OS a Linux
   ```

2. **Abre `config.txt`:**

   ```text
   <<<<<<< HEAD
   Sistema Operativo: macOS
   =======
   Sistema Operativo: Linux
   >>>>>>> f9fbc19 (Cambiar OS a Linux)
   ```

   > ⚠️ **Fíjate:** en un rebase, `HEAD` es la rama **base** (`main`, *macOS*), y abajo aparece **tu** commit que se está re-aplicando (*Linux*). Es al revés que en el merge del ejercicio 4.

3. **Resuelve** borrando los marcadores y dejando el texto final:

   ```text
   Sistema Operativo: Sistema dual (macOS y Linux)
   ```

4. **Continúa el rebase.** A diferencia del merge, **no** haces `git commit`: añades el archivo y le dices a Git que siga.

   ```bash
   git add config.txt
   git rebase --continue
   ```

   Si se abre el editor con el mensaje del commit, guarda y cierra. Debe terminar con `Successfully rebased and updated refs/heads/feature-linux`.

5. **Comprueba el historial** (lineal, sin commit de merge):

   ```bash
   git log --oneline --graph --all
   ```

   ```text
   * 313812e (HEAD -> feature-linux) Cambiar OS a Linux
   * cef8c00 (main) Cambiar OS a macOS
   * f760f4c Commit inicial: Windows
   ```

> **Red de seguridad:** si en cualquier momento te equivocas durante el rebase, `git rebase --abort` cancela todo y te devuelve a como estabas antes de empezar.

---

## Comprueba lo que has aprendido

1. ¿Por qué en el rebase no se hace `git commit` tras resolver?
2. ¿Qué rama representa `HEAD` en los marcadores de un rebase? ¿Y en los de un merge?
3. Si `feature-linux` tuviera **3** commits que tocan `config.txt`, ¿cuántas veces podría detenerse el rebase?
4. ¿Qué tendrías que hacer para que `main` incluya ahora el cambio de `feature-linux`? (Pista: Parte C del [ejercicio 1](ejercicio_1_git_merge_vs_rebase.md)).
