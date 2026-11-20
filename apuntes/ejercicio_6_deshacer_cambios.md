# Ejercicio guiado 6: deshacer cambios (restore, commit --amend, reset, revert y reflog)

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left">
> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Introducción: el "Ctrl+Z" de Git

En Git, equivocarse es normal. Git es como un **Ctrl+Z con superpoderes**: permite volver atrás de muchas maneras, desde descartar un pequeño cambio en un archivo hasta deshacer un commit que ya está en el servidor. La clave es elegir el comando según **dónde está el error**:

| Dónde está el error | Comando | ¿Reescribe la historia? |
|---|---|:---:|
| En un archivo modificado, sin `git add` | `git restore <archivo>` | No |
| En staging (hiciste `git add` por error) | `git restore --staged <archivo>` | No |
| En el último commit, aún sin subir | `git commit --amend` | **Sí** |
| En varios commits recientes, sin subir | `git reset` (`--soft`, `--mixed`, `--hard`) | **Sí** |
| En un commit ya subido y compartido | `git revert <hash>` | No |
| "He perdido commits con un reset" | `git reflog` | — |

> **Regla de oro:** lo que **reescribe la historia** (`amend`, `reset`) solo se usa con commits que **no has subido**. Para lo ya compartido, `revert`.

**Teoría de apoyo:** [9. Deshacer cambios](GIT_Resumen_comandos_de_interes.md#9-deshacer-cambios-restore-reset-revert-amend) · [15.4 Reflog](GIT_Resumen_comandos_de_interes.md#154-reflog-recuperar-commits-perdidos)

> Después de **cada** paso ejecuta `git status`, `git log --oneline` y `cat config.txt`: así ves qué ha cambiado y en qué zona.

---

## Parte A: escenario de práctica

Trabajaremos con el archivo de configuración de un servidor:

```bash
mkdir git-deshacer-ejemplo
cd git-deshacer-ejemplo
git init -b main

echo "hostname: server01" > config.txt
git add config.txt
git commit -m "Commit inicial: añade hostname"

echo "ip_address: 192.168.1.10" >> config.txt
git commit -am "Añade la dirección IP del servidor"

echo "dns_server: 8.8.8.8" >> config.txt
git commit -am "Configura el servidor DNS principal"

git log --oneline
```

```text
fa40705 (HEAD -> main) Configura el servidor DNS principal
72e6139 Añade la dirección IP del servidor
b310363 Commit inicial: añade hostname
```

(Tus hashes serán otros).

---

## Parte B: git restore, descartar cambios locales

**Escenario 1: has modificado un archivo y no te gusta el cambio.**

```bash
echo "admin_user: root_MAL" >> config.txt
git status                  # modified: config.txt  ← y Git te sugiere: use "git restore <file>..."
git restore config.txt
cat config.txt              # la línea "admin_user: root_MAL" ha desaparecido
```

**Escenario 2: has hecho `git add` por error.**

```bash
echo "puerto_ssh: 2222" >> config.txt
git add config.txt
git status                  # Changes to be committed  ← sugiere: use "git restore --staged <file>..."
git restore --staged config.txt
git status                  # vuelve a "Changes not staged": el cambio SIGUE en el archivo
git restore config.txt      # ahora sí lo descartamos para dejarlo limpio
```

> `git restore --staged` saca el archivo de staging pero **conserva** el cambio; `git restore` sin más **lo descarta** (⚠️ no se puede recuperar).

---

## Parte C: corregir el último commit (amend)

**Escenario 1: el mensaje del último commit no es bueno.**

```bash
git commit --amend -m "Añade el servidor DNS de Google (8.8.8.8)"
git log --oneline           # mismo número de commits, pero el último tiene hash NUEVO
```

**Escenario 2: se te olvidó añadir un archivo.**

```bash
echo "Servidor de pruebas del aula" > LEEME.txt
git add LEEME.txt
git commit --amend --no-edit      # --no-edit: conserva el mensaje
git show --stat HEAD              # el último commit ahora incluye config.txt y LEEME.txt
```

| `git commit --amend` | |
|---|---|
| Qué hace | **Reemplaza** el commit más reciente por uno nuevo |
| ID (hash) | Cambia |
| Cuándo usarlo | Solo con commits que **aún no has subido** con `git push` |
| Cuándo NO usarlo | Nunca en commits que ya están en una rama remota compartida |

---

## Parte D: git reset, viajar en el tiempo (con consecuencias)

`git reset` mueve la rama (`HEAD`) a un commit anterior. Los commits posteriores desaparecen del `log`; lo que cambia entre los tres modos es **qué pasa con sus cambios**:

| Modo | Los cambios de los commits descartados quedan… |
|---|---|
| `--soft` | En **staging**, listos para un nuevo commit |
| `--mixed` (por defecto) | En el **working directory**, sin staging (como si los acabaras de escribir) |
| `--hard` | ⚠️ **Borrados** |

1. **`--soft`:** deshaz el último commit y rehazlo con otro mensaje.

   ```bash
   git reset --soft HEAD~1
   git status                        # Changes to be committed: config.txt y LEEME.txt
   git commit -m "Añade DNS y LEEME"
   ```

2. **`--mixed`:** vuelve al primer commit conservando todo el trabajo, para rehacer IP y DNS en **un solo** commit.

   ```bash
   git reset HEAD~2                  # equivale a git reset --mixed <hash del commit inicial>
   git log --oneline                 # solo queda "Commit inicial"
   git status                        # modified: config.txt · Untracked: LEEME.txt
   cat config.txt                    # ¡las líneas de IP y DNS siguen ahí!
   git add .
   git commit -m "Añade IP, DNS y LEEME"
   ```

   > `config.txt` aparece como **modified** (no como *untracked*), porque ya estaba en el commit inicial. `LEEME.txt` sí aparece como *untracked*: no existía en ese commit.

3. **`--hard`:** ahora en modo destructivo.

   ```bash
   git reset --hard HEAD~1
   cat config.txt                    # solo "hostname: server01"
   ls                                # LEEME.txt ha desaparecido
   ```

---

## Parte E: git reflog, recuperar lo "perdido"

El `reset --hard` parece irreversible, pero Git guarda durante un tiempo todos los movimientos de `HEAD`:

```bash
git reflog
```

```text
b310363 HEAD@{0}: reset: moving to HEAD~1
861fd4e HEAD@{1}: commit: Añade IP, DNS y LEEME
b310363 HEAD@{2}: reset: moving to HEAD~2
```

```bash
git reset --hard 861fd4e          # usa TU hash (o HEAD@{1})
cat config.txt                    # todo ha vuelto
ls                                # LEEME.txt también
```

> El reflog no puede recuperar cambios que **nunca** llegaron a un commit (por ejemplo, lo descartado con `git restore`).

---

## Parte F: git revert, deshacer de forma segura

`revert` es la forma **recomendada** de deshacer un commit que ya se ha compartido: no borra nada, crea un **commit nuevo** con los cambios inversos.

1. **Deshacer el último commit:**

   ```bash
   echo "puerto_ssh: 2222" >> config.txt
   git commit -am "Añade el puerto SSH"
   git revert --no-edit HEAD         # sin --no-edit se abre el editor con "Revert ..."
   cat config.txt                    # sin la línea del puerto
   ```

2. **Deshacer un commit antiguo:** busca el hash de "Añade IP, DNS y LEEME" y reviértelo.

   ```bash
   git log --oneline
   git revert --no-edit <hash>
   git log --oneline
   ```

   ```text
   2719141 (HEAD -> main) Revert "Añade IP, DNS y LEEME"
   a2a6874 Revert "Añade el puerto SSH"
   337ed53 Añade el puerto SSH
   861fd4e Añade IP, DNS y LEEME
   b310363 Commit inicial: añade hostname
   ```

   El archivo vuelve a tener solo el `hostname`, pero **la historia está intacta**: queda registrado qué se hizo y qué se deshizo. Es la forma profesional de trabajar en equipo.

---

## Reto: revert con conflicto

Repite la **Parte A** en otra carpeta e intenta revertir el commit **intermedio** ("Añade la dirección IP del servidor"):

```bash
git revert <hash-del-commit-de-la-IP>
```

Git responde `CONFLICT`, porque la línea del DNS se añadió justo después de la de la IP y Git no sabe cómo dejar el archivo. Resuélvelo como en el [ejercicio 4](ejercicio_4_conflictos_en_merge.md): deja `hostname` y `dns_server`, borra los marcadores y termina con:

```bash
git add config.txt
git revert --continue             # o git revert --abort para cancelar
```

---

## Comprueba lo que has aprendido

1. ¿Qué diferencia hay entre `git restore config.txt` y `git restore --staged config.txt`?
2. ¿Por qué cambia el hash al hacer `git commit --amend`? ¿Qué problema causaría a tus compañeros si ese commit ya estuviera subido?
3. Tras `git reset HEAD~2`, ¿dónde estaban los cambios? ¿Y tras `git reset --hard HEAD~1`?
4. ¿Por qué `revert` es la opción correcta en una rama compartida y `reset` no?
5. ¿Podrías recuperar con `reflog` la línea "admin_user: root_MAL" de la Parte B? ¿Por qué?
