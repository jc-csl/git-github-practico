# Ejercicio guiado 12: sincronizar con el remoto, push rechazado y divergencias

<img src="../imagenes/logo-centro-san-luis.jpg" alt="Centro San Luis" width="200">

**curso 2026-27 · Juan Carlos San Román**

> <img src="../imagenes/semaforo-ia-verde.png" alt="Semáforo IA: nivel verde" width="28" align="left">
> **Declaración de uso de IA** · Guía de uso de la IA en el aula, Centro San Luis (nivel verde). Este material parte de los apuntes propios del profesorado (resúmenes de comandos Git y taller Git/GitHub); se ha utilizado IA para la redacción de los ejercicios, el formateo, el simulador y la comprobación de los comandos en una terminal real, con revisión y validación del profesorado.

---

## Objetivo

Simular a **dos personas** (Ana y Beto) que trabajan sobre el mismo repositorio remoto, provocar el famoso `! [rejected] … (fetch first)` y resolverlo, primero sin conflicto y después con conflicto.

No hace falta GitHub: el "remoto" será un repositorio *bare* en una carpeta (como en el [ejercicio 7](ejercicio_7_servidor_backup_bare.md)). Funciona exactamente igual.

**Teoría de apoyo:** [8. Inspeccionar](GIT_Resumen_comandos_de_interes.md#8-inspeccionar-status-log-diff) · [11. Sincronizar con el remoto](GIT_Resumen_comandos_de_interes.md#11-sincronizar-con-el-remoto-y-resolver-divergencias)

```text
             remoto.git  (hace de GitHub)
            ▲          ▲
   push/pull│          │push/pull
          ana/        beto/
```

---

## Parte A: preparación

```bash
mkdir practica-sync
cd practica-sync
git init --bare -b main remoto.git

# Ana crea el proyecto y lo sube
git clone remoto.git ana          # warning: You appear to have cloned an empty repository (normal)
cd ana
echo "Lista de la compra" > lista.txt
git add lista.txt
git commit -m "Crea la lista"
git push -u origin main
cd ..

# Beto se une al proyecto
git clone remoto.git beto
```

Abre **dos terminales**, una en `ana/` y otra en `beto/`. Así ves a cada persona por separado.

---

## Parte B: push rechazado sin conflicto

1. **Ana** añade algo y lo sube:

   ```bash
   echo "- leche" >> lista.txt
   git commit -am "Añade leche"
   git push
   ```

2. **Beto**, sin haber hecho `pull`, trabaja en **otro archivo** e intenta subir:

   ```bash
   echo "Notas de Beto" > notas.txt
   git add notas.txt
   git commit -m "Añade notas"
   git push
   ```

   ```text
    ! [rejected]        main -> main (fetch first)
   hint: Updates were rejected because the remote contains work that you do not have locally.
   ```

3. **Beto diagnostica** antes de actuar:

   ```bash
   git fetch                         # descarga sin tocar nada
   git status -sb                    # ## main...origin/main [ahead 1, behind 1]
   git log --oneline --graph --all   # se ven las dos líneas: la suya y la de Ana
   ```

   `ahead 1, behind 1`: Beto tiene 1 commit que el remoto no tiene, y el remoto tiene 1 que Beto no tiene. Las historias han **divergido**.

4. **Beto integra** lo de Ana poniendo su commit encima, y sube:

   ```bash
   git pull --rebase
   git push
   git log --oneline --graph --all   # historia lineal: Crea la lista → Añade leche → Añade notas
   ```

> **¿Y `git pull` a secas?** Depende de la configuración. Git for Windows trae `pull.rebase=false` y hace un **merge** (crea un commit de merge). En otros sistemas Git se para con `You have divergent branches` y te pide elegir: `git pull --rebase` o `git pull --no-rebase`. Para no depender de eso: `git config --global pull.rebase true`.

---

## Parte C: push rechazado con conflicto

1. **Ana** se actualiza, añade una línea al final de la lista y sube:

   ```bash
   git pull
   echo "- huevos" >> lista.txt
   git commit -am "Añade huevos"
   git push
   ```

2. **Beto** añade **otra** línea al final de la **misma** lista:

   ```bash
   echo "- pan" >> lista.txt
   git commit -am "Añade pan"
   git push                          # ! [rejected] (fetch first)
   git pull --rebase                 # CONFLICT (content): Merge conflict in lista.txt
   ```

3. **Beto resuelve.** `lista.txt` queda así:

   ```text
   Lista de la compra
   - leche
   <<<<<<< HEAD
   - huevos
   =======
   - pan
   >>>>>>> 4811098 (Añade pan)
   ```

   (Recuerda: en un rebase, `HEAD` es lo que **ya está en el remoto**, lo de Ana, y abajo va **tu** commit). Aquí lo correcto es **conservar las dos líneas**. Edita el archivo y déjalo así:

   ```text
   Lista de la compra
   - leche
   - huevos
   - pan
   ```

   ```bash
   git add lista.txt
   git rebase --continue
   git push
   ```

4. **Ana** se actualiza y comprueba que tiene todo:

   ```bash
   git pull
   cat lista.txt
   git log --oneline
   ```

---

## Parte D (opcional): las opciones drásticas

En una copia nueva del escenario (o con cuidado), prueba las dos salidas "sin término medio" de la [tabla de la sección 11](GIT_Resumen_comandos_de_interes.md#11-sincronizar-con-el-remoto-y-resolver-divergencias):

| Quiero… | Comandos |
|---|---|
| Descartar lo mío y quedarme igual que el remoto | `git fetch` → `git reset --hard origin/main` ⚠️ |
| Imponer lo mío sobre el remoto | `git push --force-with-lease` ⚠️ (borra commits de otros) |

---

## Comprueba lo que has aprendido

1. ¿Qué significa `[ahead 1, behind 1]`? ¿Y `[behind 2]`?
2. ¿Por qué conviene hacer `git fetch` + `git status -sb` **antes** de `pull`?
3. ¿Qué diferencia hay entre `git pull` y `git pull --rebase` en el historial que queda?
4. ¿Qué costumbre evita casi todos estos rechazos? (Pista: [rutina recomendada, sección 7](GIT_Resumen_comandos_de_interes.md#7-ciclo-diario-add-commit-push-pull)).
