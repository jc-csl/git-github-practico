# Ejercicio guiado 11: mantener la configuración de Git y SSH en un equipo que se reinicia

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left">
> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## El problema y la solución

- **El problema:** tu configuración global de Git (`.gitconfig`) y tus claves SSH (`.ssh/`) se guardan en tu carpeta de usuario, `C:\Users\<TuUsuario>\` (en Git Bash, `~`). En las aulas donde **la unidad C: se restaura en cada reinicio**, esa carpeta vuelve a su estado original y pierdes la configuración.
- **La solución:** dos scripts de Git Bash. Uno **guarda** esos archivos en una carpeta segura de la unidad **D:** (que no se borra) antes de apagar, y el otro los **restaura** al empezar la sesión.

```text
AL TERMINAR:  ~/.gitconfig + ~/.ssh/   ── guardar-config.sh ──►    D:/git_backup
AL EMPEZAR:   D:/git_backup            ── restaurar-config.sh ──►  ~/.gitconfig + ~/.ssh/
```

**Teoría de apoyo:** [3.4 Equipos que se reinician](GIT_Resumen_comandos_de_interes.md#34-equipos-que-se-reinician-guardar-gitconfig-y-ssh)

🧪 **Laboratorio** (terminal simulada en el navegador, con *Comprobar* y solución): [Configuración persistente](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-persist)

---

## Fase 1: configuración inicial (solo una vez)

Necesitas tener algo que merezca la pena guardar: identidad de Git, clave SSH subida a GitHub y `ssh -T git@github.com` funcionando. Si aún no lo tienes, haz la **Parte A del [ejercicio 10](ejercicio_10_ssh_github_https_vs_ssh.md)**.

---

## Fase 2: los scripts

1. **Crea la carpeta de scripts en D:**

   ```bash
   mkdir -p /d/git-scripts
   cd /d/git-scripts
   ```

2. **Copia los dos scripts** en esa carpeta. Descárgalos de este repositorio, [recursos/scripts/guardar-config.sh](recursos/scripts/guardar-config.sh) y [recursos/scripts/restaurar-config.sh](recursos/scripts/restaurar-config.sh), o créalos con `nano guardar-config.sh` y pega su contenido.

   Lo que hace cada uno:

   | Script | Pasos |
   |---|---|
   | `guardar-config.sh` | 1) Crea `D:/git_backup` si no existe · 2) copia `~/.gitconfig` · 3) copia la carpeta `~/.ssh` completa |
   | `restaurar-config.sh` | 1) Comprueba que `D:/git_backup` existe (si no, avisa y para) · 2) copia `.gitconfig` a `~` · 3) copia `.ssh` a `~` |

   Fragmento clave de `guardar-config.sh`:

   ```bash
   BACKUP_DIR="${BACKUP_DIR:-D:/git_backup}"   # carpeta destino (se puede cambiar)
   mkdir -p "$BACKUP_DIR"                      # -p: no da error si ya existe
   if [ -f ~/.gitconfig ]; then                # -f: ¿existe el archivo?
       cp ~/.gitconfig "$BACKUP_DIR/"
   fi
   if [ -d ~/.ssh ]; then                      # -d: ¿existe la carpeta?
       cp -rf ~/.ssh "$BACKUP_DIR/"            # -r recursivo, -f sobrescribe
   fi
   ```

3. **Haz la primera copia:**

   ```bash
   bash guardar-config.sh
   ls -A /d/git_backup          # .gitconfig  .ssh
   ls /d/git_backup/.ssh        # id_ed25519  id_ed25519.pub  known_hosts…
   ```

---

## Fase 3: simula un reinicio

Comprueba que la restauración funciona **sin** reiniciar el equipo: aparta tu configuración, restaura y verifica.

```bash
mv ~/.gitconfig ~/gitconfig.apartado        # simulamos que se ha perdido
git config --global user.name               # no muestra nada

bash /d/git-scripts/restaurar-config.sh
git config --global user.name               # vuelve a aparecer tu nombre
ssh -T git@github.com                       # Hi TU-USUARIO! …

rm ~/gitconfig.apartado                     # todo bien: borramos la copia apartada
```

---

## Fase 4: tu rutina diaria

**Al iniciar la sesión:**

```bash
cd /d/git-scripts
bash restaurar-config.sh
git config --global user.name               # ¿sale tu nombre?
ssh -T git@github.com                       # ¿te da la bienvenida?
```

Si las dos comprobaciones funcionan, puedes trabajar.

**Al terminar la sesión (MUY IMPORTANTE)**, sobre todo si has cambiado algo (alias nuevos, otra clave, configuración):

```bash
cd /d/git-scripts
bash guardar-config.sh
```

---

## Avisos de seguridad

- ⚠️ `D:/git_backup/.ssh` contiene tu **clave privada**. **Nunca** pongas esa carpeta dentro de un repositorio Git ni la subas a ningún sitio. Si otras personas usan el mismo equipo, protege la clave con *passphrase*.
- Los scripts guardan Git y SSH, pero **no** la sesión de GitHub CLI ni las credenciales HTTPS: se guardan en el almacén de credenciales de Windows y se pierden al reiniciar. Tras restaurar, repite `gh auth login` si lo usas.
- Si cambias la carpeta de copia, indícala al ejecutar: `BACKUP_DIR="E:/mi_backup" bash guardar-config.sh`.

---

## Comprueba lo que has aprendido

1. ¿En qué carpeta guarda Git la configuración global en Windows? ¿Y SSH las claves?
2. ¿Por qué hay que ejecutar el script de guardado **al final** de la sesión y no solo el primer día?
3. ¿Qué hace `[ -f ~/.gitconfig ]`? ¿Y `[ -d ~/.ssh ]`?
4. ¿Por qué sería grave hacer `git add .` en una carpeta que contenga `git_backup`?

<details>
<summary><b>Soluciones</b></summary>

1. La configuración global en `C:\Users\<usuario>\.gitconfig` (`~/.gitconfig`); las claves SSH en `C:\Users\<usuario>\.ssh\` (`~/.ssh/`).
2. Porque durante la sesión puedes cambiar cosas (alias, otra clave, configuración). Si solo guardas el primer día, cada restauración traería una versión antigua.
3. `[ -f ~/.gitconfig ]` comprueba si existe ese **archivo**; `[ -d ~/.ssh ]`, si existe esa **carpeta**. Así el script avisa en vez de fallar.
4. Tu **clave privada** quedaría confirmada en el historial y, al subirla, expuesta. Habría que borrarla de GitHub (*Settings → SSH keys*), generar otra y limpiar el historial.

</details>
