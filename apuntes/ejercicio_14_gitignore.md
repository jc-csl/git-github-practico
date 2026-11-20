# Ejercicio guiado 14: .gitignore y dejar de rastrear archivos

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left">
> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Objetivo

Evitar que lleguen al repositorio archivos que **no deben subirse**: contraseñas (`.env`), registros (`*.log`), temporales… y arreglarlo cuando un archivo ya estaba rastreado.

**Teoría de apoyo:** [13. .gitignore y dejar de rastrear archivos](GIT_Resumen_comandos_de_interes.md#13-gitignore-y-dejar-de-rastrear-archivos)

🧪 **Laboratorio** (terminal simulada en el navegador, con *Comprobar* y solución): [.gitignore y rm --cached](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-ignore)

---

## Parte A: un proyecto con archivos "peligrosos"

```bash
mkdir practica-ignore
cd practica-ignore
git init -b main

echo 'print("hola")' > app.py              # código: SÍ se sube
echo "CLAVE_API=1234-secreta" > .env       # credenciales: NUNCA
echo "error" > debug.log                   # registro: no
mkdir tmp logs
echo "cache" > tmp/cache.txt               # temporal: no
echo "log de hoy" > logs/hoy.log           # registro: no…
touch logs/.gitkeep                        # …pero queremos conservar la carpeta logs/

git status -uall                           # -uall: muestra cada archivo, no solo las carpetas
```

Todos aparecen como *untracked*. Un `git add .` ahora subiría tu clave secreta.

---

## Parte B: crear el .gitignore

```bash
cat > .gitignore <<'EOF'
# Credenciales
.env
# Registros y temporales
*.log
/tmp
/logs/*
!logs/.gitkeep
EOF

git status -uall
```

Ahora solo aparecen `.gitignore`, `app.py` y `logs/.gitkeep`.

| Línea | Qué ignora |
|---|---|
| `# …` | Comentario |
| `.env` | Ese archivo, esté donde esté |
| `*.log` | Cualquier archivo que termine en `.log` |
| `/tmp` | La carpeta `tmp` de la **raíz** |
| `/logs/*` | Todo lo que hay dentro de `logs/` |
| `!logs/.gitkeep` | Excepción: ese archivo **sí** se rastrea (Git no guarda carpetas vacías) |

**Comprueba qué regla ignora cada archivo:**

```bash
git check-ignore -v debug.log logs/hoy.log
```

```text
.gitignore:4:*.log      debug.log
.gitignore:6:/logs/*    logs/hoy.log
```

```bash
git status --ignored -s       # los ignorados aparecen con !!
git add .
git commit -m "Proyecto con .gitignore"
git ls-files                  # lo que realmente está en el repo: .gitignore, app.py, logs/.gitkeep
```

---

## Parte C: el .gitignore llega tarde

El `.gitignore` solo afecta a archivos **no rastreados**. Si un archivo ya está en el repositorio, añadirlo después al `.gitignore` **no sirve de nada**.

```bash
echo "modo=local" > config.local
git add config.local
git commit -m "Añade config local"          # ¡ups! no debía subirse

echo "config.local" >> .gitignore
echo "modo=otro" > config.local
git status -s                               # M config.local  ← Git lo sigue vigilando
```

**Solución:** sacarlo del índice con `git rm --cached` (lo borra del repositorio, **no** del disco):

```bash
git rm --cached config.local
git commit -am "Deja de rastrear config.local"
echo "modo=3" > config.local
git status -s                               # nada: ahora sí está ignorado
ls config.local                             # y sigue en tu disco
```

> ⚠️ Si lo que se subió era una **contraseña o token**, `git rm --cached` no basta: sigue en el historial (y en GitHub). Lo primero es **revocar/cambiar la credencial** y después limpiar el historial (`git filter-repo`).

---

## Reto

1. Crea un archivo `notas_personales.txt` y una carpeta `build/` con un archivo dentro. Añade las reglas necesarias y compruébalas con `git check-ignore -v`.
2. GitHub ofrece plantillas de `.gitignore` por lenguaje: <https://github.com/github/gitignore>. Busca la de **Python** y localiza en ella tres reglas que entiendas.

---

## Comprueba lo que has aprendido

1. ¿Qué diferencia hay entre `/tmp` y `tmp/` en un `.gitignore`?
2. ¿Por qué hace falta `logs/.gitkeep`?
3. ¿Qué hace `git rm --cached` y en qué se diferencia de `git rm`?
4. Has subido tu `.env` con una clave a GitHub. Ordena los pasos que debes dar.

<details>
<summary><b>Soluciones</b></summary>

1. `/tmp` ignora solo la carpeta `tmp` de la **raíz**; `tmp/` ignora cualquier carpeta llamada `tmp`, en cualquier nivel.
2. Git no guarda carpetas vacías. `.gitkeep` es un archivo para que `logs/` exista en el repo, mientras `/logs/*` ignora todo lo demás que contenga.
3. `git rm --cached` deja de rastrear el archivo (lo quita del índice) pero lo **conserva en disco**; `git rm` lo borra también del disco.
4. 1) Revocar o cambiar la clave **inmediatamente**. 2) Añadir `.env` al `.gitignore`, `git rm --cached .env`, commit y push. 3) Limpiar el historial (`git filter-repo`) y forzar el push. 4) Avisar al equipo para que vuelva a clonar.

</details>
