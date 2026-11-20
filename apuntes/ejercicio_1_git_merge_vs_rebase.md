# Ejercicio guiado 1: ramas, merge y rebase

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left"> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Objetivo

Comprobar en la práctica la diferencia entre **fusionar** (`merge`) y **rebasar** (`rebase`) dos ramas que han avanzado **las dos** por separado.

**Teoría de apoyo:** [10. Ramas y merge](GIT_Resumen_comandos_de_interes.md#10-ramas-y-merge) · [15.1 Rebase](GIT_Resumen_comandos_de_interes.md#151-rebase)

🧪 **Laboratorio** (terminal simulada en el navegador, con *Comprobar* y solución): [Merge con commit de fusión](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-rama-merge) · [Recolocar una rama con rebase](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-rebase)

**Requisito:** [Ejercicio 9. Flujo básico con ramas](ejercicio_9_flujo_basico_con_ramas.md) (crear, fusionar y borrar una rama cuando `main` no ha avanzado).

**Antes de empezar:** Git instalado y con identidad configurada (`git config --global user.name` y `user.email`). Todo el ejercicio es local: no hace falta GitHub.

---

## Parte A: preparar el escenario

Vamos a dejar `main` y `feature` con un commit cada una desde un punto común:

```text
        B  (feature)
       /
  A ── C  (main)
```

1. **Crea un repositorio de prueba** (`-b main` asegura que la rama se llame `main`):

   ```bash
   mkdir prueba-merge
   cd prueba-merge
   git init -b main
   ```

2. **Primer commit en `main`:**

   ```bash
   echo "Version inicial" > archivo.txt
   git add archivo.txt
   git commit -m "Commit A en main"
   ```

3. **Crea la rama `feature` y añade un commit:**

   ```bash
   git branch                      # solo existe main (marcada con *)
   git switch -c feature           # crea la rama y cambia a ella
   echo "Nueva caracteristica" >> archivo.txt
   git add archivo.txt
   git commit -m "Commit B en feature"
   ```

4. **Vuelve a `main` y simula que un compañero ha subido otro cambio:**

   ```bash
   git switch main
   echo "Cambio de otro compañero" > otro.txt
   git add otro.txt
   git commit -m "Commit C en main"
   git log --oneline --graph --all
   ```

---

## Parte B: integrar con MERGE

1. **Sitúate en la rama destino** (la que recibe los cambios) y fusiona:

   ```bash
   git switch main
   git merge --no-edit feature     # --no-edit: acepta el mensaje "Merge branch 'feature'"
   ```

   > Sin `--no-edit` se abre el editor para confirmar el mensaje del commit de merge: guarda y cierra.

2. **Revisa el historial:**

   ```bash
   git log --oneline --graph --all
   ```

   Resultado esperado (los hashes serán otros):

   ```text
   *   7d1e9a2 (HEAD -> main) Merge branch 'feature'
   |\
   | * 3b8c4f0 (feature) Commit B en feature
   * | 9a0e5d1 Commit C en main
   |/
   * 1f2c3d4 Commit A en main
   ```

   Las líneas se separan y se vuelven a unir: el historial cuenta **cómo ocurrió** y aparece un commit nuevo de merge.

3. **Borra la rama ya fusionada:**

   ```bash
   git branch -d feature
   git branch                      # ya solo queda main
   ```

---

## Parte C: integrar con REBASE

Repite la **Parte A** en otra carpeta (`prueba-rebase` en lugar de `prueba-merge`) y continúa:

1. **Sitúate en la rama que quieres mover** (`feature`) y rebásala sobre `main`:

   ```bash
   git switch feature
   git rebase main
   ```

   El commit B se **re-aplica** después de C, con un hash nuevo.

2. **Revisa el historial:**

   ```bash
   git log --oneline --graph --all
   ```

   ```text
   * 5e6f7a8 (HEAD -> feature) Commit B en feature
   * 9a0e5d1 (main) Commit C en main
   * 1f2c3d4 Commit A en main
   ```

3. **Integra en `main`.** Ahora el merge es *fast-forward*: `main` solo avanza su puntero, sin commit de merge.

   ```bash
   git switch main
   git merge feature               # verás "Fast-forward"
   git branch -d feature
   git log --oneline --graph --all # una única línea recta
   ```

---

## Comprueba lo que has aprendido

1. ¿Cuántos commits hay en `main` al final de la Parte B? ¿Y al final de la Parte C? ¿Por qué no coinciden?
2. ¿Ha cambiado el hash del commit B en la Parte C? ¿Por qué eso es un problema si `feature` ya estuviera subida y otros la usaran?
3. ¿Qué significa *Fast-forward*?
4. ¿Qué pasaría con `git branch -d feature` si `feature` **no** estuviera fusionada? ¿Y con `-D`?

<details>
<summary><b>Soluciones</b></summary>

1. En la Parte B, `main` tiene **4** commits (A, C, B y el commit de merge). En la Parte C, **3** (A, C y B re-aplicado), porque el rebase no crea commit de merge: copia B encima de C.
2. Sí: B pasa a ser un commit nuevo (B') con otro hash, porque cambia su commit padre. Si `feature` ya estuviera subida y otros la usaran, ellos tendrían el B antiguo: habría que forzar el `push` y sus historias divergirían (regla de oro del rebase).
3. Que la rama destino solo **adelanta su puntero** hasta el último commit de la otra rama. No se crea commit de merge porque el destino no tenía trabajo nuevo que combinar.
4. `git branch -d` se niega (`not fully merged`) para que no pierdas commits. `git branch -D` la borra igualmente; sus commits solo se podrían recuperar con `git reflog`.

</details>

▶ **Siguiente:** cuando las dos ramas tocan las mismas líneas aparecen conflictos → [Ejercicio 4 (merge)](ejercicio_4_conflictos_en_merge.md) y [Ejercicio 5 (rebase)](ejercicio_5_conflictos_en_rebase.md).
