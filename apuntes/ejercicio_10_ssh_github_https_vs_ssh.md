# Ejercicio guiado 10: conectar con GitHub por SSH y diagnosticar HTTPS vs SSH

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left">
> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Objetivo

1. Configurar la autenticación **SSH** con GitHub (se hace una vez por equipo).
2. Entender y resolver un problema muy frecuente: **`ssh -T git@github.com` funciona, pero `git push` sigue pidiendo usuario y contraseña**.

**Teoría de apoyo:** [2. Configuración inicial](GIT_Resumen_comandos_de_interes.md#2-instalación-y-configuración-inicial) · [3. Autenticación SSH](GIT_Resumen_comandos_de_interes.md#3-autenticación-ssh-con-github) · [6. Gestión de remotos](GIT_Resumen_comandos_de_interes.md#6-gestión-de-remotos)

🧪 **Laboratorio** (terminal simulada en el navegador, con *Comprobar* y solución): [Autenticación SSH](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-ssh) · [HTTPS con token y set-url](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-https)

> **¿Aula con disco C: que se reinicia?** Al terminar este ejercicio haz el [ejercicio 11](ejercicio_11_config_entorno_volatil.md) para no perder la clave en el próximo reinicio.

---

## Parte A: identidad y clave SSH

Todo en **Git Bash**.

1. **Identidad de Git** (usa el mismo correo que en GitHub):

   ```bash
   git config --global user.name "Tu Nombre"
   git config --global user.email "tu_email@ejemplo.com"
   git config --list
   ```

2. **Genera la pareja de claves.** Pulsa Enter para aceptar la ruta por defecto. En un equipo compartido, pon una *passphrase*.

   ```bash
   ssh-keygen -t ed25519 -C "tu_email@ejemplo.com"
   ls -l ~/.ssh/          # id_ed25519 (PRIVADA, nunca se comparte) e id_ed25519.pub (pública)
   ```

   > `ed25519` es el tipo recomendado hoy. En sistemas antiguos que no lo admitan: `ssh-keygen -t rsa -b 4096 -C "…"` (genera `id_rsa` e `id_rsa.pub`).

3. **Carga la clave en el agente** (así no te pide la passphrase en cada operación):

   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

4. **Sube la clave PÚBLICA a GitHub:**

   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

   Copia la línea completa → GitHub → avatar → *Settings* → *SSH and GPG keys* → *New SSH key* → *Title*: "PC aula" → pega en *Key* → *Add SSH key*.

5. **Prueba la conexión:**

   ```bash
   ssh -T git@github.com
   ```

   La primera vez pregunta si confías en el servidor: escribe `yes`. Debe responder:

   ```text
   Hi TU-USUARIO! You've successfully authenticated, but GitHub does not provide shell access.
   ```

---

## Parte B: diagnóstico, ¿por qué `push` pide contraseña?

1. **Crea en GitHub una repo de prueba** `prueba-ssh` **con README** (casilla *Add a README file*), o con GitHub CLI:

   ```bash
   gh repo create prueba-ssh --private --add-readme
   ```

2. **Clónala por HTTPS** (a propósito):

   ```bash
   git clone https://github.com/TU-USUARIO/prueba-ssh.git
   cd prueba-ssh
   echo "Cambio de prueba" >> README.md
   git commit -am "Prueba de push"
   git push
   ```

   Git pide usuario y contraseña/token o abre una ventana de inicio de sesión. **Cancela.**

3. **Diagnóstico.** Mira la URL del remoto:

   ```bash
   git remote -v
   ```

   ```text
   origin  https://github.com/TU-USUARIO/prueba-ssh.git (fetch)
   origin  https://github.com/TU-USUARIO/prueba-ssh.git (push)
   ```

   Git **guarda la URL con la que clonaste** y la usa para todos los `push` y `pull`. Como es `https://`, se autentica por HTTPS e **ignora tu clave SSH**. `ssh -T git@github.com` funciona porque es una prueba directa de SSH, pero no tiene nada que ver con la configuración de *esta* repo.

4. **Solución: cambia la URL del remoto a SSH.**

   ```bash
   git remote set-url origin git@github.com:TU-USUARIO/prueba-ssh.git
   git remote -v
   ```

   ```text
   origin  git@github.com:TU-USUARIO/prueba-ssh.git (fetch)
   origin  git@github.com:TU-USUARIO/prueba-ssh.git (push)
   ```

   Fíjate en la sintaxis: empieza por `git@github.com:` (con **dos puntos** antes del usuario), no por `https://`.

5. **Vuelve a intentarlo:**

   ```bash
   git push
   ```

   Ahora sube sin pedir nada.

| URL | Protocolo | Autenticación |
|---|---|---|
| `https://github.com/usuario/repo.git` | HTTPS | Token, Git Credential Manager o `gh auth login` |
| `git@github.com:usuario/repo.git` | SSH | Tu clave SSH |

---

## Parte C (opcional): limpieza

Borra la repo de prueba desde la web (*Settings → Danger Zone → Delete this repository*) o con `gh repo delete TU-USUARIO/prueba-ssh` (GitHub CLI pedirá primero el permiso extra con `gh auth refresh -s delete_repo`).

---

## Comprueba lo que has aprendido

1. ¿Qué clave subes a GitHub, la que termina en `.pub` o la otra? ¿Por qué?
2. Si `ssh -T git@github.com` funciona, ¿por qué `git push` puede seguir pidiendo contraseña?
3. ¿Qué comando muestra con qué URL está trabajando una repo? ¿Y cuál la cambia?
4. ¿Con qué URL debes clonar a partir de ahora para no tener este problema?

<details>
<summary><b>Soluciones</b></summary>

1. La **`.pub`** (pública). La privada nunca sale de tu equipo: quien la tenga puede hacerse pasar por ti.
2. Porque esa repo tiene un remoto con URL `https://…`. Git solo usa tu clave SSH si la URL es `git@github.com:…`.
3. `git remote -v` muestra la URL; `git remote set-url origin <nueva-url>` la cambia.
4. Con la URL SSH: `git clone git@github.com:usuario/repo.git` (botón *Code → SSH* en GitHub).

</details>
