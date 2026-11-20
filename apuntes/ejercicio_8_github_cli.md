# Ejercicio guiado 8: GitHub CLI (gh). Repos, issues y Pull Requests desde la terminal

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left">
> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Objetivo

Hacer **sin abrir la web de GitHub** lo que hasta ahora hacías con el navegador: crear una repo remota, abrir una incidencia, proponer un cambio con un Pull Request y fusionarlo.

**Teoría de apoyo:** [4. GitHub CLI (gh)](GIT_Resumen_comandos_de_interes.md#4-github-cli-gh) · [5.2 Proyecto nuevo con GitHub CLI](GIT_Resumen_comandos_de_interes.md#52-proyecto-nuevo-con-github-cli-en-un-solo-paso) · [16. Colaborar en GitHub](GIT_Resumen_comandos_de_interes.md#16-colaborar-en-github-fork-pull-request-y-trabajo-en-equipo)

**Antes de empezar:** Git con identidad configurada y cuenta de GitHub. Sirve CMD, PowerShell o Git Bash.

---

## Parte A: instalar y autenticar

1. **Instala GitHub CLI:**

   ```bash
   winget install --id GitHub.cli
   ```

2. **Cierra todas las terminales y abre una nueva.** Comprueba:

   ```bash
   gh --version
   ```

3. **Inicia sesión** y responde al asistente (elige **SSH** si ya tienes clave del [apartado 3](GIT_Resumen_comandos_de_interes.md#3-autenticación-ssh-con-github); si no, **HTTPS**):

   ```bash
   gh auth login
   ```

   `GitHub.com` → protocolo → (SSH: subir tu `id_ed25519.pub` · HTTPS: *Authenticate Git* `Yes`) → `Login with a web browser` → copia el código de 8 caracteres, pulsa Enter y autorízalo en el navegador.

4. **Verifica:**

   ```bash
   gh auth status
   ```

   Debe aparecer `✓ Logged in to github.com account TU-USUARIO` y el protocolo elegido.

---

## Parte B: crear una repo remota en un solo comando

1. **Prepara un proyecto local:**

   ```bash
   mkdir practica-gh
   cd practica-gh
   git init -b main
   echo "# Práctica con GitHub CLI" > README.md
   git add .
   git commit -m "Commit inicial"
   ```

2. **Crea la repo en GitHub, vincúlala y sube** (todo a la vez):

   ```bash
   gh repo create practica-gh --private --source=. --remote=origin --push --description "Práctica de GitHub CLI"
   ```

3. **Comprueba:**

   ```bash
   git remote -v          # origin ya apunta a GitHub: no hiciste git remote add
   gh repo view           # muestra el README en la terminal
   gh repo view --web     # abre la repo en el navegador
   ```

---

## Parte C: ciclo completo con issue, rama, Pull Request y merge

1. **Abre una incidencia** (tarea pendiente):

   ```bash
   gh issue create --title "Añadir sección de autoría" --body "El README debe indicar quién ha hecho la práctica."
   gh issue list          # anota su número (p. ej. #1)
   ```

2. **Trabaja en una rama:**

   ```bash
   git switch -c autoria
   echo "" >> README.md
   echo "Autor: TU NOMBRE" >> README.md
   git commit -am "Añadir autoría. Closes #1"
   git push -u origin autoria
   ```

   > Escribir `Closes #1` en el mensaje hace que, al fusionar el PR, GitHub **cierre automáticamente** la incidencia 1.

3. **Crea el Pull Request:**

   ```bash
   gh pr create --fill    # --fill usa el mensaje del commit como título y descripción
   gh pr list             # anota su número
   ```

4. **Revisa y fusiona** (normalmente lo haría otra persona del equipo):

   ```bash
   gh pr view 2                           # usa TU número de PR
   gh pr merge 2 --merge --delete-branch  # fusiona y borra la rama en GitHub y en local
   ```

5. **Actualiza tu copia y comprueba:**

   ```bash
   git switch main
   git pull
   git log --oneline --graph
   gh issue list --state closed           # la incidencia #1 aparece cerrada
   ```

---

## Parte D (opcional): colaborar con un compañero

Por parejas: A añade a B como colaborador (*Settings → Collaborators*, o pídeselo al profesor). B ejecuta:

```bash
gh repo clone USUARIO-A/practica-gh
cd practica-gh
git switch -c mejora-b
# ... editar ...
git commit -am "Mejora propuesta por B"
git push -u origin mejora-b
gh pr create --fill
```

A revisa con `gh pr list`, `gh pr checkout NUMERO` (prueba el cambio en local) y lo fusiona con `gh pr merge NUMERO --merge`.

---

## Comprueba lo que has aprendido

1. ¿Qué tres pasos de la sección 5.1 sustituye `gh repo create … --source=. --remote=origin --push`?
2. ¿Por qué falla `--push` si la carpeta no tiene ningún commit?
3. ¿Qué diferencia hay entre `git` y `gh`? ¿Podrías hacer `git push` sin `gh`?
4. ¿Qué hace `gh pr checkout` y para qué sirve al revisar el trabajo de otra persona?
