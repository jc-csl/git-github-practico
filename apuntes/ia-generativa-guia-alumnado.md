# Inteligencia Artificial Generativa · Guía del alumnado

**TIC · 1º Bachillerato (Ciencias Sociales)**

> La IA es una herramienta para pensar mejor, no para dejar de pensar.

Esta guía recoge todo lo que vamos a trabajar sobre IA generativa. En cada apartado encontrarás explicaciones, ejemplos y prácticas señaladas como **Práctica**. Las soluciones de algunas prácticas están al final, en el **Solucionario**. ¡Intenta hacerlas antes de mirarlo!

---

## Índice

1. [¿Cómo funciona una IA generativa?](#1-cómo-funciona-una-ia-generativa)
2. [Alucinaciones: cuando la IA se inventa cosas](#2-alucinaciones-cuando-la-ia-se-inventa-cosas)
3. [¿Qué IA uso para cada tarea?](#3-qué-ia-uso-para-cada-tarea)
4. [Ingeniería del prompt: cómo pedirle las cosas](#4-ingeniería-del-prompt-cómo-pedirle-las-cosas)
5. [Consumo y huella medioambiental](#5-consumo-y-huella-medioambiental)
6. [Sesgos](#6-sesgos)
7. [Privacidad](#7-privacidad)
8. [Ética: cómo usar la IA en clase](#8-ética-cómo-usar-la-ia-en-clase)
9. [Cómo declarar que has usado IA](#9-cómo-declarar-que-has-usado-ia)
10. [Leyes, edad y derechos de autor](#10-leyes-edad-y-derechos-de-autor)
11. [Deepfakes y desinformación](#11-deepfakes-y-desinformación)
12. [Glosario](#12-glosario)
13. [Decálogo del buen uso de la IA](#13-decálogo-del-buen-uso-de-la-ia)
14. [Solucionario](#14-solucionario)

---

## 1. ¿Cómo funciona una IA generativa?

La **IA generativa** es un tipo de inteligencia artificial que **crea contenido nuevo**: textos, imágenes, audios, vídeos o código. Le das una instrucción (un *prompt*) y ella genera un resultado.

### El autocompletado del móvil… pero gigante

¿Te has fijado en que el teclado del móvil te sugiere la siguiente palabra mientras escribes? Un chatbot como ChatGPT, Gemini o Claude funciona con una idea parecida, pero a una escala enorme.

1. **Aprende**: ha "leído" cantidades gigantescas de texto (webs, libros, artículos…) y ha aprendido qué palabras suelen ir detrás de otras y en qué contextos.
2. **Predice**: cuando le escribes, genera la respuesta **trozo a trozo**, eligiendo en cada paso la continuación más probable.
3. **Se ajusta**: después, personas reales han valorado miles de respuestas para que el modelo sea más útil y seguro.

**Ejemplo:** si escribes *"La capital de Francia es…"*, la continuación más probable es *"París"*. La IA no lo "sabe" como tú: ha visto esa frase muchísimas veces.

> **Clave:** la IA no entiende ni sabe cosas como una persona. **Genera texto que suena correcto.** Casi siempre acierta, pero cuando se equivoca lo hace con la misma seguridad.

### ¿Y las imágenes?

Los generadores de imágenes parten de una imagen llena de "ruido" (como la nieve de una tele antigua) y la van limpiando paso a paso hasta que se parece a lo que has descrito. Por eso a veces fallan en detalles: **manos con seis dedos, letras deformadas, objetos que se funden entre sí**.

### Práctica 1.1 · El juego del autocompletado

1. Abre una nota en el móvil y escribe: *"Mañana voy a"*.
2. Pulsa **siempre la sugerencia central** del teclado diez veces seguidas.
3. Compara tu frase con la de tus compañeros/as.

**Reflexiona:**
- ¿Tiene sentido la frase?
- ¿Por qué cada móvil genera frases distintas?
- ¿En qué se parece esto a un chatbot? ¿En qué se diferencia?

---

## 2. Alucinaciones: cuando la IA se inventa cosas

Una **alucinación** es cuando la IA **inventa información** y la presenta como verdadera: fechas, datos, citas, autores, libros o enlaces que no existen.

**¿Por qué pasa?** Porque la IA genera texto *probable*, no comprueba si es cierto. Si no tiene un dato, puede rellenar el hueco con algo que "suena bien".

### Ejemplos típicos

| Le pides… | Puede pasar que… |
|---|---|
| Bibliografía para un trabajo | Te dé libros con títulos y autores creíbles **que no existen**. |
| La biografía de una persona poco conocida | Mezcle datos de varias personas o invente premios y cargos. |
| Una estadística ("¿qué porcentaje de jóvenes vascos…?") | Te dé un número exacto **sin ninguna fuente real** detrás. |
| Un cálculo largo | Se equivoque en un paso y el resultado final sea erróneo. |
| Algo que ha pasado esta semana | No lo sepa (su conocimiento tiene una fecha de corte) o lo invente. |

### Reglas para no caer en la trampa

1. **Verifica** los datos importantes en fuentes fiables (webs oficiales, Eustat, INE, prensa contrastada, libros).
2. **Comprueba que existen** los libros, artículos y enlaces que te da.
3. **Pide fuentes**… y ábrelas para ver si dicen lo que la IA asegura.
4. **Desconfía de los números** demasiado exactos.
5. **Contrasta**: haz la misma pregunta a dos IAs distintas.
6. **Tú eres responsable** de lo que entregas, no la IA.

### Práctica 2.1 · Caza la alucinación

1. Pide a una IA: *"Dame 5 libros sobre la historia de Bilbao con su autor, editorial y año de publicación."*
2. Busca cada libro en Google Books, en la web de una biblioteca (por ejemplo, la Biblioteca de Bidebarrieta) o en una librería online.
3. Completa la tabla:

| Libro | ¿Existe? | ¿El autor es correcto? | ¿El año es correcto? |
|---|---|---|---|
| 1. | | | |
| 2. | | | |
| 3. | | | |
| 4. | | | |
| 5. | | | |

**Reflexiona:** ¿cuántos datos eran correctos? ¿Habrías entregado esa bibliografía sin comprobarla?

### Práctica 2.2 · La pregunta trampa

Pregunta a una IA por algo que **no existe**, como si existiera. Por ejemplo:
> *"Resúmeme la batalla de Deusto de 1734."*

¿Te dice que no tiene constancia de esa batalla o se inventa un relato? Prueba con dos IAs diferentes y compara.

---

## 3. ¿Qué IA uso para cada tarea?

> ⚠️ Las herramientas cambian muy rápido. Esta lista es de octubre de 2026.
> ⚠️ Comprueba siempre la **edad mínima** de cada herramienta (apartado 10).

| Quiero… | Herramientas | Ten en cuenta… |
|---|---|---|
| Redactar, explicar, resumir, resolver dudas | ChatGPT, Claude, Gemini, Copilot | Son parecidas. Usa la cuenta del centro si la hay. |
| Buscar información **con fuentes** | Perplexity, modos de búsqueda de los chatbots | Abre siempre los enlaces que te da. |
| Estudiar a partir de **mis apuntes** | NotebookLM | Responde usando solo los documentos que subes. |
| Traducir | DeepL, Google Translate, **Elia**, **Itzuli** | Para euskera, Elia e Itzuli suelen funcionar mejor. |
| Crear imágenes | ChatGPT, Gemini, Adobe Firefly, Canva | Firefly usa imágenes con licencia. |
| Hacer presentaciones | Gamma, Canva | Te da un borrador: revisa el contenido. |
| Crear vídeo | Sora, Veo, Runway, Kling | Clips cortos; las versiones gratis tienen límites. |
| Editar vídeo | CapCut, Descript | Subtítulos automáticos, cortes, quitar silencios. |
| Voz | ElevenLabs | ¡Nunca clones la voz de alguien sin su permiso! |
| Música | Suno, Udio | Canciones a partir de texto. |
| Pasar audio a texto | Whisper, Word, Google Docs | Útil para entrevistas o podcasts. |
| Programar | GitHub Copilot, Claude, ChatGPT | Pide también que te explique el código. |

### Práctica 3.1 · ¿Qué herramienta usarías?

Para cada situación, elige la herramienta más adecuada y explica por qué:

1. Tienes los apuntes de Economía en PDF y quieres que te haga preguntas de examen **solo sobre ese temario**.
2. Necesitas datos actuales sobre el precio de la vivienda en Bilbao y quieres ver de dónde salen.
3. Tienes que traducir al euskera un texto para la revista del instituto.
4. Has grabado una entrevista de 20 minutos para el podcast y necesitas pasarla a texto.
5. Quieres una imagen de portada para un trabajo sobre la Revolución Industrial que vas a publicar en el blog del centro.
6. No entiendes cómo funciona la oferta y la demanda y quieres que te lo expliquen con un ejemplo.
7. Tienes que preparar una presentación de 8 diapositivas en poco tiempo.
8. Quieres añadir subtítulos automáticos a un vídeo para TikTok.

*(Soluciones orientativas en el apartado 14.)*

---

## 4. Ingeniería del prompt: cómo pedirle las cosas

Un **prompt** es la instrucción que le das a la IA. La calidad de la respuesta depende muchísimo de la calidad de la pregunta. Si pides algo vago, recibirás algo vago.

### Los 6 ingredientes de un buen prompt

| Ingrediente | ¿Qué responde? | Ejemplo |
|---|---|---|
| **Rol** | ¿Quién quiero que sea? | "Actúa como profesor de Economía de Bachillerato…" |
| **Tarea** | ¿Qué quiero exactamente? | "…explícame qué es la inflación…" |
| **Contexto** | ¿Para quién y para qué? | "…tengo examen el lunes y me cuesta entenderlo…" |
| **Formato** | ¿Cómo lo quiero? | "…en 5 puntos, con un ejemplo de la vida diaria…" |
| **Ejemplo** | ¿Cómo debería quedar? | "…algo parecido a este esquema: …" |
| **Restricciones** | ¿Qué no debe hacer? | "…sin fórmulas matemáticas." |

No hace falta usar siempre los seis, pero cuantos más pongas, mejor será el resultado.

### Ejemplos: de prompt pobre a buen prompt

**Historia**

❌ **Prompt pobre:** *"Hazme un resumen de la Revolución Industrial."*

✅ **Prompt bien construido:**
> Actúa como profesor de Historia de 1º de Bachillerato. Tengo un examen la semana que viene sobre la Revolución Industrial y necesito un resumen para estudiar.
>
> Céntrate en: causas, innovaciones técnicas principales, consecuencias sociales (nacimiento del proletariado, condiciones de trabajo, urbanización) y consecuencias económicas.
>
> Formato:
> - Máximo 300 palabras.
> - Un título por apartado.
> - Al final, una tabla con 5 fechas clave y qué ocurrió.
> - Termina con 3 preguntas tipo examen para comprobar si lo he entendido.
>
> Usa un lenguaje claro. Si algún dato es discutido por los historiadores, indícalo.

**Economía**

❌ **Prompt pobre:** *"¿Qué es la inflación?"*

✅ **Prompt bien construido:**
> Explícame qué es la inflación como si se lo explicaras a alguien de 17 años que no ha estudiado economía. Usa un ejemplo con productos que compro habitualmente (un bocadillo, el abono del metro, una entrada de cine). Después explícame en 3 frases por qué afecta más a quien tiene menos dinero. No uses fórmulas.

**Inglés**

❌ **Prompt pobre:** *"Corrige mi texto."*

✅ **Prompt bien construido:**
> Soy estudiante de 1º de Bachillerato con un nivel B1 de inglés. Revisa este texto que he escrito. No lo reescribas entero: haz una lista de mis errores, explica cada uno brevemente en castellano y dime cómo se escribiría correctamente. Al final, dame 2 consejos para mejorar.
> [aquí pegas tu texto]

**Imagen**

❌ **Prompt pobre:** *"Una ciudad."*

✅ **Prompt bien construido:**
> Fotografía en blanco y negro de la ría de Bilbao a principios del siglo XX, con barcos de vapor, grúas y chimeneas de fábricas al fondo. Día nublado, ambiente industrial, encuadre desde la orilla, estilo de fotografía antigua.

### Trucos que funcionan

| Truco | Ejemplo de frase |
|---|---|
| **Itera** (el primer resultado es un borrador) | "Hazlo más corto." / "Ahora con un tono más formal." / "Añade un ejemplo." |
| **Pide que te pregunte** | "Antes de responder, hazme las preguntas que necesites para hacerlo bien." |
| **Paso a paso** | "Resuélvelo paso a paso y explica cada paso." |
| **Pide que se critique** | "¿Qué puntos débiles tiene tu respuesta?" / "Ahora defiende la postura contraria." |
| **Modo tutor** | "No me des la solución. Hazme preguntas para que llegue yo a ella." |
| **Pide que avise** | "Si no estás seguro de algún dato, dímelo." |

> **Importante:** El **modo tutor** es probablemente el uso más útil de la IA para estudiar: te obliga a pensar a ti, que es justo lo que te hace aprender.

### Práctica 4.1 · Mejora estos prompts

Reescribe cada prompt usando al menos **4 ingredientes**. Después pruébalo y compara el resultado con el del prompt original.

1. *"Háblame de la gentrificación."*
2. *"Hazme un trabajo sobre el cambio climático."*
3. *"Dame ideas para un TikTok."*
4. *"Explícame las elecciones."*
5. *"Un dibujo de un instituto."*

### Práctica 4.2 · El reto del prompt

El profesor proyectará un **resultado final** (un texto, una tabla o una imagen). Tu misión: conseguir que la IA genere algo lo más parecido posible.

- Gana quien lo consiga **en menos intentos**.
- Desempate: el prompt **más corto**.

### Práctica 4.3 · La IA como tutor

1. Elige un concepto de otra asignatura que te cueste (por ejemplo, el PIB, la división de poderes o el feudalismo).
2. Escribe a la IA:
   > *"Quiero entender qué es [concepto]. No me lo expliques directamente: hazme preguntas una a una, espera mi respuesta y corrígeme hasta que lo entienda."*
3. Mantén la conversación al menos 5 turnos.

**Reflexiona:** ¿has aprendido más así o pidiéndole directamente la explicación?

### Práctica 4.4 · Intercambio de prompts

1. Escribe un prompt **malo a propósito** en un papel.
2. Pásaselo a tu compañero/a.
3. Tu compañero/a lo mejora, lo prueba y te explica qué ingredientes ha añadido.

---

## 5. Consumo y huella medioambiental

La IA no vive "en la nube": funciona en **centros de datos**, enormes naves llenas de servidores que necesitan:

- **Electricidad** para funcionar.
- **Agua** o sistemas de refrigeración para no sobrecalentarse.

Hay dos momentos con impacto:

1. **Entrenamiento**: miles de procesadores trabajando sin parar durante semanas o meses. Muy intensivo, pero se hace una vez por modelo.
2. **Uso**: cada pregunta que haces. Una sola consume poco, pero se multiplica por **miles de millones de consultas cada día**.

### Algunas cifras para hacerse una idea

- Una consulta de texto a un chatbot consume aproximadamente **0,2–0,35 Wh**. Es más o menos lo que gasta una bombilla LED de 10 W encendida **1 o 2 minutos**.
- **Generar imágenes y, sobre todo, vídeos consume bastante más** que el texto.
- Se calcula que en 2026 los centros de datos del mundo consumirán unos **565 TWh** de electricidad, y casi un tercio será por servidores de IA.

> **Importante:** Una consulta suelta no es un problema. El problema es el uso masivo e innecesario. La pregunta no es "¿uso la IA o no?", sino **"¿me aporta algo usarla aquí?"**.

### Cómo usar la IA de forma más sostenible

- No la uses para lo que resuelve un buscador, una calculadora o el diccionario.
- Escribe buenos prompts para no tener que repetir diez veces.
- No generes imágenes o vídeos en bucle "por jugar".
- Para tareas sencillas, usa modelos rápidos o ligeros.

### Práctica 5.1 · Echa cuentas

Se estima que uno de los chatbots más usados recibe unos **2.500 millones de consultas al día**. Supón que cada una consume **0,3 Wh**.

1. ¿Cuántos **kWh** se consumen al día solo en consultas? *(Recuerda: 1 kWh = 1.000 Wh.)*
2. Un hogar medio en España consume unos **9 kWh al día**. ¿A cuántos hogares equivale ese consumo diario?
3. Si en tu clase sois 25 y cada uno hace 20 consultas al día, ¿cuántos Wh consume la clase? ¿Es mucho o poco comparado con el resultado anterior? ¿Qué conclusión sacas?

*(Soluciones en el apartado 14.)*

### Práctica 5.2 · ¿Merece la pena usar IA?

Decide si en cada caso **tiene sentido** usar IA o hay una opción mejor:

1. Saber cuánto es 15 % de 240.
2. Que te expliquen un concepto de Filosofía que no entiendes.
3. Saber a qué hora cierra la biblioteca municipal.
4. Generar 40 versiones de una imagen hasta que te guste una.
5. Preparar preguntas de repaso a partir de tus apuntes.
6. Buscar el significado de una palabra.

---

## 6. Sesgos

Un **sesgo** es una tendencia injusta o desequilibrada en las respuestas de la IA. La IA aprende de datos creados por personas, y esos datos reflejan **los prejuicios y desigualdades de la sociedad**. La IA no es neutral: es un espejo de los datos con los que aprendió.

### Tipos de sesgo y ejemplos

| Tipo | Ejemplo |
|---|---|
| **Género** | Pides "un médico" y aparece un hombre; pides "una persona que limpia" y aparece una mujer. |
| **Origen** | Imágenes estereotipadas de ciertos países: todo pobreza, todo desierto, todo folclore. |
| **Idioma y cultura** | Funciona mejor en inglés que en euskera. Conoce mejor Nueva York que Bilbao. |
| **Edad y físico** | Las personas que genera suelen ser jóvenes, delgadas y sin discapacidad. |
| **Confirmación** | Si preguntas *"¿Verdad que el móvil es malo para los jóvenes?"*, tenderá a darte la razón. |

### Pregunta sesgada vs. pregunta neutra

| ❌ Sesgada | ✅ Neutra |
|---|---|
| "¿Por qué el turismo es malo para Bilbao?" | "¿Qué efectos positivos y negativos tiene el turismo en Bilbao?" |
| "Dame argumentos de que las redes sociales son malas." | "¿Qué dicen los estudios sobre los efectos de las redes sociales en los jóvenes? Incluye resultados en distintos sentidos." |
| "¿Verdad que la IA va a quitar trabajos?" | "¿Qué escenarios se plantean sobre el efecto de la IA en el empleo?" |

### Práctica 6.1 · Detectives de sesgos (imágenes)

Pide a un generador de imágenes estas descripciones y anota lo que aparece:

| Prompt | Género | Edad | Origen aparente | Otros detalles |
|---|---|---|---|---|
| "Un médico" | | | | |
| "Una persona dirigiendo una empresa" | | | | |
| "Una persona limpiando" | | | | |
| "Una familia típica" | | | | |
| "Un científico" | | | | |
| "Una persona de Euskadi" | | | | |

**Reflexiona:** ¿quién aparece?, ¿quién no aparece nunca?, ¿por qué crees que ocurre?

### Práctica 6.2 · Sesgos en el texto

Pide a una IA: *"Escribe una historia de 5 líneas sobre una persona que es piloto de avión y otra que trabaja de enfermería."*

- ¿Qué género les ha asignado?
- Repite la petición 3 veces. ¿Cambia algo?
- Ahora reescribe el prompt para evitar el estereotipo.

---

## 7. Privacidad

> **Regla de oro:** lo que escribes o subes a una IA puede guardarse y, según la herramienta, usarse para entrenar futuros modelos. **No compartas nada que no publicarías en internet.**

### Nunca compartas

- Datos personales: nombre completo, DNI, dirección, teléfono, contraseñas.
- Fotos de otras personas sin su permiso (compañeros/as, profesorado, familia).
- Información sobre salud, problemas familiares o temas íntimos.
- Documentos privados de otras personas o del instituto.

### Buenas prácticas

- Revisa la configuración de privacidad y desactiva el uso de tus conversaciones para entrenamiento si la herramienta lo permite.
- Usa la cuenta educativa del centro cuando la haya.
- Borra conversaciones con información sensible.
- Desconfía de apps de IA desconocidas que piden muchos permisos.
- Cuidado con las "IA de amistad o pareja": recogen muchísima información personal y emocional sobre ti.

### Práctica 7.1 · ¿Lo compartirías?

Decide si es seguro compartirlo con una IA: 🟢 sí, 🟡 con cuidado o 🔴 no.

1. Un texto tuyo sobre la Guerra Civil para que te corrija la ortografía.
2. Una foto del grupo de clase para que la IA la convierta en dibujo animado.
3. Tu horario de clases para que te ayude a organizar el estudio.
4. Un pantallazo de una conversación de WhatsApp con una amiga para que te diga qué responder.
5. Tu currículum con dirección y teléfono para que lo mejore.
6. Una pregunta general sobre cómo gestionar la ansiedad antes de un examen.
7. La contraseña de tu Instagram para que te diga si es segura.
8. Tus apuntes de Historia para que te haga preguntas de repaso.

*(Soluciones en el apartado 14.)*

### Práctica 7.2 · Revisa tus ajustes

Entra en la configuración de la IA que más uses y busca:
- ¿Se usan tus conversaciones para entrenar el modelo? ¿Se puede desactivar?
- ¿Se puede borrar el historial?
- ¿Qué edad mínima piden las condiciones de uso?

---

## 8. Ética: cómo usar la IA en clase

### Nuestros principios

1. **Transparencia**: si usas IA, lo dices.
2. **Aprender es el objetivo**: la IA te puede ayudar a entender, practicar y mejorar, pero no debe hacer el trabajo por ti. **Si la IA lo hace todo, tú no aprendes nada.**
3. **Responsabilidad**: eres responsable de todo lo que entregas, incluidos los errores de la IA.
4. **Respeto**: nunca uses la IA para crear contenido que ridiculice, acose o suplante a otras personas.
5. **Pensamiento crítico**: usa siempre la IA con cabeza y cuestiona lo que responde.

### 🚦 El semáforo de la IA

En cada tarea te indicaremos qué nivel de uso está permitido:

| Nivel | Qué significa | Ejemplos |
|---|---|---|
| 🔴 **Sin IA** | La tarea evalúa lo que sabes y puedes hacer tú. | Exámenes, redacciones de opinión personal. |
| 🟡 **IA de apoyo** | Puedes usarla para ideas, dudas o revisar, pero el producto final es tuyo. | Buscar ideas para un trabajo, entender un concepto, revisar la ortografía. |
| 🟢 **IA integrada** | Usar la IA forma parte de la tarea. | Proyecto de creación de contenido, prácticas de prompts. |

### ✅ Bien · ❌ Mal

| ✅ Buen uso | ❌ Mal uso |
|---|---|
| Que te explique algo que no entiendes. | Copiar y pegar la respuesta como si fuera tuya. |
| Que te haga preguntas para repasar. | Pedirle que haga los deberes enteros. |
| Que revise tu texto y te diga qué mejorar. | Entregar algo sin haberlo leído ni comprobado. |
| Lluvia de ideas para empezar. | Usarla en tareas marcadas en 🔴. |
| Practicar idiomas conversando. | Crear imágenes o audios falsos de personas reales. |

### Práctica 8.1 · ¿Qué opinas?

Lee cada caso y decide si el uso es correcto, incorrecto o depende. Justifica tu respuesta y compárala en grupo.

1. **Ane** tiene un trabajo 🟡 de Economía. Pide a la IA un índice, lo modifica, redacta ella todo el texto y lo declara al final.
2. **Iker** pide a la IA un comentario de texto de Historia, cambia algunas palabras para que "no se note" y lo entrega sin declararlo.
3. **Lucía** usa la IA para preparar preguntas de repaso antes de un examen 🔴.
4. **Mikel** genera con IA un audio con la voz de un profesor diciendo algo ridículo y lo comparte en el grupo de clase "de broma".
5. **Sara** usa un traductor con IA para entender un artículo en inglés que necesita para su trabajo.
6. **Jon** pide a la IA que le escriba una carta de disculpa para una amiga con la que ha discutido y se la envía tal cual.

---

## 9. Cómo declarar que has usado IA

### ¿Por qué declararlo?

- Por **honestidad**: igual que citas un libro o una web.
- Para que el profesorado pueda **valorar tu trabajo real**.
- Porque en la universidad y en el trabajo cada vez se exige más.

### Qué tienes que indicar

1. **Qué herramienta** has usado.
2. **Para qué** la has usado.
3. **Los prompts principales** (en trabajos importantes).
4. **Qué has hecho tú** con el resultado.

### Plantilla

```
DECLARACIÓN DE USO DE IA

Herramienta(s):
Fecha de uso:

Uso realizado:
-

Prompts principales:
-

Trabajo propio:
-
```

### Ejemplo de buena declaración ✅

```
DECLARACIÓN DE USO DE IA

Herramienta(s): ChatGPT y Canva (generador de imágenes)
Fecha de uso: 15/11/2026

Uso realizado:
- He usado ChatGPT para generar ideas para el índice del trabajo.
- He usado Canva para crear la imagen de portada.

Prompts principales:
- "Dame 5 ideas de apartados para un trabajo sobre la gentrificación en Bilbao"

Trabajo propio:
- He elegido 3 de las ideas y he añadido 2 apartados propios.
- Toda la redacción es mía.
- He comprobado los datos en Eustat y en prensa local.
```

### Ejemplo de mala declaración ❌

```
He usado IA un poco.
```

¿Por qué es mala? No dice qué herramienta, para qué ni qué ha hecho la persona. No sirve para nada.

### Si no has usado IA

Basta con escribir: *"En este trabajo no se ha utilizado inteligencia artificial."*

### Si copias una frase literal de la IA

Ponla entre comillas e indícalo:
> Según ChatGPT (consulta realizada el 15/11/2026), "…".

⚠️ Recuerda: la IA **no es una fuente fiable por sí misma**. Los datos se citan de su fuente original (Eustat, un libro, un periódico…).

### Práctica 9.1 · Escribe tu declaración

Escribe la declaración de uso para este caso:

> Has hecho un podcast sobre el turismo en Bilbao. Usaste Claude para que te ayudara a ordenar las preguntas de la entrevista, Whisper para transcribir el audio y Suno para crear una música de fondo de 10 segundos. El guion y la entrevista son tuyos, y los datos los sacaste del Ayuntamiento y de Eustat.

---

## 10. Leyes, edad y derechos de autor

### ¿Tengo edad para usar esta IA?

Cada herramienta pone sus condiciones: algunas exigen **18 años** y otras permiten usarla desde **13 años con permiso** de tu madre, padre o tutor. **Antes de registrarte, lee las condiciones de uso.**

### La ley europea de la IA

La Unión Europea tiene la primera ley completa sobre IA del mundo (el **AI Act**):

- Clasifica los usos de la IA según su **nivel de riesgo**.
- **Prohíbe** algunos usos, como manipular a las personas o puntuarlas socialmente.
- Obliga a **avisar** cuando un contenido (por ejemplo, un deepfake) está hecho con IA.
- Considera **de alto riesgo** usos como los sistemas que evalúan al alumnado.

### ¿De quién es lo que genera la IA?

- Lo que crea **solo** la IA, en general, no tiene un autor humano, y es dudoso que esté protegido por derechos de autor.
- Las IAs se han entrenado con obras de artistas, escritores y músicos que, muchas veces, no dieron permiso. Hay juicios abiertos sobre esto.
- No pidas a la IA que copie canciones, personajes o ilustraciones protegidas para publicarlas.
- Si vas a publicar en TikTok, YouTube o en un podcast, revisa las condiciones de la herramienta.

### Práctica 10.1 · Debate rápido

> *Una ilustradora descubre que una IA genera imágenes "a su estilo" porque se entrenó con sus dibujos sin pedirle permiso.*

¿Debería cobrar algo? ¿Debería poder prohibirlo? ¿Es distinto de un artista humano que se inspira en otro? Preparad argumentos a favor y en contra.

---

## 11. Deepfakes y desinformación

Un **deepfake** es un vídeo, imagen o audio **falso pero muy realista**, creado con IA, en el que una persona parece decir o hacer algo que nunca hizo.

### Riesgos

- **Desinformación**: vídeos falsos de políticos, noticias inventadas.
- **Estafas**: audios que imitan la voz de un familiar ("Ama, se me ha roto el móvil, hazme un Bizum a este número").
- **Acoso**: montajes de compañeros/as. Crear o difundir imágenes íntimas falsas de otra persona **es delito**.

### Cómo detectarlos

| Fíjate en… | Señales de alarma |
|---|---|
| Manos y dientes | Dedos de más o deformes, dientes "fundidos". |
| Ojos y parpadeo | Mirada fija, parpadeo raro o inexistente. |
| Luces y sombras | Sombras que no cuadran con la luz. |
| Texto en la imagen | Letras deformes o palabras sin sentido. |
| Voz | Tono plano, sin respiraciones, ritmo extraño. |
| La fuente | ¿Quién lo publica? ¿Lo cuentan medios fiables? |

**Herramientas:** la búsqueda inversa de imágenes (Google Lens) te ayuda a ver si una foto ya existía o de dónde sale.

> **Ante la duda, no lo compartas.** Si te llega un audio o una llamada sospechosa de un familiar pidiendo dinero, **cuelga y llama tú** a su número de siempre. Una buena idea es acordar una **palabra clave familiar** para emergencias.

### Práctica 11.1 · ¿Real o IA?

El profesor mostrará una galería de imágenes y audios. Para cada uno:
1. Decide si es real o generado con IA.
2. Indica **qué detalle** te ha hecho decidirlo.
3. Al final, comprobad las respuestas. ¿Cuántos has acertado?

### Práctica 11.2 · ¿Qué harías?

> Te llega un audio de WhatsApp de un número desconocido. Es la voz de tu hermano, que dice que está en un apuro, que ha perdido la cartera y que le hagas un Bizum de 150 € urgentemente.

Escribe, paso a paso, qué harías.

---

## 12. Glosario

| Término | Significado |
|---|---|
| **IA generativa** | IA que crea contenido nuevo: texto, imagen, audio, vídeo o código. |
| **Prompt** | La instrucción que le das a la IA. |
| **LLM** | *Large Language Model*: modelo de lenguaje grande, el "motor" de los chatbots. |
| **Token** | Trozo de texto (una palabra o parte de ella) con el que trabaja la IA. |
| **Alucinación** | Información inventada por la IA y presentada como cierta. |
| **Sesgo** | Tendencia injusta o desequilibrada en las respuestas. |
| **Datos de entrenamiento** | Toda la información con la que ha aprendido la IA. |
| **Fecha de corte** | Hasta cuándo llegan los datos de la IA. |
| **Multimodal** | IA que entiende o genera varios formatos (texto, imagen, audio…). |
| **Deepfake** | Contenido falso y realista creado con IA. |
| **Centro de datos** | Instalación con miles de servidores donde funciona la IA. |
| **AI Act** | Ley europea que regula la inteligencia artificial. |

---

## 13. Decálogo del buen uso de la IA

1. **Piensa tú primero**, y después usa la IA.
2. **Verifica** todo dato importante en una fuente fiable.
3. **Pide bien**: rol, tarea, contexto y formato.
4. **Itera**: el primer resultado es solo un borrador.
5. **Úsala como tutor**, no como "hacedeberes".
6. **Protege tu privacidad** y la de los demás.
7. **Ten en cuenta los sesgos**: la IA no es neutral.
8. **Úsala cuando aporte**: también contamina.
9. **Declara siempre** su uso.
10. **Nunca la uses para hacer daño** a nadie.

---

## 14. Solucionario

### Práctica 3.1 · ¿Qué herramienta usarías?
1. **NotebookLM**: trabaja solo con los documentos que subes.
2. **Perplexity** o el modo búsqueda de un chatbot: dan enlaces a las fuentes (¡ábrelos!).
3. **Elia** o **Itzuli**: especializados en euskera. Revisa el resultado igualmente.
4. **Whisper** o la función de transcripción de Word / Google Docs.
5. **Adobe Firefly** o Canva: imágenes con menos problemas de derechos para publicar. Declara su uso.
6. Cualquier **chatbot** (ChatGPT, Claude, Gemini, Copilot), mejor aún en **modo tutor**.
7. **Gamma** o **Canva**, revisando después el contenido.
8. **CapCut** o **Descript**.

### Práctica 5.1 · Echa cuentas
1. 2.500.000.000 × 0,3 Wh = 750.000.000 Wh = **750.000 kWh al día**.
2. 750.000 ÷ 9 ≈ **83.000 hogares**: el consumo diario de una ciudad mediana.
3. 25 × 20 × 0,3 = **150 Wh**, como una bombilla LED de 10 W encendida unas 15 horas. **Conclusión:** el uso individual es pequeño; el impacto viene de la suma de millones de usuarios.

### Práctica 7.1 · ¿Lo compartirías?
1. 🟢 Sí, es un texto tuyo sin datos personales.
2. 🔴 No, son fotos de otras personas sin su permiso.
3. 🟢 Sí, no contiene datos sensibles.
4. 🔴 No, son mensajes privados de otra persona.
5. 🟡 Con cuidado: **quita antes** la dirección y el teléfono.
6. 🟡 Con cuidado: puedes preguntar de forma general, sin dar detalles personales. Si la ansiedad te preocupa de verdad, habla con una persona de confianza o con el departamento de orientación.
7. 🔴 ¡Nunca! Las contraseñas no se comparten con nadie.
8. 🟢 Sí, es un uso excelente.
