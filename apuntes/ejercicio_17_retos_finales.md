# Ejercicio 17: retos finales, "¿qué comando uso?"

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left"> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Cómo funciona

Ya no hay pasos guiados. Cada reto tiene:

- **Prepara:** comandos que crean el problema. Cópialos tal cual en una carpeta vacía.
- **Objetivo:** cómo debe quedar el repositorio.
- **Pista:** la sección de la chuleta donde está la solución. Mírala solo si te atascas.

Comprueba siempre el resultado con `git status`, `git log --oneline --graph --all` y `ls`.

**Teoría de apoyo:** [21. Problemas frecuentes](GIT_Resumen_comandos_de_interes.md#21-problemas-frecuentes-qué-comando-uso)

🧪 **Laboratorio:** casi todos los retos tienen un ejercicio parecido en el laboratorio; el enlace está junto a cada pista. Intenta primero resolverlos en tu terminal.

Base común para todos los retos (ejecútala antes de cada uno, en una carpeta nueva):

```bash
git init -b main
echo "Inicio" > a.txt && git add . && git commit -m "Inicio"
```

---

## Reto 1: mensaje equivocado

**Prepara:**

```bash
echo "contenido" > b.txt && git add . && git commit -m "asdfgh"
```

**Objetivo:** el último commit se llama `Añade b.txt`, y no hay ningún commit más.
**Pista:** [9. Deshacer cambios](GIT_Resumen_comandos_de_interes.md#9-deshacer-cambios-restore-reset-revert-amend) · 🧪 [Corregir el último commit](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-amend)

<details>
<summary><b>Solución</b></summary>

```bash
git commit --amend -m "Añade b.txt"
git log --oneline            # sigue habiendo 2 commits
```

</details>

## Reto 2: archivo olvidado

**Prepara:**

```bash
echo "web" > index.html && echo "estilos" > estilos.css
git add index.html && git commit -m "Añade la web"
```

**Objetivo:** `estilos.css` está dentro del commit "Añade la web" (comprueba con `git show --stat HEAD`), sin crear un commit nuevo.
**Pista:** [21. Problemas frecuentes](GIT_Resumen_comandos_de_interes.md#21-problemas-frecuentes-qué-comando-uso) · 🧪 [Corregir el último commit](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-amend)

<details>
<summary><b>Solución</b></summary>

```bash
git add estilos.css
git commit --amend --no-edit
git show --stat HEAD         # index.html y estilos.css en el mismo commit
```

</details>

## Reto 3: rama equivocada

**Prepara:**

```bash
git branch desarrollo
echo "nueva función" > funcion.txt && git add . && git commit -m "Añade función"
```

**Objetivo:** el commit "Añade función" está en `desarrollo` y **no** en `main`.
**Pista:** [15.3 Cherry-pick](GIT_Resumen_comandos_de_interes.md#153-cherry-pick) · 🧪 [Commit en la rama equivocada](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-rama-equivocada)

<details>
<summary><b>Solución</b></summary>

```bash
git switch desarrollo
git cherry-pick main         # copia el último commit de main
git switch main
git reset --hard HEAD~1      # ⚠️ solo porque no estaba subido
git log --oneline --graph --all
```

</details>

## Reto 4: la rama borrada

**Prepara:**

```bash
git switch -c idea
echo "idea genial" > idea.txt && git add . && git commit -m "Idea genial"
git switch main
git branch -D idea
```

**Objetivo:** vuelve a existir la rama `idea` con su commit "Idea genial".
**Pista:** [15.4 Reflog](GIT_Resumen_comandos_de_interes.md#154-reflog-recuperar-commits-perdidos) · 🧪 [Eliminar ramas: -d y -D](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-borrar-ramas)

<details>
<summary><b>Solución</b></summary>

```bash
git reflog                   # busca "commit: Idea genial"
git branch idea <hash>       # o: git branch idea HEAD@{1}
git log --oneline idea
```

</details>

## Reto 5: la contraseña rastreada

**Prepara:**

```bash
echo "PASSWORD=1234" > .env && git add . && git commit -m "Configuración"
```

**Objetivo:** `.env` sigue en tu disco, Git ya no lo rastrea (`git ls-files` no lo muestra) y aunque lo modifiques no aparece en `git status`. Responde además: ¿qué más habría que hacer si este commit ya estuviera en GitHub?
**Pista:** [13. .gitignore](GIT_Resumen_comandos_de_interes.md#13-gitignore-y-dejar-de-rastrear-archivos) · 🧪 [.gitignore y rm --cached](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-ignore)

<details>
<summary><b>Solución</b></summary>

```bash
echo ".env" >> .gitignore
git rm --cached .env
git add .gitignore
git commit -m "Deja de rastrear .env"
git ls-files                 # .env ya no aparece
# Si ya estaba en GitHub: cambiar la contraseña YA, limpiar el historial
# (git filter-repo) y forzar el push. El commit antiguo sigue conteniéndola.
```

</details>

## Reto 6: el merge que se complica

**Prepara:**

```bash
git switch -c otra
echo "versión otra" > a.txt && git commit -am "Cambio en otra"
git switch main
echo "versión main" > a.txt && git commit -am "Cambio en main"
git merge otra
```

**Objetivo:** sin resolver nada, deja el repositorio exactamente como estaba antes del `merge`.
**Pista:** [10. Ramas y merge](GIT_Resumen_comandos_de_interes.md#10-ramas-y-merge) · 🧪 [Conflicto entre dos ramas](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-conf-ramas)

<details>
<summary><b>Solución</b></summary>

```bash
git merge --abort
git status                   # limpio, como antes del merge
cat a.txt                    # versión main
```

</details>

## Reto 7: deshacer algo ya compartido

**Prepara:**

```bash
echo "precio: 10" > tienda.txt && git add . && git commit -m "Añade precio"
echo "descuento: 90%" >> tienda.txt && git commit -am "Añade descuento"
echo "envío: gratis" >> tienda.txt && git commit -am "Añade envío"
```

Imagina que todo esto ya está en GitHub y tus compañeros lo tienen.
**Objetivo:** `tienda.txt` ya no tiene la línea del descuento, **sin borrar ningún commit** del historial.
**Pista:** [9. Deshacer cambios](GIT_Resumen_comandos_de_interes.md#9-deshacer-cambios-restore-reset-revert-amend) (¡puede haber conflicto!) · 🧪 [Revertir un commit antiguo](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-revertold)

<details>
<summary><b>Solución</b></summary>

```bash
git log --oneline            # hash de "Añade descuento"
git revert <hash>            # CONFLICT: la línea de envío va justo detrás
# editar tienda.txt: dejar "precio: 10" y "envío: gratis", sin marcadores
git add tienda.txt
git revert --continue
git log --oneline            # 5 commits: no se ha borrado ninguno
```

</details>

## Reto 8: la rama se llama master

**Prepara:** en una carpeta nueva, **sin** la base común:

```bash
git init -b master
echo "x" > x.txt && git add . && git commit -m "Inicio"
```

**Objetivo:** la rama se llama `main` y conserva el commit.
**Pista:** [10. Ramas y merge](GIT_Resumen_comandos_de_interes.md#10-ramas-y-merge) · 🧪 [Copiar un proyecto ajeno](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-copiar)

<details>
<summary><b>Solución</b></summary>

```bash
git branch -m master main
git branch                   # * main
```

</details>

## Reto 9: el detective

**Prepara:**

```bash
printf "línea 1\nlínea 2\nlínea 3\n" > informe.txt && git add . && git commit -m "Informe"
sed -i 's/línea 2/línea 2 MAL/' informe.txt && git commit -am "Revisión del informe"
echo "línea 4" >> informe.txt && git commit -am "Amplía el informe"
```

**Objetivo:** averigua con un comando **qué commit** introdujo "MAL" en la línea 2.
**Pista:** [8. Inspeccionar](GIT_Resumen_comandos_de_interes.md#8-inspeccionar-status-log-diff) · 🧪 [Consultar el historial](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-historial)

<details>
<summary><b>Solución</b></summary>

```bash
git blame informe.txt        # la línea 2 indica el commit "Revisión del informe"
# alternativas: git log -p informe.txt · git log -S "MAL" --oneline
```

</details>

## Reto 10: el remoto en HTTPS

**Prepara:**

```bash
git remote add origin https://github.com/usuario/proyecto.git
```

**Objetivo:** `git remote -v` muestra la URL SSH equivalente, sin borrar ni volver a crear el remoto.
**Pista:** [ejercicio 10](ejercicio_10_ssh_github_https_vs_ssh.md) · 🧪 [HTTPS con token y set-url](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-https)

<details>
<summary><b>Solución</b></summary>

```bash
git remote set-url origin git@github.com:usuario/proyecto.git
git remote -v
```

</details>

---

## Autoevaluación

| Reto | Comando clave que has usado | ¿Reescribe la historia? |
|:---:|---|:---:|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |
| 6 | | |
| 7 | | |
| 8 | | |
| 9 | | |
| 10 | | |
