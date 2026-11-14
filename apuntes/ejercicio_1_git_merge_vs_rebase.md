# Ejercicio Guiado 1: Git Merge vs Git Rebase

Este ejercicio te ayudará a comprender de forma práctica la diferencia entre fusionar (merge) y rebasar (rebase) ramas en Git.

## Objetivo
Simular un escenario donde la rama `main` y la rama `feature` han avanzado por separado, y resolver la integración de ambas formas.

---

## Parte A: Preparación del entorno

1. **Inicializa un repositorio de prueba:**
   ```bash
   mkdir prueba-git
   cd prueba-git
   git init
   ```
2. **Crea el primer commit en `main`:**
   ```bash
   echo "Version inicial" > archivo.txt
   git add archivo.txt
   git commit -m "Commit A en main"
   ```
3. **Crea una nueva rama y añade un commit:**
   ```bash
   git switch -c feature
   echo "Nueva caracteristica" >> archivo.txt
   git add archivo.txt
   git commit -m "Commit B en feature"
   ```
4. **Vuelve a `main` y simula que otro compañero subió cambios:**
   ```bash
   git switch main
   echo "Cambio de otro compañero" > otro.txt
   git add otro.txt
   git commit -m "Commit C en main"
   ```

---

## Parte B: Integración con MERGE

Vamos a fusionar `feature` dentro de `main`.

1. **Asegúrate de estar en la rama destino (`main`):**
   ```bash
   git switch main
   ```
2. **Ejecuta la fusión:**
   ```bash
   git merge feature
   ```
   *(Esto creará un "Commit de fusión". Se abrirá el editor de texto de tu terminal para confirmar el mensaje del commit, ciérralo guardando los cambios).*
3. **Revisa el historial:**
   ```bash
   git log --graph --oneline --all
   ```
   *Notarás que las líneas del gráfico se separan y vuelven a unirse.*

---

## Parte C: Integración con REBASE (Opcional - En otra carpeta)

Para ver la diferencia, repite la **Parte A** en una carpeta nueva y luego sigue estos pasos:

1. **Asegúrate de estar en la rama que vas a mover (`feature`):**
   ```bash
   git switch feature
   ```
2. **Ejecuta el rebase sobre `main`:**
   ```bash
   git rebase main
   ```
   *(Tus commits de `feature` se reescribirán para colocarse justo después del último commit de `main`).*
3. **Revisa el historial:**
   ```bash
   git log --graph --oneline --all
   ```
   *Notarás que el historial ahora es una línea completamente recta, sin commit de fusión.*