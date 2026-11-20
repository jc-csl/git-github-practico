# Git. Acciones habituales (chuleta rápida)

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left"> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

Versión **de bolsillo** con los comandos imprescindibles, para tener a mano o imprimir. Cada tabla enlaza con la sección de la [chuleta completa](GIT_Resumen_comandos_de_interes.md) donde se explican con más detalle y con más opciones. Para probarlos sin riesgo: el [🧪 laboratorio](https://jc-csl.github.io/git-github-practico/laboratorio/).

**Abreviaturas:** WD = *working directory* (carpeta de trabajo) · ⚠️ = destructivo o reescribe la historia.

## Lo básico

| Acción | Comando | Explicación |
|---|---|---|
| Configurar identidad (una vez) | `git config --global user.name "Nombre"` · `git config --global user.email "correo@dominio.com"` | Nombre y correo que firmarán tus commits |
| Revisar configuración | `git config --list` | Muestra la configuración actual |
| Inicializar repositorio | `git init -b main` | Crea un repositorio Git en la carpeta actual, con rama `main` |
| Ver estado | `git status` | Qué archivos están modificados, en staging o sin seguimiento |
| Añadir un archivo a staging | `git add <archivo>` | Lo prepara para el próximo commit |
| Añadir todo a staging | `git add .` | Prepara todos los archivos modificados y nuevos |
| Confirmar | `git commit -m "Mensaje"` | Guarda en el historial lo que hay en staging |
| Añadir y confirmar | `git commit -am "Mensaje"` | `add` + `commit` de archivos **ya rastreados** (no incluye los nuevos) |
| Ver historial | `git log` | Commits de la rama actual |
| Ver historial compacto | `git log --oneline --graph --all` | Una línea por commit, con el grafo de ramas |
| Renombrar un archivo | `git mv <viejo> <nuevo>` | Renombra y registra el cambio |
| Eliminar un archivo | `git rm <archivo>` | Lo borra del proyecto y del disco, registrando el cambio |

Más en: [2](GIT_Resumen_comandos_de_interes.md#2-instalación-y-configuración-inicial) · [7](GIT_Resumen_comandos_de_interes.md#7-ciclo-diario-add-commit-push-pull) · [8](GIT_Resumen_comandos_de_interes.md#8-inspeccionar-status-log-diff)

## Deshacer cambios

| Acción | Comando | Explicación |
|---|---|---|
| Descartar cambios en el WD | `git restore <archivo>` | ⚠️ Vuelve el archivo a su última versión confirmada |
| Quitar un archivo de staging | `git restore --staged <archivo>` | Lo saca de staging; mantiene los cambios en el WD |
| Vaciar staging | `git reset` | Saca todo de staging; mantiene los cambios en el WD |
| Modificar el último commit | `git commit --amend` | ⚠️ Cambia el mensaje o añade lo olvidado (solo si no lo has subido) |
| Deshacer el último commit conservando cambios | `git reset HEAD~1` | ⚠️ Borra el commit; los cambios quedan en el WD |
| Deshacer el último commit y sus cambios | `git reset --hard HEAD~1` | ⚠️ Borra el commit y sus cambios |
| Revertir un commit (seguro) | `git revert <hash>` | Crea un commit nuevo que deshace otro; no borra historial |
| Limpiar archivos no rastreados | `git clean -fd` | ⚠️ Borra archivos y carpetas que nunca se añadieron a Git (prueba antes con `git clean -n`) |
| Recuperar lo "perdido" | `git reflog` | Lista todos los movimientos de `HEAD` para volver a cualquiera |

Más en: [9](GIT_Resumen_comandos_de_interes.md#9-deshacer-cambios-restore-reset-revert-amend) · [15.4](GIT_Resumen_comandos_de_interes.md#154-reflog-recuperar-commits-perdidos)

## Ramas y fusiones

| Acción | Comando | Explicación |
|---|---|---|
| Listar ramas | `git branch` | Ramas locales; la actual, con `*` |
| Crear una rama | `git branch <rama>` | La crea a partir del commit actual (no cambia a ella) |
| Cambiar de rama | `git switch <rama>` | Te mueves a esa rama |
| Crear y cambiar | `git switch -c <rama>` | Las dos cosas en un paso |
| Fusionar en la rama actual | `git merge <rama>` | Integra los cambios de `<rama>` en la actual |
| Actualizar tu rama con main | `git rebase main` | ⚠️ Re-aplica tus commits sobre la última versión de `main` |
| Borrar una rama fusionada | `git branch -d <rama>` | Solo funciona si ya está fusionada |
| Forzar el borrado | `git branch -D <rama>` | ⚠️ La borra aunque no esté fusionada |

Más en: [10](GIT_Resumen_comandos_de_interes.md#10-ramas-y-merge) · [15.1](GIT_Resumen_comandos_de_interes.md#151-rebase)

## Sincronizar con el remoto

| Acción | Comando | Explicación |
|---|---|---|
| Clonar | `git clone <url>` | Descarga una copia completa de un repositorio remoto |
| Ver remotos | `git remote -v` | URLs de los remotos vinculados |
| Cambiar la URL (HTTPS → SSH) | `git remote set-url origin git@github.com:usuario/repo.git` | Si `push` pide contraseña aunque tengas SSH |
| Descargar sin fusionar | `git fetch origin` | Trae los cambios del remoto sin tocar tu rama |
| Descargar y fusionar | `git pull origin main` | Trae la rama `main` remota y la fusiona en la tuya |
| Subir tus cambios | `git push origin <rama>` | Envía tus commits al remoto |
| Subir una rama nueva | `git push -u origin <rama>` | La primera vez: sube y vincula (después basta `git push`) |
| Actualizar si has divergido | `git pull --rebase` | Pone tus commits locales encima de los remotos |
| Forzar la subida | `git push --force-with-lease` | ⚠️ Sobrescribe la rama remota (más seguro que `git push -f`) |
| Borrar una rama remota | `git push origin --delete <rama>` | La borra en el remoto |

Más en: [5](GIT_Resumen_comandos_de_interes.md#5-crear-o-clonar-un-repositorio) · [6](GIT_Resumen_comandos_de_interes.md#6-gestión-de-remotos) · [11](GIT_Resumen_comandos_de_interes.md#11-sincronizar-con-el-remoto-y-resolver-divergencias)

## Inspección y herramientas útiles

| Acción | Comando | Explicación |
|---|---|---|
| Diferencias en el WD | `git diff` | Cambios que aún no están en staging |
| Diferencias en staging | `git diff --staged` | Lo que entrará en el próximo commit |
| Ver un commit | `git show <hash>` | Información y cambios de ese commit |
| ¿Quién cambió esta línea? | `git blame <archivo>` | Autor y commit de cada línea |
| Guardar cambios temporalmente | `git stash` | Aparta los cambios del WD y staging |
| Recuperar lo guardado | `git stash pop` | Aplica el último stash y lo quita de la lista |
| Listar stashes | `git stash list` | Todos los cambios apartados |
| Copiar un commit a esta rama | `git cherry-pick <hash>` | Aplica un commit de otra rama en la actual |
| Crear una etiqueta | `git tag -a v1.0 -m "Mensaje"` | Marca un commit importante (una versión) |
| Subir etiquetas | `git push --tags` | Envía las etiquetas al remoto (`git push` no lo hace) |

Más en: [8](GIT_Resumen_comandos_de_interes.md#8-inspeccionar-status-log-diff) · [12](GIT_Resumen_comandos_de_interes.md#12-stash-guardar-trabajo-a-medias) · [14](GIT_Resumen_comandos_de_interes.md#14-etiquetas-tags-y-versiones) · [15.3](GIT_Resumen_comandos_de_interes.md#153-cherry-pick)
