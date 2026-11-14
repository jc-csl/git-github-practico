# Ejercicio Guiado 5: Resolución de Conflictos con Git Rebase

Resolver conflictos en un `rebase` es ligeramente diferente a un `merge`. En lugar de crear un "commit de fusión" al final, Git pausa el proceso en cada commit conflictivo para que lo resuelvas, y luego "continúa" aplicando el resto.

## Objetivo
Provocar un conflicto al rebasar una rama sobre `main` y utilizar el comando `--continue`.

---

## Parte A: Preparar el escenario

1. **Crea otro repositorio limpio:**
   ```bash
   mkdir prueba-rebase
   cd prueba-rebase
   git init
   echo "Sistema Operativo: Windows" > config.txt
   git add config.txt
   git commit -m "Commit inicial: Windows"
   ```

2. **Crea la rama secundaria (feature) y modifica el archivo:**
   ```bash
   git switch -c feature-linux
   echo "Sistema Operativo: Linux" > config.txt
   git add config.txt
   git commit -m "Cambiar OS a Linux"
   ```

3. **Vuelve a `main` y haz un cambio en el mismo lugar:**
   ```bash
   git switch main
   echo "Sistema Operativo: macOS" > config.txt
   git add config.txt
   git commit -m "Cambiar OS a macOS"
   ```

---

## Parte B: Ejecutar el Rebase y resolver

1. **Sitúate en la rama que quieres mover (`feature-linux`):**
   ```bash
   git switch feature-linux
   ```

2. **Inicia el rebase sobre `main`:**
   ```bash
   git rebase main
   ```
   *Git pausará el proceso y te avisará que hay un conflicto en `config.txt`.*

3. **Abre `config.txt` y resuelve el conflicto:**
   Verás los marcadores de conflicto. Deja el texto final que desees y borra los marcadores (`<<<<<<<`, `=======`, etc.).
   ```text
   Sistema Operativo: Sistema dual (macOS y Linux)
   ```

4. **Continúa el proceso de rebase:**
   A diferencia del merge, **NO** haces un `git commit`. Simplemente añades el archivo resuelto a la zona de preparación (staging) y le dices a Git que continúe.
   ```bash
   git add config.txt
   git rebase --continue
   ```
   *(Si el rebase te abre un editor de texto para confirmar el mensaje del commit reescrito, simplemente guárdalo y ciérralo).*

*Nota de seguridad: Si en algún momento te equivocas o te asustas durante un rebase, puedes cancelarlo todo y volver a como estabas antes ejecutando `git rebase --abort`.*