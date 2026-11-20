# Web de ejercicios · Git y GitHub en la práctica

Módulo Cloud, IoT and Quantum Computing · CFGS ASIR · Centro San Luis. Autor: Juan Carlos San Román. Generada el 18/11/2026 a partir de "GIT. Resumen de comandos de interés" y "01. Git, GitHub. Resumen de comandos" (docx). **Versión 2** (20/11/2026): integrada en el repositorio [git-github-practico](../README.md) junto con los [apuntes en Markdown](../apuntes/README.md) y el [editor Markdown](../editor/); 4 ejercicios nuevos y simulador ampliado (`gh`, scripts de bash, `cp -r`, `~/.gitconfig`, `reiniciar-equipo`).

- Web: https://jc-csl.github.io/git-github-practico/laboratorio/ (versión anterior: https://claude.ai/artifact/9pQXpV5V6TWHRaBnp4CgwA)
- Mismo estilo que la web de Quantum Annealing/QUBO (paleta navy + cobre, índice lateral, modo presentación con P / ← → / Esc / F).
- Cabecera: solo logo Centro San Luis + semáforo verde y declaración de uso de IA (sin Txurdinaga ni Tknika). Autor único: Juan Carlos San Román.

## Formato de cada ejercicio
Situación → Tareas → Comandos → Solución desplegable (comando · `# comentario breve` · salida esperada marcada con │). Se usa `git status` / `git status -sb` / `git log --oneline` al inicio y al final. Nivel básico / medio / avanzado. Tecla **S** abre la solución en modo presentación; botón "Soluciones" abre todas.

## Laboratorio (lab.js)
Cada ejercicio tiene el botón **🧪 Practicar en el laboratorio** (y en la barra superior, **Laboratorio**): se abre a pantalla completa un ejercicio por página, con el enunciado a la izquierda y una **terminal simulada** a la derecha. Enlace directo: `index.html#lab-<id>` (por ejemplo `#lab-e-conf-pull`).
- Git simulado en el navegador (sin servidor): archivos, ramas, merge/conflictos con marcas reales, rebase e `rebase -i` (editor integrado, también `nano`), stash, tags, reflog, remotos y un GitHub simulado (`git@github.com:usuario/<repo>.git`). `help` lista lo disponible.
- **GitHub CLI simulado** (`gh help`): `auth login/status/logout/refresh`, `repo create/clone/view/list/delete`, `issue create/list/view/close`, `pr create/list/view/checkout/merge/close` (los commits con `Closes #N` cierran la incidencia al fusionar), `release create/list` y `gh api repos/{owner}/{repo}/pages` para activar GitHub Pages.
- **Aula que se reinicia**: `~/.gitconfig` es un archivo real sincronizado con `git config --global`; `cp -r`; rutas de Windows (`D:/x` = `/d/x`); `bash script.sh` y `./script.sh` (variables, `if [ -f|-d ]`, `else`, `fi`, `exit`); y `reiniciar-equipo`, que borra `~/.gitconfig`, `~/.ssh` y la sesión de `gh` conservando `/d`.
- Cada ejercicio arranca con su escenario ya preparado (repos, commits, compañeros, GitHub). **Reiniciar** vuelve al punto de partida.
- **Comprobar**: revisa el estado final (✓/✗) y lista los comandos que fallaron. **Solución**: además muestra qué comandos de la solución has usado y la solución completa.
- Las comprobaciones y escenarios están en `SPECS` dentro de `lab.js`. Tras cambiarlos: `node lab.test.js` (ejecuta una solución modelo por ejercicio y exige que todo pase; también que nada pase sin hacer nada).
- Límites: no hay tuberías (`|`) ni `git lfs migrate`; los clics en la web de GitHub no se simulan (los PR y Pages se hacen con `gh`; en `e-fork` y `e-equipo` se comprueba que la rama está subida). `node lab.test.js` comprueba además que los scripts de `e-persist` sean idénticos a `../apuntes/recursos/scripts/`. El trabajo de cada ejercicio se pierde al recargar la página.

## Unidades (50 ejercicios)
| # | Unidad | Ejercicios |
|---|---|---|
| 1 | Conceptos | 4 zonas, códigos de `status -s`, HEAD/ramas/origin/main, **simulador de zonas** (edit, add, commit, push, compañero hace push, pull, restore, amend, reset soft/mixto/hard, revert, force-with-lease, stash, reflog) |
| 2 | Repositorio local | config · init · **README.md en Markdown** · ciclo con diff · .gitignore + rm --cached · mv/rm/clean |
| 3 | Autenticación | SSH (Git Bash/Linux y PowerShell) · HTTPS con token + set-url · **configuración persistente en un aula que se reinicia** |
| 4 | Remotos | local → GitHub vacío · crear en GitHub y clonar · historias no relacionadas · servidor `--bare` (red y laboratorio local pc-ana/pc-benat) · copiar proyecto ajeno (rename origin → upstream) |
| 5 | Día a día | cambios y push · fetch vs pull · stash · tags · historial (log, blame, show) |
| 6 | Deshacer | mapa restore/reset/revert · restore · restore --staged · restore --source · amend · reset --soft y subir sin force · revert de fichero erróneo · revert de commit antiguo · reset soft/mixto · reset --hard (local y subido + force-with-lease) · reflog |
| 7 | Ramas | rama + ff · merge 3 vías · ramas remotas · borrar -d/-D + recuperar · commit en rama equivocada · cherry-pick |
| 8 | Conflictos | anatomía · entre ramas + abort · ours/theirs y -X · push rechazado + pull · pull --rebase · gana remoto / gana local |
| 9 | Rebase | visual merge/rebase/squash/cherry-pick · rebase · rebase -i squash/fixup/drop · reword + reordenar |
| 10 | Colaborar y publicar en GitHub | fork + PR + upstream · equipo con ramas y PR · **GitHub CLI (repo, issue, PR)** · **GitHub Pages** |
| 11 | Archivos grandes | push rechazado >100 MB · Git LFS · CRLF |
| 12 | Referencia | chuleta (2 diapositivas), problemas frecuentes, mapa comando → ejercicios (automático), glosario con buscador, créditos |

## Decisiones y comprobaciones
- Todos los escenarios se ejecutaron con Git 2.43 en Linux; las salidas mostradas son reales (hashes de ejemplo).
- `git config --global pull.rebase false` incluido en la configuración inicial: sin él, `git pull` con ramas divergentes falla (Git ≥ 2.33).
- Revert de commit antiguo planteado sobre un archivo distinto (`banner.js`) para que no dé conflicto; se explica el caso con conflicto.
- "Eliminar en 2 situaciones" cubierto de dos formas: reset (soft/mixto frente a --hard) y ramas (-d frente a -D).
- Corregido de los apuntes: `git switch -b` no existe (es `-c`); `--amend` con dos guiones; clave pública `.pub`; `ssh-add` con la privada.
