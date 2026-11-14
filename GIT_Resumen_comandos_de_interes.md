# GIT / GitHub. Resumen de comandos de interés (CLI)

Chuleta de comandos Git ordenados por funcionalidad. Cada bloque tiene una tabla `comando → comentario breve` y, cuando procede, una receta paso a paso lista para copiar.

**Convenciones:** `<hash>` = identificador de commit (se ve con `git log --oneline`) · `origin` = nombre habitual del remoto · `main` = rama principal · ⚠️ = comando destructivo o que reescribe historial.

## Índice

1. [Conceptos mínimos](#1-conceptos-mínimos)
2. [Instalación y configuración inicial](#2-instalación-y-configuración-inicial)
3. [Autenticación SSH con GitHub](#3-autenticación-ssh-con-github)
4. [Crear o clonar un repositorio](#4-crear-o-clonar-un-repositorio)
5. [Gestión de remotos](#5-gestión-de-remotos)
6. [Ciclo diario: add, commit, push, pull](#6-ciclo-diario-add-commit-push-pull)
7. [Inspeccionar: status, log, diff](#7-inspeccionar-status-log-diff)
8. [Deshacer cambios: restore, reset, revert, amend](#8-deshacer-cambios-restore-reset-revert-amend)
9. [Ramas y merge](#9-ramas-y-merge)
10. [Sincronizar con el remoto y resolver divergencias](#10-sincronizar-con-el-remoto-y-resolver-divergencias)
11. [Stash: guardar trabajo a medias](#11-stash-guardar-trabajo-a-medias)
12. [.gitignore y dejar de rastrear archivos](#12-gitignore-y-dejar-de-rastrear-archivos)
13. [Etiquetas (tags) y versiones](#13-etiquetas-tags-y-versiones)
14. [Avanzado: rebase, rebase interactivo, cherry-pick, reflog](#14-avanzado-rebase-rebase-interactivo-cherry-pick-reflog)
15. [Colaborar en GitHub: fork, Pull Request y trabajo en equipo](#15-colaborar-en-github-fork-pull-request-y-trabajo-en-equipo)
16. [Archivos grandes y Git LFS](#16-archivos-grandes-y-git-lfs)
17. [Finales de línea Windows / Linux (CRLF / LF)](#17-finales-de-línea-windows--linux-crlf--lf)
18. [Alias](#18-alias)
19. [Problemas frecuentes: qué comando uso](#19-problemas-frecuentes-qué-comando-uso)

---

## 1. Conceptos mínimos

| Zona | Qué es | Cómo se llega |
|---|---|---|
| **Working directory** | Carpeta de trabajo, archivos tal como los editas | Editando |
| **Staging (index)** | Cambios preparados para el próximo commit | `git add` |
| **Repositorio local** | Historial de commits, en la subcarpeta `.git` | `git commit` |
| **Repositorio remoto** | Copia en GitHub (`origin`) | `git push` / `git pull` |

| Término | Significado |
|---|---|
| `HEAD` | Puntero al commit actual (normalmente el último de la rama en la que estás) |
| `HEAD~1`, `HEAD~2` | El commit anterior, el de dos atrás… |
| `origin/main` | Copia local de cómo estaba la rama `main` del remoto en el último `fetch` |
| *upstream* | Rama remota vinculada a tu rama local; permite usar `git push` / `git pull` sin argumentos |

**Ventajas de la CLI:** acceso a todos los comandos, se puede usar en scripts para automatizar, y es igual en Windows, Linux y Mac.

---

## 2. Instalación y configuración inicial

- **Windows:** instalar desde <https://git-scm.com/downloads/win>. Se trabaja con **Git Bash** (terminal tipo Linux).
- **Linux:** `sudo apt install git` y se usa desde la terminal bash de forma nativa.

| Comando | Comentario |
|---|---|
| `git --version` | Comprueba la instalación |
| `git config --list` | Revisa la configuración actual |
| `git config --list --show-origin` | Igual, indicando en qué archivo está cada valor |
| `git config --global user.name "Tu Nombre"` | Nombre que aparecerá en los commits |
| `git config --global user.email "tuemail@ejemplo.com"` | Correo (usar el mismo que en GitHub) |
| `git config --global core.editor "nano"` | Editor para mensajes de commit, rebase, etc. |
| `git config --global init.defaultBranch main` | Las repos nuevas nacen con rama `main` en lugar de `master` |
| `git config --global core.autocrlf false` | Git no toca los finales de línea; elimina el *warning* LF/CRLF (ver [17](#17-finales-de-línea-windows--linux-crlf--lf)) |
| `git config --global pull.rebase false` | `git pull` fusiona con merge (valor clásico); con `true` hace rebase |
| `git config --global --unset <clave>` | Elimina un valor de configuración |
| `git help <comando>` | Ayuda de un comando, p. ej. `git help reset` |

> **Niveles:** `--system` (todo el equipo) → `--global` (tu usuario, `~/.gitconfig`) → `--local` (solo esa repo, `.git/config`). El más específico gana.

**Espacio de trabajo:** una carpeta por repositorio, con el nombre del repositorio.

```bash
mkdir nombre-repo
cd nombre-repo
pwd
```

---

## 3. Autenticación SSH con GitHub

Requisito previo: cuenta en <https://github.com> (tu página será `https://github.com/nombre-usuario`).

### Git Bash / Linux

| Comando | Comentario |
|---|---|
| `ssh-keygen -t ed25519 -C "tu_email@ejemplo.com"` | Genera la pareja de claves en `~/.ssh/` |
| `ls -l ~/.ssh/` | Lista las claves: `id_ed25519` (privada) e `id_ed25519.pub` (pública) |
| `eval "$(ssh-agent -s)"` | Arranca el agente SSH, que guarda las claves privadas en memoria |
| `ssh-add ~/.ssh/id_ed25519` | Añade la clave **privada** al agente: no pide la passphrase en cada operación |
| `cat ~/.ssh/id_ed25519.pub` | Muestra la clave **pública** para copiarla (nunca se comparte la privada) |
| `ssh -T git@github.com` | Prueba la conexión; debe responder *"Hi usuario! You've successfully authenticated…"* |

**En GitHub:** avatar → *Settings* → *SSH and GPG keys* → *New SSH key* → poner un *Title* que identifique el equipo (p. ej. "PC de Casa") → pegar la clave pública en *Key* → *Add SSH key*.

### Windows (CMD / PowerShell)

```bat
ssh-keygen -t ed25519 -C "tu_email@ejemplo.com"
:: PowerShell como administrador: activar y arrancar el agente
Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
:: añadir la clave PRIVADA al agente
ssh-add %USERPROFILE%\.ssh\id_ed25519
:: copiar la clave PÚBLICA al portapapeles
type %USERPROFILE%\.ssh\id_ed25519.pub | clip
```

> **HTTPS en lugar de SSH:** GitHub ya no acepta la contraseña de la cuenta por HTTPS; pide un *Personal Access Token* (Settings → Developer settings → Personal access tokens) o el *Git Credential Manager* que instala Git for Windows.

---

## 4. Crear o clonar un repositorio

> **Regla:** el repositorio vacío se crea **primero en GitHub** (sin README, sin .gitignore, sin licencia) antes de poder hacer `push` desde local, tanto si es un proyecto nuevo (`git init`) como si subes uno existente.

### 4.1 Proyecto nuevo desde una carpeta local

```bash
cd nombre-repo
git init                                   # crea la subcarpeta .git
echo "# nombre-repo" >> README.md
git add .
git commit -m "Mensaje inicial"
git branch -M main                         # asegura que la rama se llama main
git remote add origin git@github.com:usuario/nombre-repo.git
git push -u origin main                    # 1ª subida: -u vincula main con origin/main
```

### 4.2 Subir una repo local que ya existe

```bash
git remote add origin git@github.com:usuario/nombre-repo.git
git branch -M main
git push -u origin main
```

### 4.3 Clonar una repo remota

| Comando | Comentario |
|---|---|
| `git clone https://github.com/usuario/nombre-repo.git` | Clona por HTTPS |
| `git clone git@github.com:usuario/nombre-repo.git` | Clona por SSH (clave autenticada previamente, ver [3](#3-autenticación-ssh-con-github)) |
| `git clone <url> otra-carpeta` | Clona en una carpeta con otro nombre |
| `git clone --depth 1 <url>` | Clon superficial: solo el último commit (rápido, sin historial) |

```bash
git clone git@github.com:usuario/nombre-repo.git
cd nombre-repo
# ... editar ...
git add .
git commit -m "Mis primeros cambios"
git push
```

Con `git clone` te ahorras 3 pasos:

- **No** haces `git init`: el clon ya viene inicializado, con todo el historial.
- **No** haces `git remote add origin`: `origin` ya es la URL de donde clonaste.
- **No** necesitas `git branch -M main` (normalmente): la rama principal ya viene configurada.

### 4.4 Crear tu propia repo a partir de clonar una ajena

```bash
git clone https://github.com/otro-usuario/proyecto
cd proyecto
git branch -m master main                  # solo si la rama se llama master
git status
# Crear en GitHub una repo vacía con el mismo nombre (sin README, .gitignore ni licencia)
git remote remove origin                   # quita el origin heredado de la clonación
git remote add origin git@github.com:usuario/proyecto.git
git push -u origin main                    # equivale a: git push --set-upstream origin main
```

---

## 5. Gestión de remotos

| Comando | Comentario |
|---|---|
| `git remote -v` | Lista los remotos y sus URL |
| `git remote add origin https://github.com/usuario/nombre-repo.git` | Añade remoto por HTTPS |
| `git remote add origin git@github.com:usuario/nombre-repo.git` | Añade remoto por SSH |
| `git remote set-url origin git@github.com:usuario/nombre-repo.git` | Cambia la URL (p. ej. de HTTPS a SSH) |
| `git remote set-url origin https://github.com/usuario/nombre-repo.git` | Cambia la URL (de SSH a HTTPS) |
| `git remote remove origin` | Elimina el enlace con el remoto (no borra nada en GitHub) |
| `git remote rename origin antiguo` | Renombra un remoto |
| `git remote show origin` | Detalle del remoto: ramas, upstream, estado |

**Dejar la repo remota vieja y empezar a subir a una nueva:**

```bash
git remote -v
git remote remove origin                              # borra el enlace a la repo vieja
git remote add origin git@github.com:usuario/nueva-repo.git   # vincula con la nueva
git branch -M main                                    # (opcional) asegura el nombre main
git push -u origin main                               # sube código e historial por 1ª vez
```

---

## 6. Ciclo diario: add, commit, push, pull

| Comando | Comentario |
|---|---|
| `git status` | Qué ha cambiado y en qué zona está cada archivo |
| `git add archivo.txt` | Pasa un archivo a staging |
| `git add .` | Pasa a staging todos los cambios de la carpeta actual |
| `git add -p` | Añade por trozos (*hunks*), eligiendo qué parte de cada archivo entra |
| `git commit -m "Mensaje"` | Guarda en el historial lo que hay en staging |
| `git commit -am "Mensaje"` | `add` + `commit` de los archivos ya rastreados (no incluye nuevos) |
| `git push` | Sube los commits a la rama remota vinculada |
| `git push -u origin main` | Primera subida de una rama: crea el vínculo upstream |
| `git pull` | Descarga y fusiona los cambios del remoto (= `fetch` + `merge`) |
| `git fetch` | Solo descarga; no toca tu rama ni tus archivos |
| `git rm fichero.log` | Borra el archivo del disco y del repositorio |
| `git rm --cached fichero.log` | Deja de rastrearlo pero lo conserva en disco |
| `git mv antiguo.md nuevo.md` | Renombra o mueve un archivo y deja el cambio en staging |
| `git clean -n` | Simula qué archivos no rastreados se borrarían |
| `git clean -fd` | ⚠️ Borra archivos y carpetas no rastreados |

**Rutina recomendada:**

```bash
git pull                     # empezar siempre actualizado
# ... editar ...
git status
git add .
git commit -m "Describe qué cambia y por qué"
git push
```

---

## 7. Inspeccionar: status, log, diff

### Estado e historial

| Comando | Comentario |
|---|---|
| `git status` | Estado completo |
| `git status -sb` | Estado resumido con la relación con el remoto |
| `git log` | Historial de commits con sus hashes |
| `git log --oneline` | Una línea por commit (hash corto + mensaje) |
| `git log --oneline --graph --all` | Historial de todas las ramas en forma de grafo |
| `git log --max-count=3` (o `-3`) | Solo los 3 últimos commits |
| `git log -p archivo.txt` | Historial de un archivo con los cambios de cada commit |
| `git log --author="Nombre" --since="2 weeks ago"` | Filtra por autor y fecha |
| `git log main..origin/main` | Commits que tiene el remoto y tú no (tras `git fetch`) |
| `git show <hash>` | Detalle y cambios de un commit |
| `git blame archivo.txt` | Quién y en qué commit modificó cada línea |

**Comprobar si el último commit está en local o en remoto:**

```bash
git fetch
git status -sb
# ## main...origin/main [ahead 1]
```

- `## main` → estás en la rama `main`.
- `...origin/main` → tu rama rastrea a `origin/main`.
- `[ahead 1]` → tienes 1 commit local sin subir (`push`).
- `[behind 2]` → el remoto tiene 2 commits que no tienes (`pull`).
- `[ahead 1, behind 2]` → historiales divergentes (ver [10](#10-sincronizar-con-el-remoto-y-resolver-divergencias)).

### Comparar versiones (diff)

| Comando | Compara | Comentario |
|---|---|---|
| `git diff` | Working directory ↔ Staging | Lo modificado y aún no añadido con `git add` |
| `git diff --staged` (o `--cached`) | Staging ↔ último commit | Exactamente lo que se guardará con `git commit` |
| `git diff HEAD` | Working directory ↔ último commit | Todos los cambios locales, estén en staging o no |
| `git diff archivo.txt` | Un solo archivo | Igual que `git diff`, limitado a ese archivo |
| `git diff HEAD~1 HEAD archivo.txt` | Commit anterior ↔ último | Cambios de un archivo entre los dos últimos commits |
| `git diff <hash1> <hash2>` | Dos commits | Cambios entre dos puntos del historial |
| `git diff main origin/main` | Local ↔ remoto | Diferencias con el remoto (hacer `git fetch` antes) |
| `git diff main..otra-rama` | Dos ramas | Diferencias entre ramas |
| `git diff --stat` | — | Solo el resumen de archivos y líneas cambiadas |

> En la salida, las líneas con `+` (verde) son añadidas y las de `-` (rojo), eliminadas.

---

## 8. Deshacer cambios: restore, reset, revert, amend

**Enfoque de cada comando:**

- `git restore` → restaura **archivos** individuales.
- `git reset` → mueve `HEAD` y manipula **staging y commits** (elimina o mantiene cambios).
- `git revert` → deshace un commit creando un **commit inverso**, sin borrar historial.

| Comando | Comentario |
|---|---|
| `git restore archivo.txt` | ⚠️ Descarta los cambios no añadidos; vuelve a la última versión confirmada |
| `git restore --staged archivo.txt` | Saca el archivo de staging; mantiene los cambios en disco |
| `git restore --source=<hash> archivo.txt` | Recupera el archivo tal como estaba en un commit concreto |
| `git reset` | Vacía staging; no toca los archivos |
| `git reset --soft <hash>` | Vuelve a ese commit y deja los cambios posteriores **en staging** |
| `git reset <hash>` (= `--mixed`) | Vuelve a ese commit y deja los cambios **en disco, sin staging** |
| `git reset --hard <hash>` | ⚠️ Vuelve a ese commit y **borra** todos los cambios posteriores |
| `git reset HEAD~1` | Deshace el último commit conservando los cambios en disco |
| `git reset --hard HEAD~1` | ⚠️ Elimina el último commit y sus cambios |
| `git revert HEAD` | Crea un commit nuevo que deshace el último |
| `git revert <hash>` | Crea un commit nuevo que deshace el commit indicado |
| `git commit --amend` | Reemplaza el último commit (mensaje y/o contenido de staging) |
| `git commit --amend --no-edit` | Igual, conservando el mensaje |
| `git push --force-with-lease origin main` | ⚠️ Push forzado tras `amend`/`reset`; falla si alguien subió algo entretanto |
| `git push --force` | ⚠️ Push forzado sin comprobación: sobrescribe el remoto |

**Qué usar según el caso:**

| Situación | ¿Ya subido (push)? | Usar |
|---|---|---|
| Descartar cambios de un archivo sin añadir | — | `git restore archivo` |
| Quitar un archivo de staging | — | `git restore --staged archivo` |
| Corregir mensaje o contenido del último commit | No | `git commit --amend` |
| Eliminar los últimos commits | No | `git reset` (`--soft`, mixto o `--hard`) |
| Deshacer un commit que ya tienen otros | Sí | `git revert` (seguro, no reescribe historial) |
| Eliminar un commit subido, trabajando tú solo | Sí | `git reset --hard` + `git push --force-with-lease` |

### Recetas

**Revertir el último commit creando un commit nuevo.** No borra el error: añade un commit que lo deshace. Es lo correcto si hay más gente en la repo, porque evita el error de "historial divergente" en su próximo `pull`.

```bash
git revert HEAD
git push origin main
```

**Eliminar el último commit como si no hubiera existido.** Historial más limpio, pero cuidado si alguien ha hecho `pull` hace poco.

```bash
git reset --hard HEAD~1                    # retrocede al commit anterior
git push origin main --force-with-lease    # fuerza la actualización en GitHub
```

**Revertir un commit erróneo cuando alguien ha subido cambios después:**

```bash
git pull origin <rama>          # te traes el commit del compañero
git log --oneline               # localizas el hash del commit erróneo (p. ej. e5f6g7h)
git revert <hash>               # nuevo commit que deshace solo ese cambio
git push origin <rama>          # subes la solución sin romper el trabajo de nadie
```

**Volver a una versión antigua eliminando lo posterior:**

```bash
git log --oneline               # o git reflog para ver todos los movimientos
git reset --hard <hash>         # ⚠️ se borra todo lo hecho desde ese punto
```

> Si te arrepientes de un `reset`, casi siempre se puede recuperar con `git reflog` (ver [14.4](#144-reflog-recuperar-commits-perdidos)).

**Ejercicio guiado: deshacer cambios**

```bash
git status                           # 1. estado inicial
# 2. modificar archivo.txt con nano
git diff                             # 3. cambios aún no añadidos
git add archivo.txt                  # 4. a staging
git diff --staged                    # 5. staging frente al último commit
git commit -m "Cambio de prueba en archivo.txt"   # 6.
git log --oneline --graph --all      # 7. historial
git diff HEAD~1 HEAD archivo.txt     # 8. entre los dos últimos commits
# modificar otra vez archivo.txt
git restore archivo.txt              # 9. descarta el cambio no añadido
# modificar y hacer git add
git restore --staged archivo.txt     # 10. lo saca de staging, conserva el cambio
git reset HEAD~1                     # 11. deshace el último commit, conserva cambios
git reset --hard HEAD~1              # 12. ⚠️ deshace commit y cambios
git reflog                           # 13. ver todos los movimientos de HEAD
git reset --hard <hash>              # 14. volver a cualquiera de ellos
```

---

## 9. Ramas y merge

| Comando | Comentario |
|---|---|
| `git branch` | Lista las ramas locales (`*` marca la actual) |
| `git branch -a` | Lista ramas locales y remotas |
| `git branch -vv` | Ramas con su último commit y su upstream |
| `git branch nueva-rama` | Crea una rama (no cambia a ella) |
| `git switch nueva-rama` | Cambia a esa rama |
| `git switch -c otra-rama` | Crea la rama y cambia a ella |
| `git switch -` | Vuelve a la rama anterior |
| `git checkout rama` / `git checkout -b rama` | Forma clásica equivalente a `switch` / `switch -c` |
| `git branch -m nuevo-nombre` | Renombra la rama actual |
| `git branch -m master main` | Renombra `master` a `main` |
| `git branch -M main` | Renombra forzando (sobrescribe si ya existe `main`) |
| `git merge nueva-rama` | Fusiona `nueva-rama` **en la rama actual** |
| `git merge --no-ff nueva-rama` | Fusiona creando siempre commit de merge (se ve la rama en el grafo) |
| `git merge --abort` | Cancela un merge con conflictos y vuelve al estado previo |
| `git branch -d nueva-rama` | Borra la rama (solo si ya está fusionada) |
| `git branch -D nueva-rama` | ⚠️ Borra la rama aunque no esté fusionada |
| `git push origin nueva-rama` | Sube la rama al remoto |
| `git push -u origin nueva-rama` | La sube y la vincula (upstream) |
| `git push origin --delete nueva-rama` | Borra la rama en el remoto |
| `git fetch --prune` | Limpia referencias a ramas remotas que ya no existen |

> `git switch -b` **no existe**: con `switch` la opción es `-c` (*create*); `-b` es de `checkout`.

**Ejercicio guiado: ramas**

```bash
git branch                          # ramas existentes
git switch -c test                  # crea y cambia a 'test'
# ... editar ...
git status
git add .
git commit -m "Cambios en rama test"
git log --oneline
git switch main                     # vuelve a la principal
git merge test                      # fusiona 'test' en 'main'
git log --oneline --graph --all     # comprueba el merge
git branch -d test                  # borra la rama ya fusionada
git status
```

**Resolver un conflicto de merge a mano:**

```bash
git merge otra-rama                 # CONFLICT (content): Merge conflict in index.html
git status                          # lista los archivos en conflicto ("both modified")
# Editar el archivo: quedarse con lo correcto y borrar las marcas
#   <<<<<<< HEAD          (lo tuyo)
#   =======
#   >>>>>>> otra-rama     (lo que llega)
git add index.html                  # marca el conflicto como resuelto
git commit                          # cierra el merge
```

---

## 10. Sincronizar con el remoto y resolver divergencias

### Sin conflicto

| Comando | Comentario |
|---|---|
| `git pull` | Actualiza local desde el remoto |
| `git push` | Actualiza el remoto desde local |
| `git push -u origin main` | Primera subida de la rama |

### Ver diferencias con el remoto antes de decidir

```bash
git fetch                           # descarga sin fusionar
git status -sb                      # ahead / behind
git diff main origin/main           # diferencias de contenido
git log main..origin/main           # commits del remoto que no tengo
git log origin/main..main           # commits míos que no están en el remoto
```

### Con divergencia

Ocurre cuando local y remoto han avanzado por separado desde el último punto común (`push` rechazado, *non-fast-forward*). Elige según qué versión quieres conservar:

| Quiero… | Comandos | Comentario |
|---|---|---|
| **Conservar ambos** (recomendado) | `git pull --rebase origin main` → `git push` | Trae lo remoto y re-aplica tus commits encima; historial lineal |
| **Conservar ambos con commit de merge** | `git pull` → resolver → `git push` | Fusión clásica |
| **Fusionar, preferencia local** | `git fetch` → `git merge -Xours origin/main` | En las líneas en conflicto gana lo local; el resto se fusiona |
| **Fusionar, preferencia remoto** | `git fetch origin` → `git merge -Xtheirs origin/main` | En las líneas en conflicto gana lo remoto |
| **Quedarme con el remoto** | `git fetch origin` → `git reset --hard origin/main` | ⚠️ Se pierden los cambios y commits locales |
| **Sobrescribir el remoto con local** | `git add .` → `git commit -m "…"` → `git push --force-with-lease` | ⚠️ Se pierden los commits remotos |

**Opción 1. Integrar lo remoto conservando lo mío:**

```bash
git pull --rebase origin main
# si hay conflictos: editar, git add <archivo> y continuar
git rebase --continue               # o git rebase --abort para cancelar
git push -u origin main
```

**Opción 2. Descartar lo local y quedar igual que GitHub:**

```bash
git remote -v
git fetch origin
git reset --hard origin/main        # ⚠️ PERDERÁS tus cambios locales
```

**Actualizar con cambios locales sin confirmar, priorizando lo local:**

```bash
git stash && git merge -X ours origin/main --no-edit && git stash pop
```

Guarda tus cambios sin confirmar, fusiona lo que hay en el servidor dando preferencia a tus commits en caso de conflicto, y recupera tus cambios. Hacer `git fetch` antes. Si lo recuperado con `stash pop` choca con lo fusionado, Git pedirá resolver el conflicto a mano en ese punto.

---

## 11. Stash: guardar trabajo a medias

Aparta temporalmente los cambios sin hacer commit; útil para cambiar de rama o hacer `pull` con trabajo a medias.

| Comando | Comentario |
|---|---|
| `git stash` | Guarda los cambios del working directory y staging; deja la carpeta limpia |
| `git stash -u` | Incluye también los archivos nuevos no rastreados |
| `git stash push -m "descripción"` | Guarda con un nombre descriptivo |
| `git stash list` | Lista los stashes: `stash@{0}`, `stash@{1}`… |
| `git stash show -p stash@{0}` | Muestra el contenido de un stash |
| `git stash pop` | Aplica el último stash y lo elimina de la lista |
| `git stash apply stash@{1}` | Aplica un stash concreto y lo conserva en la lista |
| `git stash drop stash@{0}` | Elimina un stash concreto |
| `git stash clear` | ⚠️ Elimina todos los stashes |

```bash
git stash                 # aparto lo que estoy haciendo
git switch main && git pull
git switch mi-rama
git stash pop             # recupero mi trabajo
```

---

## 12. .gitignore y dejar de rastrear archivos

El archivo `.gitignore` (en la raíz de la repo) indica qué **no** debe rastrear Git.

| Patrón | Qué ignora |
|---|---|
| `*.log` | Todos los archivos `.log` |
| `*.swp` | Temporales del editor |
| `/tmp` | La carpeta `tmp` de la raíz |
| `/logs/*` | Todo el contenido de `logs/` |
| `!logs/.gitkeep` | Excepción: ese archivo **sí** se rastrea (mantiene la carpeta vacía en la repo) |
| `node_modules/` | Una carpeta completa, esté donde esté |
| `.env` | Archivo con credenciales; nunca debe subirse |

```bash
cat <<EOF > .gitignore
/logs/*
!logs/.gitkeep
/tmp
*.swp
.env
EOF
```

| Comando | Comentario |
|---|---|
| `git status --ignored` | Muestra también lo que se está ignorando |
| `git check-ignore -v archivo` | Dice qué regla del `.gitignore` ignora ese archivo |
| `git rm --cached archivo` | Deja de rastrear un archivo; lo conserva en disco |
| `git rm -r --cached carpeta/` | Deja de rastrear una carpeta completa |

**Dejar de rastrear carpetas recién añadidas al `.gitignore`.** El `.gitignore` solo evita que se añadan archivos **nuevos**. Si ya estaban rastreados, Git los sigue vigilando: hay que sacarlos del índice con `rm --cached` (vuelven a *untracked*) y entonces el `.gitignore` ya los ignora.

```bash
git rm -r --cached db_monitor/
git rm -r --cached db_alice/
git rm -r --cached db_bob/
git commit -m "Remover carpetas de base de datos del seguimiento de Git"
git push origin main
```

---

## 13. Etiquetas (tags) y versiones

Marcan un commit concreto, normalmente una versión entregable (`v1.0`).

| Comando | Comentario |
|---|---|
| `git tag` | Lista las etiquetas |
| `git tag v1.0` | Etiqueta ligera sobre el commit actual |
| `git tag -a v1.0 -m "Versión 1.0"` | Etiqueta anotada (autor, fecha y mensaje); la recomendada |
| `git tag -a v0.9 <hash> -m "…"` | Etiqueta un commit antiguo |
| `git show v1.0` | Detalle de la etiqueta y su commit |
| `git push origin v1.0` | Sube una etiqueta (no se suben con `git push` normal) |
| `git push origin --tags` | Sube todas las etiquetas |
| `git tag -d v1.0` | Borra la etiqueta en local |
| `git push origin --delete v1.0` | Borra la etiqueta en el remoto |
| `git switch --detach v1.0` | Sitúa la carpeta en esa versión para consultarla |

---

## 14. Avanzado: rebase, rebase interactivo, cherry-pick, reflog

### 14.1 Rebase

Re-aplica los commits de tu rama encima de otra, dejando un historial **lineal** (sin commit de merge).

| Comando | Comentario |
|---|---|
| `git rebase main` | Recoloca la rama actual encima del último commit de `main` |
| `git pull --rebase` | Trae lo remoto y re-aplica tus commits locales encima |
| `git rebase --continue` | Sigue tras resolver un conflicto (`git add` antes) |
| `git rebase --skip` | Salta el commit que da conflicto |
| `git rebase --abort` | Cancela y vuelve al estado anterior al rebase |

```bash
git switch mi-rama
git rebase main                 # mi-rama pasa a partir del último commit de main
git switch main
git merge mi-rama               # fast-forward, sin commit de merge
```

> ⚠️ **Regla de oro:** no hacer rebase de commits que ya están subidos y que usan otros. Reescribe los hashes y obliga a `push --force-with-lease`.

### 14.2 Rebase interactivo

Permite reordenar, unir, renombrar o eliminar commits **antes de subirlos**.

```bash
git rebase -i HEAD~3            # edita los 3 últimos commits
```

Se abre el editor con una línea por commit (el más antiguo arriba). Se cambia la palabra inicial:

| Acción | Abrev. | Efecto |
|---|---|---|
| `pick` | `p` | Deja el commit tal cual |
| `reword` | `r` | Mantiene el commit y permite cambiar el mensaje |
| `edit` | `e` | Se detiene en ese commit para modificar su contenido |
| `squash` | `s` | Lo une al commit anterior y combina los mensajes |
| `fixup` | `f` | Lo une al anterior descartando su mensaje |
| `drop` | `d` | Elimina el commit |

```text
pick   a1b2c3d Añade formulario
squash e4f5a6b Corrige typo       ← se funde con el anterior
reword 0c9d8e7 arreglos           ← pedirá un mensaje nuevo
```

Mover líneas de sitio cambia el orden de los commits. Al guardar y cerrar se aplica; si algo sale mal, `git rebase --abort`.

### 14.3 Cherry-pick

Copia uno o varios commits concretos de otra rama a la rama actual (crea commits nuevos con otro hash).

| Comando | Comentario |
|---|---|
| `git cherry-pick <hash>` | Aplica ese commit en la rama actual |
| `git cherry-pick <hash1> <hash2>` | Aplica varios commits |
| `git cherry-pick <hashA>^..<hashB>` | Aplica un rango, de A a B incluidos |
| `git cherry-pick -n <hash>` | Trae los cambios a staging sin crear el commit |
| `git cherry-pick --continue` | Sigue tras resolver un conflicto |
| `git cherry-pick --abort` | Cancela la operación |

```bash
git log --oneline otra-rama     # localizo el commit que me interesa (p. ej. 7f3a2b1)
git switch main
git cherry-pick 7f3a2b1         # traigo solo ese arreglo a main
```

Caso típico: un arreglo urgente hecho en una rama de desarrollo que hace falta ya en `main`, o un commit hecho por error en la rama equivocada.

### 14.4 Reflog: recuperar commits perdidos

El reflog guarda el historial de **todos los movimientos de `HEAD`** (commits, resets, reverts, cambios de rama), aunque ya no aparezcan en `git log`. Es la red de seguridad para volver atrás de un `reset`.

| Comando | Comentario |
|---|---|
| `git reflog` | Lista los movimientos: `HEAD@{0}` es el más reciente |
| `git reset --hard <hash>` | Vuelve al estado de esa entrada del reflog |
| `git reset --hard HEAD@{1}` | Vuelve a donde estaba `HEAD` justo antes del último movimiento |
| `git branch rama-recuperada <hash>` | Recupera una rama borrada a partir de su último commit |
| `git switch --detach <hash>` | Sitúa la carpeta en ese punto para inspeccionar sin mover la rama |

**Ejemplo: deshacer un `reset --hard` equivocado**

```text
$ git reflog
5671668 (HEAD -> main) HEAD@{0}: reset: moving to 5671668
1196a76 HEAD@{1}: revert: "C5" Revert "C3"
b9c37ac HEAD@{2}: reset: moving to HEAD
b9c37ac HEAD@{3}: commit: C4
5bdbc7c HEAD@{4}: commit: C3
5671668 HEAD@{5}: commit: C2
1be8aa3 HEAD@{6}: commit (initial): C1

$ git reset --hard 1196a76
HEAD is now at 1196a76 "C5" Revert "C3"

$ git log --all --oneline --graph --decorate
* 1196a76 (HEAD -> main) "C5" Revert "C3"
* b9c37ac C4
* 5bdbc7c C3
* 5671668 C2
* 1be8aa3 C1
```

> El reflog es **local** (no se sube a GitHub) y caduca: por defecto conserva unos 90 días. No recupera cambios que nunca llegaron a un commit.

---

## 15. Colaborar en GitHub: fork, Pull Request y trabajo en equipo

### 15.1 Contribuir a un repositorio público ajeno (fork + PR)

| Paso | Acción | Comando / dónde |
|---|---|---|
| 1 | Hacer **fork** del repositorio | Botón *Fork* en GitHub: crea una copia en tu cuenta |
| 2 | Clonar tu fork | `git clone git@github.com:TU_USUARIO/NOMBRE_REPO.git` y `cd NOMBRE_REPO` |
| 3 | Crear una rama para el cambio | `git switch -c mi-cambio` |
| 4 | Hacer los cambios | Editar los archivos |
| 5 | Confirmar | `git status` → `git add archivo` → `git commit -m "Descripción clara"` |
| 6 | Subir la rama a tu fork | `git push origin mi-cambio` |
| 7 | Abrir el **Pull Request** | En GitHub: *Compare & pull request*, destino = repo original, descripción clara |
| 8 | Revisión | Si piden cambios, repetir 4-6: los commits nuevos se añaden solos al PR |
| 9 | Aceptación o rechazo | Si se acepta, tus cambios quedan integrados en el proyecto original |

**Mantener tu fork al día con el original:**

```bash
git remote add upstream https://github.com/AUTOR_ORIGINAL/NOMBRE_REPO.git
git fetch upstream
git switch main
git merge upstream/main          # o: git rebase upstream/main
git push origin main
```

### 15.2 Trabajo en equipo sobre un mismo repositorio

**Paso 0 (supervisor):** crear la repo en GitHub y añadir al equipo en *Settings → Collaborators*.

| Paso | Acción | Comando |
|---|---|---|
| 1 | Clonar (solo la primera vez) | `git clone <URL_del_repo>` y `cd <nombre_del_repo>` |
| 2 | Sincronizar **siempre** antes de empezar | `git switch main` → `git pull origin main` |
| 3 | Crear tu rama de trabajo | `git switch -c nombre-colaborador/descripcion-tarea` |
| 4 | Hacer los cambios | Editar o crear archivos |
| 5 | Guardar en tu rama | `git add .` → `git commit -m "Mensaje claro"` |
| 6 | Subir tu rama | `git push -u origin nombre-colaborador/descripcion-tarea` |
| 7 | Crear el Pull Request | En GitHub: *Compare & pull request*, título y descripción |
| 8 | Revisión y fusión (supervisor) | *Merge pull request* |
| 9 | Limpiar tras la fusión | `git switch main` → `git pull` → `git branch -d mi-rama` |

- **Sin conflicto:** si tus cambios no chocan con los de nadie (p. ej. un archivo nuevo), el supervisor fusiona directamente.
- **Con conflicto:** si dos personas tocaron las mismas líneas (p. ej. `index.html`), hay que resolverlo antes de fusionar. Lo habitual es que el autor actualice su rama:

```bash
git switch mi-rama
git fetch origin
git merge origin/main            # resolver conflictos, git add, git commit
git push
```

### 15.3 GitHub CLI (opcional)

Con la herramienta `gh` (<https://cli.github.com>) se evita pasar por la web:

| Comando | Comentario |
|---|---|
| `gh auth login` | Autentica la terminal con tu cuenta de GitHub |
| `gh repo create nombre-repo --private --source=. --push` | Crea la repo en GitHub desde la carpeta local y la sube |
| `gh repo clone usuario/nombre-repo` | Clona |
| `gh repo fork usuario/nombre-repo --clone` | Hace fork y lo clona |
| `gh pr create` | Abre un Pull Request de la rama actual |
| `gh pr list` / `gh pr checkout 12` | Lista los PR / descarga uno para probarlo |

---

## 16. Archivos grandes y Git LFS

GitHub rechaza archivos de más de **100 MB** en un `push` normal.

### Eliminar un archivo grande añadido en el último commit

```bash
# 1. Quita el archivo del índice de Git (lo conserva en disco)
git rm --cached docs/assets/video_grande.gif
# 2. (Opcional) bórralo también del disco o muévelo fuera del proyecto
rm docs/assets/video_grande.gif
# 3. Reescribe el último commit para que "olvide" el archivo
git commit --amend --no-edit
# 4. Sube los cambios
git push origin main             # con --force-with-lease si el commit ya estaba subido
```

> Esto solo sirve si el archivo entró en el **último** commit. Si está más atrás en el historial hay que reescribirlo con `git filter-repo` o con un rebase interactivo.

### Git LFS (Large File Storage)

Extensión de Git para archivos grandes (vídeos, imágenes, ISO, datasets, binarios) sin ralentizar la repo:

1. En la repo solo se guarda un **puntero** de texto de pocos bytes (hash SHA-256 y tamaño).
2. El archivo real se almacena en un **servidor LFS** aparte (GitHub lo soporta).
3. Al clonar, la descarga es **transparente** y solo de la versión que necesita tu rama, no de todo su historial.

| Comando | Comentario |
|---|---|
| `git lfs install` | Activa LFS (una vez por equipo/usuario) |
| `git lfs track "*.iso"` | Indica qué archivos gestiona LFS |
| `git lfs track "modelos/*.bin"` | También por carpeta y patrón |
| `git add .gitattributes` | Guarda la configuración generada por `track` |
| `git lfs ls-files` | Lista los archivos gestionados por LFS |
| `git lfs migrate import --include="*.iso"` | ⚠️ Pasa a LFS archivos que ya estaban en el historial (lo reescribe) |

```bash
git lfs install
git lfs track "*.iso"
git add .gitattributes
git commit -m "Configurar Git LFS para archivos grandes"
git add archivo_grande.iso
git commit -m "Añadir imagen ISO"
git push origin main             # a partir de aquí, Git como de costumbre
```

> GitHub incluye una cuota gratuita limitada de almacenamiento y ancho de banda LFS por cuenta; consultar el valor vigente en la documentación de GitHub.

---

## 17. Finales de línea Windows / Linux (CRLF / LF)

- **Windows** usa **CRLF**: retorno de carro (`\r`) + nueva línea (`\n`).
- **Linux** usa **LF**: solo nueva línea (`\n`).

Síntoma típico al ejecutar en Linux/WSL un script editado en Windows: `$'\r': command not found`.

| Comando | Comentario |
|---|---|
| `dos2unix scripts/*.sh` | Convierte los archivos a formato Linux |
| `sed -i 's/\r$//' scripts/*.sh` | Alternativa sin instalar nada: borra el `\r` final de cada línea |
| `file script.sh` | Indica si tiene *"CRLF line terminators"* |
| `git config --global core.autocrlf false` | Git no convierte finales de línea; elimina el warning *LF will be replaced by CRLF* |
| `git config --global core.autocrlf input` | Convierte a LF al hacer commit y no toca al descargar (útil en Linux/WSL) |

> En `sed`, `s/\r$//` sustituye el `\r` del final de línea por lo que hay entre las dos últimas barras: nada.

**Forzar LF en los scripts para todo el equipo** con un archivo `.gitattributes` en la repo:

```text
*.sh text eol=lf
```

---

## 18. Alias

Comandos cortos personalizados; se guardan en `~/.gitconfig`.

| Comando | Comentario |
|---|---|
| `git config --global alias.last 'log -1 HEAD'` | `git last` muestra el último commit |
| `git config --global alias.st 'status -sb'` | `git st` → estado resumido |
| `git config --global alias.co switch` | `git co rama` → cambiar de rama |
| `git config --global alias.br branch` | `git br` → listar ramas |
| `git config --global alias.cm 'commit -m'` | `git cm "mensaje"` |
| `git config --global alias.lg 'log --oneline --graph --all --decorate'` | `git lg` → grafo completo |
| `git config --global alias.unstage 'restore --staged'` | `git unstage archivo` |
| `git config --global --get-regexp alias` | Lista los alias definidos |
| `git config --global --unset alias.last` | Borra un alias |

```text
$ git last
commit 66938dae3329c7aebe598c2246a8e6af90d04646
Author: Tu Nombre <tuemail@ejemplo.com>
Date:   Tue Aug 26 19:48:51 2008 +0800

    test for current head
```

---

## 19. Problemas frecuentes: qué comando uso

| Problema | Solución |
|---|---|
| `push` rechazado (*non-fast-forward*) | `git pull --rebase origin main` y después `git push` |
| Me he equivocado en el mensaje del último commit | `git commit --amend -m "Mensaje correcto"` |
| Olvidé añadir un archivo al último commit | `git add archivo` → `git commit --amend --no-edit` |
| Hice el commit en la rama equivocada | `git switch rama-buena` → `git cherry-pick <hash>` → volver y `git reset --hard HEAD~1` |
| Quiero descartar todos los cambios locales sin confirmar | ⚠️ `git restore .` (y `git clean -fd` para los no rastreados) |
| Quiero dejar mi copia idéntica a GitHub | ⚠️ `git fetch origin` → `git reset --hard origin/main` |
| Hice `reset --hard` y perdí commits | `git reflog` → `git reset --hard <hash>` |
| Borré una rama sin fusionar | `git reflog` → `git branch rama <hash>` |
| Necesito cambiar de rama con trabajo a medias | `git stash` → … → `git stash pop` |
| Un archivo del `.gitignore` sigue apareciendo | `git rm --cached archivo` → commit |
| Subí un archivo de más de 100 MB | Ver [16](#16-archivos-grandes-y-git-lfs) |
| Subí una contraseña o token | Revocar la credencial **inmediatamente**; después limpiar el historial (`git filter-repo`) |
| El remoto está en HTTPS y pide credenciales | `git remote set-url origin git@github.com:usuario/nombre-repo.git` |
| La rama se llama `master` | `git branch -m master main` |
| `Permission denied (publickey)` | Revisar `ssh-add -l`, `ssh -T git@github.com` y la clave en GitHub |
| `$'\r': command not found` | `dos2unix script.sh` (ver [17](#17-finales-de-línea-windows--linux-crlf--lf)) |
| Un merge se ha complicado | `git merge --abort` y volver a empezar |
| ¿En qué commit se introdujo un fallo? | `git log -p archivo`, `git blame archivo` |

---

## Enlaces

- Documentación oficial y libro *Pro Git* en español: <https://git-scm.com/book/es/v2>
- Tutorial `git fetch` (Atlassian): <https://www.atlassian.com/es/git/tutorials/syncing/git-fetch>
- Documentación de GitHub: <https://docs.github.com/es>
