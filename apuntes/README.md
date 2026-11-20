# Apuntes de Git y GitHub · Itinerario

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left">
> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Cómo están organizados

| Documento | Para qué sirve |
|---|---|
| [Acciones habituales](GIT_acciones_habituales.md) | **Chuleta de bolsillo:** unos 50 comandos imprescindibles en cinco tablas. Para tener a mano o imprimir. |
| [Resumen de comandos](GIT_Resumen_comandos_de_interes.md) | **Teoría y referencia completa:** tablas, recetas y explicaciones ordenadas por tema. Se consulta, no se lee de corrido. |
| Ejercicios guiados (1-16) | **Práctica paso a paso:** cada uno indica qué secciones de la chuleta necesita, muestra el resultado esperado y termina con preguntas de comprobación. |
| [Ejercicio 17. Retos finales](ejercicio_17_retos_finales.md) | **Evaluación:** diez problemas reales sin pasos guiados, solo con pistas. |

Los comandos se explican en la chuleta; los ejercicios los aplican sin repetir la teoría.

## Itinerario recomendado

Los ejercicios conservan su número para no romper enlaces ya compartidos: **sigue el orden de esta tabla**, no el del número.

### Bloque I. Primeros pasos

| Orden | Tema | Teoría | Práctica |
|:---:|---|---|---|
| 1 | Markdown: escribir documentación | — | [Ejercicio 2. Reproduce un documento en Markdown](ejercicio_2_markdown_desde_pdf.md) |
| 2 | Instalar y configurar Git, conectar con GitHub por SSH | [1](GIT_Resumen_comandos_de_interes.md#1-conceptos-mínimos) · [2](GIT_Resumen_comandos_de_interes.md#2-instalación-y-configuración-inicial) · [3](GIT_Resumen_comandos_de_interes.md#3-autenticación-ssh-con-github) | [Ejercicio 10. SSH y diagnóstico HTTPS vs SSH](ejercicio_10_ssh_github_https_vs_ssh.md) |
| 3 | No perder la configuración en el aula | [3.4](GIT_Resumen_comandos_de_interes.md#34-equipos-que-se-reinician-guardar-gitconfig-y-ssh) | [Ejercicio 11. Configuración en un equipo que se reinicia](ejercicio_11_config_entorno_volatil.md) |
| 4 | Primer repositorio, ciclo diario y publicación | [5](GIT_Resumen_comandos_de_interes.md#5-crear-o-clonar-un-repositorio) · [6](GIT_Resumen_comandos_de_interes.md#6-gestión-de-remotos) · [7](GIT_Resumen_comandos_de_interes.md#7-ciclo-diario-add-commit-push-pull) | [Ejercicio 3. Publicar en GitHub Pages](ejercicio_3_github_pages.md) |

### Bloque II. Trabajo diario

| Orden | Tema | Teoría | Práctica |
|:---:|---|---|---|
| 5 | Inspeccionar y deshacer cambios | [8](GIT_Resumen_comandos_de_interes.md#8-inspeccionar-status-log-diff) · [9](GIT_Resumen_comandos_de_interes.md#9-deshacer-cambios-restore-reset-revert-amend) · [15.4](GIT_Resumen_comandos_de_interes.md#154-reflog-recuperar-commits-perdidos) | [Ejercicio 6. Deshacer cambios](ejercicio_6_deshacer_cambios.md) |
| 6 | Ciclo de vida de una rama | [10](GIT_Resumen_comandos_de_interes.md#10-ramas-y-merge) | [Ejercicio 9. Flujo básico con ramas](ejercicio_9_flujo_basico_con_ramas.md) |
| 7 | Merge frente a rebase | [10](GIT_Resumen_comandos_de_interes.md#10-ramas-y-merge) · [15.1](GIT_Resumen_comandos_de_interes.md#151-rebase) | [Ejercicio 1. Ramas, merge y rebase](ejercicio_1_git_merge_vs_rebase.md) |
| 8 | Conflictos | [10](GIT_Resumen_comandos_de_interes.md#10-ramas-y-merge) · [15.1](GIT_Resumen_comandos_de_interes.md#151-rebase) | [Ejercicio 4. Conflictos en merge](ejercicio_4_conflictos_en_merge.md) → [Ejercicio 5. Conflictos en rebase](ejercicio_5_conflictos_en_rebase.md) |
| 9 | Push rechazado y divergencias con el remoto | [11](GIT_Resumen_comandos_de_interes.md#11-sincronizar-con-el-remoto-y-resolver-divergencias) | [Ejercicio 12. Sincronizar con el remoto](ejercicio_12_sincronizar_push_rechazado.md) |
| 10 | Trabajo a medias | [12](GIT_Resumen_comandos_de_interes.md#12-stash-guardar-trabajo-a-medias) | [Ejercicio 13. Stash](ejercicio_13_stash_trabajo_a_medias.md) |
| 11 | Qué no se sube | [13](GIT_Resumen_comandos_de_interes.md#13-gitignore-y-dejar-de-rastrear-archivos) | [Ejercicio 14. .gitignore](ejercicio_14_gitignore.md) |
| 12 | Versiones | [14](GIT_Resumen_comandos_de_interes.md#14-etiquetas-tags-y-versiones) | [Ejercicio 16. Etiquetas y versiones](ejercicio_16_tags_versiones.md) |

### Bloque III. Avanzado, colaboración y copias de seguridad

| Orden | Tema | Teoría | Práctica |
|:---:|---|---|---|
| 13 | Cherry-pick y rebase interactivo | [15.2](GIT_Resumen_comandos_de_interes.md#152-rebase-interactivo) · [15.3](GIT_Resumen_comandos_de_interes.md#153-cherry-pick) | [Ejercicio 15. Cherry-pick y rebase interactivo](ejercicio_15_cherry_pick_rebase_interactivo.md) |
| 14 | GitHub desde la terminal y trabajo en equipo | [4](GIT_Resumen_comandos_de_interes.md#4-github-cli-gh) · [16](GIT_Resumen_comandos_de_interes.md#16-colaborar-en-github-fork-pull-request-y-trabajo-en-equipo) | [Ejercicio 8. GitHub CLI](ejercicio_8_github_cli.md) |
| 15 | Servidor propio de copias de seguridad | [17](GIT_Resumen_comandos_de_interes.md#17-servidor-propio-de-copias-de-seguridad-repositorio-bare) | [Ejercicio 7. Servidor de copias con --bare](ejercicio_7_servidor_backup_bare.md) |
| 16 | **Evaluación final** | [21](GIT_Resumen_comandos_de_interes.md#21-problemas-frecuentes-qué-comando-uso) | [Ejercicio 17. Retos finales](ejercicio_17_retos_finales.md) |

**Solo para consultar cuando haga falta:** [18 Git LFS](GIT_Resumen_comandos_de_interes.md#18-archivos-grandes-y-git-lfs) · [19 finales de línea CRLF/LF](GIT_Resumen_comandos_de_interes.md#19-finales-de-línea-en-windows-y-linux-crlf-y-lf) · [20 alias](GIT_Resumen_comandos_de_interes.md#20-alias)

## Qué necesita cada ejercicio

| Necesita… | Ejercicios |
|---|---|
| Solo Git en local | 1, 4, 5, 6, 7 (Parte A), 9, 12, 13, 14, 15, 16, 17 |
| Cuenta de GitHub | 3, 8, 10 |
| Disco persistente `D:` | 11 |
| Un servidor Linux con SSH | 7 (Parte B) |

## Recursos

- [recursos/ejercicio_2_documento.pdf](recursos/ejercicio_2_documento.pdf): documento de una cara para el ejercicio 2 (fuente editable: [ejercicio_2_documento.html](recursos/ejercicio_2_documento.html)).
- [recursos/ejercicio_2_solucion.md](recursos/ejercicio_2_solucion.md): solución del ejercicio 2.
- [recursos/scripts/guardar-config.sh](recursos/scripts/guardar-config.sh) y [recursos/scripts/restaurar-config.sh](recursos/scripts/restaurar-config.sh): scripts del ejercicio 11.
