// Genera apuntes-datos.js: los .md del repositorio (README.md y apuntes/) dentro de un script.
// Así el editor los abre sin la ventana de archivos del navegador, también en local (file://),
// donde las páginas no pueden leer archivos pero sí cargar <script src>.
//
//   node editor/generar-apuntes.mjs              regenera apuntes-datos.js con los archivos del disco
//   node editor/generar-apuntes.mjs --comprobar  falla si apuntes-datos.js no está al día
//   node editor/generar-apuntes.mjs --vigilar    lo regenera cada vez que cambia un .md (Ctrl+C para salir)
//   node editor/generar-apuntes.mjs --indice     usa los .md tal como van en el commit (lo usa .githooks/pre-commit)
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, watch } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const editorDir = dirname(fileURLToPath(import.meta.url));
const repo = dirname(editorDir);
const salida = join(editorDir, 'apuntes-datos.js');
const args = process.argv.slice(2);

function mdDe(dir) {
  return readdirSync(dir).flatMap(n => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return mdDe(p);
    return /\.md$/i.test(n) ? [p] : [];
  });
}

// { 'README.md': '...', 'apuntes/...md': '...' } desde el disco o desde el índice de Git
function leerDocs(desdeIndice) {
  const docs = {};
  if (desdeIndice) {
    const git = (...a) => execFileSync('git', a, { cwd: repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const rutas = git('ls-files', '-z', '--', 'README.md', 'apuntes').split('\0').filter(r => /\.md$/i.test(r));
    for (const r of rutas.sort()) docs[r] = git('show', ':' + r).replace(/\r\n/g, '\n');
  } else {
    const archivos = [join(repo, 'README.md'), ...mdDe(join(repo, 'apuntes'))];
    for (const p of archivos.sort()) docs[relative(repo, p).split(sep).join('/')] = readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  }
  return docs;
}

function generarJs(docs) {
  return '// Generado por editor/generar-apuntes.mjs: no editar a mano.\n'
    + '// Tras cambiar los apuntes: node editor/generar-apuntes.mjs\n'
    + 'window.APUNTES_MD = ' + JSON.stringify(docs).replace(/</g, '\\u003c') + ';\n';
}

const actual = () => existsSync(salida) ? readFileSync(salida, 'utf8').replace(/\r\n/g, '\n') : '';

// Escribe solo si cambia; devuelve true si lo ha reescrito
function regenerar(desdeIndice) {
  const docs = leerDocs(desdeIndice);
  const js = generarJs(docs);
  if (actual() === js) return { cambiado: false, n: Object.keys(docs).length };
  writeFileSync(salida, js);
  return { cambiado: true, n: Object.keys(docs).length };
}

if (args.includes('--comprobar')) {
  const docs = leerDocs(false);
  if (actual() !== generarJs(docs)) { console.error('apuntes-datos.js no está al día: ejecuta node editor/generar-apuntes.mjs'); process.exit(1); }
  console.log(`apuntes-datos.js al día (${Object.keys(docs).length} documentos)`);
} else if (args.includes('--vigilar')) {
  const hora = () => new Date().toLocaleTimeString('es-ES');
  const r = regenerar(false);
  console.log(`[${hora()}] ${r.cambiado ? 'Regenerado' : 'Al día'}: ${r.n} documentos. Vigilando apuntes/ y README.md (Ctrl+C para salir)...`);
  let t = null;
  const avisar = (nombre) => {
    if (nombre && !/\.md$/i.test(String(nombre))) return;
    clearTimeout(t);
    t = setTimeout(() => {
      try {
        const r2 = regenerar(false);
        if (r2.cambiado) console.log(`[${hora()}] Regenerado: ${r2.n} documentos. Recarga el editor para verlo.`);
      } catch (e) { console.error(`[${hora()}] Error al regenerar: ${e.message}`); }
    }, 300);
  };
  watch(join(repo, 'apuntes'), { recursive: true }, (_ev, nombre) => avisar(nombre));
  watch(repo, (_ev, nombre) => { if (nombre === 'README.md') avisar(nombre); });
} else {
  const r = regenerar(args.includes('--indice'));
  console.log(`apuntes-datos.js: ${r.n} documentos${r.cambiado ? ' (actualizado)' : ' (sin cambios)'}`);
}
