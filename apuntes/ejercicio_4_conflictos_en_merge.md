# Ejercicio Guiado 4: Resolución de Conflictos con Git Merge

Un conflicto ocurre cuando dos ramas modifican exactamente la misma línea de un archivo de manera diferente. Git no sabe con qué versión quedarse y te pide que lo resuelvas manualmente.

## Objetivo
Provocar un conflicto intencionado al intentar fusionar (merge) una rama y resolverlo editando el archivo.

---

## Parte A: Preparar el escenario del conflicto

1. **Crea un nuevo repositorio y un archivo base:**
   ```bash
   mkdir prueba-conflictos
   cd prueba-conflictos
   git init
   echo "Color favorito: Azul" > preferencias.txt
   git add preferencias.txt
   git commit -m "Commit inicial: Color azul"
   ```

2. **Crea una nueva rama y modifica la misma línea:**
   ```bash
   git switch -c rama-verde
   echo "Color favorito: Verde" > preferencias.txt
   git add preferencias.txt
   git commit -m "Cambiar color a verde"
   ```

3. **Vuelve a `main` y modifica esa misma línea de otra forma:**
   ```bash
   git switch main
   echo "Color favorito: Rojo" > preferencias.txt
   git add preferencias.txt
   git commit -m "Cambiar color a rojo"
   ```

*Ahora tienes dos historias divergentes (`main` dice Rojo, `rama-verde` dice Verde).*

---

## Parte B: Provocar y resolver el conflicto

1. **Intenta fusionar `rama-verde` en `main`:**
   ```bash
   git merge rama-verde
   ```
   *Git te mostrará un mensaje de error diciendo: `CONFLICT (content): Merge conflict in preferencias.txt`.*

2. **Abre el archivo `preferencias.txt` en tu editor de código o de texto.** Verás algo como esto:
   ```text
   <<<<<<< HEAD
   Color favorito: Rojo
   =======
   Color favorito: Verde
   >>>>>>> rama-verde
   ```

3. **Resuelve el conflicto:**
   Borra las líneas de marcadores de Git (`<<<<<<<`, `=======`, `>>>>>>>`) y deja el texto como quieres que quede en la versión final. Por ejemplo, puedes quedarte con uno, o mezclarlos:
   ```text
   Color favorito: Rojo oscuro y Verde claro
   ```

4. **Finaliza la fusión:**
   Dile a Git que el conflicto ya está resuelto añadiendo el archivo y creando el commit de fusión.
   ```bash
   git add preferencias.txt
   git commit -m "Conflicto resuelto: combinación de colores"
   ```

¡Felicidades! Has resuelto tu primer conflicto de Merge.