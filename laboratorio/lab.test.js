// Autocomprobación del laboratorio: node lab.test.js
// Para cada ejercicio: prepara el escenario, ejecuta una solución modelo y exige que pasen todas las comprobaciones.
const {Env,SPECS,SCRIPT_GUARDAR,SCRIPT_RESTAURAR,README_TIENDA}=require('./lab.js');
const ed=f=>({ed:f});                      // respuesta al editor (nano, commit, rebase -i)
const put=(p,c)=>({put:[p,c]});            // escribir un archivo "a mano"
const S={
'e-config':['git --version','git config --list','git config --global user.name "Ana Pérez"','git config --global user.email "ana@ejemplo.com"','git config --global init.defaultBranch main','git config --global core.editor "nano"','git config --global pull.rebase false','git config --list --show-origin'],
'e-init':['mkdir -p ~/practicas-git/web-tienda && cd ~/practicas-git/web-tienda','git init','git status','echo "<h1>Tienda</h1>" > index.html','echo "body{font-family:sans-serif}" > estilos.css','git status -s','git add index.html','git status -s','git add .','git commit -m "Primera versión de la web"','git log --oneline','git status'],
'e-ciclo':["sed -i 's/Tienda/Tienda online/' index.html",'echo "body{background:#fafafa}" >> estilos.css','git diff index.html','git add index.html','git diff --staged','git diff HEAD --stat','git commit -m "Cambia el título"','git commit -am "Fondo gris claro"','git log --oneline','git show --stat HEAD'],
'e-ignore':[{here:['cat > .gitignore <<EOF','logs/\n.env\n*.log\n']},'git status -s','git add .gitignore && git commit -m "Añade .gitignore"','echo "nueva traza" >> debug.log','git status -s','git rm --cached debug.log','git commit -m "Deja de rastrear debug.log"','git status -s','ls debug.log','git check-ignore -v debug.log','git status --ignored -s'],
'e-mvrm':['git mv estilos.css style.css','git status -s','git rm antiguo.html','git commit -m "Renombra CSS y elimina página antigua"','echo "idea" > borrador1.txt; echo "idea" > borrador2.txt','git clean -n','git clean -fd','git status'],
'e-ssh':['ssh-keygen -t ed25519 -C "tu_email@ejemplo.com"','ls -l ~/.ssh/','eval "$(ssh-agent -s)"','ssh-add ~/.ssh/id_ed25519','cat ~/.ssh/id_ed25519.pub','ssh -T git@github.com'],
'e-https':['git clone https://github.com/usuario/web-tienda.git','cd web-tienda','git push','git config --global credential.helper store','git remote -v','git remote set-url origin git@github.com:usuario/web-tienda.git','git remote -v','git push'],
'e-subir':['git remote -v','git log --oneline','git remote add origin git@github.com:usuario/web-tienda.git','git branch -M main','git push -u origin main','git status -sb','git branch -vv'],
'e-clone':['git clone git@github.com:usuario/apuntes-asir.git','cd apuntes-asir','git remote -v','echo "# Tema 1: redes" > tema1.md','git add tema1.md','git commit -m "Añade tema 1"','git status -sb','git push','git status -sb'],
'e-unrelated':['git remote add origin git@github.com:usuario/proyecto.git','git push -u origin main','git pull origin main','git pull origin main --allow-unrelated-histories --no-edit','git log --oneline --graph','git push -u origin main','git status -sb'],
'e-bare':['mkdir -p ~/practicas-git/equipo && cd ~/practicas-git/equipo','git init --bare servidor/proyecto.git','git clone servidor/proyecto.git pc-ana','git clone servidor/proyecto.git pc-benat','cd pc-ana','git config user.name "Ana"','git config user.email "ana@ejemplo.com"','printf "Lista de la compra\\n- pan\\n" > lista.txt','git add . && git commit -m "Lista inicial"','git push -u origin main','git status -sb','cd ../pc-benat','git config user.name "Beñat" && git config user.email "benat@ejemplo.com"','git pull','git log --oneline'],
'e-copiar':['git clone https://github.com/robertovormittag/phonetic-website.git','cd phonetic-website','git branch','git branch -m master main','git remote -v','git remote rename origin upstream','git remote add origin git@github.com:usuario/phonetic-website.git','git push -u origin main','git remote -v'],
'e-subircambios':['git status -sb && git log --oneline','printf -- "- leche\\n- huevos\\n" >> lista.txt','echo "Comprar el sábado" > notas.txt','git add lista.txt && git commit -m "Añade leche y huevos"','git add notas.txt && git commit -m "Añade notas"','git status -sb','git log --oneline origin/main..main','git push','git status -sb'],
'e-actualizar':['git status -sb','git fetch','git status -sb','git log --oneline main..origin/main','git diff main origin/main --stat','git pull','git log --oneline -3'],
'e-stash':['git status -s','git pull','git stash push -u -m "cabecera a medias"','git status -s','git stash list','git pull','git stash pop','git status -s','git stash list'],
'e-tags':['git tag -a v1.0 -m "Versión entregada al cliente"','git log --oneline','git tag -a v0.9 HEAD~2 -m "Demo"','git tag','git show v1.0 --stat','git push origin --tags','git tag -a v1.1 -m "Por error"','git push origin v1.1','git tag -d v1.1','git push origin --delete v1.1','git switch --detach v0.9','git switch main'],
'e-historial':['git log --oneline --graph --all -5','git log --oneline -- precios.html','git log -p -1 -- precios.html','git blame precios.html','git show HEAD~1','git diff HEAD~4 HEAD~2 -- precios.html','git diff HEAD~1 HEAD -- precios.html','git log --author="Beñat" --oneline'],
'e-restore':['git status -s','git diff app.py','git restore app.py','git status -s'],
'e-unstage':['git add .','git status -s','git diff --staged --stat','git restore --staged config.local','git status -s','git commit -m "Añade menú de usuario"','git status -s'],
'e-source':['git log --oneline -- estilos.css','git restore --source=HEAD~3 estilos.css','git status -s','git diff --stat','git add estilos.css',"git commit -m \"Recupera estilos.css de 'Ajusta márgenes'\"",'git log --oneline -2'],
'e-amend':['git log --oneline -2','git add login.css','git commit --amend --no-edit','git commit --amend -m "Añade login"','git log --oneline -2','git show --stat HEAD'],
'e-undolocal':['git status -sb && git log --oneline -3','git reset --soft HEAD~1','git status -sb','nano app.py',ed(t=>t.replace('pritn','print')),'git add app.py','git commit -m "C3: login"','git push','git log --oneline -3'],
'e-revertfile':['git log --oneline -3','git show --stat --oneline HEAD','git revert HEAD',ed(t=>t),'git log --oneline -3','git push','git status -sb'],
'e-revertold':['git log --oneline','git log --oneline -- banner.js','git revert --no-edit HEAD~3','git log --oneline -2','git push'],
'e-resetsoft':['git log --oneline','git reset --soft HEAD~2','git status -s','git commit -m "Tema 4"','git log --oneline -2','git add prueba.md && git commit -m "Prueba"','git reset HEAD~1','git status -s','git log --oneline -1'],
'e-resethard':['git log --oneline -3','git reset --hard HEAD~2','git log --oneline -1 && ls','git status -sb','cd ../solo','git log --oneline -2','git reset --hard HEAD~1','git status -sb','git push --force-with-lease','git status -sb'],
'e-reflog':['git log --oneline -2','git reflog','git reset --hard HEAD@{1}','git log --oneline -3'],
'e-rama-ff':['git branch','git switch -c tema5','echo "# Tema 5" > tema5.md && git add . && git commit -m "Tema 5"','git log --oneline --graph --all -3','git switch main','ls tema5.md','git merge tema5','git branch -d tema5','git log --oneline -2'],
'e-rama-merge':['git switch -c indice','echo "1. Redes  2. Sistemas" > indice.md && git add . && git commit -m "Índice"','git switch main','echo "# Tema 6" > tema6.md && git add . && git commit -m "Tema 6"','git log --oneline --graph --all','git merge indice','git log --oneline --graph -4','git branch -d indice'],
'e-rama-remota':['git switch -c login','echo "form" > login.html && git add . && git commit -m "Login"','git push -u origin login','cd ../pc-benat','git fetch','git branch -a','git switch login','git branch -vv','cd ../pc-ana','git switch main && git merge login && git push','git push origin --delete login','git branch -d login','cd ../pc-benat','git switch main','git fetch --prune','git branch -vv','git pull && git branch -d login'],
'e-borrar-ramas':['git branch','git branch --merged','git branch --no-merged','git branch -d tema5','git branch -d borrador','git branch -D borrador','git reflog',env=>`git branch borrador ${env.A.mark.borr}`,'git log --oneline -1 borrador'],
'e-rama-equivocada':['git status -sb && git log --oneline -2','git branch footer','git reset --hard HEAD~1','git log --oneline --graph --all -3','git switch footer'],
'e-cherry':['git log --oneline desarrollo -3','git switch main','git cherry-pick desarrollo~1','git log --oneline --graph --all -4'],
'e-conf-ramas':['git switch -c color','echo "color: azul" > estilo.txt && git add . && git commit -m "Azul"','git switch main','echo "color: rojo" > estilo.txt && git add . && git commit -m "Rojo"','git merge color','git status -s','git merge --abort','git status -s','git merge color','cat estilo.txt','echo "color: morado" > estilo.txt','git add estilo.txt','git commit --no-edit','git log --oneline --graph -4'],
'e-conf-version':['git merge color','git checkout --theirs estilo.txt','cat estilo.txt','git add estilo.txt && git commit --no-edit','git merge -X ours --no-edit verde','cat estilo.txt'],
'e-conf-pull':["sed -i 's/- pan/- pan integral/' lista.txt && git commit -am \"Ana: pan integral\" && git push",'cd ../pc-benat',"sed -i 's/- pan/- pan de molde/' lista.txt && git commit -am \"Beñat: pan de molde\"",'git push','git fetch','git status -sb','git log --oneline --graph --all','git pull','git status','nano lista.txt',ed(()=> 'Lista de la compra\n- pan integral\n- pan de molde\n'),'git add lista.txt','git commit -m "Fusiona listas de Ana y Beñat"','git push','git log --oneline --graph'],
'e-conf-rebase':['git status -sb','git pull --rebase','cat lista.txt','nano lista.txt',ed(()=> 'Lista de la compra\n- pan\n- leche\n- huevos\n'),'git add lista.txt','git rebase --continue',ed(t=>t),'git push','git log --oneline --graph -3'],
'e-conf-ganar':['cd ~/practicas-git/equipo/pc-benat','git fetch origin','git status -sb','git reset --hard origin/main','git status -sb','git clean -fd',
  'cd ~/practicas-git/solo','git fetch && git log --oneline main..origin/main','git push --force-with-lease',
  'cd ~/practicas-git/equipo/pc-ana','git fetch','git stash && git merge -X ours origin/main --no-edit && git stash pop'],
'e-rebase':['git log --oneline --graph --all','git switch contacto','git rebase main','git log --oneline --graph --all','git switch main','git merge contacto','git branch -d contacto','git log --oneline'],
'e-rebase-i':['git status -sb && git log --oneline -5','git rebase -i HEAD~4',ed(t=>{ const L=t.split('\n'); L[1]=L[1].replace(/^pick/,'squash'); L[2]=L[2].replace(/^pick/,'fixup'); L[3]=L[3].replace(/^pick/,'drop'); return L.join('\n'); }),ed(()=> 'FAQ completa\n'),'git log --oneline -3','git status -sb','git push'],
'e-rebase-i2':['git log --oneline -3','git rebase -i HEAD~3',ed(t=>{ const L=t.split('\n'); return [L[2],L[1].replace(/^pick/,'reword'),L[0],...L.slice(3)].join('\n'); }),ed(()=> 'Añade tabla de tarifas\n'),'git log --oneline -3'],
'e-fork':['git clone git@github.com:TU_USUARIO/apuntes-redes.git','cd apuntes-redes','git switch -c corrige-mascara','nano tema3.md',ed(t=>t.replace('255.255.255.0','255.255.255.192')),'git add tema3.md && git commit -m "Corrige máscara /26 en el ejemplo"','git push -u origin corrige-mascara','git remote add upstream https://github.com/profe/apuntes-redes.git','git remote -v','git switch main','git fetch upstream','git merge upstream/main','git push origin main'],
'e-equipo':['git clone git@github.com:supervisor/web-instituto.git && cd web-instituto','git switch main && git pull','git switch -c ana/pagina-ciclos','echo "<h2>Ciclos</h2>" > ciclos.html','git add . && git commit -m "Añade página de ciclos formativos"','git push -u origin ana/pagina-ciclos'],
'e-readme':['git status -s','nano README.md',ed(()=>README_TIENDA),'git add README.md','git commit -m "Añade README con la documentación del proyecto"','git status -s','git log --oneline'],
'e-persist':['ls','cat ~/.gitconfig','bash guardar-config.sh','ls -a /d/git_backup /d/git_backup/.ssh','reiniciar-equipo','git config --global user.name','ssh -T git@github.com','cd /d/git-scripts','bash restaurar-config.sh','git config --global user.name','ssh -T git@github.com'],
'e-gh':['gh auth status','gh auth login','gh auth status','gh repo create practica-gh --private --source=. --remote=origin --push','git remote -v','gh issue create --title "Añadir sección de autoría" --body "El README debe indicar quién ha hecho la práctica."','gh issue list','git switch -c autoria','echo "Autor: Alumno" >> README.md','git commit -am "Añade autoría. Closes #1"','git push -u origin autoria','gh pr create --fill','gh pr list','gh pr merge 2 --merge --delete-branch','git pull','git log --oneline --graph','gh issue list --state closed'],
'e-pages':['cd mi-web-markdown','git init','git add .','git commit -m "Primera versión de la web"','gh repo create mi-web-markdown --public --source=. --remote=origin --push','gh api repos/{owner}/{repo}/pages -X POST -f "source[branch]=main" -f "source[path]=/"','gh api repos/{owner}/{repo}/pages','echo "Última actualización: noviembre" >> README.md','git commit -am "Actualiza README"','git push','gh repo view --web'],
'e-grande':['git push','git rm --cached docs/demo.mp4','echo "*.mp4" >> .gitignore && git add .gitignore','git commit --amend --no-edit','git show --stat HEAD','git push','git status -sb'],
'e-lfs':['git lfs install','git lfs track "*.iso"','git lfs track "modelos/*.bin"','cat .gitattributes','git add .gitattributes','git commit -m "Configura Git LFS"','git add debian.iso','git commit -m "Añade imagen Debian"','git lfs ls-files','git push'],
'e-crlf':['file scripts/backup.sh',"sed -i 's/\\r$//' scripts/*.sh",'file scripts/backup.sh','echo "*.sh text eol=lf" >> .gitattributes','git add .gitattributes scripts/ && git commit -m "Fuerza LF en scripts"','git config --global core.autocrlf input']
};
let bad=0;
{ const fs=require('fs'), path=require('path'), dir=path.join(__dirname,'..','apuntes','recursos','scripts');
  for(const [f,c] of [['guardar-config.sh',SCRIPT_GUARDAR],['restaurar-config.sh',SCRIPT_RESTAURAR]]){ const p=path.join(dir,f);
    if(!fs.existsSync(p)) continue; if(fs.readFileSync(p,'utf8')!==c){ bad++; console.log(`✗ ${f}: el script del laboratorio no coincide con apuntes/recursos/scripts/${f}`); } else console.log(`✓ ${f} = apuntes/recursos/scripts/${f}`); } }
for(const id of Object.keys(SPECS)){ const env=Env(), err=env.setup(SPECS[id]); const log=[];
  if(err){ console.log(`✗ ${id}: preparación → ${err.message}`); bad++; continue; }
  const dump=()=>env.takeOut().forEach(o=>log.push(o.s));
  for(const step of S[id]||[]){
    if(step.ed){ if(!env.E.edit){ log.push('!! se esperaba el editor\n'); break; } env.saveEdit(step.ed(env.E.edit.text)); }
    else if(step.here){ log.push('$ '+step.here[0]+'\n'); env.run(step.here[0],step.here[1]); }
    else { const c=typeof step==='function'?step(env):step; log.push('$ '+c+'\n'); env.run(c); }
    dump(); }
  const fails=SPECS[id].checks.filter(([t,fn])=>{ try{ return !fn(env.A); }catch(e){ return true; } }).map(c=>c[0]);
  const unexpected=env.E.hist.filter(h=>!h.ok).map(h=>h.cmd);
  if(fails.length||!S[id]){ bad++; console.log(`✗ ${id}: ${S[id]?fails.join(' | '):'sin solución modelo'}\n  errores: ${unexpected.join(' | ')}`); if(process.argv.includes('-v')) console.log(log.join('')); }
  else console.log(`✓ ${id}${unexpected.length?'   (errores esperados: '+unexpected.join(' | ')+')':''}`); }
// check negativo: sin hacer nada, ningún ejercicio debe salir "todo correcto"
for(const id of Object.keys(SPECS)){ const env=Env(); env.setup(SPECS[id]); if(SPECS[id].checks.every(([,fn])=>{ try{ return fn(env.A); }catch(e){ return false; } })){ bad++; console.log(`✗ ${id}: aprueba sin hacer nada`); } }
// errores: donde Git real responde "fatal:", el simulador también (en un repo con un solo commit)
for(const cmds of [['rm -rf .git','git status'],['git reset --hard HEAD~5'],['git reset --hard a.txt'],['git switch noexiste']]){
  const env=Env(); env.setup(SPECS['e-init']);
  for(const c of ['mkdir neg && cd neg','git init','echo a > a.txt','git add .','git commit -m uno',...cmds]){ env.takeOut(); env.run(c); }
  const out=env.takeOut().map(o=>o.s).join('');
  if(out.startsWith('fatal:')) console.log(`✓ error: ${cmds.join(' ; ')}`); else { bad++; console.log(`✗ se esperaba fatal: ${cmds.join(' ; ')} → ${out.trim()||'(sin salida)'}`); } }
// el editor lee los apuntes de editor/apuntes-datos.js: debe estar al día con los .md
{ const r=require('child_process').spawnSync(process.execPath,[require('path').join(__dirname,'..','editor','generar-apuntes.mjs'),'--comprobar'],{encoding:'utf8'});
  if(r.status){ bad++; console.log('✗ '+(r.stderr||r.stdout).trim()); } else console.log('✓ '+r.stdout.trim()); }
console.log(bad?`\n${bad} fallo(s)`:'\nTodo OK'); process.exit(bad?1:0);
