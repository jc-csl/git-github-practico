# Web de ejercicios · Git y GitHub en la práctica

Módulo Cloud, IoT and Quantum Computing · CFGS ASIR · Centro San Luis. Autor: Juan Carlos San Román. Generada el 18/11/2026 a partir de "GIT. Resumen de comandos de interés" y "01. Git, GitHub. Resumen de comandos" (docx). **Versión 1**.

- Web: https://claude.ai/artifact/9pQXpV5V6TWHRaBnp4CgwA
- Mismo estilo que la web de Quantum Annealing/QUBO (paleta navy + cobre, índice lateral, modo presentación con P / ← → / Esc / F).
- Cabecera: solo logo Centro San Luis + semáforo verde y declaración de uso de IA (sin Txurdinaga ni Tknika). Autor único: Juan Carlos San Román.

## Formato de cada ejercicio
Situación → Tareas → Comandos → Solución desplegable (comando · `# comentario breve` · salida esperada marcada con │). Se usa `git status` / `git status -sb` / `git log --oneline` al inicio y al final. Nivel básico / medio / avanzado. Tecla **S** abre la solución en modo presentación; botón "Soluciones" abre todas.

## Laboratorio (lab.js)
Cada ejercicio tiene el botón **🧪 Practicar en el laboratorio** (y en la barra superior, **Laboratorio**): se abre a pantalla completa un ejercicio por página, con el enunciado a la izquierda y una **terminal simulada** a la derecha. Enlace directo: `index.html#lab/<id>` (por ejemplo `#lab/e-conf-pull`).
- Git simulado en el navegador (sin servidor): archivos, ramas, merge/conflictos con marcas reales, rebase e `rebase -i` (editor integrado, también `nano`), stash, tags, reflog, remotos y un GitHub simulado (`git@github.com:usuario/<repo>.git`). `help` lista lo disponible.
- Cada ejercicio arranca con su escenario ya preparado (repos, commits, compañeros, GitHub). **Reiniciar** vuelve al punto de partida.
- **Comprobar**: revisa el estado final (✓/✗) y lista los comandos que fallaron. **Solución**: además muestra qué comandos de la solución has usado y la solución completa.
- Las comprobaciones y escenarios están en `SPECS` dentro de `lab.js`. Tras cambiarlos: `node lab.test.js` (ejecuta una solución modelo por ejercicio y exige que todo pase; también que nada pase sin hacer nada).
- Límites: no hay tuberías (`|`) ni `git lfs migrate`; el Pull Request y los clics en GitHub no se simulan (se comprueba que la rama está subida). El trabajo de cada ejercicio se pierde al recargar la página.

## Unidades (46 ejercicios)
| # | Unidad | Ejercicios |
|---|---|---|
| 1 | Conceptos | 4 zonas, códigos de `status -s`, HEAD/ramas/origin/main, **simulador de zonas** (edit, add, commit, push, compañero hace push, pull, restore, amend, reset soft/mixto/hard, revert, force-with-lease, stash, reflog) |
| 2 | Repositorio local | 1 config · 2 init · 3 ciclo con diff · 4 .gitignore + rm --cached · 5 mv/rm/clean |
| 3 | Autenticación | 6 SSH (Git Bash/Linux y PowerShell) · 7 HTTPS con token + set-url |
| 4 | Remotos | 8 local → GitHub vacío · 9 crear en GitHub y clonar · 10 historias no relacionadas · 11 servidor `--bare` (red y laboratorio local pc-ana/pc-benat) · 12 copiar proyecto ajeno (rename origin → upstream) |
| 5 | Día a día | 13 cambios y push · 14 fetch vs pull · 15 stash · 16 tags · 17 historial (log, blame, show) |
| 6 | Deshacer | mapa restore/reset/revert · 18 restore · 19 restore --staged · 20 restore --source · 21 amend · 22 reset --soft y subir sin force · 23 revert de fichero erróneo · 24 revert de commit antiguo · 25 reset soft/mixto · 26 reset --hard (local y subido + force-with-lease) · 27 reflog |
| 7 | Ramas | 28 rama + ff · 29 merge 3 vías · 30 ramas remotas · 31 borrar -d/-D + recuperar · 32 commit en rama equivocada · 33 cherry-pick |
| 8 | Conflictos | anatomía · 34 entre ramas + abort · 35 ours/theirs y -X · 36 push rechazado + pull · 37 pull --rebase · 38 gana remoto / gana local |
| 9 | Rebase | visual merge/rebase/squash/cherry-pick · 39 rebase · 40 rebase -i squash/fixup/drop · 41 reword + reordenar |
| 10 | GitHub | 42 fork + PR + upstream · 43 equipo con ramas y PR |
| 11 | Archivos grandes | 44 push rechazado >100 MB · 45 Git LFS · 46 CRLF |
| 12 | Referencia | chuleta (2 diapositivas), problemas frecuentes, mapa comando → ejercicios (automático), glosario con buscador, créditos |

## Decisiones y comprobaciones
- Todos los escenarios se ejecutaron con Git 2.43 en Linux; las salidas mostradas son reales (hashes de ejemplo).
- `git config --global pull.rebase false` incluido en la configuración inicial: sin él, `git pull` con ramas divergentes falla (Git ≥ 2.33).
- Revert de commit antiguo planteado sobre un archivo distinto (`banner.js`) para que no dé conflicto; se explica el caso con conflicto.
- "Eliminar en 2 situaciones" cubierto de dos formas: reset (soft/mixto frente a --hard) y ramas (-d frente a -D).
- Corregido de los apuntes: `git switch -b` no existe (es `-c`); `--amend` con dos guiones; clave pública `.pub`; `ssh-add` con la privada.
