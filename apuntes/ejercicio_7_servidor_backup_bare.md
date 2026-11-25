# Ejercicio guiado 7: servidor de copias de seguridad con Git (--bare)

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left"> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Objetivo

Montar tu propio "GitHub privado" para copias de seguridad: un repositorio **bare** (sin carpeta de trabajo, solo historial) que recibe tus `push` por SSH. Primero lo simularás en tu propio equipo y después en un servidor real.

**Teoría de apoyo:** [17. Servidor propio de copias de seguridad](GIT_Resumen_comandos_de_interes.md#17-servidor-propio-de-copias-de-seguridad-repositorio-bare) · [6. Gestión de remotos](GIT_Resumen_comandos_de_interes.md#6-gestión-de-remotos)

🧪 **Laboratorio** (terminal simulada en el navegador, con *Comprobar* y solución): [Servidor propio con --bare](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-bare)

```text
  Tu equipo                         Servidor (o carpeta / USB)
  mis_datos/  ── git push ──►  ~/backups/mis_datos.git   (bare)
  (con archivos)  ◄── git clone ──   (solo historial)
```

---

## Parte A: simulación en local (sin servidor)

Un remoto puede ser **otra carpeta**. Así practicas el flujo completo sin SSH. Usa Git Bash.

1. **Prepara el repositorio local con datos:**

   ```bash
   mkdir -p ~/practica-backup/mis_datos
   cd ~/practica-backup/mis_datos
   echo "Notas importantes" > notas.txt
   echo "Lista de tareas"   > tareas.txt
   git init -b main
   git add .
   git commit -m "Copia de seguridad inicial"
   git status                     # nothing to commit, working tree clean
   ```

   > Prueba a hacer `git commit` en una carpeta **vacía**: Git responde `nothing to commit (create/copy files and use "git add" to track)`. Por eso primero se copian los datos.

2. **Crea el repositorio bare** (hace de "servidor"):

   ```bash
   mkdir -p ~/practica-backup/servidor/mis_datos.git
   cd ~/practica-backup/servidor/mis_datos.git
   git init --bare -b main
   ls                             # HEAD config hooks objects refs… ¡no hay notas.txt!
   ```

3. **Vincula y sube:**

   ```bash
   cd ~/practica-backup/mis_datos
   git remote add origin ~/practica-backup/servidor/mis_datos.git
   git remote -v                  # ruta para (fetch) y (push)
   git push -u origin main        # * [new branch]  main -> main
   ```

4. **Consulta la copia:** el bare no tiene archivos visibles, pero sí el historial.

   ```bash
   git -C ~/practica-backup/servidor/mis_datos.git log --oneline
   Listar los nombres de todos los archivos guardados en la rama main
   git ls-tree -r --name-only main
   ```

5. **Restaura** la copia en otra carpeta, como si hubieras perdido el equipo:

   ```bash
   cd ~/practica-backup
   git clone servidor/mis_datos.git restaurado
   ls restaurado                  # notas.txt  tareas.txt
   ```

6. **Comprueba por qué hace falta `--bare`:** intenta subir a `restaurado`, que es un repositorio normal.

   ```bash
   cd ~/practica-backup/mis_datos
   git remote add prueba ../restaurado
   echo "cambio" >> notas.txt && git commit -am "Cambio de prueba"
   git push prueba main           # ! [remote rejected] main -> main (branch is currently checked out)
   git remote remove prueba
   git push                       # al bare sí funciona
   ```

> **Variante USB:** repite el paso 2 en una memoria USB (en Git Bash, la unidad `E:` es `/e/`) y usa `git remote add usb /e/backups/mis_datos.git`.

---

## Parte B: servidor real por SSH

Necesitas una máquina Linux accesible por SSH (servidor del aula, máquina virtual, Raspberry Pi o el equipo de un compañero) con `git` y `openssh-server` instalados. Sustituye `usuario` e `ip_del_servidor` (p. ej. `192.168.1.50`) por los tuyos.

1. **(Recomendado) Entra con clave en lugar de contraseña:**

   ```bash
   ssh-copy-id usuario@ip_del_servidor
   ```

2. **Conéctate y crea el repositorio bare:**

   ```bash
   ssh usuario@ip_del_servidor
   mkdir -p ~/backups/mis_datos.git
   cd ~/backups/mis_datos.git
   git init --bare -b main        # Initialized empty Git repository in /home/usuario/backups/mis_datos.git/
   exit
   ```

3. **En tu equipo, añade el servidor como un segundo remoto.** Tu repo ya tiene `origin` (la carpeta de la Parte A), así que este se llamará `backup`:

   ```bash
   cd ~/practica-backup/mis_datos
   git remote add backup usuario@ip_del_servidor:backups/mis_datos.git
   git remote -v
   git push -u backup main
   ```

   > Si escribes `git remote add origin …` verás `error: remote origin already exists`.

4. **Verifica en el servidor:**

   ```bash
   ssh usuario@ip_del_servidor "git -C ~/backups/mis_datos.git log --oneline"
   ```

---

## Parte C: mantenimiento diario

1. **Ciclo de tres comandos** cada vez que cambien tus archivos:

   ```bash
   echo "Nueva tarea" >> tareas.txt
   git add .
   git commit -m "Actualización de backup: $(date +%F)"
   git push backup
   ```

2. **Reto:** crea un alias que lo haga todo en un paso y pruébalo.

   ```bash
   git config --global alias.backup '!git add . && git commit -m "Backup $(date +%F)" && git push'
   echo "Otra tarea" >> tareas.txt
   git backup
   ```

   > El alias hace `git push` al remoto vinculado con `-u` (el último que configuraste). Compruébalo con `git status -sb`.

---

## Comprueba lo que has aprendido

1. ¿Qué diferencia hay entre `mis_datos/` y `mis_datos.git/`? ¿Por qué en uno ves `notas.txt` y en el otro no?
2. ¿Por qué Git rechaza el `push` a un repositorio normal?
3. ¿Qué comando usarías para recuperar todos tus datos en un equipo nuevo?
4. Al clonar aparece `warning: remote HEAD refers to nonexistent ref`. ¿Qué ocurrió al crear el bare y cómo se arregla? (Pista: [17.6](GIT_Resumen_comandos_de_interes.md#176-problemas-típicos)).
5. ¿Guarda Git los archivos que están en `.gitignore`? ¿Qué implica para una copia de seguridad?

<details>
<summary><b>Soluciones</b></summary>

1. `mis_datos/` es un repositorio **normal**: carpeta de trabajo con tus archivos y, dentro, `.git`. `mis_datos.git/` es **bare**: solo el contenido de `.git` (objetos y referencias), sin carpeta de trabajo; por eso no ves `notas.txt`.
2. Porque actualizar la rama que está *checked out* en un repositorio con carpeta de trabajo dejaría sus archivos desincronizados (y podría pisar lo que alguien edita allí). Git lo impide con `receive.denyCurrentBranch`.
3. `git clone usuario@ip_del_servidor:backups/mis_datos.git` (o la ruta de la carpeta o del USB).
4. El bare se creó con la rama por defecto `master` (su `HEAD` apunta a `refs/heads/master`), pero solo subiste `main`. En el servidor: `git symbolic-ref HEAD refs/heads/main`. Se evita creándolo con `git init --bare -b main`.
5. No: lo ignorado no entra en ningún commit, así que **no está en la copia**. Lo que quieras respaldar no debe estar en `.gitignore`, o necesita otra copia aparte.

</details>
