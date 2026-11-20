# Ejercicio guiado 13: stash, guardar trabajo a medias

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left">
> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Objetivo

Estás a mitad de una función y te piden un **arreglo urgente** en `main`. No quieres hacer un commit con trabajo a medias, pero Git no te deja cambiar de rama. Solución: `git stash`, un "cajón" donde apartar los cambios temporalmente.

**Teoría de apoyo:** [12. Stash](GIT_Resumen_comandos_de_interes.md#12-stash-guardar-trabajo-a-medias)

---

## Parte A: preparación

```bash
mkdir practica-stash
cd practica-stash
git init -b main
echo "Versión 1" > app.txt
echo "Léeme" > LEEME.txt
git add .
git commit -m "Versión 1"

git switch -c nueva-funcion
echo "Función: paso 1" >> app.txt
git commit -am "Paso 1 de la función"
```

---

## Parte B: el problema

Sigues trabajando, **sin hacer commit**: modificas un archivo y creas otro nuevo.

```bash
echo "Función: paso 2 (a medias)" >> app.txt
echo "boceto de la pantalla" > boceto.txt
```

Llega el aviso urgente. Intentas cambiar a `main`:

```bash
git switch main
```

```text
error: Your local changes to the following files would be overwritten by checkout:
        app.txt
Please commit your changes or stash them before you switch branches.
```

Git te protege: si cambiara de rama, perderías el paso 2. Y te da la pista: *commit* o *stash*.

---

## Parte C: apartar, arreglar y recuperar

1. **Aparta el trabajo** con un nombre descriptivo. `-u` incluye también los archivos nuevos (*untracked*) como `boceto.txt`:

   ```bash
   git stash push -u -m "paso 2 a medias"
   git status                   # working tree clean
   ls                           # boceto.txt ya no está (está en el stash)
   git stash list               # stash@{0}: On nueva-funcion: paso 2 a medias
   ```

2. **Haz el arreglo urgente en `main`:**

   ```bash
   git switch main
   echo "Contacto: soporte@ejemplo.com" >> LEEME.txt
   git commit -am "Arreglo urgente: contacto"
   ```

3. **Vuelve a tu rama y recupera el trabajo:**

   ```bash
   git switch nueva-funcion
   git stash pop                # aplica el último stash y lo borra de la lista
   git status                   # modified: app.txt · untracked: boceto.txt
   cat app.txt                  # el paso 2 ha vuelto
   git stash list               # vacía
   ```

---

## Parte D: varios stashes

```bash
git stash push -m "intento A"            # aparta el paso 2 otra vez
echo "otra idea" >> app.txt
git stash push -m "intento B"
git stash list                           # stash@{0}: intento B · stash@{1}: intento A
git stash show -p stash@{1}              # qué contiene el intento A
git stash apply stash@{1}                # lo aplica y lo CONSERVA en la lista
git stash drop stash@{0}                 # descarta el intento B
git stash list
```

| | `git stash pop` | `git stash apply` |
|---|---|---|
| Aplica los cambios | Sí | Sí |
| Lo borra de la lista | Sí | No (hay que hacer `drop`) |

---

## Comprueba lo que has aprendido

1. ¿Por qué Git no te dejaba cambiar de rama en la Parte B? ¿Te habría dejado si `app.txt` fuera igual en las dos ramas?
2. ¿Qué pasa con `boceto.txt` si haces `git stash` **sin** `-u`?
3. ¿Qué diferencia hay entre `pop` y `apply`?
4. ¿Qué alternativa a `stash` tenías? ¿Qué inconveniente tiene?
