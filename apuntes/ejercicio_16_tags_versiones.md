# Ejercicio guiado 16: etiquetas (tags) y versiones

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left">
> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Objetivo

Marcar con una **etiqueta** los commits que son versiones entregables (`v1.0`, `v1.1`…), volver a ellas para consultarlas y subirlas al remoto. Es lo que se hace al entregar un proyecto o publicar una versión de un programa.

**Teoría de apoyo:** [14. Etiquetas (tags) y versiones](GIT_Resumen_comandos_de_interes.md#14-etiquetas-tags-y-versiones)

🧪 **Laboratorio** (terminal simulada en el navegador, con *Comprobar* y solución): [Etiquetar versiones](https://jc-csl.github.io/git-github-practico/laboratorio/#lab-e-tags)

---

## Parte A: crear etiquetas

```bash
mkdir practica-tags
cd practica-tags
git init --bare -b main remoto.git          # remoto de práctica
git init -b main proyecto
cd proyecto

echo "Calculadora v1: suma" > app.txt
git add .
git commit -m "Suma"
git tag -a v1.0 -m "Primera versión entregable"     # etiqueta ANOTADA (recomendada)

echo "resta" >> app.txt
git commit -am "Resta"
echo "multiplica" >> app.txt
git commit -am "Multiplica"
git tag v1.1                                         # etiqueta LIGERA
```

| | Anotada (`-a`) | Ligera |
|---|---|---|
| Guarda autor, fecha y mensaje | Sí | No (solo un nombre que apunta a un commit) |
| Uso | Versiones oficiales | Marcas personales o temporales |

---

## Parte B: consultar etiquetas y versiones

```bash
git tag                               # v1.0  v1.1
git log --oneline --decorate
```

```text
e42ddce (HEAD -> main, tag: v1.1) Multiplica
e2bd0f4 Resta
ed9c589 (tag: v1.0) Suma
```

```bash
git show v1.0                         # autor, fecha y mensaje de la etiqueta + el commit
```

**Volver a una versión para consultarla:**

```bash
git switch --detach v1.0              # HEAD is now at ed9c589 Suma
cat app.txt                           # solo "suma"
git switch main                       # vuelta al presente
```

> En *detached HEAD* estás "de visita" en el pasado: no estás en ninguna rama. Si quisieras arreglar algo de esa versión, crearías una rama: `git switch -c arreglo-v1.0 v1.0`.

**Etiquetar un commit antiguo** que se te olvidó marcar:

```bash
git tag -a v1.0.1 HEAD~1 -m "Versión con resta"
git log --oneline --decorate
```

---

## Parte C: subir y borrar etiquetas

`git push` **no** sube las etiquetas: hay que pedirlo.

```bash
git remote add origin ../remoto.git
git push -u origin main
git ls-remote --tags origin           # vacío: aún no hay etiquetas en el remoto

git push origin v1.0                  # sube una
git push origin --tags                # sube todas
git ls-remote --tags origin
```

> Las líneas que acaban en `^{}` corresponden a las etiquetas **anotadas**: indican el commit al que apuntan.

**Borrar una etiqueta** (en local y en el remoto):

```bash
git tag -d v1.0.1
git push origin --delete v1.0.1
```

---

## Parte D (opcional): versiones en GitHub (*Releases*)

En una repo de GitHub, una etiqueta puede convertirse en una **Release**, con notas y archivos descargables. Con GitHub CLI ([ejercicio 8](ejercicio_8_github_cli.md)):

```bash
gh release create v1.0 --title "Versión 1.0" --notes "Primera versión entregable"
gh release list
```

---

## Comprueba lo que has aprendido

1. ¿Qué diferencia hay entre una etiqueta anotada y una ligera?
2. ¿Por qué tras `git push` tus compañeros no ven tus etiquetas?
3. ¿Qué significa estar en *detached HEAD*? ¿Cómo sales?
4. ¿Qué diferencia hay entre una etiqueta y una rama? (Pista: ¿cuál se mueve al hacer commits?)

<details>
<summary><b>Soluciones</b></summary>

1. La **anotada** es un objeto propio con autor, fecha y mensaje (para versiones oficiales). La **ligera** es solo un nombre que apunta a un commit.
2. Porque `git push` no envía etiquetas: hay que subirlas con `git push origin v1.0` o `git push origin --tags`.
3. Que `HEAD` apunta a un commit, no a una rama: lo que confirmes ahí no pertenece a ninguna rama. Se sale con `git switch main` (o creando una rama con `git switch -c`).
4. La **rama** avanza con cada commit nuevo; la **etiqueta** se queda fija en su commit para siempre.

</details>
