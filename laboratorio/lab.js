/* Laboratorio de Git: una terminal simulada por ejercicio, sin servidor.
   Motor: sistema de archivos en memoria + Git simplificado (cada commit guarda una instantánea completa).
   Cada ejercicio (SPECS) define: nota de partida, preparación (comandos reales del simulador) y
   comprobaciones sobre el estado final. GitHub se simula con repos bare en /.github/<usuario>/<repo>.git */
(function(){
"use strict";
const HOME='/home/alumno', PRACT=HOME+'/practicas-git', GH='/.github';
class Fail extends Error{}
const die=m=>{ throw new Fail(m); };
const dirname=p=>p.replace(/\/[^/]*$/,'')||'/', basename=p=>p.replace(/\/+$/,'').replace(/.*\//,'');
function resolve(cwd,p){ if(p==='~'||p.startsWith('~/')) p=HOME+p.slice(1); const out=[];
  for(const s of (p.startsWith('/')?p:cwd+'/'+p).split('/')){ if(!s||s==='.') continue; if(s==='..') out.pop(); else out.push(s); }
  return '/'+out.join('/'); }
const first=m=>(m||'').split('\n')[0];
const lines=s=>s==null||s===''?[]:s.replace(/\n$/,'').split('\n');
const same=(a,b)=>{ const ka=Object.keys(a), kb=Object.keys(b); return ka.length===kb.length&&ka.every(k=>a[k]===b[k]); };
const union=(...os)=>[...new Set(os.flatMap(o=>Object.keys(o||{})))].sort();
const globRe=g=>new RegExp('^'+g.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*\*/g,'\0').replace(/\*/g,'[^/]*').replace(/\?/g,'[^/]').replace(/\0/g,'.*')+'$');
const plural=(n,w)=>`${n} ${w}${n===1?'':'s'}`;
const cleanMsg=m=>(m||'').split('\n').filter(l=>!l.startsWith('#')).join('\n').replace(/\s+$/,'').replace(/^\n+/,'');

/* ── diff de líneas (LCS) y fusión a 3 bandas ── */
function lcsOps(a,b){ const n=a.length,m=b.length, dp=Array.from({length:n+1},()=>new Int32Array(m+1));
  for(let i=n-1;i>=0;i--) for(let j=m-1;j>=0;j--) dp[i][j]=a[i]===b[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
  const o=[]; let i=0,j=0;
  while(i<n&&j<m){ if(a[i]===b[j]){ o.push([' ',a[i]]); i++; j++; } else if(dp[i+1][j]>=dp[i][j+1]) o.push(['-',a[i++]]); else o.push(['+',b[j++]]); }
  while(i<n) o.push(['-',a[i++]]); while(j<m) o.push(['+',b[j++]]); return o; }
function hunks(base,x){ const H=[]; let bi=0, cur=null;
  for(const [k,l] of lcsOps(base,x)){
    if(k===' '){ if(cur){ H.push(cur); cur=null; } bi++; }
    else { if(!cur) cur={s:bi,e:bi,add:[]}; if(k==='-'){ bi++; cur.e=bi; } else cur.add.push(l); } }
  if(cur) H.push(cur); return H; }
// Cambios que se tocan o solapan = conflicto (como Git). X: 'ours' | 'theirs' resuelve los conflictos.
function merge3(base,ours,theirs,lab,X){
  if(ours===theirs) return {text:ours};
  if(base===ours) return {text:theirs};
  if(base===theirs) return {text:ours};
  if(ours==null||theirs==null){ if(X==='ours') return {text:ours}; if(X==='theirs') return {text:theirs}; return {text:ours??theirs,conflict:true}; }
  const B=lines(base);
  const all=[...hunks(B,lines(ours)).map(h=>({...h,w:'a'})),...hunks(B,lines(theirs)).map(h=>({...h,w:'t'}))].sort((x,y)=>x.s-y.s||x.e-y.e);
  const groups=[]; for(const h of all){ const g=groups[groups.length-1]; if(g&&h.s<=g.e){ g.e=Math.max(g.e,h.e); g.hs.push(h); } else groups.push({s:h.s,e:h.e,hs:[h]}); }
  const side=(g,w)=>{ const r=[]; let i=g.s; for(const h of g.hs.filter(h=>h.w===w)){ r.push(...B.slice(i,h.s),...h.add); i=h.e; } r.push(...B.slice(i,g.e)); return r; };
  const out=[]; let bi=0, conflict=false;
  for(const g of groups){ out.push(...B.slice(bi,g.s)); bi=g.e;
    const ws=new Set(g.hs.map(h=>h.w));
    if(ws.size===1){ out.push(...side(g,[...ws][0])); continue; }
    const a=side(g,'a'), t=side(g,'t');
    if(a.join('\n')===t.join('\n')||X==='ours') out.push(...a);
    else if(X==='theirs') out.push(...t);
    else { conflict=true; out.push('<<<<<<< '+lab[0],...a,'=======',...t,'>>>>>>> '+lab[1]); } }
  out.push(...B.slice(bi));
  return {text:out.length?out.join('\n')+'\n':'',conflict}; }

/* ── tokenizador de la shell ── */
function tokenize(line){ const T=[]; let i=0, cur=null; const push=()=>{ if(cur){ T.push(cur); cur=null; } };
  while(i<line.length){ const ch=line[i];
    if(ch===' '||ch==='\t'){ push(); i++; continue; }
    const two=line.substr(i,2);
    if(['&&','||','>>','<<'].includes(two)){ push(); T.push({op:two}); i+=2; continue; }
    if(';|><'.includes(ch)){ push(); T.push({op:ch}); i++; continue; }
    if(ch==='#'&&!cur) break;
    cur=cur||{v:'',q:false};
    if(ch==='"'){ i++; while(i<line.length&&line[i]!=='"'){ if(line[i]==='\\'&&'"\\$`'.includes(line[i+1])) i++; cur.v+=line[i++]; } i++; cur.q=true; continue; }
    if(ch==="'"){ i++; while(i<line.length&&line[i]!=="'") cur.v+=line[i++]; i++; cur.q=true; continue; }
    if(ch==='\\'&&i+1<line.length){ cur.v+=line[i+1]; i+=2; continue; }
    cur.v+=ch; i++; }
  push(); return T; }
const textOf=toks=>toks.filter(t=>!t.op).map(t=>t.q?`"${t.v}"`:t.v).join(' ');
const shapeOf=toks=>toks.filter(t=>!t.op).map(t=>t.q?'"…"':t.v.replace(/^[0-9a-f]{7,40}$/,'<h>').replace(/^HEAD@\{\d+\}$/,'<h>')).join(' ');
// "a && b; c" → [{cmd, shape}] (para comparar con la solución)
function splitCmds(line){ const T=tokenize(line), out=[]; let cur=[];
  const flush=()=>{ if(cur.length) out.push({cmd:textOf(cur),shape:shapeOf(cur)}); cur=[]; };
  for(const t of T){ if(t.op==='&&'||t.op==='||'||t.op===';') flush(); else cur.push(t); } flush(); return out; }

/* ════════════════════════ entorno: FS + Git ════════════════════════ */
function Env(){
const E={files:{},dirs:new Set(['/','/home',HOME]),cwd:HOME,repos:{},C:{},cfg:{},t:0,hist:[],out:[],agent:[],agentOn:false,cred:false,mark:{},quiet:false,edit:null,stdin:null,clearReq:false};
let cap=null;
const put=(s,c)=>{ if(cap!==null){ cap+=s; return; } if(!E.quiet) E.out.push({s,c}); };
const say=(s,c)=>{ if(s!=null&&s!=='') put(s.endsWith('\n')?s:s+'\n',c); };
const hint=s=>say(s,'m');

/* ── archivos ── */
const isDir=p=>E.dirs.has(p), isFile=p=>p in E.files;
function mkdirp(p){ while(p!=='/'&&!E.dirs.has(p)){ E.dirs.add(p); p=dirname(p); } }
function write(p,c){ mkdirp(dirname(p)); E.files[p]=c; }
function rmPath(p){ delete E.files[p]; if(isDir(p)){ for(const f of Object.keys(E.files)) if(f.startsWith(p+'/')) delete E.files[f]; for(const d of [...E.dirs]) if(d===p||d.startsWith(p+'/')) E.dirs.delete(d); } }
function children(dir){ const s=new Set(), pre=dir==='/'?'/':dir+'/';
  for(const f of [...Object.keys(E.files),...E.dirs]) if(f!==dir&&f.startsWith(pre)) s.add(f.slice(pre.length).split('/')[0]);
  return [...s].sort(); }
const abs=p=>resolve(E.cwd,p);

/* ── repositorios ── */
function newRepo(root,bare,branch){ const R={root,bare,head:branch,detached:null,heads:{},tags:{},rrefs:{},remotes:{},upstream:{},cfg:{},index:{},conf:{},op:null,reflog:[],stash:[]};
  E.repos[root]=R; mkdirp(root); const gd=bare?root:root+'/.git';
  ['HEAD','config','description'].forEach(f=>E.files[gd+'/'+f]=''); ['hooks','info','objects','refs'].forEach(d=>mkdirp(gd+'/'+d)); return R; }
function findRepo(p=E.cwd){ for(let d=p;;d=dirname(d)){ if(E.repos[d]) return E.repos[d]; if(d==='/') return null; } }
function needRepo(){ const R=findRepo(); if(!R) die('fatal: not a git repository (or any of the parent directories): .git'); return R; }
function needWT(){ const R=needRepo(); if(R.bare) die('fatal: this operation must be run in a work tree'); return R; }
function relTo(R,a){ if(a===R.root) return ''; if(a.startsWith(R.root+'/')) return a.slice(R.root.length+1); return null; }
function relArg(R,s){ const r=relTo(R,abs(s)); if(r==null) die(`fatal: ${s}: '${s}' is outside repository at '${R.root}'`); return r; }
function wt(R){ const o={}, pre=R.root+'/'; for(const f in E.files) if(f.startsWith(pre)){ const r=f.slice(pre.length); if(r==='.git'||r.startsWith('.git/')) continue; o[r]=E.files[f]; } return o; }
const wfile=(R,p,c)=>write(R.root+'/'+p,c);
function rfile(R,p){ const a=R.root+'/'+p; delete E.files[a]; for(let d=dirname(a); d.startsWith(R.root+'/')&&!children(d).length; d=dirname(d)) E.dirs.delete(d); }
const headHash=R=>R.head?R.heads[R.head]||null:R.detached;
const tree=h=>h?E.C[h].tree:{};
const getCfg=(R,k)=>{ k=k.toLowerCase(); return R&&R.cfg[k]!=null?R.cfg[k]:E.cfg[k]; };
const ident=R=>({name:getCfg(R,'user.name'),email:getCfg(R,'user.email')});
function newHash(){ let h; do h=Math.floor(Math.random()*0x10000000).toString(16).padStart(7,'0'); while(E.C[h]); return h; }
function mkCommit(R,t,parents,msg,author){ const a=author||ident(R), h=newHash();
  E.C[h]={h,tree:{...t},parents:parents.filter(Boolean),msg,author:a.name,email:a.email,t:++E.t}; return h; }
function setHead(R,h,msg){ if(R.head) R.heads[R.head]=h; else R.detached=h; R.reflog.unshift({h,msg}); }
function anc(h){ const s=new Set(), st=h?[h]:[]; while(st.length){ const x=st.pop(); if(!x||s.has(x)) continue; s.add(x); st.push(...E.C[x].parents); } return s; }
const isAnc=(a,b)=>!!a&&!!b&&anc(b).has(a);
function mergeBase(a,b){ const A=anc(a); let best=null; for(const x of anc(b)) if(A.has(x)&&(!best||E.C[x].t>E.C[best].t)) best=x; return best; }
function rev(R,s){ if(!s) return null;
  const m=s.match(/^(.*?)((?:[~^]\d*)*)$/); const base=m[1]; let h=null;
  const at=base.match(/^(.*)@\{(\d+)\}$/);
  if(at){ const r=R.reflog[+at[2]]; h=r&&r.h; }
  else if(base==='HEAD'||base==='@') h=headHash(R);
  else if(R.heads[base]!=null) h=R.heads[base];
  else if(R.tags[base]) h=R.tags[base].h;
  else if(R.rrefs[base.replace(/^(refs\/)?remotes\//,'')]!=null) h=R.rrefs[base.replace(/^(refs\/)?remotes\//,'')];
  else if(base.startsWith('refs/heads/')) h=R.heads[base.slice(11)];
  else if(/^[0-9a-f]{4,40}$/.test(base)){ const b=base.slice(0,7), c=Object.keys(E.C).filter(k=>k.startsWith(b)); if(c.length===1) h=c[0]; }
  if(!h) return null;
  for(const t of m[2].match(/[~^]\d*/g)||[]){ const n=t.length>1?+t.slice(1):1;
    if(t[0]==='~'){ for(let i=0;i<n;i++){ h=E.C[h].parents[0]; if(!h) return null; } } else { h=n?E.C[h].parents[n-1]:h; if(!h) return null; } }
  return h; }
const badRev=x=>`fatal: ambiguous argument '${x}': unknown revision or path not in the working tree.\nUse '--' to separate paths from revisions, like this:\n'git <command> [<revision>...] -- [<file>...]'`;

/* ── .gitignore ── */
function ignRules(R){ return (E.files[R.root+'/.gitignore']||'').split('\n').map((l,i)=>({l:l.trim(),n:i+1})).filter(r=>r.l&&!r.l.startsWith('#')); }
function globIgn(pat,p){ const dirOnly=pat.endsWith('/'); pat=pat.replace(/\/$/,'').replace(/^\//,''); const re=globRe(pat), segs=p.split('/');
  if(pat.includes('/')){ for(let i=1;i<=segs.length;i++) if(re.test(segs.slice(0,i).join('/'))&&(!dirOnly||i<segs.length)) return true; return false; }
  for(let i=0;i<segs.length;i++) if(re.test(segs[i])&&(!dirOnly||i<segs.length-1)) return true; return false; }
function ignored(R,p){ let hit=null; for(const r of ignRules(R)){ if(r.l.startsWith('!')){ if(globIgn(r.l.slice(1),p)) hit=null; } else if(globIgn(r.l,p)) hit=r; } return hit; }
function lfsPats(t){ return (t['.gitattributes']||'').split('\n').filter(l=>/filter=lfs/.test(l)).map(l=>l.trim().split(/\s+/)[0]); }
const lfsMatch=(pats,p)=>pats.some(g=>g.includes('/')?globRe(g).test(p):globRe(g).test(basename(p)));

/* ── estado ── */
function collapse(R,paths){ const idx=Object.keys(R.index), out=new Set();
  for(const p of paths){ const segs=p.split('/'); let shown=p;
    for(let i=1;i<segs.length;i++){ const d=segs.slice(0,i).join('/'); if(!idx.some(q=>q.startsWith(d+'/'))){ shown=d+'/'; break; } }
    out.add(shown); }
  return [...out].sort(); }
function statusOf(R){ const H=tree(headHash(R)), I=R.index, W=wt(R); let items=[]; const unt=[], ign=[];
  for(const p of union(H,I,W)){ if(R.conf[p]) continue;
    const inH=p in H, inI=p in I, inW=p in W;
    if(inH||inI){ const x=!inH?'A':!inI?'D':H[p]!==I[p]?'M':' '; const y=!inI?' ':!inW?'D':W[p]!==I[p]?'M':' '; if(x!==' '||y!==' ') items.push({p,x,y}); }
    if(!inI&&inW){ if(ignored(R,p)) ign.push(p); else unt.push(p); } }
  for(const d of items.filter(i=>i.x==='D')){ const a=items.find(i=>i.x==='A'&&I[i.p]===H[d.p]); if(a){ a.x='R'; a.from=d.p; if(d.y===' ') items=items.filter(i=>i!==d); else d.x=' '; } }
  return {items:items.sort((a,b)=>a.p<b.p?-1:1),unt:collapse(R,unt),ign:collapse(R,ign),conf:Object.keys(R.conf).sort()}; }
function track(R,br){ const u=R.upstream[br]; if(!u) return null; const name=u.remote+'/'+u.merge, rh=R.rrefs[name], lh=R.heads[br];
  if(rh==null) return {name,gone:true}; const A=anc(lh), B=anc(rh);
  return {name,ahead:[...A].filter(x=>!B.has(x)).length,behind:[...B].filter(x=>!A.has(x)).length}; }
function trackMsg(t){ if(t.gone) return `Your branch is based on '${t.name}', but the upstream is gone.\n  (use "git branch --unset-upstream" to fixup)`;
  if(!t.ahead&&!t.behind) return `Your branch is up to date with '${t.name}'.`;
  if(!t.behind) return `Your branch is ahead of '${t.name}' by ${plural(t.ahead,'commit')}.\n  (use "git push" to publish your local commits)`;
  if(!t.ahead) return `Your branch is behind '${t.name}' by ${plural(t.behind,'commit')}, and can be fast-forwarded.\n  (use "git pull" to update your local branch)`;
  return `Your branch and '${t.name}' have diverged,\nand have ${t.ahead} and ${t.behind} different commits each, respectively.\n  (use "git pull" if you want to integrate the remote branch with yours)`; }
const WORD={M:'modified',A:'new file',D:'deleted',R:'renamed'};
function statusLong(R){ const h=headHash(R), op=R.op, S=statusOf(R);
  if(R.head) say(`On branch ${R.head}`);
  else if(op&&op.type==='rebase') say(`${op.inter?'interactive ':''}rebase in progress; onto ${op.onto}\nYou are currently rebasing branch '${op.branch}' on '${op.onto}'.\n  (fix conflicts and then run "git rebase --continue")\n  (use "git rebase --skip" to skip this patch)\n  (use "git rebase --abort" to check out the original branch)`);
  else say(`HEAD detached at ${h}`);
  if(R.head){ const t=track(R,R.head); if(t) say(trackMsg(t)); }
  if(!h) say('\nNo commits yet');
  if(op&&op.type==='merge') say(S.conf.length?'\nYou have unmerged paths.\n  (fix conflicts and run "git commit")\n  (use "git merge --abort" to abort the merge)':'\nAll conflicts fixed but you are still merging.\n  (use "git commit" to conclude merge)');
  if(op&&(op.type==='cherry-pick'||op.type==='revert')) say(`\nYou are currently ${op.type==='revert'?'reverting':'cherry-picking'} commit ${op.src}.\n  (fix conflicts and run "git ${op.type} --continue")\n  (use "git ${op.type} --abort" to cancel the ${op.type} operation)`);
  const st=S.items.filter(i=>i.x!==' '), un=S.items.filter(i=>i.y!==' ');
  if(st.length){ say('\nChanges to be committed:'); hint(h?'  (use "git restore --staged <file>..." to unstage)':'  (use "git rm --cached <file>..." to unstage)'); st.forEach(i=>say(`\t${(WORD[i.x]+':').padEnd(12)}${i.from?i.from+' -> ':''}${i.p}`,'ok')); }
  if(S.conf.length){ say('\nUnmerged paths:'); hint('  (use "git add <file>..." to mark resolution)'); S.conf.forEach(p=>say(`\tboth modified:   ${p}`,'rd')); }
  if(un.length){ say('\nChanges not staged for commit:'); hint('  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)'); un.forEach(i=>say(`\t${(WORD[i.y]+':').padEnd(12)}${i.p}`,'rd')); }
  if(S.unt.length){ say('\nUntracked files:'); hint('  (use "git add <file>..." to include in what will be committed)'); S.unt.forEach(p=>say('\t'+p,'rd')); }
  if(!st.length&&!S.conf.length){ say(un.length?'\nno changes added to commit (use "git add" and/or "git commit -a")':S.unt.length?'\nnothing added to commit but untracked files present (use "git add" to track)':h?'nothing to commit, working tree clean':'\nnothing to commit (create/copy files and use "git add" to track)'); } }
function dirtyPaths(R){ const H=tree(headHash(R)), W=wt(R), s=new Set();
  for(const p of union(H,R.index)) if(R.index[p]!==H[p]||W[p]!==R.index[p]) s.add(p); return s; }
function guardLocal(R,oldT,newT,what){ const d=dirtyPaths(R); const bl=union(oldT,newT).filter(p=>oldT[p]!==newT[p]&&d.has(p));
  if(bl.length) die(`error: Your local changes to the following files would be overwritten by ${what}:\n${bl.map(p=>'\t'+p).join('\n')}\nPlease commit your changes or stash them before you ${what==='checkout'?'switch branches':what}.\nAborting`);
  const W=wt(R), uc=Object.keys(newT).filter(p=>!(p in oldT)&&!(p in R.index)&&p in W&&W[p]!==newT[p]);
  if(uc.length) die(`error: The following untracked working tree files would be overwritten by ${what}:\n${uc.map(p=>'\t'+p).join('\n')}\nPlease move or remove them before you ${what==='checkout'?'switch branches':what}.\nAborting`); }
function checkoutTree(R,newT,oldT){ for(const p of union(oldT,newT)){ if(oldT[p]===newT[p]) continue; if(newT[p]==null){ delete R.index[p]; rfile(R,p); } else { R.index[p]=newT[p]; wfile(R,p,newT[p]); } } }
function hardTo(R,h){ const T=tree(h), old={...tree(headHash(R)),...R.index}; for(const p of union(old,T)){ if(p in T) wfile(R,p,T[p]); else rfile(R,p); } R.index={...T}; R.conf={}; }
function mergeTrees(bT,oT,tT,lab,X){ const res={}, conf=[];
  for(const p of union(bT,oT,tT)){ const r=merge3(bT[p],oT[p],tT[p],lab,X); if(r.text!=null) res[p]=r.text; if(r.conflict) conf.push(p); }
  return {tree:res,conf,both:union(bT,oT,tT).filter(p=>oT[p]!==bT[p]&&tT[p]!==bT[p])}; }
function applyMerge(R,M,oldT){ const idx={...M.tree}; M.conf.forEach(p=>{ if(oldT[p]!=null) idx[p]=oldT[p]; else delete idx[p]; });
  checkoutTree(R,idx,oldT); M.conf.forEach(p=>{ wfile(R,p,M.tree[p]); R.conf[p]=true; });
  M.both.forEach(p=>{ say(`Auto-merging ${p}`); if(M.conf.includes(p)) say(`CONFLICT (content): Merge conflict in ${p}`); }); }

/* ── salida: diff, stat, log ── */
function statRows(A,B,paths){ const rows=[]; for(const p of union(A,B)){ if(paths&&paths.length&&!paths.some(q=>p===q||p.startsWith(q+'/'))) continue; if(A[p]===B[p]) continue;
  let i=0,d=0; for(const [k] of lcsOps(lines(A[p]),lines(B[p]))){ if(k==='+') i++; else if(k==='-') d++; } rows.push([p,i,d]); } return rows; }
const summary=rows=>{ const i=rows.reduce((s,r)=>s+r[1],0), d=rows.reduce((s,r)=>s+r[2],0); return ` ${plural(rows.length,'file')} changed`+(i?`, ${i} insertion${i>1?'s':''}(+)`:'')+(d?`, ${d} deletion${d>1?'s':''}(-)`:''); };
function statText(A,B,paths){ const rows=statRows(A,B,paths); if(!rows.length) return ''; const w=Math.max(...rows.map(r=>r[0].length));
  return rows.map(([p,i,d])=>` ${p.padEnd(w)} | ${i+d} ${'+'.repeat(i)}${'-'.repeat(d)}`).join('\n')+'\n'+summary(rows); }
function commitStat(A,B){ const rows=statRows(A,B); return [summary(rows),...union(A,B).filter(p=>A[p]==null&&B[p]!=null).map(p=>` create mode 100644 ${p}`),...union(A,B).filter(p=>A[p]!=null&&B[p]==null).map(p=>` delete mode 100644 ${p}`)].join('\n'); }
function showDiff(A,B,paths){ for(const p of union(A,B)){ if(paths&&paths.length&&!paths.some(q=>p===q||p.startsWith(q+'/'))) continue; if(A[p]===B[p]) continue;
  put(`diff --git a/${p} b/${p}\n`,'b');
  put(A[p]==null?`new file mode 100644\n--- /dev/null\n+++ b/${p}\n`:B[p]==null?`deleted file mode 100644\n--- a/${p}\n+++ /dev/null\n`:`--- a/${p}\n+++ b/${p}\n`,'b');
  const a=lines(A[p]), b=lines(B[p]); put(`@@ -1,${a.length} +1,${b.length} @@\n`,'hk');
  for(const [k,l] of lcsOps(a,b)) put(k+l.replace(/\r/g,'^M')+'\n',k==='+'?'add':k==='-'?'del':''); } }
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function date(t){ const d=new Date(Date.UTC(2026,10,18,8,0)+t*137000), p=n=>String(n).padStart(2,'0');
  return `${DAYS[d.getUTCDay()]} ${MON[d.getUTCMonth()]} ${d.getUTCDate()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} 2026 +0100`; }
function decos(R){ const m={}, add=(h,s)=>{ if(h) (m[h]=m[h]||[]).push(s); };
  if(R.head) add(R.heads[R.head],'HEAD -> '+R.head); else add(R.detached,'HEAD');
  for(const [t,o] of Object.entries(R.tags)) add(o.h,'tag: '+t);
  for(const [k,h] of Object.entries(R.rrefs)) add(h,k);
  for(const [b,h] of Object.entries(R.heads)) if(b!==R.head) add(h,b);
  return m; }
function printCommit(c,f,D,pre){ const d=D[c.h]?` (${D[c.h].join(', ')})`:'';
  if(f.oneline){ if(pre) put(pre+' ','gr'); put(c.h,'y'); put(d,'dc'); put(' '+first(c.msg)+'\n'); return; }
  if(pre) put(pre+' ','gr'); put('commit '+c.h,'y'); put(d+'\n','dc');
  const ind=pre?pre.replace(/\*/,'|')+' ':'';
  if(c.parents.length>1) say(ind+'Merge: '+c.parents.join(' '));
  say(`${ind}Author: ${c.author} <${c.email}>\n${ind}Date:   ${date(c.t)}\n${ind}`); c.msg.split('\n').forEach(l=>say(ind+'    '+l)); say(ind+' '); }
// grafo ASCII sencillo (columnas): suficiente para ramas, merges y rebases de los ejercicios
function graphLog(list,each){ let cols=[];
  for(const c of list){ let i=cols.indexOf(c.h); if(i<0){ cols.push(c.h); i=cols.length-1; }
    each(c,cols.map((x,k)=>k===i?'*':'|').join(' '));
    const ps=c.parents.filter(p=>list.some(x=>x.h===p));
    if(!ps.length) cols.splice(i,1); else { cols[i]=ps[0];
      ps.slice(1).forEach(p=>{ if(cols.includes(p)) return; cols.splice(i+1,0,p); put(cols.map((x,k)=>k<=i?'|':k===i+1?'\\':'\\').join(' ').replace(/\| \\/,'|\\')+'\n','gr'); }); }
    for(;;){ const k=cols.findIndex((x,j)=>cols.indexOf(x)<j); if(k<0) break;
      put((cols.slice(0,k).map(()=>'|').join(' ')+'/').replace(/ \/$/,'/')+cols.slice(k+1).map(()=>' /').join('')+'\n','gr'); cols.splice(k,1); } } }

/* ── remotos ── */
function repoByUrl(url,base){ let p; let m=url.match(/^(?:git@github\.com:|https:\/\/github\.com\/)([^/]+)\/(.+?)(?:\.git)?\/?$/);
  if(m) p=`${GH}/${m[1]==='TU_USUARIO'?'usuario':m[1]}/${m[2]}.git`;
  else { m=url.match(/^[\w.-]+@[\w.-]+:(\/.*)$/); p=m?m[1]:resolve(base||E.cwd,url.replace(/^file:\/\//,'')); }
  return E.repos[p]||E.repos[p.replace(/\/\.git$/,'')]||null; }
const isGHurl=u=>/github\.com/.test(u);
function remoteRepo(R,name){ const url=R.remotes[name];
  if(url==null) die(`fatal: '${name}' does not appear to be a git repository\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.`);
  const S=repoByUrl(url,R.root);
  if(!S) die(isGHurl(url)?'ERROR: Repository not found.\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.':`fatal: '${url}' does not appear to be a git repository\nfatal: Could not read from remote repository.`);
  return {S,url}; }
function httpsAuth(url){ if(!/^https:/.test(url)||E.cred) return; hint(`Username for 'https://github.com': usuario\nPassword for 'https://usuario@github.com': ******** (pegas el token, no tu contraseña)`); if(getCfg(null,'credential.helper')) E.cred=true; }
function fetchRemote(R,name,prune){ const {S,url}=remoteRepo(R,name); httpsAuth(url); const L=[];
  for(const [b,h] of Object.entries(S.heads)){ const k=name+'/'+b, old=R.rrefs[k]; if(old===h) continue;
    L.push(old==null?` * [new branch]      ${b} -> ${k}`:isAnc(old,h)?`   ${old}..${h}  ${b} -> ${k}`:` + ${old}...${h} ${b} -> ${k}  (forced update)`); R.rrefs[k]=h; }
  for(const [t,o] of Object.entries(S.tags)) if(!R.tags[t]){ R.tags[t]={...o}; L.push(` * [new tag]         ${t} -> ${t}`); }
  if(prune) for(const k of Object.keys(R.rrefs)) if(k.startsWith(name+'/')&&S.heads[k.slice(name.length+1)]==null){ delete R.rrefs[k]; L.push(` - [deleted]         (none)     -> ${k}`); }
  if(L.length) say(`From ${url}\n${L.join('\n')}`); return S; }
function bigFile(R,h,S){ const have=new Set(); Object.values(S.heads).forEach(x=>anc(x).forEach(y=>have.add(y)));
  for(const c of anc(h)){ if(have.has(c)) continue; const T=E.C[c].tree, pats=lfsPats(T);
    for(const [p,v] of Object.entries(T)){ const m=/^\[binario (\d+) MB\]/.exec(v); if(m&&+m[1]>100&&!lfsMatch(pats,p)) return {p,mb:m[1]}; } } return null; }

/* ── parser de opciones ── */
function P(a,val=''){ const V=val.split(','), f={}, args=[], pp=[]; let dd=false;
  for(let i=0;i<a.length;i++){ const x=a[i];
    if(dd){ pp.push(x); continue; } if(x==='--'){ dd=true; continue; }
    let m=x.match(/^--([\w-]+)(?:=(.*))?$/);
    if(m){ f[m[1]]=m[2]!=null?m[2]:V.includes(m[1])?a[++i]:true; continue; }
    if(/^-\d+$/.test(x)){ f.n=+x.slice(1); continue; }
    if(/^-[a-zA-Z]/.test(x)){ const s=x.slice(1); for(let j=0;j<s.length;j++){ const c=s[j];
        if(V.includes(c)){ const v=j<s.length-1?s.slice(j+1):a[++i]; f[c]=c==='m'&&f.m!=null?[].concat(f.m,v):v; break; } f[c]=true; } continue; }
    args.push(x); }
  return {f,args,pp}; }

/* ════════════════ comandos git ════════════════ */
const IDENT=`Author identity unknown\n\n*** Please tell me who you are.\n\nRun\n\n  git config --global user.email "you@example.com"\n  git config --global user.name "Your Name"\n\nto set your account's default identity.\nOmit --global to set the identity only in this repository.\n\nfatal: unable to auto-detect email address (got 'alumno@aula.(none)')`;
function doCommit(R,msg,parents,o={}){ msg=cleanMsg(msg); if(!msg) die('Aborting commit due to empty commit message.');
  const h=mkCommit(R,R.index,parents,msg,o.author);
  const kind=o.kind||(o.amend?'commit (amend)':!parents.length?'commit (initial)':parents.length>1?'commit (merge)':'commit');
  setHead(R,h,`${kind}: ${first(msg)}`);
  say(`[${R.head||'detached HEAD'}${parents.length?'':' (root-commit)'} ${h}] ${first(msg)}`); say(commitStat(tree(parents[0]),R.index));
  if(R.op&&R.op.type!=='rebase') R.op=null; return h; }
const COMMIT_HELP="\n# Escribe el mensaje del commit. Las líneas que empiezan por '#' se ignoran\n# y un mensaje vacío cancela el commit.\n";
function pick(R,o){ const h=headHash(R), oldT=tree(h); const M=mergeTrees(o.base,oldT,o.theirs,['HEAD',o.label]);
  guardLocal(R,oldT,M.tree,o.type); applyMerge(R,M,oldT);
  if(M.conf.length){ R.op={type:o.type,msg:o.msg,src:o.src,author:o.author,orig:h};
    die(`error: could not ${o.type==='revert'?'revert':'apply'} ${o.src}... ${first(o.subject)}\nhint: After resolving the conflicts, mark them with\nhint: "git add/rm <pathspec>", then run\nhint: "git ${o.type} --continue".\nhint: To abort and get back to the state before "git ${o.type}",\nhint: run "git ${o.type} --abort".`); }
  if(same(R.index,oldT)) die(`The previous ${o.type} is now empty, possibly due to conflict resolution.`);
  if(o.edit) return edit(o.msg,m=>doCommit(R,m,[h],{author:o.author,kind:o.type}),'COMMIT_EDITMSG');
  doCommit(R,o.msg,[h],{author:o.author,kind:o.type}); }
function opContinue(R,type){ if(!R.op||R.op.type!==type) die(`error: no ${type} in progress`); if(Object.keys(R.conf).length) die(`error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add/rm <file>'\nhint: as appropriate to mark resolution and make a commit.`); doCommit(R,R.op.msg,[headHash(R)],{author:R.op.author,kind:type}); }
function opAbort(R,type){ if(!R.op||R.op.type!==type) die(`error: no ${type} in progress`); hardTo(R,R.op.orig); R.op=null; }
function doMerge(R,th,label,o={}){ const h=headHash(R);
  if(!h){ const T=tree(th); guardLocal(R,{},T,'merge'); checkoutTree(R,T,{}); setHead(R,th,`merge ${label}: Fast-forward`); return; }
  if(isAnc(th,h)){ say('Already up to date.'); return; }
  const base=mergeBase(h,th);
  if(!base&&!o.unrelated) die('fatal: refusing to merge unrelated histories');
  if(base===h&&!o.noff){ const oldT=tree(h), newT=tree(th); guardLocal(R,oldT,newT,'merge');
    say(`Updating ${h}..${th}\nFast-forward`); say(statText(oldT,newT)); checkoutTree(R,newT,oldT); setHead(R,th,`merge ${label}: Fast-forward`); return; }
  if(o.ffonly) die('fatal: Not possible to fast-forward, aborting.');
  const oldT=tree(h), M=mergeTrees(tree(base),oldT,tree(th),['HEAD',label],o.X);
  guardLocal(R,oldT,M.tree,'merge');
  const msg=o.msg||(/^[^/]+\/./.test(label)&&R.rrefs[label]!=null?`Merge remote-tracking branch '${label}'`:`Merge branch '${label}'`)+(R.head&&!['main','master'].includes(R.head)?` into ${R.head}`:'');
  applyMerge(R,M,oldT);
  if(M.conf.length){ R.op={type:'merge',theirs:th,msg}; die('Automatic merge failed; fix conflicts and then commit the result.'); }
  doCommitQuiet(R,msg,[h,th]); say("Merge made by the 'ort' strategy."); say(statText(oldT,R.index)); }
function doCommitQuiet(R,msg,parents){ const h=mkCommit(R,R.index,parents,msg); setHead(R,h,`merge: ${first(msg)}`); R.op=null; return h; }

/* rebase: replay de commits uno a uno; se para en conflictos o cuando hace falta el editor */
function startRebase(R,onto,steps,upName,inter){ const h=headHash(R);
  R.op={type:'rebase',branch:R.head,orig:h,onto,steps,inter,upName};
  const oldT=tree(h); checkoutTree(R,tree(onto),oldT); R.head=null; R.detached=onto; R.reflog.unshift({h:onto,msg:`rebase (start): checkout ${upName}`});
  rebaseStep(R); }
function rebaseStep(R){ const op=R.op;
  while(op.steps.length){ const s=op.steps.shift(), c=E.C[s.h], h=headHash(R);
    if(s.cmd==='drop') continue;
    if(s.cmd==='pick'&&c.parents[0]===h){ checkoutTree(R,c.tree,tree(h)); R.detached=s.h; R.reflog.unshift({h:s.h,msg:`rebase (pick): ${first(c.msg)}`}); op.done=true; continue; }
    if((s.cmd==='squash'||s.cmd==='fixup')&&!op.done) die(`error: cannot '${s.cmd}' without a previous commit`);
    const oldT=tree(h), M=mergeTrees(tree(c.parents[0]),oldT,c.tree,['HEAD',`${c.h} (${first(c.msg)})`]);
    applyMerge(R,M,oldT); op.done=true;
    if(M.conf.length){ op.cur=s; die(`error: could not apply ${c.h}... ${first(c.msg)}\nhint: Resolve all conflicts manually, mark them as resolved with\nhint: "git add/rm <conflicted_files>", then run "git rebase --continue".\nhint: You can instead skip this commit: run "git rebase --skip".\nhint: To abort and get back to the state before "git rebase", run "git rebase --abort".`); }
    if(!finishStep(R,s,false)) return; op.done=true; }
  const fin=headHash(R); R.heads[op.branch]=fin; R.head=op.branch; R.detached=null; R.op=null;
  R.reflog.unshift({h:fin,msg:`rebase (finish): returning to refs/heads/${op.branch}`}); say(`Successfully rebased and updated refs/heads/${op.branch}.`); }
function finishStep(R,s,afterConflict){ const c=E.C[s.h], h=headHash(R), au={name:c.author,email:c.email};
  const resume=()=>rebaseStep(R);
  if(s.cmd==='squash'||s.cmd==='fixup'){ const prev=E.C[h];
    const go=m=>{ const n=mkCommit(R,R.index,prev.parents,cleanMsg(m),{name:prev.author,email:prev.email}); R.detached=n; R.reflog.unshift({h:n,msg:`rebase (${s.cmd}): ${first(m)}`}); };
    if(s.cmd==='fixup'){ go(prev.msg); return true; }
    edit(`# This is a combination of 2 commits.\n# This is the 1st commit message:\n\n${prev.msg}\n\n# This is the commit message #2:\n\n${c.msg}\n`,m=>{ go(m); resume(); },'COMMIT_EDITMSG (squash)'); return false; }
  if(same(R.index,tree(h))) return true;
  const mk=m=>{ const n=mkCommit(R,R.index,[h],cleanMsg(m),au); R.detached=n; R.reflog.unshift({h:n,msg:`rebase (${s.cmd}): ${first(m)}`}); };
  if(s.cmd==='reword'||afterConflict){ edit(c.msg+COMMIT_HELP,m=>{ if(!cleanMsg(m)) die('Aborting commit due to empty commit message.'); mk(m); resume(); },'COMMIT_EDITMSG'); return false; }
  mk(c.msg); return true; }
function parseTodo(txt){ const N={p:'pick',pick:'pick',r:'reword',reword:'reword',s:'squash',squash:'squash',f:'fixup',fixup:'fixup',d:'drop',drop:'drop',e:'pick',edit:'pick'}, steps=[];
  for(const l of txt.split('\n')){ const s=l.trim(); if(!s||s.startsWith('#')) continue; const m=s.match(/^(\w+)\s+([0-9a-f]{4,})/);
    if(!m) die(`error: invalid line: ${s}`); if(!N[m[1]]) die(`error: invalid command '${m[1]}'`);
    const h=Object.keys(E.C).find(k=>k.startsWith(m[2].slice(0,7))); if(!h) die(`error: invalid commit '${m[2]}'`); steps.push({cmd:N[m[1]],h}); }
  return steps; }
const TODO_HELP=`
# Comandos (cambia la palabra del principio de cada línea):
# p, pick   = usar el commit
# r, reword = usar el commit, pero cambiar el mensaje
# s, squash = unir con el commit anterior, combinando los mensajes
# f, fixup  = unir con el commit anterior, descartando este mensaje
# d, drop   = eliminar el commit
# El orden de las líneas es el orden de los commits (el más antiguo arriba).
# Borrar una línea también elimina ese commit.`;
function commitsToReplay(h,uh){ const U=anc(uh); return [...anc(h)].filter(x=>!U.has(x)&&E.C[x].parents.length<2).sort((a,b)=>E.C[a].t-E.C[b].t); }

const G={
 version(){ say('git version 2.43.0'); },
 help(){ say(GITHELP); },
 init(a){ const {f,args}=P(a,'b,initial-branch'); const dir=abs(args[0]||'.'), bare=!!f.bare;
  if(E.repos[dir]) return say(`Reinitialized existing Git repository in ${dir}${bare?'':'/.git'}/`);
  let br=f.b||f['initial-branch']||getCfg(null,'init.defaultBranch');
  if(!br){ br='master'; hint("hint: Using 'master' as the name for the initial branch. This default branch name\nhint: is subject to change. To configure the initial branch name to use in all\nhint: of your new repositories, which will suppress this warning, call:\nhint:\nhint: \tgit config --global init.defaultBranch <name>"); }
  newRepo(dir,bare,br); say(`Initialized empty ${f.shared?'shared ':''}Git repository in ${dir}${bare?'':'/.git'}/`); },
 config(a){ const {f,args}=P(a); const R=findRepo(); const scope=f.global||f.system?'global':f.local?'local':null;
  if(f.list||f.l){ const L=[], add=(o,src)=>Object.entries(o).forEach(([k,v])=>L.push((f['show-origin']?src+'\t':'')+k+'='+v));
    if(scope!=='local') add(E.cfg,'file:'+HOME+'/.gitconfig'); if(scope!=='global'&&R) add(R.cfg,'file:.git/config'); return say(L.join('\n')); }
  const [k,...vs]=args; if(!k) die('usage: git config [<options>]'); const key=k.toLowerCase();
  if(!key.includes('.')) die(`error: key does not contain a section: ${k}`);
  if(f.unset){ delete (scope==='global'?E.cfg:(R||{cfg:{}}).cfg)[key]; return; }
  if(!vs.length){ const v=scope==='global'?E.cfg[key]:scope==='local'?R&&R.cfg[key]:getCfg(R,key); if(v==null) die(''); return say(v); }
  if(scope!=='global'&&!R) die('fatal: not in a git directory');
  (scope==='global'?E.cfg:R.cfg)[key]=vs.join(' '); },
 status(a){ const R=needWT(); const {f}=P(a);
  if(!f.s&&!f.short&&!f.porcelain) return statusLong(R);
  const S=statusOf(R), h=headHash(R);
  if(f.b||f.branch){ const t=R.head&&track(R,R.head);
    say(!R.head?'## HEAD (no branch)':!h?`## No commits yet on ${R.head}`:'## '+R.head+(t?'...'+t.name+(t.gone?' [gone]':t.ahead||t.behind?` [${[t.ahead?'ahead '+t.ahead:'',t.behind?'behind '+t.behind:''].filter(Boolean).join(', ')}]`:''):''),'b'); }
  S.conf.forEach(p=>say('UU '+p,'rd'));
  S.items.forEach(i=>say(i.x+i.y+' '+(i.from?i.from+' -> ':'')+i.p,i.y===' '?'ok':'rd'));
  S.unt.forEach(p=>say('?? '+p,'rd'));
  if(f.ignored) S.ign.forEach(p=>say('!! '+p,'m')); },
 add(a){ const R=needWT(); const {f,args}=P(a); const W=wt(R); const specs=f.A||f.all||f.u?['.']:args;
  if(!specs.length) die('Nothing specified, nothing added.\nhint: Maybe you wanted to say \'git add .\'?');
  const ign=[];
  for(const s of specs){ const rel=relArg(R,s), g=/[*?]/.test(s)?globRe(rel):null;
    const match=p=>g?g.test(p)||g.test(basename(p)):rel===''||p===rel||p.startsWith(rel+'/');
    const cand=union(W,R.index).filter(match);
    if(!cand.length) die(`fatal: pathspec '${s}' did not match any files`);
    for(const p of cand){ const tracked=p in R.index;
      if(!tracked&&f.u) continue;
      if(!tracked&&p in W&&!f.f&&ignored(R,p)){ if(rel===p) ign.push(p); continue; }
      if(p in W) R.index[p]=W[p]; else delete R.index[p]; delete R.conf[p]; } }
  if(ign.length) die(`The following paths are ignored by one of your .gitignore files:\n${ign.join('\n')}\nhint: Use -f if you really want to add them.`); },
 commit(a){ const R=needWT(); const {f}=P(a,'m,C');
  if(f.a) for(const p of Object.keys(R.index)){ const w=E.files[R.root+'/'+p]; if(w==null) delete R.index[p]; else R.index[p]=w; delete R.conf[p]; }
  if(Object.keys(R.conf).length) die("error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add/rm <file>'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.");
  const id=ident(R); if(!id.name||!id.email) die(IDENT);
  const h0=headHash(R), op=R.op;
  if(f.amend&&!h0) die('fatal: You have nothing to amend.');
  const parents=f.amend?E.C[h0].parents:op&&op.type==='merge'?[h0,op.theirs]:h0?[h0]:[];
  if(!f.amend&&!(op&&op.type==='merge')&&same(R.index,tree(h0))&&!f['allow-empty']){ statusLong(R); die(''); }
  const author=f.amend?{name:E.C[h0].author,email:E.C[h0].email}:op&&op.author;
  const go=m=>doCommit(R,m,parents,{amend:f.amend,author});
  if(f.m!=null) return go([].concat(f.m).join('\n\n'));
  const def=f.amend?E.C[h0].msg:op&&op.msg||'';
  if(f['no-edit']) return go(def);
  edit(def+COMMIT_HELP,go,'COMMIT_EDITMSG'); },
 log(a){ const R=needRepo(); const {f,args,pp}=P(a,'n,author,since,until,max-count'); const n=f.n||+f['max-count']||Infinity;
  const starts=[], excl=new Set(), paths=pp.map(p=>relArg(R,p));
  for(const x of args){ const r=x.match(/^(.*?)\.\.(.*)$/);
    if(r){ const A=rev(R,r[1]||'HEAD'), B=rev(R,r[2]||'HEAD'); if(!A||!B) die(badRev(x)); anc(A).forEach(h=>excl.add(h)); starts.push(B); continue; }
    const h=rev(R,x); if(h){ starts.push(h); continue; }
    if(!R.bare&&(isFile(abs(x))||isDir(abs(x)))){ paths.push(relArg(R,x)); continue; }
    die(badRev(x)); }
  if(f.all) starts.push(...Object.values(R.heads),...Object.values(R.rrefs),...Object.values(R.tags).map(t=>t.h),...(R.detached?[R.detached]:[]));
  if(!starts.length){ const h=headHash(R); if(!h) die(`fatal: your current branch '${R.head}' does not have any commits yet`); starts.push(h); }
  const S=new Set(); starts.forEach(s=>anc(s).forEach(h=>{ if(!excl.has(h)) S.add(h); }));
  let list=[...S].map(h=>E.C[h]).sort((x,y)=>y.t-x.t);
  if(paths.length) list=list.filter(c=>{ const pt=tree(c.parents[0]); return union(pt,c.tree).some(p=>pt[p]!==c.tree[p]&&paths.some(q=>p===q||p.startsWith(q+'/'))); });
  if(f.author) list=list.filter(c=>(c.author+' '+c.email).includes(f.author));
  list=list.slice(0,n); const D=decos(R);
  const each=(c,pre)=>{ printCommit(c,f,D,pre); if(f.p||f.patch) showDiff(tree(c.parents[0]),c.tree,paths); if(f.stat) say(statText(tree(c.parents[0]),c.tree,paths)); };
  if(f.graph) graphLog(list,each); else list.forEach(c=>each(c,'')); },
 show(a){ const R=needRepo(); const {f,args,pp}=P(a); const x=args[0]||'HEAD';
  const tg=R.tags[x]; if(tg&&tg.msg!=null&&!f.oneline) say(`tag ${x}\nTagger: ${tg.tagger}\nDate:   ${date(tg.t)}\n\n${tg.msg}\n`);
  const h=rev(R,x); if(!h) die(badRev(x)); const c=E.C[h];
  printCommit(c,f,decos(R),''); const pt=tree(c.parents[0]), paths=pp.map(p=>relArg(R,p));
  if(f.stat) say(statText(pt,c.tree,paths)); else if(c.parents.length<2) showDiff(pt,c.tree,paths); },
 diff(a){ const R=needWT(); const {f,args,pp}=P(a); const paths=pp.map(p=>relArg(R,p)), revs=[];
  for(const x of args){ const r=x.match(/^(.+?)\.\.\.?(.+)$/); if(r){ const A=rev(R,r[1]), B=rev(R,r[2]); if(!A||!B) die(badRev(x)); revs.push(A,B); continue; }
    const h=rev(R,x); if(h&&!isFile(abs(x))){ revs.push(h); continue; }
    if(isFile(abs(x))||isDir(abs(x))||x in R.index){ paths.push(relArg(R,x)); continue; } die(badRev(x)); }
  const staged=f.staged||f.cached, W=wt(R);
  const wtT=base=>{ const o={}; for(const p of union(base,R.index)) if(p in W) o[p]=W[p]; return o; };
  let A,B;
  if(revs.length>=2){ A=tree(revs[0]); B=tree(revs[1]); }
  else if(revs.length===1){ A=tree(revs[0]); B=staged?R.index:wtT(A); }
  else if(staged){ A=tree(headHash(R)); B=R.index; }
  else { A=R.index; B=wtT({}); }
  if(f.stat) say(statText(A,B,paths)); else if(f['name-only']) say(statRows(A,B,paths).map(r=>r[0]).join('\n')); else showDiff(A,B,paths); },
 restore(a){ const R=needWT(); const {f,args,pp}=P(a,'s,source'); const specs=[...args,...pp]; const src=f.source||f.s; const staged=f.staged||f.S, work=f.worktree||f.W||!staged;
  if(!specs.length) die('fatal: you must specify path(s) to restore');
  let srcT=null; if(src){ const h=rev(R,src); if(!h) die(`fatal: could not resolve ${src}`); srcT=tree(h); }
  const H=tree(headHash(R)), W=wt(R);
  for(const s of specs){ const rel=relArg(R,s), m=p=>rel===''||p===rel||p.startsWith(rel+'/');
    const cand=union(R.index,H,srcT||{},staged?{}:W).filter(m).filter(p=>p in R.index||p in H||(srcT&&p in srcT));
    if(!cand.length) die(`error: pathspec '${s}' did not match any file(s) known to git`);
    for(const p of cand){ if(R.conf[p]&&!staged&&!srcT) die(`error: path '${p}' is unmerged`);
      if(staged){ const t=srcT||H; if(p in t) R.index[p]=t[p]; else delete R.index[p]; }
      if(work){ const t=srcT||(staged?H:R.index); if(p in t) wfile(R,p,t[p]); else if(!srcT) rfile(R,p); } } } },
 checkout(a){ const R=needWT(); const {f,args,pp}=P(a,'b,B');
  if(f.ours||f.theirs){ for(const s of [...args,...pp]){ const p=relArg(R,s); if(!R.conf[p]) die(`error: path '${p}' does not have ${f.ours?'our':'their'} version`);
      const op=R.op, oursH=headHash(R), theirsH=op&&op.type==='merge'?op.theirs:op&&op.type==='rebase'&&op.cur?op.cur.h:null;
      // en un rebase, "ours" es la base nueva y "theirs" tu commit
      const t=f.ours?tree(oursH):tree(theirsH); if(p in t) wfile(R,p,t[p]); else rfile(R,p); }
    return say(`Updated ${plural([...args,...pp].length,'path')} from the index`); }
  if(f.b||f.B) return G.switch([f.B?'-C':'-c',f.b||f.B,...args]);
  if(pp.length||(args.length&&!rev(R,args[0])&&!R.rrefs['origin/'+args[0]])){ const paths=pp.length?pp:args, src=pp.length?args[0]:null;
    if(src){ const h=rev(R,src); if(!h) die(badRev(src)); const t=tree(h); for(const s of paths){ const rel=relArg(R,s); const c=Object.keys(t).filter(p=>p===rel||p.startsWith(rel+'/')); if(!c.length) die(`error: pathspec '${s}' did not match any file(s) known to git`); c.forEach(p=>{ R.index[p]=t[p]; wfile(R,p,t[p]); }); } }
    else G.restore(paths);
    return say(`Updated ${plural(paths.length,'path')} from ${src?src:'the index'}`); }
  if(!args.length) return;
  if(R.heads[args[0]]!=null||R.rrefs['origin/'+args[0]]!=null) return G.switch(args);
  const h=rev(R,args[0]); moveTo(R,h,null);
  hint(`Note: switching to '${args[0]}'.\n\nYou are in 'detached HEAD' state. You can look around, make experimental\nchanges and commit them, and you can discard any commits you make in this\nstate without impacting any branches by switching back to a branch.\n\nTo return:  git switch -`); say(`HEAD is now at ${h} ${first(E.C[h].msg)}`); },
 switch(a){ const R=needWT(); const {f,args}=P(a,'c,C');
  if(f.c||f.C){ const name=f.c||f.C; if(R.heads[name]!=null&&!f.C) die(`fatal: a branch named '${name}' already exists`);
    if(!/^[\w.\/-]+$/.test(name)||name.endsWith('/')) die(`fatal: '${name}' is not a valid branch name`);
    const h0=headHash(R);
    if(!h0&&!args[0]){ R.head=name; return say(`Switched to a new branch '${name}'`); }
    const start=args[0]?rev(R,args[0]):h0; if(!start) die(`fatal: invalid reference: ${args[0]}`);
    moveTo(R,start,name,true); if(args[0]&&R.rrefs[args[0]]!=null){ const [rm,...b]=args[0].split('/'); R.upstream[name]={remote:rm,merge:b.join('/')}; say(`branch '${name}' set up to track '${args[0]}'.`); }
    return say(`Switched to a new branch '${name}'`); }
  if(f.detach){ const h=rev(R,args[0]||'HEAD'); if(!h) die(`fatal: invalid reference: ${args[0]}`); moveTo(R,h,null); return say(`HEAD is now at ${h} ${first(E.C[h].msg)}`); }
  const name=args[0]; if(!name) die('fatal: missing branch or commit argument');
  if(name==='-'){ const prev=R.reflog.find(r=>/^checkout: moving from (\S+) to/.test(r.msg)); const m=prev&&prev.msg.match(/^checkout: moving from (\S+) to/); if(!m) die('fatal: invalid reference: @{-1}'); return G.switch(R.heads[m[1]]!=null?[m[1]]:['--detach',m[1]]); }
  if(R.heads[name]!=null){ if(R.head===name) return say(`Already on '${name}'`); moveTo(R,R.heads[name],name); say(`Switched to branch '${name}'`); const t=track(R,name); if(t) say(trackMsg(t)); return; }
  const rk=Object.keys(R.rrefs).filter(k=>k.slice(k.indexOf('/')+1)===name);
  if(rk.length===1){ moveTo(R,R.rrefs[rk[0]],name,true); const [rm]=rk[0].split('/'); R.upstream[name]={remote:rm,merge:name}; say(`branch '${name}' set up to track '${rk[0]}'.\nSwitched to a new branch '${name}'`); return; }
  if(R.tags[name]) die(`fatal: a branch is expected, got tag '${name}'\nhint: If you want to detach HEAD at the commit, try again with the --detach option.`);
  if(rev(R,name)) die(`fatal: a branch is expected, got commit '${name}'\nhint: If you want to detach HEAD at the commit, try again with the --detach option.`);
  die(`fatal: invalid reference: ${name}`); },
 branch(a){ const R=needRepo(); const {f,args}=P(a,'u,set-upstream-to'); const vv=a.includes('-vv'), h=headHash(R);
  if(f.d||f.D||f.delete){ for(const n of args){ if(R.heads[n]==null) die(`error: branch '${n}' not found`);
      if(n===R.head) die(`error: cannot delete branch '${n}' used by worktree at '${R.root}'`);
      if(!f.D&&!f.force){ const u=R.upstream[n], ref=u&&R.rrefs[u.remote+'/'+u.merge]!=null?R.rrefs[u.remote+'/'+u.merge]:h;
        if(!isAnc(R.heads[n],ref)) die(`error: the branch '${n}' is not fully merged.\nIf you are sure you want to delete it, run 'git branch -D ${n}'`); }
      say(`Deleted branch ${n} (was ${R.heads[n]}).`); delete R.heads[n]; delete R.upstream[n]; } return; }
  if(f.m||f.M){ const [o,nw]=args.length>1?args:[R.head,args[0]]; if(!nw) die('fatal: branch name required');
    if(R.heads[o]==null&&o!==R.head) die(`error: refname refs/heads/${o} not found\nfatal: Branch rename failed`);
    if(R.heads[nw]!=null&&!f.M) die(`fatal: a branch named '${nw}' already exists`);
    if(R.heads[o]!=null){ R.heads[nw]=R.heads[o]; if(nw!==o) delete R.heads[o]; } if(R.upstream[o]){ R.upstream[nw]=R.upstream[o]; if(nw!==o) delete R.upstream[o]; } if(R.head===o) R.head=nw; return; }
  if(f.u||f['set-upstream-to']){ const up=f.u||f['set-upstream-to'], b=args[0]||R.head; if(R.rrefs[up]==null) die(`fatal: the requested upstream branch '${up}' does not exist`); const [rm,...m]=up.split('/'); R.upstream[b]={remote:rm,merge:m.join('/')}; return say(`branch '${b}' set up to track '${up}'.`); }
  if(args.length&&!f.merged&&!f['no-merged']){ const [n,s]=args; if(R.heads[n]!=null) die(`fatal: a branch named '${n}' already exists`);
    if(!/^[\w.\/-]+$/.test(n)) die(`fatal: '${n}' is not a valid branch name`);
    const st=rev(R,s||'HEAD'); if(!st) die(`fatal: not a valid object name: '${s||R.head}'`); R.heads[n]=st;
    if(s&&R.rrefs[s]!=null){ const [rm,...m]=s.split('/'); R.upstream[n]={remote:rm,merge:m.join('/')}; say(`branch '${n}' set up to track '${s}'.`); } return; }
  const L=[];
  if(!f.r){ if(!R.head&&h) L.push(['* ',`(HEAD detached at ${h})`,h]);
    Object.keys(R.heads).sort().forEach(b=>{ if(f.merged&&!isAnc(R.heads[b],h)) return; if(f['no-merged']&&isAnc(R.heads[b],h)) return; L.push([b===R.head?'* ':'  ',b,R.heads[b]]); }); }
  if(f.a||f.r) Object.keys(R.rrefs).sort().forEach(k=>L.push(['  ',(f.a?'remotes/':'')+k,R.rrefs[k],true]));
  const w=Math.max(0,...L.map(l=>l[1].length));
  L.forEach(([m,b,hh,rm])=>{ let s=m+b; if(f.v||vv){ const t=vv&&!rm&&R.upstream[b]?track(R,b):null;
      s=m+b.padEnd(w)+' '+hh+' '+(t?`[${t.name}${t.gone?': gone':t.ahead||t.behind?': '+[t.ahead?'ahead '+t.ahead:'',t.behind?'behind '+t.behind:''].filter(Boolean).join(', '):''}] `:'')+first(E.C[hh].msg); }
    say(s,m==='* '?'ok':rm?'rd':''); }); },
 merge(a){ const R=needWT(); const {f,args}=P(a,'X,m,s,strategy-option');
  if(f.abort){ if(!R.op||R.op.type!=='merge') die('fatal: There is no merge to abort (MERGE_HEAD missing).'); hardTo(R,headHash(R)); R.op=null; return; }
  if(f.continue){ if(!R.op||R.op.type!=='merge') die('fatal: There is no merge in progress (MERGE_HEAD missing).'); return G.commit(['--no-edit']); }
  if(R.op) die(Object.keys(R.conf).length?"error: Merging is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add/rm <file>'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.":'fatal: You have not concluded your merge (MERGE_HEAD exists).\nPlease, commit your changes before you merge.');
  const name=args[0]; if(!name) die('fatal: No remote for the current branch.');
  const th=rev(R,name); if(!th) die(`merge: ${name} - not something we can merge`);
  doMerge(R,th,name,{X:f.X||f['strategy-option'],noff:f['no-ff'],ffonly:f['ff-only'],msg:f.m,unrelated:f['allow-unrelated-histories']}); },
 remote(a){ const R=needRepo(); const [cmd,...r]=a;
  if(!cmd||cmd==='-v'||cmd==='--verbose') return say(Object.entries(R.remotes).map(([n,u])=>cmd?`${n}\t${u} (fetch)\n${n}\t${u} (push)`:n).join('\n'));
  const [n,u]=r;
  if(cmd==='add'){ if(!n||!u) die('usage: git remote add <name> <url>'); if(R.remotes[n]!=null) die(`error: remote ${n} already exists.`); R.remotes[n]=u; return; }
  if(R.remotes[n]==null) die(`error: No such remote: '${n}'`);
  if(cmd==='remove'||cmd==='rm'){ delete R.remotes[n]; for(const k of Object.keys(R.rrefs)) if(k.startsWith(n+'/')) delete R.rrefs[k]; for(const b in R.upstream) if(R.upstream[b].remote===n) delete R.upstream[b]; return; }
  if(cmd==='rename'){ if(!u) die('usage: git remote rename <old> <new>'); if(R.remotes[u]!=null) die(`error: remote ${u} already exists.`); R.remotes[u]=R.remotes[n]; delete R.remotes[n];
    for(const k of Object.keys(R.rrefs)) if(k.startsWith(n+'/')){ R.rrefs[u+k.slice(n.length)]=R.rrefs[k]; delete R.rrefs[k]; } for(const b in R.upstream) if(R.upstream[b].remote===n) R.upstream[b].remote=u; return; }
  if(cmd==='set-url'){ if(!u) die('usage: git remote set-url <name> <newurl>'); R.remotes[n]=u; return; }
  if(cmd==='get-url') return say(R.remotes[n]);
  die(`error: unknown subcommand: \`${cmd}'`); },
 clone(a){ const {f,args}=P(a,'depth,b,branch,o'); const url=args[0]; if(!url) die('fatal: You must specify a repository to clone.');
  const name=args[1]||basename(url).replace(/\.git$/,''), dir=abs(name);
  if(isFile(dir)||(isDir(dir)&&children(dir).length)) die(`fatal: destination path '${name}' already exists and is not an empty directory.`);
  const S=repoByUrl(url,E.cwd);
  say(`Cloning into ${f.bare?'bare repository ':''}'${name}'...`);
  if(!S) die(isGHurl(url)?'ERROR: Repository not found.\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.':`fatal: repository '${url}' does not exist`);
  httpsAuth(url);
  if(f.bare){ const R=newRepo(dir,true,S.head); R.heads={...S.heads}; for(const t in S.tags) R.tags[t]={...S.tags[t]}; return say('done.'); }
  const R=newRepo(dir,false,S.head); R.remotes.origin=isGHurl(url)||/^[\w.-]+@/.test(url)?url:S.root;
  for(const [b,h] of Object.entries(S.heads)) R.rrefs['origin/'+b]=h; for(const t in S.tags) R.tags[t]={...S.tags[t]};
  const def=f.b||f.branch||S.head; R.head=def; R.upstream[def]={remote:'origin',merge:def};
  if(S.heads[def]==null){ hint('warning: You appear to have cloned an empty repository.'); return; }
  R.heads[def]=S.heads[def]; checkoutTree(R,tree(S.heads[def]),{}); R.reflog.unshift({h:S.heads[def],msg:`clone: from ${url}`});
  say(`remote: Enumerating objects: ${anc(S.heads[def]).size*3}, done.\nReceiving objects: 100%, done.`); },
 fetch(a){ const R=needRepo(); const {f,args}=P(a); const names=f.all?Object.keys(R.remotes):[args[0]||(R.head&&R.upstream[R.head]||{}).remote||'origin'];
  names.forEach(n=>fetchRemote(R,n,f.prune||f.p)); },
 pull(a){ const R=needWT(); const {f,args}=P(a,'X,strategy-option'); let remote=args[0], br=args[1];
  if(!remote){ const u=R.head&&R.upstream[R.head];
    if(!u) die(`There is no tracking information for the current branch.\nPlease specify which branch you want to merge with.\nSee git-pull(1) for details.\n\n    git pull <remote> <branch>\n\nIf you wish to set tracking information for this branch you can do so with:\n\n    git branch --set-upstream-to=origin/<branch> ${R.head}\n`);
    remote=u.remote; br=u.merge; }
  if(!br){ const u=R.upstream[R.head]; br=u&&u.remote===remote?u.merge:R.head; }
  const url=R.remotes[remote]; fetchRemote(R,remote);
  const th=R.rrefs[remote+'/'+br]; if(th==null) die(`fatal: couldn't find remote ref ${br}`);
  const h=headHash(R);
  if(!h) return doMerge(R,th,`${remote}/${br}`);
  if(isAnc(th,h)) return say('Already up to date.');
  const reb=f.rebase||(!f['no-rebase']&&getCfg(R,'pull.rebase')==='true');
  if(!isAnc(h,th)&&!reb&&!f['no-rebase']&&!f['ff-only']&&getCfg(R,'pull.rebase')==null&&getCfg(R,'pull.ff')==null)
    die("hint: You have divergent branches and need to specify how to reconcile them.\nhint: You can do so by running one of the following commands sometime before\nhint: your next pull:\nhint:\nhint:   git config pull.rebase false  # merge\nhint:   git config pull.rebase true   # rebase\nhint:   git config pull.ff only       # fast-forward only\nhint:\nhint: You can replace \"git config\" with \"git config --global\" to set a default\nhint: preference for all repositories.\nfatal: Need to specify how to reconcile divergent branches.");
  if(reb){ if(dirtyPaths(R).size) die('error: cannot pull with rebase: You have unstaged changes.\nerror: Please commit or stash them.');
    if(isAnc(h,th)) return doMerge(R,th,`${remote}/${br}`);
    return startRebase(R,th,commitsToReplay(h,th).map(x=>({cmd:'pick',h:x})),`${remote}/${br}`); }
  doMerge(R,th,`${remote}/${br}`,{msg:`Merge branch '${br}' of ${url}`,X:f.X||f['strategy-option'],ffonly:f['ff-only'],unrelated:f['allow-unrelated-histories']}); },
 push(a){ const R=needRepo(); const {f,args}=P(a); const setU=f.u||f['set-upstream']; let remote=args[0], specs=args.slice(1);
  if(!remote){ const u=R.head&&R.upstream[R.head];
    if(!u){ if(!Object.keys(R.remotes).length) die('fatal: No configured push destination.\nEither specify the URL from the command-line or configure a remote repository using\n\n    git remote add <name> <url>\n\nand then push using the remote name\n\n    git push <name>');
      die(`fatal: The current branch ${R.head} has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin ${R.head}\n`); }
    remote=u.remote; specs=[R.head+':'+u.merge]; }
  const {S,url}=remoteRepo(R,remote); httpsAuth(url);
  const ok=[], errs=[], after=[]; let hintTxt='';
  if(f.delete||f.d){ for(const n of specs){ if(S.heads[n]!=null){ delete S.heads[n]; delete R.rrefs[remote+'/'+n]; ok.push(` - [deleted]         ${n}`); } else if(S.tags[n]){ delete S.tags[n]; ok.push(` - [deleted]         ${n}`); } else errs.push(`error: unable to delete '${n}': remote ref does not exist`); }
    if(ok.length) say(`To ${url}\n${ok.join('\n')}`); if(errs.length) die(errs.join('\n')+`\nerror: failed to push some refs to '${url}'`); return; }
  if(f.tags) Object.keys(R.tags).forEach(t=>specs.push('refs/tags/'+t));
  if(!specs.length){ if(!R.head||R.heads[R.head]==null) die(`error: src refspec ${R.head} does not match any`); specs=[R.head]; }
  for(const sp of specs){ let [src,dst]=sp.replace(/^\+/,'').split(':'); dst=dst||src;
    const tagName=src.startsWith('refs/tags/')?src.slice(10):R.heads[src]==null&&R.tags[src]?src:null;
    if(tagName){ if(!R.tags[tagName]) die(`error: src refspec ${src} does not match any`); if(!S.tags[tagName]){ S.tags[tagName]={...R.tags[tagName]}; ok.push(` * [new tag]         ${tagName} -> ${tagName}`); } continue; }
    const h=rev(R,src); if(!h) die(`error: src refspec ${src} does not match any\nerror: failed to push some refs to '${url}'`);
    const old=S.heads[dst];
    if(old===h){ if(setU&&R.heads[src]!=null){ R.upstream[src]={remote,merge:dst}; after.push(`branch '${src}' set up to track '${remote}/${dst}'.`); } continue; }
    const force=f.force||f.f||sp.startsWith('+'), lease=f['force-with-lease'];
    if(old!=null&&!isAnc(old,h)&&!force){
      if(lease){ if(R.rrefs[remote+'/'+dst]!==old){ errs.push(` ! [rejected]        ${src} -> ${dst} (stale info)`); continue; } }
      else { const known=[...Object.values(R.rrefs),...Object.values(R.heads)].some(x=>isAnc(old,x));
        errs.push(` ! [rejected]        ${src} -> ${dst} (${known?'non-fast-forward':'fetch first'})`);
        hintTxt=known?"\nhint: Updates were rejected because the tip of your current branch is behind\nhint: its remote counterpart. If you want to integrate the remote changes,\nhint: use 'git pull' before pushing again.":"\nhint: Updates were rejected because the remote contains work that you do not\nhint: have locally. This is usually caused by another repository pushing to\nhint: the same ref. If you want to integrate the remote changes, use\nhint: 'git pull' before pushing again."; continue; } }
    if(!S.bare&&S.head===dst){ errs.push(` ! [remote rejected] ${src} -> ${dst} (branch is currently checked out)`); continue; }
    if(S.root.startsWith(GH+'/')){ const big=bigFile(R,h,S); if(big){ say(`remote: error: Trace: 3f1c2a9e\nremote: error: See https://gh.io/lfs for more information.\nremote: error: File ${big.p} is ${big.mb}.00 MB; this exceeds GitHub's file size limit of 100.00 MB\nremote: error: GH001: Large files detected. You may want to try Git Large File Storage - https://git-lfs.github.com.`,'e'); errs.push(` ! [remote rejected] ${src} -> ${dst} (pre-receive hook declined)`); continue; } }
    S.heads[dst]=h; R.rrefs[remote+'/'+dst]=h; if(S.heads[S.head]==null) S.head=dst;
    ok.push(old==null?` * [new branch]      ${src} -> ${dst}`:!isAnc(old,h)?` + ${old}...${h} ${src} -> ${dst} (forced update)`:`   ${old}..${h}  ${src} -> ${dst}`);
    if(setU&&R.heads[src]!=null){ R.upstream[src]={remote,merge:dst}; after.push(`branch '${src}' set up to track '${remote}/${dst}'.`); } }
  if(!ok.length&&!errs.length) say('Everything up-to-date');
  if(ok.length||errs.length) say(`To ${url}`); if(ok.length) say(ok.join('\n')); if(after.length) say(after.join('\n'));
  if(errs.length) die(errs.join('\n')+`\nerror: failed to push some refs to '${url}'`+hintTxt); },
 reset(a){ const R=needWT(); const {f,args,pp}=P(a); const mode=f.hard?'hard':f.soft?'soft':'mixed';
  let target='HEAD', paths=[...pp]; args.forEach((x,i)=>{ if(i===0&&rev(R,x)&&!(x in wt(R))) target=x; else paths.push(x); });
  if(paths.length){ const t=tree(rev(R,target)); for(const s of paths){ const rel=relArg(R,s); union(t,R.index).filter(p=>p===rel||p.startsWith(rel+'/')).forEach(p=>{ if(p in t) R.index[p]=t[p]; else delete R.index[p]; }); }
    const W=wt(R), ch=Object.keys(R.index).filter(p=>W[p]!==R.index[p]); if(ch.length) say('Unstaged changes after reset:\n'+ch.map(p=>(p in W?'M':'D')+'\t'+p).join('\n')); return; }
  const h=rev(R,target); if(!h) die(badRev(target));
  if(mode==='hard'){ hardTo(R,h); R.op=null; }
  if(R.head) R.heads[R.head]=h; else R.detached=h; R.reflog.unshift({h,msg:`reset: moving to ${target}`});
  if(mode==='mixed'){ R.index={...tree(h)}; R.conf={}; if(R.op&&R.op.type!=='rebase') R.op=null; const W=wt(R), ch=union(R.index).filter(p=>W[p]!==R.index[p]); if(ch.length) say('Unstaged changes after reset:\n'+ch.map(p=>(p in W?'M':'D')+'\t'+p).join('\n')); }
  if(mode==='hard') say(`HEAD is now at ${h} ${first(E.C[h].msg)}`); },
 revert(a){ const R=needWT(); const {f,args}=P(a,'m');
  if(f.continue) return opContinue(R,'revert'); if(f.abort) return opAbort(R,'revert');
  if(R.op) die('error: a cherry-pick or revert is already in progress\nhint: try "git revert (--continue | --abort)"');
  if(!args.length) die('usage: git revert [<options>] <commit-ish>...'); const h=rev(R,args[0]); if(!h) die(`fatal: bad revision '${args[0]}'`); const c=E.C[h];
  if(c.parents.length>1&&!f.m) die(`error: commit ${h} is a merge but no -m option was given.\nfatal: revert failed`);
  if(!c.parents.length) die('error: cannot revert a root commit in this simulator');
  pick(R,{type:'revert',base:c.tree,theirs:tree(c.parents[+f.m?+f.m-1:0]),label:`parent of ${h} (${first(c.msg)})`,msg:`Revert "${first(c.msg)}"\n\nThis reverts commit ${h}.`,src:h,subject:c.msg,edit:!f['no-edit']}); },
 'cherry-pick'(a){ const R=needWT(); const {f,args}=P(a);
  if(f.continue) return opContinue(R,'cherry-pick'); if(f.abort) return opAbort(R,'cherry-pick');
  if(R.op) die('error: a cherry-pick or revert is already in progress\nhint: try "git cherry-pick (--continue | --abort)"');
  if(!args.length) die('usage: git cherry-pick [<options>] <commit-ish>...');
  for(const x of args){ const h=rev(R,x); if(!h) die(`fatal: bad revision '${x}'`); const c=E.C[h]; if(c.parents.length>1) die(`error: commit ${h} is a merge but no -m option was given.`);
    pick(R,{type:'cherry-pick',base:tree(c.parents[0]),theirs:c.tree,label:`${h} (${first(c.msg)})`,msg:c.msg,src:h,subject:c.msg,author:{name:c.author,email:c.email},edit:f.e||f.edit}); } },
 rebase(a){ const R=needWT(); const {f,args}=P(a,'onto');
  if(f.continue){ const op=R.op; if(!op||op.type!=='rebase') die('fatal: No rebase in progress?');
    if(Object.keys(R.conf).length) die('error: you must edit all merge conflicts and then\nmark them as resolved using git add');
    const s=op.cur; op.cur=null; if(s&&!same(R.index,tree(headHash(R)))){ if(!finishStep(R,s,true)) return; } return rebaseStep(R); }
  if(f.abort){ const op=R.op; if(!op||op.type!=='rebase') die('fatal: No rebase in progress?'); R.head=op.branch; R.detached=null; hardTo(R,op.orig); R.heads[op.branch]=op.orig; R.op=null; return; }
  if(f.skip){ const op=R.op; if(!op||op.type!=='rebase') die('fatal: No rebase in progress?'); hardTo(R,headHash(R)); op.cur=null; return rebaseStep(R); }
  if(R.op) die('fatal: It seems that there is already a rebase-merge directory, and\nI wonder if you are in the middle of another rebase.\n\n\tgit rebase (--continue | --abort | --skip)');
  if(!R.head) die('fatal: You are not currently on a branch.');
  const up=args[0]||(R.upstream[R.head]&&R.upstream[R.head].remote+'/'+R.upstream[R.head].merge); if(!up) die('fatal: There is no tracking information for the current branch.');
  const uh=rev(R,up); if(!uh) die(`fatal: invalid upstream '${up}'`);
  if(dirtyPaths(R).size) die('error: cannot rebase: You have unstaged changes.\nerror: Please commit or stash them.');
  const h=headHash(R), todo=commitsToReplay(h,uh);
  if(f.i||f.interactive){ if(!todo.length) die('error: nothing to do');
    return edit(todo.map(x=>`pick ${x} ${first(E.C[x].msg)}`).join('\n')+'\n'+TODO_HELP,txt=>{ const steps=parseTodo(txt); if(!steps.length) return say('Nothing to do'); startRebase(R,uh,steps,up,true); },'git-rebase-todo'); }
  if(isAnc(uh,h)) return say(`Current branch ${R.head} is up to date.`);
  if(isAnc(h,uh)){ const oldT=tree(h); checkoutTree(R,tree(uh),oldT); setHead(R,uh,`rebase (finish): refs/heads/${R.head} onto ${uh}`); return say(`Successfully rebased and updated refs/heads/${R.head}.`); }
  startRebase(R,uh,todo.map(x=>({cmd:'pick',h:x})),up); },
 stash(a){ const R=needWT(); const sub=a[0]&&!a[0].startsWith('-')?a[0]:'push', rest=a[0]&&!a[0].startsWith('-')?a.slice(1):a; const {f,args}=P(rest,'m');
  const idx=()=>{ const m=(args[0]||'').match(/\{(\d+)\}/); return m?+m[1]:0; };
  if(sub==='push'||sub==='save'){ const h=headHash(R); if(!h) die('You do not have the initial commit yet'); const H=tree(h), W=wt(R);
    const dirty=[...dirtyPaths(R)], untr=f.u||f['include-untracked']?Object.keys(W).filter(p=>!(p in R.index)&&!(p in H)&&!ignored(R,p)):[];
    if(!dirty.length&&!untr.length) return say('No local changes to save');
    const ent={base:h,index:{...R.index},wt:{},untracked:{},msg:f.m||(sub==='save'&&args.length)?`On ${R.head}: ${f.m||args.join(' ')}`:`WIP on ${R.head}: ${h} ${first(E.C[h].msg)}`};
    for(const p of union(H,R.index)) if(p in W) ent.wt[p]=W[p];
    untr.forEach(p=>{ ent.untracked[p]=W[p]; rfile(R,p); });
    hardTo(R,h); R.stash.unshift(ent); return say(`Saved working directory and index state ${ent.msg}`); }
  if(sub==='list') return say(R.stash.map((s,i)=>`stash@{${i}}: ${s.msg}`).join('\n'));
  if(sub==='show'){ const s=R.stash[idx()]; if(!s) die('No stash entries found.'); return say(statText(tree(s.base),s.wt)); }
  if(sub==='drop'||sub==='clear'){ if(sub==='clear'){ R.stash=[]; return; } const i=idx(); if(!R.stash[i]) die('No stash entries found.'); R.stash.splice(i,1); return say(`Dropped refs/stash@{${i}} (${newHash()})`); }
  if(sub==='pop'||sub==='apply'){ const i=idx(), s=R.stash[i]; if(!s) die('No stash entries found.');
    const H=tree(headHash(R)), W=wt(R), B=tree(s.base);
    for(const p in s.untracked) if(p in W) die(`${p} already exists, no checkout\nerror: could not restore untracked files from stash`);
    const changed=union(B,s.wt,s.index).filter(p=>s.wt[p]!==B[p]||s.index[p]!==B[p]), d=dirtyPaths(R), bl=changed.filter(p=>d.has(p));
    if(bl.length) die(`error: Your local changes to the following files would be overwritten by merge:\n${bl.map(p=>'\t'+p).join('\n')}\nPlease commit your changes or stash them before you merge.\nAborting\nThe stash entry is kept in case you need it again.`);
    let conflict=false;
    for(const p of changed){ const r=merge3(B[p],H[p],s.wt[p],['Updated upstream','Stashed changes']);
      if(r.text==null){ rfile(R,p); delete R.index[p]; } else wfile(R,p,r.text);
      if(r.conflict){ conflict=true; R.conf[p]=true; say(`Auto-merging ${p}\nCONFLICT (content): Merge conflict in ${p}`); }
      else if(!(p in B)&&p in s.index) R.index[p]=r.text; }
    for(const p in s.untracked) wfile(R,p,s.untracked[p]);
    if(conflict){ hint('On branch '+R.head); die('The stash entry is kept in case you need it again.'); }
    statusLong(R); if(sub==='pop'){ R.stash.splice(i,1); say(`Dropped refs/stash@{${i}} (${newHash()})`); } return; }
  die(`error: unknown subcommand: ${sub}`); },
 tag(a){ const R=needRepo(); const {f,args}=P(a,'m');
  if(f.d){ for(const n of args){ if(!R.tags[n]) die(`error: tag '${n}' not found.`); say(`Deleted tag '${n}' (was ${R.tags[n].h})`); delete R.tags[n]; } return; }
  if(!args.length||f.l) return say(Object.keys(R.tags).sort().join('\n'));
  const [n,r]=args; if(R.tags[n]&&!f.f) die(`fatal: tag '${n}' already exists`);
  const h=rev(R,r||'HEAD'); if(!h) die(`fatal: Failed to resolve '${r||'HEAD'}' as a valid ref.`);
  const mk=m=>{ R.tags[n]={h,msg:m,tagger:`${ident(R).name} <${ident(R).email}>`,t:++E.t}; };
  if(f.a&&f.m==null) return edit('\n#\n# Escribe el mensaje de la etiqueta '+n+'\n',m=>{ m=cleanMsg(m); if(!m) die('fatal: no tag message?'); mk(m); },'TAG_EDITMSG');
  mk(f.m!=null?[].concat(f.m).join('\n\n'):null); },
 rm(a){ const R=needWT(); const {f,args,pp}=P(a); const specs=[...args,...pp]; if(!specs.length) die('usage: git rm [<options>] [--] <file>...');
  const W=wt(R), H=tree(headHash(R));
  for(const s of specs){ const rel=relArg(R,s), g=/[*?]/.test(s)?globRe(rel):null;
    const m=Object.keys(R.index).filter(p=>g?g.test(p)||g.test(basename(p)):rel===''||p===rel||p.startsWith(rel+'/'));
    if(!m.length) die(`fatal: pathspec '${s}' did not match any files`);
    if(m.some(p=>p!==rel)&&!g&&!f.r) die(`fatal: not removing '${s}' recursively without -r`);
    if(!f.cached&&!f.f){ const mod=m.filter(p=>p in W&&(W[p]!==R.index[p]||R.index[p]!==H[p])); if(mod.length) die(`error: the following file has local modifications:\n    ${mod.join('\n    ')}\n(use --cached to keep the file, or -f to force removal)`); }
    for(const p of m){ delete R.index[p]; if(!f.cached) rfile(R,p); say(`rm '${p}'`); } } },
 mv(a){ const R=needWT(); const {args}=P(a); if(args.length!==2) die('usage: git mv [<options>] <source>... <destination>');
  const src=relArg(R,args[0]); let dst=relArg(R,args[1]); if(isDir(R.root+'/'+dst)) dst=(dst?dst+'/':'')+basename(src);
  if(!(src in R.index)) die(`fatal: not under version control, source=${src}, destination=${dst}`);
  if(isFile(R.root+'/'+dst)) die(`fatal: destination exists, source=${src}, destination=${dst}`);
  const c=E.files[R.root+'/'+src]; if(c==null) die(`fatal: bad source, source=${src}, destination=${dst}`);
  rfile(R,src); wfile(R,dst,c); R.index[dst]=R.index[src]; delete R.index[src]; },
 clean(a){ const R=needWT(); const {f}=P(a); if(!f.n&&!f.f) die('fatal: clean.requireForce defaults to true and neither -i, -n, nor -f given; refusing to clean');
  const W=wt(R), idx=Object.keys(R.index), items=new Set();
  for(const p of Object.keys(W).sort()){ if(p in R.index||(!f.x&&ignored(R,p))) continue;
    const top=p.includes('/')?p.split('/')[0]:null;
    if(top&&!idx.some(q=>q.startsWith(top+'/'))){ if(f.d) items.add(top+'/'); } else items.add(p); }
  for(const it of items){ if(f.n) say('Would remove '+it); else { say('Removing '+it); rmPath(R.root+'/'+it.replace(/\/$/,'')); } } },
 reflog(a){ const R=needRepo(); const D=decos(R); say(R.reflog.slice(0,30).map((r,i)=>`${r.h}${i===0&&D[r.h]?' ('+D[r.h].join(', ')+')':''} HEAD@{${i}}: ${r.msg}`).join('\n')); },
 blame(a){ const R=needWT(); const {args,pp}=P(a); const p=relArg(R,(pp[0]||args[0]||'')); let h=headHash(R); const cur=tree(h)[p];
  if(cur==null) die(`fatal: no such path '${p}' in HEAD`);
  const chain=[]; for(let x=h;x;x=E.C[x].parents[0]) chain.push(E.C[x]);
  lines(cur).forEach((l,i)=>{ let who=chain[0]; for(const c of chain){ if(lines(c.tree[p]).includes(l)) who=c; else break; }
    say(`${who.h} (${who.author.padEnd(8)} 2026-11-18 ${String(i+1).padStart(2)}) ${l}`); }); },
 'check-ignore'(a){ const R=needWT(); const {f,args}=P(a); let any=false;
  for(const s of args){ const p=relArg(R,s); if(p in R.index) continue; const r=ignored(R,p); if(r){ any=true; say(f.v?`.gitignore:${r.n}:${r.l}\t${s}`:s); } }
  if(!any) die(''); },
 'ls-files'(){ const R=needWT(); say(Object.keys(R.index).sort().join('\n')); },
 lfs(a){ const R=a[0]==='install'?null:needWT(); const [cmd,...r]=a;
  if(cmd==='install'){ E.lfs=true; return say('Updated Git hooks.\nGit LFS initialized.'); }
  if(cmd==='track'){ const at=R.root+'/.gitattributes';
    if(!r.length) return say('Listing tracked patterns\n'+lfsPats({'.gitattributes':E.files[at]||''}).map(p=>`    ${p} (.gitattributes)`).join('\n'));
    r.forEach(p=>{ const cur=E.files[at]||''; if(!cur.split('\n').some(l=>l.startsWith(p+' '))) write(at,cur+`${p} filter=lfs diff=lfs merge=lfs -text\n`); say(`Tracking "${p}"`); }); return; }
  if(cmd==='ls-files'){ const T=tree(headHash(R)), pats=lfsPats(T); return say(Object.keys(T).filter(p=>lfsMatch(pats,p)).map(p=>`${newHash().slice(0,10)} * ${p}`).join('\n')); }
  if(cmd==='migrate') die('git lfs migrate reescribe el historial: no está incluido en este simulador.');
  die(`Error: unknown command "${cmd}" for "git-lfs"`); }
};
G['--version']=G.version;
function moveTo(R,h,branch,create){ const oldT=tree(headHash(R)), newT=tree(h); guardLocal(R,oldT,newT,'checkout');
  checkoutTree(R,newT,oldT); const from=R.head||headHash(R); if(create) R.heads[branch]=h;
  R.head=branch; R.detached=branch?null:h; R.reflog.unshift({h,msg:`checkout: moving from ${from} to ${branch||h}`}); }
function edit(text,cb,title){ E.edit={text,cb,title}; }

/* ════════════════ shell ════════════════ */
const SH={
 help(){ say(HELP); }, clear(){ E.clearReq=true; }, pwd(){ say(E.cwd); },
 cd(a){ const p=abs(a[0]||'~'); if(!isDir(p)) die(`bash: cd: ${a[0]}: No such file or directory`); E.cwd=p; },
 ls(a){ const fl=a.filter(x=>/^-/.test(x)).join(''), all=fl.includes('a'), long=fl.includes('l'); const ps=a.filter(x=>!/^-/.test(x)); if(!ps.length) ps.push('.');
  const res=[];
  for(const x of ps){ const p=abs(x); if(isFile(p)){ res.push(long?`-rw-r--r-- 1 alumno alumno ${String(E.files[p].length).padStart(5)} nov 18 ${x}`:x); continue; }
    if(!isDir(p)) die(`ls: cannot access '${x}': No such file or directory`);
    let ch=children(p).filter(n=>all||!n.startsWith('.')); if(all) ch=['.','..',...ch];
    if(ps.length>1) res.push(x+':');
    const nm=n=>isDir(p+'/'+n)&&n!=='.'&&n!=='..'?n+'/':n;
    res.push(long?ch.map(n=>(isDir(p==='/'?'/'+n:p+'/'+n)?'drwxr-xr-x':'-rw-r--r--')+` 1 alumno alumno ${String((E.files[p+'/'+n]||'').length).padStart(5)} nov 18 ${nm(n)}`).join('\n'):ch.map(nm).join('  ')); }
  say(res.filter(Boolean).join('\n'),'dc'); },
 mkdir(a){ const p=a.includes('-p'); for(const x of a.filter(x=>!/^-/.test(x))){ const d=abs(x);
    if(isDir(d)||isFile(d)){ if(!p) die(`mkdir: cannot create directory '${x}': File exists`); continue; }
    if(!p&&!isDir(dirname(d))) die(`mkdir: cannot create directory '${x}': No such file or directory`); mkdirp(d); } },
 touch(a){ for(const x of a){ const p=abs(x); if(!isDir(dirname(p))) die(`touch: cannot touch '${x}': No such file or directory`); if(!isFile(p)) E.files[p]=''; } },
 echo(a){ let n=false, e=false; while(a[0]==='-n'||a[0]==='-e'){ if(a[0]==='-n') n=true; else e=true; a=a.slice(1); }
  let s=a.join(' '); if(e) s=s.replace(/\\n/g,'\n').replace(/\\t/g,'\t'); put(s+(n?'':'\n')); },
 printf(a){ if(a[0]==='--') a=a.slice(1); let i=1; const s=(a[0]||'').replace(/%s/g,()=>a[i++]||'').replace(/\\n/g,'\n').replace(/\\t/g,'\t').replace(/\\r/g,'\r'); put(s); },
 cat(a){ const fs=a.filter(x=>x!=='-'); if(!fs.length){ put(E.stdin||''); return; }
  for(const x of fs){ const p=abs(x); if(isDir(p)) die(`cat: ${x}: Is a directory`); if(!isFile(p)) die(`cat: ${x}: No such file or directory`); put(E.files[p]); } },
 rm(a){ const fl=a.filter(x=>/^-/.test(x)).join(''), r=/r/i.test(fl), f=fl.includes('f');
  for(const x of a.filter(x=>!/^-/.test(x))){ const p=abs(x); if(isDir(p)){ if(!r) die(`rm: cannot remove '${x}': Is a directory`); if(E.repos[p]) delete E.repos[p]; for(const k of Object.keys(E.repos)) if(k.startsWith(p+'/')) delete E.repos[k]; rmPath(p); }
    else if(isFile(p)) delete E.files[p]; else if(!f) die(`rm: cannot remove '${x}': No such file or directory`); } },
 mv(a){ const [s,d]=a.filter(x=>!/^-/.test(x)); if(!d) die('mv: missing destination file operand'); const sp=abs(s); let dp=abs(d); if(isDir(dp)) dp+='/'+basename(sp);
  if(isFile(sp)){ write(dp,E.files[sp]); delete E.files[sp]; return; }
  if(!isDir(sp)) die(`mv: cannot stat '${s}': No such file or directory`);
  for(const f of Object.keys(E.files)) if(f.startsWith(sp+'/')){ write(dp+f.slice(sp.length),E.files[f]); delete E.files[f]; }
  for(const x of [...E.dirs]) if(x===sp||x.startsWith(sp+'/')){ E.dirs.delete(x); mkdirp(dp+x.slice(sp.length)); }
  if(E.repos[sp]){ E.repos[dp]=E.repos[sp]; E.repos[dp].root=dp; delete E.repos[sp]; } },
 cp(a){ const [s,d]=a.filter(x=>!/^-/.test(x)); const sp=abs(s); let dp=abs(d||''); if(!isFile(sp)) die(`cp: cannot stat '${s}': No such file or directory`); if(isDir(dp)) dp+='/'+basename(sp); write(dp,E.files[sp]); },
 sed(a){ const inPlace=a.includes('-i'), r=a.filter(x=>x!=='-i'&&x!=='-e'), ex=r[0]||'';
  const m=ex.match(/^s(.)(.*?)\1(.*?)\1(g?)$/); if(!m) die(`sed: -e expression #1: comando no soportado en el simulador (solo s/patrón/reemplazo/)`);
  const re=new RegExp(m[2].replace(/\\r/g,'\r').replace(/\\([(){}+?|])/g,'$1'),m[4]), rep=m[3].replace(/\$/g,'$$$$').replace(/&/g,'$$&');
  for(const x of r.slice(1)){ const p=abs(x); if(!isFile(p)) die(`sed: can't read ${x}: No such file or directory`);
    const out=E.files[p].split('\n').map(l=>l.replace(re,rep)).join('\n'); if(inPlace) E.files[p]=out; else put(out); } },
 nano(a){ const x=a.filter(v=>!/^-/.test(v))[0]; if(!x) die('nano: indica el archivo que quieres editar'); const p=abs(x);
  if(isDir(p)) die(`nano: ${x} es una carpeta`); if(!isDir(dirname(p))) die(`nano: ${x}: No such file or directory`);
  edit(E.files[p]||'',t=>{ E.files[p]=t; },'nano '+x); },
 file(a){ for(const x of a){ const p=abs(x); if(isDir(p)){ say(`${x}: directory`); continue; } if(!isFile(p)){ say(`${x}: cannot open \`${x}' (No such file or directory)`); continue; }
    const c=E.files[p]; say(`${x}: ${c===''?'empty':(/^#!.*(ba)?sh/.test(c)?'Bourne-Again shell script, ASCII text executable':'ASCII text')+(/\r\n/.test(c)?', with CRLF line terminators':'')}`); } },
 dos2unix(a){ for(const x of a){ const p=abs(x); if(!isFile(p)) die(`dos2unix: ${x}: No such file or directory`); E.files[p]=E.files[p].replace(/\r\n/g,'\n'); say(`dos2unix: converting file ${x} to Unix format...`,'m'); } },
 sudo(a){ return runWords(a); }, chown(){}, chmod(){},
 eval(a){ if(/ssh-agent/.test(a.join(' '))) return SH['ssh-agent'](); },
 'ssh-agent'(){ E.agentOn=true; say('Agent pid 4242'); },
 'ssh-keygen'(a){ const {f}=P(a,'t,C,f,N,b'); const t=f.t||'rsa', file=f.f?abs(f.f):`${HOME}/.ssh/id_${t}`;
  say(`Generating public/private ${t} key pair.\nEnter file in which to save the key (${file}): \nEnter passphrase (empty for no passphrase): \nEnter same passphrase again: \nYour identification has been saved in ${file}\nYour public key has been saved in ${file}.pub\nThe key fingerprint is:\nSHA256:q8V0m3c1f9Tz4a7KxR2u ${f.C||'alumno@aula'}`);
  write(file,'-----BEGIN OPENSSH PRIVATE KEY-----\n(clave privada simulada: no la compartas nunca)\n-----END OPENSSH PRIVATE KEY-----\n'); write(file+'.pub',`ssh-${t} AAAAC3NzaC1lZDI1NTE5AAAAIGs1mUl4d0r ${f.C||'alumno@aula'}\n`); },
 'ssh-add'(a){ const x=a.filter(v=>!/^-/.test(v))[0]||'~/.ssh/id_ed25519', p=abs(x);
  if(!E.agentOn) die('Could not open a connection to your authentication agent.');
  if(!isFile(p)) die(`${x}: No such file or directory`);
  if(p.endsWith('.pub')) die(`Error loading key "${x}": invalid format\n(ssh-add necesita la clave PRIVADA, sin .pub)`);
  E.agent.push(p); say(`Identity added: ${x} (${(E.files[p+'.pub']||'').trim().split(' ')[2]||'alumno@aula'})`); },
 ssh(a){ const host=a.filter(v=>!/^-/.test(v))[0]||'';
  if(!/github\.com/.test(host)) die(`ssh: connect to host ${host.replace(/^.*@/,'')} port 22: Connection timed out (simulador: solo github.com)`);
  if(!E.agent.length&&!Object.keys(E.files).some(f=>/\/\.ssh\/id_\w+$/.test(f))) die('git@github.com: Permission denied (publickey).');
  hint('# (simulado: se supone que ya has pegado la clave pública en GitHub → Settings → SSH and GPG keys)'); say("Hi usuario! You've successfully authenticated, but GitHub does not provide shell access."); },
 history(){ say(E.hist.map((h,i)=>String(i+1).padStart(4)+'  '+h.cmd).join('\n')); },
 git(a){ const sub=a[0]; if(!sub||sub==='--help') return G.help(); const g=G[sub]; if(!g) die(`git: '${sub}' is not a git command. See 'git --help'.`); return g(a.slice(1)); }
};
SH.vim=SH.vi=SH.code=SH.notepad=SH.nano;
const HELP=`Terminal simulada (Git 2.43 en memoria; nada sale de tu navegador).
  Archivos: ls, cd, pwd, mkdir, touch, cat, echo, printf, rm, mv, cp, sed -i 's/a/b/', nano (editor), file, dos2unix
  Git:      init, config, status, add, commit, log, show, diff, restore, rm, mv, clean, reset, revert,
            branch, switch, checkout, merge, rebase (-i), cherry-pick, stash, tag, reflog, blame,
            remote, clone, fetch, pull, push, check-ignore, ls-files, lfs
  Otros:    ssh-keygen, ssh-agent, ssh-add, ssh -T, history, clear
  Teclas:   ↑/↓ historial · Tab completa · Ctrl+L limpia · Ctrl+C cancela la línea
  GitHub simulado: git@github.com:usuario/<repo>.git  (o https://github.com/usuario/<repo>.git)`;
const GITHELP=`usage: git <command> [<args>]\n\n${HELP}`;

function expand(t){ if(t.q||!/[*?]/.test(t.v)) return [t.v];
  const dir=t.v.includes('/')?t.v.replace(/\/[^/]*$/,''):'', pat=t.v.slice(dir?dir.length+1:0), re=globRe(pat), d=abs(dir||'.');
  const m=children(d).filter(n=>re.test(n)&&(pat.startsWith('.')||!n.startsWith('.'))).map(n=>dir?dir+'/'+n:n);
  return m.length?m:[t.v]; }
function runWords(words){ const f=SH[words[0]]; if(!f) die(`bash: ${words[0]}: command not found`); return f(words.slice(1)); }
function runSimple(toks){ const words=[]; let redir=null, pipe=false;
  for(let i=0;i<toks.length;i++){ const t=toks[i];
    if(t.op==='>'||t.op==='>>'){ const nx=toks[++i]; if(!nx||nx.op) die('bash: syntax error near unexpected token `newline\''); redir={append:t.op==='>>',file:nx.v}; }
    else if(t.op==='<<'){ i++; }
    else if(t.op==='<'){ i++; }
    else if(t.op==='|'){ pipe=true; break; }
    else words.push(...expand(t)); }
  if(!words.length) return;
  if(pipe) hint('# (las tuberías | no están simuladas: se muestra solo el primer comando)');
  if(redir){ const p=abs(redir.file); if(isDir(p)) die(`bash: ${redir.file}: Is a directory`); if(!isDir(dirname(p))) die(`bash: ${redir.file}: No such file or directory`); cap=''; }
  try{ runWords(words); } finally { if(redir){ const p=abs(redir.file), c=cap; cap=null; E.files[p]=(redir.append&&E.files[p]||'')+c; } } }
function runLine(line){ const T=tokenize(line); const segs=[[]], ops=[];
  for(const t of T){ if(t.op==='&&'||t.op==='||'||t.op===';'){ segs.push([]); ops.push(t.op); } else segs[segs.length-1].push(t); }
  let ok=true;
  segs.forEach((s,k)=>{ if(k>0&&((ops[k-1]==='&&'&&!ok)||(ops[k-1]==='||'&&ok))) return; if(!s.length) return;
    const entry={cmd:textOf(s),shape:shapeOf(s),ok:true};
    try{ runSimple(s); ok=true; }
    catch(e){ ok=false; entry.ok=false; if(e instanceof Fail){ E.lastErr=e.message; if(e.message) say(e.message,'e'); } else { say('error interno del simulador: '+e.message,'e'); if(typeof console!=='undefined') console.error(e); } }
    if(!E.quiet) E.hist.push(entry);
    if(E.edit) E.edit.entry=entry; });
  return ok; }
function guard(fn){ try{ fn(); } catch(e){ if(e instanceof Fail){ if(e.message) say(e.message,'e'); return false; } say('error interno del simulador: '+e.message,'e'); if(typeof console!=='undefined') console.error(e); return false; } return true; }

/* ── herramientas para preparar ejercicios ── */
const T={
 sh(c){ if(!runLine(c)) throw new Error(`preparación: "${c}" → ${E.lastErr}`); },
 put(p,c){ write(abs(p),c); },
 ci(msg,files){ for(const [p,c] of Object.entries(files)) c==null?T.sh(`rm -f ${p}`):T.put(p,c); T.sh('git add -A'); T.sh(`git commit -m "${msg}"`); },
 repo(dir,commits,o={}){ T.sh(`mkdir -p ${dir}`); T.sh(`cd ${dir}`); T.sh(`git init${o.b?' -b '+o.b:''}`); (commits||[]).forEach(c=>T.ci(...c)); },
 gh(owner,name,commits,o={}){ const url=`git@github.com:${owner}/${name}.git`; T.sh(`git init --bare ${GH}/${owner}/${name}.git${o.b?' -b '+o.b:''}`);
  if(commits&&commits.length){ const back=E.cwd; T.sh('mkdir -p /tmp/sim'); T.sh('cd /tmp/sim'); T.sh(`git clone ${url} w`); T.sh('cd w');
    T.sh(`git config user.name "${owner}"`); T.sh(`git config user.email "${owner}@ejemplo.com"`); commits.forEach(c=>T.ci(...c)); T.sh(`git push -u origin ${o.b||'main'}`); T.sh(`cd ${back}`); T.sh('rm -rf /tmp/sim'); }
  return url; },
 base(){ ['git config --global user.name "Alumno"','git config --global user.email "alumno@ejemplo.com"','git config --global init.defaultBranch main','git config --global core.editor nano','git config --global pull.rebase false','mkdir -p ~/practicas-git','cd ~/practicas-git'].forEach(T.sh); },
 equipo(){ T.sh('mkdir -p ~/practicas-git/equipo'); T.sh('cd ~/practicas-git/equipo'); T.sh('git init --bare servidor/proyecto.git');
  T.sh('git clone servidor/proyecto.git pc-ana'); T.sh('git clone servidor/proyecto.git pc-benat');
  T.sh('cd pc-ana'); T.sh('git config user.name "Ana"'); T.sh('git config user.email "ana@ejemplo.com"'); T.ci('Lista inicial',{'lista.txt':'Lista de la compra\n- pan\n'}); T.sh('git push -u origin main');
  T.sh('cd ../pc-benat'); T.sh('git config user.name "Beñat"'); T.sh('git config user.email "benat@ejemplo.com"'); T.sh('git pull'); },
 mark(k,ref='HEAD'){ E.mark[k]=rev(needRepo(),ref); }
};

/* ── API de comprobación (rutas relativas a ~/practicas-git) ── */
const at=p=>resolve(PRACT,p);
const A={
 env:E, mark:E.mark,
 repo:p=>E.repos[at(p)],
 gh:(o,n)=>E.repos[`${GH}/${o}/${n}.git`],
 br:(p,b)=>E.repos[at(p)].heads[b],
 head:p=>E.C[headHash(E.repos[at(p)])],
 tree:(p,r='HEAD')=>tree(rev(E.repos[at(p)],r)),
 treeOf:h=>tree(h),
 log:(p,r='HEAD')=>[...anc(rev(E.repos[at(p)],r))].map(h=>E.C[h]).sort((x,y)=>y.t-x.t),
 logOf:h=>[...anc(h)].map(x=>E.C[x]).sort((x,y)=>y.t-x.t),
 find:(p,re)=>A.log(p).find(c=>re.test(c.msg)),
 changed:c=>{ const pt=tree(c.parents[0]); return union(pt,c.tree).filter(p=>pt[p]!==c.tree[p]); },
 file:p=>E.files[at(p)],
 clean:p=>{ const R=E.repos[at(p)], S=statusOf(R); return !S.items.length&&!S.conf.length&&!S.unt.length&&!R.op; },
 untracked:p=>statusOf(E.repos[at(p)]).unt,
 ign:(p,f)=>!!ignored(E.repos[at(p)],f),
 cfg:k=>E.cfg[k.toLowerCase()],
 C:h=>E.C[h], isAnc,
 used:re=>E.hist.some(h=>h.ok&&re.test(h.cmd)),
 tried:re=>E.hist.some(h=>re.test(h.cmd)),
 failed:re=>E.hist.some(h=>!h.ok&&re.test(h.cmd))
};

return {
 E, A,
 setup(spec){ E.quiet=true; let err=null; try{ spec&&spec.setup&&spec.setup(T); } catch(e){ err=e; } E.quiet=false; E.hist=[]; E.out=[]; E.edit=null; return err; },
 run(line,stdin){ E.stdin=stdin||null; runLine(line); E.stdin=null; },
 saveEdit(text){ const ed=E.edit; E.edit=null; if(!guard(()=>ed.cb(text))&&ed.entry) ed.entry.ok=false; },
 cancelEdit(){ const ed=E.edit; E.edit=null; if(/^COMMIT|^TAG/.test(ed.title)){ say('Aborting commit due to empty commit message.','e'); if(ed.entry) ed.entry.ok=false; } else if(/^nano/.test(ed.title)) hint('# (sin guardar)'); else if(ed.title==='git-rebase-todo') hint('# rebase cancelado: no se ha cambiado nada'); else guard(()=>ed.cb(ed.text)); },
 prompt(){ const R=findRepo(); let br='';
  if(R&&!R.bare){ const op=R.op; br=R.head||'('+(R.detached||'').slice(0,7)+'...)'; if(op) br+='|'+{merge:'MERGING',rebase:'REBASE','cherry-pick':'CHERRY-PICKING',revert:'REVERTING'}[op.type]; }
  return {path:E.cwd.replace(HOME,'~'),br}; },
 complete(line){ const m=line.match(/^(.*?)(\S*)$/), before=m[1], word=m[2]; let opts;
  if(!before.trim()) opts=Object.keys(SH);
  else if(/^git\s+$/.test(before)) opts=Object.keys(G).filter(k=>!k.startsWith('-'));
  else { const dir=word.includes('/')?word.replace(/\/[^/]*$/,'/'):'', d=abs(dir||'.'); opts=isDir(d)?children(d).map(n=>dir+n+(isDir(resolve(d,n))?'/':'')):[]; const R=findRepo(); if(R&&/^git\s+(switch|checkout|merge|branch|rebase|log|diff|push|pull|cherry-pick)\b/.test(before)) opts.push(...Object.keys(R.heads),...Object.keys(R.rrefs)); }
  const c=[...new Set(opts)].filter(o=>o.startsWith(word));
  if(c.length===1) return {line:before+c[0]+(c[0].endsWith('/')?'':' ')};
  let pre=word; if(c.length) for(let i=word.length;;i++){ const ch=c[0][i]; if(!ch||!c.every(x=>x[i]===ch)) break; pre+=ch; }
  return {line:before+pre,options:pre===word&&c.length>1?c:null}; },
 takeOut(){ const o=E.out; E.out=[]; return o; }
};
}

/* ════════════════ ejercicios ════════════════ */
const HTML_TIENDA='<html>\n<head><title>Tienda</title></head>\n<body>\n<h1>Tienda</h1>\n</body>\n</html>\n';
const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const SRV='equipo/servidor/proyecto.git', srv=A=>A.repo(SRV);
const noMarks=s=>!/^(<{7}|={7}|>{7})/m.test(s||'');
const SPECS={
'e-config':{ note:'Equipo recién instalado: Git todavía no tiene ninguna configuración.',
 setup:T=>{ T.sh('mkdir -p ~/practicas-git'); T.sh('cd ~/practicas-git'); },
 checks:[
  ['Has comprobado la versión (git --version)',A=>A.used(/^git (--)?version/)],
  ['user.name configurado de forma global',A=>!!A.cfg('user.name')],
  ['user.email configurado de forma global',A=>/@/.test(A.cfg('user.email'))],
  ['init.defaultBranch = main',A=>A.cfg('init.defaultBranch')==='main'],
  ['core.editor = nano',A=>/nano/.test(A.cfg('core.editor'))],
  ['pull.rebase = false',A=>A.cfg('pull.rebase')==='false'],
  ['Has revisado la configuración (git config --list)',A=>A.used(/^git config .*(--list|-l)\b/)]]},
'e-init':{ note:'Estás en <code>~/practicas-git</code>, vacía. Git ya está configurado (usuario Alumno, rama main).',
 setup:T=>T.base(),
 checks:[
  ['Existe el repositorio ~/practicas-git/web-tienda',A=>!!A.repo('web-tienda')],
  ['Has creado index.html y estilos.css',A=>A.file('web-tienda/index.html')!=null&&A.file('web-tienda/estilos.css')!=null],
  ['Has preparado primero solo index.html',A=>A.used(/^git add index\.html$/),'Usa git add index.html, mira git status -s y después git add .'],
  ['Hay un commit con los dos archivos',A=>{ const t=A.tree('web-tienda'); return 'index.html' in t&&'estilos.css' in t; }],
  ['La rama es main',A=>A.repo('web-tienda').head==='main'],
  ['Carpeta limpia al final',A=>A.clean('web-tienda')]]},
'e-ciclo':{ note:'Repositorio <code>web-tienda</code> con un commit ("Primera versión de la web"). Ya estás dentro.',
 setup:T=>{ T.base(); T.repo('web-tienda',[['Primera versión de la web',{'index.html':'<h1>Tienda</h1>\n','estilos.css':'body{font-family:sans-serif}\n'}]]); },
 checks:[
  ['Has modificado index.html y estilos.css',A=>{ const L=A.log('web-tienda'), r=L[L.length-1].tree, t=A.tree('web-tienda'); return t['index.html']!==r['index.html']&&t['estilos.css']!==r['estilos.css']; }],
  ['Has visto los cambios sin preparar (git diff)',A=>A.used(/^git diff(?!.*--(staged|cached))/)],
  ['Has visto los cambios preparados (git diff --staged)',A=>A.used(/^git diff.*--(staged|cached)/)],
  ['Dos commits: uno solo con index.html y otro solo con estilos.css',A=>{ const L=A.log('web-tienda'); return L.length>=3&&eq(A.changed(L[1]),['index.html'])&&eq(A.changed(L[0]),['estilos.css']); },'Prepara solo index.html, haz commit, y luego el CSS en otro commit (commit -am).'],
  ['Has consultado el último commit (git show)',A=>A.used(/^git show/)],
  ['Carpeta limpia',A=>A.clean('web-tienda')]]},
'e-ignore':{ note:'<code>web-tienda</code>: <code>debug.log</code> ya está en el repositorio, y ya existen <code>logs/app.log</code> y <code>.env</code> (sin seguimiento). No hace falta la primera línea de la solución.',
 setup:T=>{ T.base(); T.repo('web-tienda',[['Primera versión de la web',{'index.html':'<h1>Tienda</h1>\n'}],['Añade log de depuración',{'debug.log':'arranque ok\n'}]]); T.put('logs/app.log','error 500\n'); T.put('.env','DB_PASS=1234\n'); },
 checks:[
  ['.gitignore ignora logs/, .env y *.log',A=>A.ign('web-tienda','logs/app.log')&&A.ign('web-tienda','.env')&&A.ign('web-tienda','otro.log')],
  ['.gitignore está guardado en un commit',A=>'.gitignore' in A.tree('web-tienda')],
  ['debug.log ya no está en el último commit',A=>!('debug.log' in A.tree('web-tienda')),'.gitignore no afecta a lo ya rastreado: usa git rm --cached debug.log.'],
  ['debug.log sigue en el disco',A=>A.file('web-tienda/debug.log')!=null,'Con --cached se quita del índice sin borrar el archivo.'],
  ['.env y logs/app.log nunca han entrado en un commit',A=>A.log('web-tienda').every(c=>!('.env' in c.tree)&&!('logs/app.log' in c.tree))],
  ['Has averiguado la regla con git check-ignore',A=>A.used(/^git check-ignore/)],
  ['Carpeta limpia',A=>A.clean('web-tienda')]]},
'e-mvrm':{ note:'<code>web-tienda</code> con <code>index.html</code>, <code>estilos.css</code> y <code>antiguo.html</code> en el repositorio.',
 setup:T=>{ T.base(); T.repo('web-tienda',[['Primera versión de la web',{'index.html':'<h1>Tienda</h1>\n','estilos.css':'body{margin:0}\n','antiguo.html':'<p>Página vieja</p>\n'}]]); },
 checks:[
  ['style.css en el último commit y estilos.css ya no',A=>{ const t=A.tree('web-tienda'); return 'style.css' in t&&!('estilos.css' in t); }],
  ['Renombrado con git mv',A=>A.used(/^git mv /)],
  ['antiguo.html eliminado del repositorio y del disco',A=>!('antiguo.html' in A.tree('web-tienda'))&&A.file('web-tienda/antiguo.html')==null],
  ['Has simulado la limpieza (git clean -n)',A=>A.used(/^git clean .*-\w*n/)],
  ['Borradores eliminados con git clean -f',A=>A.used(/^git clean .*-\w*f/)&&!A.untracked('web-tienda').length],
  ['Carpeta limpia',A=>A.clean('web-tienda')]]},
'e-ssh':{ note:'Simulación: no hay GitHub real. <code>ssh -T</code> responde como si ya hubieras pegado la clave pública en GitHub → Settings → SSH and GPG keys.',
 setup:T=>T.base(),
 checks:[
  ['Clave ed25519 generada (~/.ssh/id_ed25519 y .pub)',A=>A.file('~/.ssh/id_ed25519')!=null&&A.file('~/.ssh/id_ed25519.pub')!=null,'ssh-keygen -t ed25519 -C "tu_email"'],
  ['La clave lleva tu correo como comentario (-C)',A=>/@ejemplo|@\w+\.\w+/.test(A.file('~/.ssh/id_ed25519.pub'))&&!/alumno@aula/.test(A.file('~/.ssh/id_ed25519.pub'))],
  ['Agente SSH arrancado',A=>A.env.agentOn],
  ['Clave PRIVADA añadida al agente',A=>A.env.agent.some(p=>/id_ed25519$/.test(p)),'ssh-add usa la privada (sin .pub).'],
  ['Has mostrado la clave pública para copiarla',A=>A.used(/^cat .*id_ed25519\.pub/)],
  ['Conexión probada (ssh -T git@github.com)',A=>A.used(/^ssh -T git@github\.com/)]]},
'e-https':{ note:'GitHub (simulado) tiene <code>usuario/web-tienda</code>. Por HTTPS se simula la petición de usuario y token.',
 setup:T=>{ T.base(); T.gh('usuario','web-tienda',[['Primera versión de la web',{'index.html':'<h1>Tienda</h1>\n'}]]); },
 checks:[
  ['Clonado por HTTPS en ~/practicas-git/web-tienda',A=>!!A.repo('web-tienda')&&A.used(/^git clone https:/)],
  ['credential.helper configurado',A=>!!A.cfg('credential.helper')],
  ['Has comprobado la URL (git remote -v)',A=>A.used(/^git remote -v/)],
  ['origin apunta ahora a la URL SSH',A=>/^git@github\.com:usuario\/web-tienda/.test(A.repo('web-tienda').remotes.origin)],
  ['Has hecho push',A=>A.used(/^git push/)]]},
'e-subir':{ note:'<code>web-tienda</code> tiene 3 commits en la rama <b>master</b>. En GitHub (simulado) ya existe la repo vacía: <code>git@github.com:usuario/web-tienda.git</code>.',
 setup:T=>{ T.base(); T.gh('usuario','web-tienda'); T.repo('web-tienda',[['Primera versión de la web',{'index.html':'<h1>Tienda</h1>\n'}],['Añade estilos',{'estilos.css':'body{margin:0}\n'}],['Añade contacto',{'contacto.html':'<p>Contacto</p>\n'}]],{b:'master'}); },
 checks:[
  ['origin apunta a usuario/web-tienda',A=>/github\.com[:/]usuario\/web-tienda(\.git)?$/.test(A.repo('web-tienda').remotes.origin)],
  ['La rama local se llama main',A=>{ const R=A.repo('web-tienda'); return R.head==='main'&&!('master' in R.heads); },'git branch -M main'],
  ['GitHub tiene main con todos los commits',A=>A.gh('usuario','web-tienda').heads.main===A.br('web-tienda','main')],
  ['main vinculada a origin/main (push -u)',A=>{ const u=A.repo('web-tienda').upstream.main; return u.remote==='origin'&&u.merge==='main'; }],
  ['Has comprobado con status -sb o branch -vv',A=>A.used(/^git (status -sb|branch -vv)/)]]},
'e-clone':{ note:'En GitHub (simulado) ya está creada <code>usuario/apuntes-asir</code> con README y .gitignore.',
 setup:T=>{ T.base(); T.gh('usuario','apuntes-asir',[['Initial commit',{'README.md':'# apuntes-asir\n','.gitignore':'*.tmp\n'}]]); },
 checks:[
  ['apuntes-asir clonada',A=>'README.md' in A.tree('apuntes-asir')],
  ['Has comprobado el remoto (git remote -v)',A=>A.used(/^git remote -v/)],
  ['tema1.md guardado en un commit',A=>'tema1.md' in A.tree('apuntes-asir')],
  ['GitHub ya tiene tema1.md',A=>'tema1.md' in A.treeOf(A.gh('usuario','apuntes-asir').heads.main)],
  ['Local y remoto sincronizados',A=>A.br('apuntes-asir','main')===A.gh('usuario','apuntes-asir').heads.main]]},
'e-unrelated':{ note:'Local: <code>proyecto</code> con 2 commits. GitHub (simulado): <code>git@github.com:usuario/proyecto.git</code>, creada con README.',
 setup:T=>{ T.base(); T.gh('usuario','proyecto',[['Initial commit',{'README.md':'# proyecto\n'}]]); T.repo('proyecto',[['Estructura inicial',{'index.html':'<h1>Proyecto</h1>\n'}],['Añade estilos',{'estilos.css':'body{margin:0}\n'}]]); },
 checks:[
  ['Has reproducido el rechazo del push',A=>A.failed(/^git push/)],
  ['Has unido las historias con --allow-unrelated-histories',A=>A.used(/--allow-unrelated-histories/)],
  ['El último commit es un merge con README.md y tus archivos',A=>{ const c=A.head('proyecto'); return c.parents.length===2&&'README.md' in c.tree&&'index.html' in c.tree; }],
  ['GitHub tiene tu main',A=>A.gh('usuario','proyecto').heads.main===A.br('proyecto','main')],
  ['main vinculada a origin/main',A=>!!A.repo('proyecto').upstream.main]]},
'e-bare':{ pane:'lab', note:'Haz la variante <b>Laboratorio en tu equipo</b>: el servidor y los dos PCs son carpetas dentro de <code>~/practicas-git/equipo</code>.',
 setup:T=>T.base(),
 checks:[
  ['Repo bare en equipo/servidor/proyecto.git',A=>srv(A).bare],
  ['pc-ana y pc-benat clonados del servidor',A=>['pc-ana','pc-benat'].every(p=>/servidor\/proyecto\.git$/.test(A.repo('equipo/'+p).remotes.origin))],
  ['Usuario local de pc-ana: Ana',A=>A.repo('equipo/pc-ana').cfg['user.name']==='Ana'],
  ['El servidor tiene lista.txt',A=>'lista.txt' in A.treeOf(srv(A).heads.main)],
  ['pc-benat ha traído el commit de Ana',A=>A.br('equipo/pc-benat','main')===srv(A).heads.main],
  ['Usuario local de pc-benat: Beñat',A=>A.repo('equipo/pc-benat').cfg['user.name']==='Beñat']]},
'e-copiar':{ note:'GitHub (simulado): el original <code>https://github.com/robertovormittag/phonetic-website.git</code> (rama master) y tu repo vacía <code>git@github.com:usuario/phonetic-website.git</code>.',
 setup:T=>{ T.base(); T.gh('robertovormittag','phonetic-website',[['Initial commit',{'index.html':'<h1>Phonetic alphabet</h1>\n'}],['Add alphabet table',{'alphabet.html':'<p>Alfa Bravo Charlie</p>\n'}]],{b:'master'}); T.gh('usuario','phonetic-website'); },
 checks:[
  ['Proyecto clonado en phonetic-website',A=>!!A.repo('phonetic-website')],
  ['Rama renombrada a main',A=>{ const R=A.repo('phonetic-website'); return 'main' in R.heads&&!('master' in R.heads); }],
  ['upstream → repositorio original',A=>/robertovormittag\/phonetic-website/.test(A.repo('phonetic-website').remotes.upstream)],
  ['origin → tu repositorio',A=>/usuario\/phonetic-website/.test(A.repo('phonetic-website').remotes.origin)],
  ['Tu GitHub tiene main con todo el historial',A=>A.gh('usuario','phonetic-website').heads.main===A.br('phonetic-website','main')],
  ['main vinculada a origin/main',A=>A.repo('phonetic-website').upstream.main.remote==='origin']]},
'e-subircambios':{ note:'Laboratorio del equipo preparado (servidor, pc-ana y pc-benat con "Lista inicial"). Estás en <code>pc-ana</code>.',
 setup:T=>{ T.base(); T.equipo(); T.sh('cd ../pc-ana'); },
 checks:[
  ['lista.txt incluye leche y huevos',A=>/leche/.test(A.file('equipo/pc-ana/lista.txt'))&&/huevos/.test(A.file('equipo/pc-ana/lista.txt'))],
  ['Dos commits: uno solo con lista.txt y otro solo con notas.txt',A=>{ const L=A.log('equipo/pc-ana'); return eq(A.changed(L[1]),['lista.txt'])&&eq(A.changed(L[0]),['notas.txt']); }],
  ['Has comprobado que ibas por delante (status -sb)',A=>A.used(/^git status -sb/)],
  ['El servidor tiene tus dos commits',A=>srv(A).heads.main===A.br('equipo/pc-ana','main')],
  ['Carpeta limpia',A=>A.clean('equipo/pc-ana')]]},
'e-actualizar':{ note:'Ana ya ha subido 2 commits al servidor. Estás en <code>pc-benat</code>, que todavía no lo sabe.',
 setup:T=>{ T.base(); T.equipo(); T.sh('cd ../pc-ana'); T.ci('Añade leche y huevos',{'lista.txt':'Lista de la compra\n- pan\n- leche\n- huevos\n'}); T.ci('Añade notas',{'notas.txt':'Comprar el sábado\n'}); T.sh('git push'); T.sh('cd ../pc-benat'); },
 checks:[
  ['Has descargado con git fetch',A=>A.used(/^git fetch/)],
  ['Has listado los commits pendientes (log main..origin/main)',A=>A.used(/^git log.*\.\.origin\/main/)],
  ['Has mirado las diferencias con origin/main',A=>A.used(/^git diff.*origin\/main/)],
  ['pc-benat actualizado con el servidor',A=>A.br('equipo/pc-benat','main')===srv(A).heads.main],
  ['Integrado sin commit de merge (fast-forward)',A=>A.head('equipo/pc-benat').parents.length===1]]},
'e-stash':{ note:'Estás en <code>pc-benat</code> con la cabecera a medias en <code>index.html</code> y <code>cabecera.css</code> nuevo. Ana ha subido un cambio en index.html.',
 setup:T=>{ T.base(); T.equipo(); T.sh('cd ../pc-ana'); T.ci('Añade index.html',{'index.html':HTML_TIENDA}); T.sh('git push'); T.sh('cd ../pc-benat'); T.sh('git pull');
  T.sh('cd ../pc-ana'); T.ci('Cambia el título',{'index.html':HTML_TIENDA.replace('<title>Tienda','<title>Tienda online')}); T.sh('git push'); T.sh('cd ../pc-benat');
  T.put('index.html',HTML_TIENDA.replace('<body>\n','<body>\n<header>Cabecera</header>\n')); T.put('cabecera.css','header{background:navy}\n'); },
 checks:[
  ['Has apartado también el archivo nuevo (stash -u)',A=>A.used(/^git stash( push)? .*(-u\b|--include-untracked)/)],
  ['pc-benat actualizado con el servidor',A=>A.br('equipo/pc-benat','main')===srv(A).heads.main],
  ['index.html tiene el cambio de Ana y tu cabecera',A=>{ const f=A.file('equipo/pc-benat/index.html'); return /Tienda online/.test(f)&&/<header>/.test(f); }],
  ['cabecera.css ha vuelto',A=>A.file('equipo/pc-benat/cabecera.css')!=null],
  ['La lista de stash queda vacía',A=>!A.repo('equipo/pc-benat').stash.length],
  ['Tu trabajo sigue sin commit',A=>!/<header>/.test(A.tree('equipo/pc-benat')['index.html'])]]},
'e-tags':{ note:'<code>web-tienda</code> con 4 commits, ya subida a GitHub (simulado). La demo fue el commit "Demo para el cliente".',
 setup:T=>{ T.base(); T.gh('usuario','web-tienda'); T.repo('web-tienda',[['Primera versión de la web',{'index.html':'<h1>Tienda</h1>\n'}],['Demo para el cliente',{'demo.html':'<p>Demo</p>\n'}],['Añade carrito',{'carrito.html':'<p>Carrito</p>\n'}],['Corrige precios',{'precios.html':'Camiseta: 15 €\n'}]]);
  T.sh('git remote add origin git@github.com:usuario/web-tienda.git'); T.sh('git push -u origin main'); },
 checks:[
  ['v1.0 anotada en el último commit',A=>{ const t=A.repo('web-tienda').tags['v1.0']; return t.msg!=null&&t.h===A.br('web-tienda','main'); },'Anotada = con -a y -m.'],
  ['v0.9 anotada en el commit de la demo',A=>{ const t=A.repo('web-tienda').tags['v0.9']; return t.msg!=null&&/Demo/.test(A.C(t.h).msg); }],
  ['v1.0 y v0.9 subidas a GitHub',A=>{ const G=A.gh('usuario','web-tienda'); return !!(G.tags['v1.0']&&G.tags['v0.9']); },'git push origin --tags'],
  ['Has creado y subido una etiqueta por error (v1.1)',A=>A.used(/^git tag .*v1\.1/)&&A.used(/^git push .*(v1\.1|--tags)/)],
  ['v1.1 borrada en local y en GitHub',A=>!A.repo('web-tienda').tags['v1.1']&&!A.gh('usuario','web-tienda').tags['v1.1']]]},
'e-historial':{ note:'<code>web-tienda</code>: la camiseta aparece a 1.5 € en precios.html. Investiga con el historial (los hashes son los tuyos, no los de la solución).',
 setup:T=>{ T.base(); T.repo('web-tienda',[['Primera versión de la web',{'index.html':'<h1>Tienda</h1>\n'}],['Añade precios',{'precios.html':'Camiseta: 15 €\nPantalón: 30 €\n'}]]);
  T.sh('git config user.name "Beñat"'); T.ci('Rebajas de invierno',{'precios.html':'Camiseta: 1.5 €\nPantalón: 30 €\n'}); T.sh('git config --unset user.name');
  T.ci('Añade contacto',{'contacto.html':'<p>Contacto</p>\n'}); T.sh('git switch -c ofertas'); T.ci('Página de ofertas',{'ofertas.html':'<p>2x1</p>\n'}); T.sh('git switch main'); T.ci('Corrige pantalón',{'precios.html':'Camiseta: 1.5 €\nPantalón: 29 €\n'}); },
 checks:[
  ['Grafo de todas las ramas (log --graph --all)',A=>A.used(/^git log.*--graph/)&&A.used(/^git log.*--all/)],
  ['Commits que tocaron precios.html',A=>A.used(/^git log.*precios\.html/)],
  ['Autor de cada línea (git blame)',A=>A.used(/^git blame .*precios\.html/)],
  ['Detalle de un commit (git show)',A=>A.used(/^git show/)],
  ['El archivo entre dos commits (git diff A B -- precios.html)',A=>A.used(/^git diff \S+ \S+ (-- )?precios\.html/)]]},
'e-restore':{ note:'Repositorio <code>app</code>; <code>app.py</code> ya está "destrozado" (no hace falta el primer echo).',
 setup:T=>{ T.base(); T.repo('app',[['Versión inicial',{'app.py':'print("hola")\n'}]]); T.put('app.py','print("hola")\nbasura\n'); },
 checks:[
  ['Has visto el cambio (git diff)',A=>A.used(/^git diff/)],
  ['app.py vuelve a la última versión guardada',A=>A.file('app/app.py')===A.tree('app')['app.py']],
  ['Descartado con git restore',A=>A.used(/^git (restore|checkout --) /)],
  ['Carpeta limpia',A=>A.clean('app')]]},
'e-unstage':{ note:'<code>app</code>: has modificado app.py y existe config.local. Empieza con <code>git add .</code> como en la situación.',
 setup:T=>{ T.base(); T.repo('app',[['Versión inicial',{'app.py':'print("hola")\n'}]]); T.put('app.py','print("hola")\nmenu_usuario()\n'); T.put('config.local','DEBUG=1\n'); },
 checks:[
  ['Has comprobado lo preparado (status / diff --staged)',A=>A.used(/^git (status|diff .*--(staged|cached))/)],
  ['El commit nuevo incluye el cambio de app.py',A=>/menu_usuario/.test(A.tree('app')['app.py'])],
  ['config.local no está en el commit',A=>!('config.local' in A.tree('app'))],
  ['config.local sigue en el disco y fuera de staging',A=>A.file('app/config.local')!=null&&!('config.local' in A.repo('app').index)],
  ['Lo sacaste con git restore --staged',A=>A.used(/^git (restore --staged|reset( HEAD)?( --)?) .*config\.local/)]]},
'e-source':{ note:'<code>web-tienda</code>: el estilos.css bueno es el del commit "Ajusta márgenes" (HEAD~3). Tus hashes no coinciden con los de la solución.',
 setup:T=>{ T.base(); T.repo('web-tienda',[['Primera versión de la web',{'index.html':'<h1>Tienda</h1>\n','estilos.css':'body{margin:0}\n'}],['Ajusta márgenes',{'estilos.css':'body{margin:0 auto;max-width:900px}\n'}],['Colores nuevos',{'estilos.css':'body{margin:0 auto;max-width:900px;color:red}\n'}],['Añade footer',{'index.html':'<h1>Tienda</h1>\n<footer>2026</footer>\n'}],['Rompe la rejilla',{'estilos.css':'body{margin:-50px;max-width:9px;color:red}\n'}]]); },
 checks:[
  ['estilos.css vuelve a la versión de "Ajusta márgenes"',A=>A.tree('web-tienda')['estilos.css']===A.find('web-tienda',/Ajusta márgenes/).tree['estilos.css']],
  ['Guardado en un commit nuevo que solo toca estilos.css',A=>eq(A.changed(A.head('web-tienda')),['estilos.css'])&&!/Rompe/.test(A.head('web-tienda').msg)],
  ['Historial intacto (5 commits anteriores + 1)',A=>A.log('web-tienda').length===6,'No uses reset: trae solo el archivo con git restore --source.'],
  ['index.html no se ha tocado',A=>/footer/.test(A.tree('web-tienda')['index.html'])],
  ['Carpeta limpia',A=>A.clean('web-tienda')]]},
'e-amend':{ note:'Último commit: "aÑade login" (sin push). <code>login.css</code> se quedó fuera.',
 setup:T=>{ T.base(); T.repo('web-tienda',[['Primera versión de la web',{'index.html':'<h1>Tienda</h1>\n'}],['aÑade login',{'login.html':'<form></form>\n'}]]); T.put('login.css','form{margin:auto}\n'); },
 checks:[
  ['login.css está en el último commit',A=>'login.css' in A.tree('web-tienda')],
  ['Mensaje corregido a "Añade login"',A=>A.head('web-tienda').msg.trim()==='Añade login'],
  ['Sigue habiendo un único commit de login',A=>A.log('web-tienda').length===2,'Con --amend se sustituye el último commit en vez de crear otro.'],
  ['Has usado --amend',A=>A.used(/--amend/)]]},
'e-undolocal':{ note:'<code>app</code>: el último commit "C3: login" (sin subir) tiene una errata en app.py: <code>pritn</code>. Corrígela con <code>nano app.py</code>.',
 setup:T=>{ T.base(); T.gh('usuario','app'); T.repo('app',[['C1: inicio',{'app.py':'def inicio():\n    pass\n'}],['C2: README',{'README.md':'# App\n'}]]); T.sh('git remote add origin git@github.com:usuario/app.git'); T.sh('git push -u origin main');
  T.ci('C3: login',{'app.py':'def inicio():\n    pass\n\ndef login():\n    pritn("login")\n'}); },
 checks:[
  ['Deshecho con reset --soft',A=>A.used(/^git reset --soft/)],
  ['Commit "C3: login" con app.py corregido',A=>{ const c=A.head('app'); return /C3/.test(c.msg)&&!/pritn/.test(c.tree['app.py'])&&/print\("login"\)/.test(c.tree['app.py']); }],
  ['Un solo commit C3 en el historial',A=>A.log('app').filter(c=>/C3/.test(c.msg)).length===1],
  ['Subido sin --force',A=>A.gh('usuario','app').heads.main===A.br('app','main')&&!A.used(/push .*(--force|-f\b)/)],
  ['GitHub nunca ha recibido el error',A=>A.logOf(A.gh('usuario','app').heads.main).every(c=>!/pritn/.test(c.tree['app.py']))]]},
'e-revertfile':{ note:'<code>app</code>: "C4: estadísticas" ya está en GitHub e incluye <code>datos_alumnos.csv</code>. Beñat ya lo tiene: no reescribas el historial.',
 setup:T=>{ T.base(); T.gh('usuario','app'); T.repo('app',[['C1: inicio',{'app.py':'def inicio():\n    pass\n'}],['C2: README',{'README.md':'# App\n'}],['C3: login',{'login.py':'def login():\n    print("login")\n'}],['C4: estadísticas',{'stats.py':'def media(n):\n    return sum(n)/len(n)\n','datos_alumnos.csv':'nombre,nota\nAna,9\n'}]]);
  T.sh('git remote add origin git@github.com:usuario/app.git'); T.sh('git push -u origin main'); T.mark('top'); },
 checks:[
  ['Has revisado el commit (git show)',A=>A.used(/^git show/)],
  ['datos_alumnos.csv ya no está en el último commit',A=>!('datos_alumnos.csv' in A.tree('app'))],
  ['Historial intacto: C4 sigue ahí',A=>A.isAnc(A.mark.top,A.br('app','main'))],
  ['Subido con push normal',A=>A.gh('usuario','app').heads.main===A.br('app','main')&&!A.used(/push .*(--force|-f\b)/)]]},
'e-revertold':{ note:'<code>web</code>: banner.js llegó en "Añade banner" (HEAD~3). Los commits posteriores están bien. Ya está en GitHub.',
 setup:T=>{ T.base(); T.gh('usuario','web'); T.repo('web',[['Primera versión',{'index.html':'<h1>Web</h1>\n'}],['Añade banner',{'banner.js':'mostrarBanner();\n'}],['Añade menú',{'menu.js':'crearMenu();\n'}],['Corrige textos',{'index.html':'<h1>Mi web</h1>\n'}],['Añade footer',{'footer.html':'<footer>2026</footer>\n'}]]);
  T.sh('git remote add origin git@github.com:usuario/web.git'); T.sh('git push -u origin main'); T.mark('top'); },
 checks:[
  ['Has localizado el commit (log -- banner.js)',A=>A.used(/^git log.*banner\.js/)],
  ['banner.js ya no está',A=>!('banner.js' in A.tree('web'))],
  ['menu.js, footer.html y los textos siguen',A=>{ const t=A.tree('web'); return 'menu.js' in t&&'footer.html' in t&&/Mi web/.test(t['index.html']); }],
  ['El último commit es el revert de "Añade banner"',A=>/^Revert "Añade banner"/.test(A.head('web').msg)],
  ['Historial intacto y subido',A=>A.isAnc(A.mark.top,A.br('web','main'))&&A.gh('usuario','web').heads.main===A.br('web','main')]]},
'e-resetsoft':{ note:'<code>notas</code>: "Tema 4 parte A" y "Tema 4 parte B" sin subir; <code>prueba.md</code> existe sin seguimiento.',
 setup:T=>{ T.base(); T.repo('notas',[['Tema 3',{'tema3.md':'# Tema 3\n'}],['Tema 4 parte A',{'tema4.md':'# Tema 4\nParte A\n'}],['Tema 4 parte B',{'tema4.md':'# Tema 4\nParte A\nParte B\n'}]]); T.put('prueba.md','probando\n'); },
 checks:[
  ['Un solo commit "Tema 4" con las dos partes',A=>{ const t4=A.log('notas').filter(c=>/Tema 4/.test(c.msg)); return t4.length===1&&/Parte B/.test(t4[0].tree['tema4.md'])&&/Parte A/.test(t4[0].tree['tema4.md']); }],
  ['Has usado reset --soft',A=>A.used(/^git reset --soft/)],
  ['Commit "Prueba" creado y después deshecho',A=>A.used(/^git commit.*Prueba/)&&!A.log('notas').some(c=>/^Prueba/.test(c.msg))],
  ['Has usado reset mixto (sin --soft ni --hard)',A=>A.used(/^git reset( --mixed)? HEAD(~1|\^)$/)],
  ['prueba.md sigue en la carpeta, fuera de staging',A=>A.file('notas/prueba.md')!=null&&!('prueba.md' in A.repo('notas').index)]]},
'e-resethard':{ note:'A: estás en <code>notas</code> ("Experimento 1" y "2" sin subir). B: <code>~/practicas-git/solo</code>, con "Commit por error" ya subido a GitHub.',
 setup:T=>{ T.base(); T.gh('usuario','solo'); T.repo('solo',[['Inicio',{'a.txt':'a\n'}],['Versión buena',{'b.txt':'b\n'}],['Commit por error',{'secreto.txt':'clave=1234\n'}]]); T.sh('git remote add origin git@github.com:usuario/solo.git'); T.sh('git push -u origin main');
  T.sh('cd ..'); T.repo('notas',[['Tema 3',{'tema3.md':'# Tema 3\n'}],['Tema 4',{'tema4.md':'# Tema 4\n'}],['Experimento 1',{'exp1.md':'prueba 1\n'}],['Experimento 2',{'exp2.md':'prueba 2\n'}]]); },
 checks:[
  ['A: notas vuelve a "Tema 4"',A=>A.head('notas').msg==='Tema 4'],
  ['A: exp1.md y exp2.md han desaparecido',A=>A.file('notas/exp1.md')==null&&A.file('notas/exp2.md')==null],
  ['B: "Commit por error" eliminado en local',A=>!A.log('solo').some(c=>/por error/.test(c.msg))],
  ['B: GitHub igual que tu local',A=>A.gh('usuario','solo').heads.main===A.br('solo','main')],
  ['B: --force-with-lease (no --force)',A=>A.used(/--force-with-lease/)&&!A.used(/push .*(--force(?!-with-lease)|-f\b)/)]]},
'e-reflog':{ note:'<code>notas</code>: acabas de hacer <code>git reset --hard HEAD~2</code> y los experimentos ya no salen en <code>git log</code>.',
 setup:T=>{ T.base(); T.repo('notas',[['Tema 3',{'tema3.md':'# Tema 3\n'}],['Tema 4',{'tema4.md':'# Tema 4\n'}],['Experimento 1',{'exp1.md':'prueba 1\n'}],['Experimento 2',{'exp2.md':'prueba 2\n'}]]); T.mark('exp2'); T.sh('git reset --hard HEAD~2'); },
 checks:[
  ['Has consultado git reflog',A=>A.used(/^git reflog/)],
  ['"Experimento 2" recuperado en main o en una rama',A=>Object.values(A.repo('notas').heads).includes(A.mark.exp2)]]},
'e-rama-ff':{ note:'Repositorio <code>notas</code> con dos commits en main.',
 setup:T=>{ T.base(); T.repo('notas',[['Tema 3',{'tema3.md':'# Tema 3\n'}],['Tema 4',{'tema4.md':'# Tema 4\n'}]]); },
 checks:[
  ['Rama tema5 creada y usada',A=>A.used(/^git (switch -c|checkout -b) tema5/)],
  ['main contiene "Tema 5" y tema5.md',A=>'tema5.md' in A.tree('notas')&&A.log('notas').some(c=>/Tema 5/.test(c.msg))],
  ['Fusión fast-forward (sin commit de merge)',A=>A.log('notas').every(c=>c.parents.length<2)],
  ['Rama tema5 borrada',A=>!('tema5' in A.repo('notas').heads)],
  ['Estás en main',A=>A.repo('notas').head==='main']]},
'e-rama-merge':{ note:'Repositorio <code>notas</code> con los temas 3 a 5 en main.',
 setup:T=>{ T.base(); T.repo('notas',[['Tema 3',{'tema3.md':'# Tema 3\n'}],['Tema 4',{'tema4.md':'# Tema 4\n'}],['Tema 5',{'tema5.md':'# Tema 5\n'}]]); },
 checks:[
  ['Has visto la divergencia con el grafo',A=>A.used(/^git log.*--graph/)],
  ['El último commit de main es un merge (dos padres)',A=>A.head('notas').parents.length===2],
  ['main tiene indice.md y tema6.md',A=>{ const t=A.tree('notas'); return 'indice.md' in t&&'tema6.md' in t; }],
  ['Rama indice borrada',A=>!('indice' in A.repo('notas').heads)]]},
'e-rama-remota':{ note:'Laboratorio del equipo preparado. Empiezas en <code>pc-ana</code>; cambia de "ordenador" con <code>cd ../pc-benat</code>.',
 setup:T=>{ T.base(); T.equipo(); T.sh('cd ../pc-ana'); },
 checks:[
  ['Ana subió login vinculada (push -u origin login)',A=>A.used(/^git push (-u|--set-upstream) origin login/)],
  ['Beñat vio la rama remota (branch -a) y la usó',A=>A.used(/^git branch -a/)&&A.used(/^git (switch|checkout) login/)],
  ['main del servidor incluye login.html',A=>'login.html' in A.treeOf(srv(A).heads.main)],
  ['login borrada del servidor y de pc-ana',A=>!('login' in srv(A).heads)&&!('login' in A.repo('equipo/pc-ana').heads)],
  ['pc-benat limpio: sin login ni origin/login, y main al día',A=>{ const R=A.repo('equipo/pc-benat'); return !('login' in R.heads)&&!('origin/login' in R.rrefs)&&R.heads.main===srv(A).heads.main; },'Primero git pull (para tener el commit en main) y después git branch -d login.']]},
'e-borrar-ramas':{ note:'<code>notas</code>: la rama <code>tema5</code> ya está fusionada; <code>borrador</code> tiene un commit sin fusionar.',
 setup:T=>{ T.base(); T.repo('notas',[['Tema 3',{'tema3.md':'# Tema 3\n'}],['Tema 4',{'tema4.md':'# Tema 4\n'}]]); T.sh('git switch -c tema5'); T.ci('Tema 5',{'tema5.md':'# Tema 5\n'}); T.sh('git switch main'); T.sh('git merge tema5');
  T.sh('git switch -c borrador'); T.ci('Borrador',{'borrador.md':'ideas sueltas\n'}); T.mark('borr'); T.sh('git switch main'); },
 checks:[
  ['Has consultado qué ramas están fusionadas',A=>A.used(/^git branch --(no-)?merged/)],
  ['tema5 borrada',A=>!('tema5' in A.repo('notas').heads)],
  ['Has visto el error de -d con borrador',A=>A.failed(/^git branch -d borrador/)],
  ['Has forzado el borrado con -D',A=>A.used(/^git branch -D borrador/)],
  ['borrador recuperada en su commit original',A=>A.repo('notas').heads.borrador===A.mark.borr,'Busca el hash en git reflog o en el mensaje "Deleted branch borrador (was …)".']]},
'e-rama-equivocada':{ note:'<code>notas</code>: el commit "Footer" está en main, sin subir (GitHub tiene hasta "Tema 4").',
 setup:T=>{ T.base(); T.gh('usuario','notas'); T.repo('notas',[['Tema 3',{'tema3.md':'# Tema 3\n'}],['Tema 4',{'tema4.md':'# Tema 4\n'}]]); T.sh('git remote add origin git@github.com:usuario/notas.git'); T.sh('git push -u origin main'); T.mark('top');
  T.ci('Footer',{'footer.md':'Pie de página\n'}); T.mark('footer'); },
 checks:[
  ['Rama footer en el commit "Footer"',A=>A.repo('notas').heads.footer===A.mark.footer],
  ['main vuelve al commit anterior (igual que origin/main)',A=>A.br('notas','main')===A.mark.top],
  ['GitHub no ha cambiado (sin push forzado)',A=>A.gh('usuario','notas').heads.main===A.mark.top]]},
'e-cherry':{ note:'<code>notas</code>: la rama <code>desarrollo</code> tiene "Corrige error tipográfico" y "Nueva sección a medias". Estás en main.',
 setup:T=>{ T.base(); T.repo('notas',[['Tema 1',{'tema1.md':'# Tema 1\nLas redes se clasifican en LAN y WAM.\n'}],['Tema 2',{'tema2.md':'# Tema 2\n'}]]);
  T.sh('git switch -c desarrollo'); T.ci('Corrige error tipográfico',{'tema1.md':'# Tema 1\nLas redes se clasifican en LAN y WAN.\n'}); T.ci('Nueva sección a medias',{'seccion.md':'TODO\n'}); T.mark('wip'); T.sh('git switch main'); },
 checks:[
  ['main tiene la corrección (WAN)',A=>/WAN\./.test(A.tree('notas')['tema1.md'])],
  ['Copiada con cherry-pick, sin fusionar la rama',A=>{ const c=A.head('notas'); return c.parents.length===1&&/Corrige/.test(c.msg)&&!A.isAnc(A.mark.wip,c.h); }],
  ['main no tiene la sección a medias',A=>!('seccion.md' in A.tree('notas'))],
  ['desarrollo no ha cambiado',A=>A.repo('notas').heads.desarrollo===A.mark.wip]]},
'e-conf-ramas':{ note:'Repositorio <code>colores</code> con un commit. Crea las ramas como en la solución. Para ver y resolver: <code>cat estilo.txt</code> y <code>nano estilo.txt</code>.',
 setup:T=>{ T.base(); T.repo('colores',[['Inicio',{'README.md':'# Colores\n'}]]); },
 checks:[
  ['Has provocado el conflicto',A=>A.failed(/^git merge color/)],
  ['Has cancelado una vez con git merge --abort',A=>A.used(/^git merge --abort/)],
  ['Merge terminado: commit con dos padres',A=>A.head('colores').parents.length===2],
  ['estilo.txt = "color: morado", sin marcas',A=>A.file('colores/estilo.txt').trim()==='color: morado'],
  ['Nada pendiente',A=>A.clean('colores')]]},
'e-conf-version':{ note:'<code>colores</code>: main tiene "color: rojo"; las ramas <code>color</code> (azul) y <code>verde</code> (verde + verde.txt) chocan con main en estilo.txt.',
 setup:T=>{ T.base(); T.repo('colores',[['Inicio',{'estilo.txt':'color: negro\n'}]]); T.sh('git switch -c color'); T.ci('Azul',{'estilo.txt':'color: azul\n'}); T.sh('git switch main');
  T.sh('git switch -c verde'); T.ci('Verde',{'estilo.txt':'color: verde\n','verde.txt':'tono: lima\n'}); T.sh('git switch main'); T.ci('Rojo',{'estilo.txt':'color: rojo\n'}); },
 checks:[
  ['Merge de color resuelto con --theirs (gana azul)',A=>A.log('colores').some(c=>c.parents.length===2&&c.parents[1]===A.br('colores','color')&&c.tree['estilo.txt']==='color: azul\n')],
  ['Merge de verde con -X ours',A=>A.used(/^git merge .*-X ?ours/)],
  ['En el merge de verde gana main en estilo.txt y llega verde.txt',A=>{ const c=A.head('colores'); return c.parents.length===2&&c.parents[1]===A.br('colores','verde')&&!/verde/.test(c.tree['estilo.txt'])&&'verde.txt' in c.tree; }],
  ['Nada pendiente',A=>A.clean('colores')]]},
'e-conf-pull':{ note:'Laboratorio del equipo preparado. Empiezas en <code>pc-ana</code>; después <code>cd ../pc-benat</code>. Resuelve con <code>nano lista.txt</code>.',
 setup:T=>{ T.base(); T.equipo(); T.sh('cd ../pc-ana'); },
 checks:[
  ['Ana subió "pan integral"',A=>A.logOf(srv(A).heads.main).some(c=>c.author==='Ana'&&/pan integral/.test(c.tree['lista.txt']))],
  ['Beñat vio el rechazo del push',A=>A.failed(/^git push/)],
  ['lista.txt final con los dos panes y sin marcas',A=>{ const f=A.treeOf(srv(A).heads.main)['lista.txt']; return /pan integral/.test(f)&&/pan de molde/.test(f)&&noMarks(f); }],
  ['El servidor tiene el commit de merge',A=>A.C(srv(A).heads.main).parents.length===2],
  ['pc-benat y servidor sincronizados',A=>A.br('equipo/pc-benat','main')===srv(A).heads.main]]},
'e-conf-rebase':{ note:'Estás en <code>pc-benat</code> tras <code>git fetch</code>: Ana subió "- leche" y tú tienes un commit con "- huevos" en el mismo sitio.',
 setup:T=>{ T.base(); T.equipo(); T.sh('cd ../pc-ana'); T.ci('Ana: leche',{'lista.txt':'Lista de la compra\n- pan\n- leche\n'}); T.sh('git push');
  T.sh('cd ../pc-benat'); T.ci('Beñat: huevos',{'lista.txt':'Lista de la compra\n- pan\n- huevos\n'}); T.sh('git fetch'); },
 checks:[
  ['Integrado con git pull --rebase',A=>A.tried(/^git pull --rebase/)],
  ['Rebase terminado',A=>!A.repo('equipo/pc-benat').op],
  ['lista.txt con leche y huevos, sin marcas',A=>{ const f=A.file('equipo/pc-benat/lista.txt'); return /leche/.test(f)&&/huevos/.test(f)&&noMarks(f); }],
  ['Historial lineal: tu commit encima del de Ana',A=>{ const c=A.head('equipo/pc-benat'); return c.parents.length===1&&/huevos/.test(c.msg)&&/leche/.test(A.C(c.parents[0]).msg); }],
  ['Subido: servidor = pc-benat',A=>A.br('equipo/pc-benat','main')===srv(A).heads.main]]},
'e-conf-ganar':{ note:'A: <code>equipo/pc-benat</code> (commit "Desastre", cambios y basura.tmp). B: <code>~/practicas-git/solo</code> (GitHub tiene "Commit equivocado"). C: <code>equipo/pc-ana</code> (commit local, notas.txt sin commit y el servidor con otro cambio en lista.txt).',
 setup:T=>{ T.base(); T.gh('usuario','solo'); T.repo('solo',[['Inicio',{'a.txt':'a\n'}]]); T.sh('git remote add origin git@github.com:usuario/solo.git'); T.sh('git push -u origin main');
  T.sh('mkdir -p /tmp/otro'); T.sh('cd /tmp/otro'); T.sh('git clone git@github.com:usuario/solo.git'); T.sh('cd solo'); T.ci('Commit equivocado',{'a.txt':'mal\n'}); T.sh('git push'); T.sh('cd ~/practicas-git/solo'); T.sh('rm -rf /tmp/otro');
  T.ci('Versión buena',{'b.txt':'bien\n'});
  T.sh('cd ~/practicas-git'); T.equipo(); T.sh('cd ../pc-ana'); T.ci('Ana: notas',{'notas.txt':'Comprar el sábado\n'}); T.sh('git push');
  T.sh('cd ..'); T.sh('git clone servidor/proyecto.git pc-carlos'); T.sh('cd pc-carlos'); T.sh('git config user.name "Carlos"'); T.ci('Carlos: leche desnatada',{'lista.txt':'Lista de la compra\n- pan\n- leche desnatada\n'}); T.sh('git push'); T.mark('carlos'); T.sh('cd ..'); T.sh('rm -rf pc-carlos');
  T.sh('cd pc-ana'); T.ci('Ana: leche entera',{'lista.txt':'Lista de la compra\n- pan\n- leche entera\n'}); T.put('notas.txt','Comprar el sábado\nIr pronto\n');
  T.sh('cd ../pc-benat'); T.ci('Desastre',{'lista.txt':'todo roto\n'}); T.put('lista.txt','aún más roto\n'); T.put('basura.tmp','???\n'); },
 checks:[
  ['A: pc-benat idéntico al servidor',A=>A.br('equipo/pc-benat','main')===srv(A).heads.main],
  ['A: sin cambios ni archivos sueltos',A=>A.clean('equipo/pc-benat')],
  ['B: GitHub tiene tu "Versión buena"',A=>A.gh('usuario','solo').heads.main===A.br('solo','main')&&/Versión buena/.test(A.head('solo').msg)],
  ['B: --force-with-lease (no --force)',A=>A.used(/--force-with-lease/)&&!A.used(/push .*(--force(?!-with-lease)|-f\b)/)],
  ['C: pc-ana integró origin/main con un merge',A=>{ const c=A.head('equipo/pc-ana'); return c.parents.length===2&&A.isAnc(A.mark.carlos,c.h); }],
  ['C: en el conflicto ganó tu línea (leche entera)',A=>{ const f=A.tree('equipo/pc-ana')['lista.txt']; return /leche entera/.test(f)&&!/desnatada/.test(f); }],
  ['C: tus cambios sin commit de notas.txt han vuelto',A=>/Ir pronto/.test(A.file('equipo/pc-ana/notas.txt'))&&!A.repo('equipo/pc-ana').stash.length]]},
'e-rebase':{ note:'<code>blog</code>: la rama <code>contacto</code> (2 commits) salió de "Inicio"; después main recibió "Portada". Estás en main.',
 setup:T=>{ T.base(); T.repo('blog',[['Inicio',{'index.html':'<h1>Blog</h1>\n'}]]); T.sh('git switch -c contacto'); T.ci('Página de contacto',{'contacto.html':'<h2>Contacto</h2>\n'}); T.ci('Formulario de contacto',{'contacto.html':'<h2>Contacto</h2>\n<form></form>\n'});
  T.sh('git switch main'); T.ci('Portada',{'portada.html':'<h2>Portada</h2>\n'}); },
 checks:[
  ['Rebase de contacto sobre main',A=>A.used(/^git rebase main/)],
  ['Historial lineal (sin commits de merge)',A=>A.log('blog').every(c=>c.parents.length<2)],
  ['Tus commits quedan después de "Portada"',A=>{ const L=A.log('blog'); return /Formulario/.test(L[0].msg)&&/Página de contacto/.test(L[1].msg)&&/Portada/.test(L[2].msg); }],
  ['Rama contacto borrada y estás en main',A=>!('contacto' in A.repo('blog').heads)&&A.repo('blog').head==='main']]},
'e-rebase-i':{ note:'<code>faq</code>: 4 commits locales sin subir. En el editor del rebase cambia <code>pick</code> por <code>squash</code>/<code>fixup</code>/<code>drop</code> (o s/f/d) y pulsa Guardar.',
 setup:T=>{ T.base(); T.gh('usuario','faq'); T.repo('faq',[['Inicio',{'index.html':'<h1>Web</h1>\n'}]]); T.sh('git remote add origin git@github.com:usuario/faq.git'); T.sh('git push -u origin main'); T.mark('base');
  T.ci('FAQ',{'faq.md':'# FAQ\n¿Qué es Gti?\n'}); T.ci('wip',{'faq.md':'# FAQ\n¿Qué es Gti?\n¿Qué es un commit?\n'}); T.ci('arreglo typo',{'faq.md':'# FAQ\n¿Qué es Git?\n¿Qué es un commit?\n'}); T.ci('prueba temporal',{'prueba.tmp':'borrar\n'}); },
 checks:[
  ['Un único commit nuevo "FAQ completa" sobre origin/main',A=>{ const c=A.head('faq'); return c.msg.trim()==='FAQ completa'&&c.parents[0]===A.mark.base; }],
  ['faq.md con el contenido de wip y la corrección',A=>{ const f=A.tree('faq')['faq.md']; return /commit\?/.test(f)&&/Git\?/.test(f); }],
  ['prueba.tmp eliminado del commit y de la carpeta',A=>!('prueba.tmp' in A.tree('faq'))&&A.file('faq/prueba.tmp')==null],
  ['Rebase terminado',A=>!A.repo('faq').op],
  ['Subido a GitHub',A=>A.gh('usuario','faq').heads.main===A.br('faq','main')]]},
'e-rebase-i2':{ note:'<code>precios</code>: los 3 últimos commits son "Página de precios", "cosas" y "Estilos". En el editor: reordena líneas y usa <code>reword</code> (r).',
 setup:T=>{ T.base(); T.repo('precios',[['Inicio',{'index.html':'<h1>Web</h1>\n'}],['Página de precios',{'precios.html':'<h2>Precios</h2>\n'}],['cosas',{'tarifas.html':'<table></table>\n'}],['Estilos',{'estilos.css':'table{border:1px solid}\n'}]]); },
 checks:[
  ['Orden: Estilos → Añade tabla de tarifas → Página de precios',A=>{ const L=A.log('precios').slice(0,3).map(c=>c.msg.trim()); return L[2]==='Estilos'&&L[1]==='Añade tabla de tarifas'&&L[0]==='Página de precios'; }],
  ['"cosas" ya no aparece',A=>!A.log('precios').some(c=>c.msg.trim()==='cosas')],
  ['Mismo contenido final',A=>['precios.html','tarifas.html','estilos.css'].every(f=>f in A.tree('precios'))],
  ['Rebase terminado',A=>!A.repo('precios').op]]},
'e-fork':{ note:'Tu fork ya existe: <code>git@github.com:usuario/apuntes-redes.git</code> (TU_USUARIO = usuario). El original, <code>https://github.com/profe/apuntes-redes.git</code>, ha recibido "Tema 4" después del fork. La máscara correcta de /26 es 255.255.255.192. El Pull Request se abre en la web: aquí se comprueba que la rama está subida.',
 setup:T=>{ T.base(); T.gh('profe','apuntes-redes',[['Tema 1',{'tema1.md':'# Tema 1\n'}],['Tema 3',{'tema3.md':'# Tema 3\nMáscara /26: 255.255.255.0\n'}]]);
  T.sh('git clone --bare git@github.com:profe/apuntes-redes.git /.github/usuario/apuntes-redes.git');
  T.sh('mkdir -p /tmp/p'); T.sh('cd /tmp/p'); T.sh('git clone git@github.com:profe/apuntes-redes.git'); T.sh('cd apuntes-redes'); T.sh('git config user.name "profe"'); T.ci('Tema 4',{'tema4.md':'# Tema 4\n'}); T.sh('git push'); T.sh('cd ~/practicas-git'); T.sh('rm -rf /tmp/p'); },
 checks:[
  ['Fork clonado',A=>/(usuario|TU_USUARIO)\/apuntes-redes/.test(A.repo('apuntes-redes').remotes.origin)],
  ['Rama corrige-mascara subida a tu fork con la corrección',A=>/192/.test(A.treeOf(A.gh('usuario','apuntes-redes').heads['corrige-mascara'])['tema3.md'])],
  ['upstream → repositorio original',A=>/profe\/apuntes-redes/.test(A.repo('apuntes-redes').remotes.upstream)],
  ['main local al día con upstream ("Tema 4")',A=>A.isAnc(A.gh('profe','apuntes-redes').heads.main,A.br('apuntes-redes','main'))],
  ['main de tu fork actualizada',A=>A.isAnc(A.gh('profe','apuntes-redes').heads.main,A.gh('usuario','apuntes-redes').heads.main)]]},
'e-equipo':{ note:'Eres colaborador de <code>git@github.com:supervisor/web-instituto.git</code>. Crea tu página (p. ej. <code>ciclos.html</code>) en una rama. La revisión y fusión del PR se hacen en la web de GitHub.',
 setup:T=>{ T.base(); T.gh('supervisor','web-instituto',[['Estructura inicial',{'index.html':'<h1>Instituto</h1>\n'}]]); },
 checks:[
  ['Repo clonada',A=>!!A.repo('web-instituto')],
  ['Rama con formato nombre/tarea',A=>Object.keys(A.repo('web-instituto').heads).some(b=>/^[\w-]+\/[\w-]+$/.test(b))],
  ['Commit nuevo en esa rama',A=>{ const R=A.repo('web-instituto'), b=Object.keys(R.heads).find(b=>b.includes('/')); return R.heads[b]!==A.gh('supervisor','web-instituto').heads.main; }],
  ['Rama subida a GitHub y vinculada (-u)',A=>{ const R=A.repo('web-instituto'), b=Object.keys(R.heads).find(b=>b.includes('/')); return A.gh('supervisor','web-instituto').heads[b]===R.heads[b]&&!!R.upstream[b]; }]]},
'e-grande':{ note:'<code>web</code>: el último commit (sin subir) incluye docs/demo.mp4 (150 MB simulados).',
 setup:T=>{ T.base(); T.gh('usuario','web'); T.repo('web',[['Inicio',{'index.html':'<h1>Web</h1>\n'}]]); T.sh('git remote add origin git@github.com:usuario/web.git'); T.sh('git push -u origin main');
  T.ci('Añade documentación',{'docs/manual.md':'# Manual\n','docs/demo.mp4':'[binario 150 MB] vídeo de demostración\n'}); },
 checks:[
  ['Has visto el rechazo de GitHub',A=>A.failed(/^git push/)],
  ['demo.mp4 fuera del último commit y manual.md dentro',A=>{ const t=A.tree('web'); return !('docs/demo.mp4' in t)&&'docs/manual.md' in t; }],
  ['demo.mp4 sigue en el disco',A=>A.file('web/docs/demo.mp4')!=null],
  ['.gitignore ignora los .mp4',A=>A.ign('web','docs/demo.mp4')],
  ['Subido: GitHub = local y sin el vídeo en ningún commit',A=>{ const G=A.gh('usuario','web'); return G.heads.main===A.br('web','main')&&A.logOf(G.heads.main).every(c=>!('docs/demo.mp4' in c.tree)); }]]},
'e-lfs':{ note:'<code>despliegue</code>: ya existen <code>debian.iso</code> (650 MB simulados) y <code>modelos/red.bin</code>. GitHub rechaza archivos de más de 100 MB fuera de LFS.',
 setup:T=>{ T.base(); T.gh('usuario','despliegue'); T.repo('despliegue',[['Inicio',{'README.md':'# Despliegue\n'}]]); T.sh('git remote add origin git@github.com:usuario/despliegue.git'); T.sh('git push -u origin main');
  T.put('debian.iso','[binario 650 MB] imagen ISO\n'); T.put('modelos/red.bin','[binario 120 MB] modelo\n'); },
 checks:[
  ['git lfs install',A=>A.used(/^git lfs install/)],
  ['.gitattributes con *.iso y modelos/*.bin, en un commit',A=>{ const g=A.tree('despliegue')['.gitattributes']||''; return /\*\.iso filter=lfs/.test(g)&&/modelos\/\*\.bin filter=lfs/.test(g); }],
  ['debian.iso en un commit',A=>'debian.iso' in A.tree('despliegue')],
  ['Has comprobado con git lfs ls-files',A=>A.used(/^git lfs ls-files/)],
  ['Subido a GitHub',A=>A.gh('usuario','despliegue').heads.main===A.br('despliegue','main')]]},
'e-crlf':{ note:'<code>servidor</code>: scripts/backup.sh se guardó con finales CRLF (Windows).',
 setup:T=>{ T.base(); T.repo('servidor',[['Script de copia',{'scripts/backup.sh':'#!/bin/bash\r\necho "copia"\r\ntar czf /tmp/web.tgz /var/www\r\n'}]]); },
 checks:[
  ['Has comprobado con file',A=>A.used(/^file /)],
  ['backup.sh sin CRLF en el último commit',A=>!/\r/.test(A.tree('servidor')['scripts/backup.sh'])],
  ['.gitattributes con "*.sh text eol=lf" en el commit',A=>/\*\.sh\s+text\s+eol=lf/.test(A.tree('servidor')['.gitattributes'])],
  ['core.autocrlf = input',A=>A.cfg('core.autocrlf')==='input'],
  ['Carpeta limpia',A=>A.clean('servidor')]]}
};

if(typeof module!=='undefined'&&module.exports) module.exports={Env,SPECS,splitCmds};
if(typeof document!=='undefined') initUI();

/* ════════════════ interfaz ════════════════ */
function initUI(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const EX=$$('section.ex'); if(!EX.length) return;
const LV={1:['básico','ok'],2:['medio','warn'],3:['avanzado','bad']};
const envs={}; let cur=-1, env=null, here=null, hpos=0;
document.body.insertAdjacentHTML('beforeend',`
<div id="lab" class="lab" hidden role="dialog" aria-modal="true" aria-labelledby="labTitle">
 <div class="lab-top">
  <button class="btn small" id="labPrev" type="button" aria-label="Ejercicio anterior">←</button>
  <div class="lab-title" id="labTitle"></div>
  <button class="btn small" id="labNext" type="button" aria-label="Ejercicio siguiente">→</button>
  <span class="sp"></span>
  <button class="btn small" id="labReset" type="button" title="Vuelve al punto de partida">↺ <span class="hide-s">Reiniciar</span></button>
  <button class="btn small" id="labCheck" type="button" title="Corrige sin enseñar la solución">✔ Comprobar</button>
  <button class="btn small primary" id="labSol" type="button">Solución</button>
  <button class="btn small" id="labClose" type="button" aria-label="Cerrar el laboratorio (Esc)">✕</button>
 </div>
 <div class="lab-body">
  <div class="lab-ex" id="labEx"></div>
  <div class="lab-tw">
   <div class="lab-note" id="labNote"></div>
   <div class="lab-term" id="labTerm"><div id="labOut" aria-live="polite"></div><label class="lab-in"><span id="labPs" class="ps"></span><input id="labIn" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Comando"></label></div>
   <div class="lab-ed" id="labEd" hidden><div class="lab-ed-h"><b id="labEdT"></b><span>Ctrl+S guarda y sale · Esc cancela</span></div><textarea id="labEdTa" spellcheck="false" aria-label="Editor"></textarea><div class="lab-ed-b"><button class="btn small primary" id="labEdSave" type="button">Guardar y salir</button><button class="btn small" id="labEdCancel" type="button">Cancelar</button></div></div>
  </div>
 </div>
</div>`);
const In=$('#labIn'), Out=$('#labOut'), Term=$('#labTerm');

EX.forEach((s,i)=>{ const b=document.createElement('button'); b.type='button'; b.className='btn lab-open'; b.innerHTML='🧪 Practicar en el laboratorio'; b.addEventListener('click',()=>open(i)); s.insertBefore(b,s.querySelector('details.sol')); });
const tb=document.createElement('button'); tb.type='button'; tb.className='btn'; tb.title='Un ejercicio por página con terminal para practicar'; tb.innerHTML='🧪 <span class="hide-s">Laboratorio</span>';
tb.addEventListener('click',()=>{ let k=0, bd=1e9; EX.forEach((s,i)=>{ const d=Math.abs(s.getBoundingClientRect().top); if(d<bd){ bd=d; k=i; } }); open(k); });
$('#solBtn').before(tb);

function fresh(id){ const e=Env(); const err=e.setup(SPECS[id]); e.html=''; e.ih=[]; e.res='';
  const w=`<span class="m"># Laboratorio: escribe los comandos como en una terminal real. "help" muestra lo que hay disponible.\n</span>`;
  e.html=err?w+`<span class="e">Error al preparar el ejercicio: ${esc(err.message)}\n</span>`:w; if(err) console.error(err); return e; }
function prompt(){ const p=env.prompt(); return `<span class="ps">alumno@aula:<b>${esc(p.path)}</b>${p.br?` <span class="br">(${esc(p.br)})</span>`:''}$</span> `; }
function flush(){ for(const o of env.takeOut()) env.html+=o.c?`<span class="${o.c}">${esc(o.s)}</span>`:esc(o.s);
  if(env.E.clearReq){ env.html=''; env.E.clearReq=false; } Out.innerHTML=env.html; Term.scrollTop=Term.scrollHeight; }
function setPs(){ $('#labPs').innerHTML=here?'<span class="ps">&gt;</span> ':prompt(); }
function open(i){ cur=(i+EX.length)%EX.length; const s=EX[cur], id=s.id, spec=SPECS[id]||{};
  env=envs[id]||(envs[id]=fresh(id)); here=null; hpos=env.ih.length;
  const lv=LV[s.dataset.level]||LV[1];
  $('#labTitle').innerHTML=`<b>Ejercicio ${s.dataset.n}</b> · ${esc((s.dataset.title||'').replace(/^Ej \d+ · /,''))} <span class="pill ${lv[1]}">${lv[0]}</span>`;
  const c=s.cloneNode(true); c.querySelectorAll('details.sol,.lab-open,.kicker,.copy').forEach(x=>x.remove()); c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
  const st=document.createElement('div'); st.className='ex lab-st'; st.append(...c.childNodes);
  const res=document.createElement('div'); res.id='labRes'; res.innerHTML=env.res;
  $('#labEx').replaceChildren(st,res); wireTabs(res); $('#labEx').scrollTop=0;
  $('#labNote').innerHTML=(spec.note?'<b>Punto de partida.</b> '+spec.note:'')||'';
  flush(); setPs();
  document.body.classList.add('lab-on'); $('#lab').hidden=false; history.replaceState(null,'','#lab-'+id);
  if(env.E.edit) showEd(); else In.focus(); }
function close(){ if(cur<0) return; $('#lab').hidden=true; document.body.classList.remove('lab-on'); const s=EX[cur]; history.replaceState(null,'','#'+s.id); s.scrollIntoView({block:'start'}); }
function exec(line,body){ env.run(line,body); flush(); setPs(); if(env.E.edit) showEd(); }
function showEd(){ const ed=env.E.edit; $('#labEdT').textContent=ed.title; $('#labEdTa').value=ed.text; $('#labEd').hidden=false; In.disabled=true; $('#labEdTa').focus(); $('#labEdTa').setSelectionRange(0,0); $('#labEdTa').scrollTop=0; }
function closeEd(save){ const v=$('#labEdTa').value; $('#labEd').hidden=true; In.disabled=false; if(save) env.saveEdit(v); else env.cancelEdit(); flush(); setPs(); if(env.E.edit) showEd(); else In.focus(); }
In.addEventListener('keydown',e=>{
  if(e.key==='Enter'){ const v=In.value; In.value='';
    if(here){ env.html+=`<span class="ps">&gt;</span> ${esc(v)}\n`; if(v.trim()===here.tag){ const h=here; here=null; exec(h.line,h.lines.join('\n')+(h.lines.length?'\n':'')); } else { here.lines.push(v); flush(); } setPs(); return; }
    env.html+=prompt()+esc(v)+'\n'; if(!v.trim()){ flush(); return; }
    env.ih.push(v); hpos=env.ih.length;
    const m=v.match(/<<-?\s*['"]?(\w+)['"]?/); if(m){ here={tag:m[1],line:v,lines:[]}; flush(); setPs(); return; }
    exec(v); return; }
  if(e.key==='ArrowUp'||e.key==='ArrowDown'){ e.preventDefault(); hpos=Math.max(0,Math.min(env.ih.length,hpos+(e.key==='ArrowUp'?-1:1))); In.value=env.ih[hpos]||''; return; }
  if(e.key==='Tab'){ e.preventDefault(); const r=env.complete(In.value); In.value=r.line; if(r.options){ env.html+=prompt()+esc(In.value)+'\n'+esc(r.options.join('  '))+'\n'; flush(); } return; }
  if(e.key==='l'&&e.ctrlKey){ e.preventDefault(); env.html=''; flush(); return; }
  if(e.key==='c'&&e.ctrlKey&&In.selectionStart===In.selectionEnd){ e.preventDefault(); env.html+=(here?'> ':prompt())+esc(In.value)+'^C\n'; In.value=''; here=null; flush(); setPs(); return; }
  if(e.key==='Escape'&&!In.value) close(); });
Term.addEventListener('click',()=>{ if(!getSelection().toString()) In.focus(); });
$('#labEdTa').addEventListener('keydown',e=>{ if(e.key==='s'&&(e.ctrlKey||e.metaKey)){ e.preventDefault(); closeEd(true); } else if(e.key==='Escape'){ e.preventDefault(); closeEd(false); }
  else if(e.key==='Tab'){ e.preventDefault(); const t=e.target, p=t.selectionStart; t.value=t.value.slice(0,p)+'    '+t.value.slice(t.selectionEnd); t.selectionStart=t.selectionEnd=p+4; } });
$('#labEdSave').addEventListener('click',()=>closeEd(true)); $('#labEdCancel').addEventListener('click',()=>closeEd(false));
$('#labPrev').addEventListener('click',()=>open(cur-1)); $('#labNext').addEventListener('click',()=>open(cur+1)); $('#labClose').addEventListener('click',close);
// confirm() está bloqueado en la web publicada: se confirma pulsando dos veces
const rb=$('#labReset'), rbHtml=rb.innerHTML; let rbArm=0;
rb.addEventListener('click',()=>{ if(env.ih.length&&Date.now()-rbArm>4000){ rbArm=Date.now(); rb.textContent='¿Seguro? Pulsa otra vez'; setTimeout(()=>rb.innerHTML=rbHtml,4000); return; } rbArm=0; rb.innerHTML=rbHtml; delete envs[EX[cur].id]; open(cur); });
$('#labCheck').addEventListener('click',()=>evaluate(false)); $('#labSol').addEventListener('click',()=>evaluate(true));
document.addEventListener('keydown',e=>{ if($('#lab').hidden||e.target===In||e.target.tagName==='TEXTAREA') return; if(e.key==='Escape') close(); },true);

function wireTabs(root){ root.querySelectorAll('[data-tabgroup]').forEach(g=>{ const btns=[...g.querySelectorAll('button')], panes=[...g.parentElement.querySelectorAll(':scope > [data-pane]')];
  btns.forEach(b=>b.addEventListener('click',()=>{ btns.forEach(x=>x.setAttribute('aria-selected',x===b)); panes.forEach(p=>p.hidden=p.dataset.pane!==b.dataset.tab); })); }); }
function solCmds(sol,pane){ let codes=[...sol.querySelectorAll('pre.sh code')]; const pn=pane&&sol.querySelector(`[data-pane="${pane}"]`); if(pn) codes=[...pn.querySelectorAll('pre.sh code')];
  else { const tabs=sol.querySelector('[data-pane]'); if(tabs) codes=[...tabs.querySelectorAll('pre.sh code')]; }
  const out=[]; for(const c of codes) for(const l of (c.dataset.raw||c.textContent).split('\n')){ if(/^│/.test(l)||/^\s*#/.test(l)||!l.trim()) continue;
    for(const p of splitCmds(l.replace(/\s{2,}#\s.*$/,''))) if(/^git /.test(p.cmd)&&!out.some(o=>o.shape===p.shape)) out.push(p); }
  return out; }
function evaluate(showSol){ const s=EX[cur], spec=SPECS[s.id]||{}, A=env.A;
  const rs=(spec.checks||[]).map(([t,fn,h])=>{ let ok=false; try{ ok=!!fn(A); }catch(e){} return {t,ok,h}; });
  const n=rs.filter(r=>r.ok).length, errs=env.E.hist.filter(h=>!h.ok);
  let h=`<div class="lab-res${n===rs.length?' all':''}"><h3>${n===rs.length?'✓ ¡Todo correcto!':`${n} de ${rs.length} comprobaciones`}</h3>
   <ul class="lab-chk">${rs.map(r=>`<li class="${r.ok?'ok':'bad'}"><span aria-hidden="true">${r.ok?'✓':'✗'}</span><div>${esc(r.t)}${!r.ok&&r.h&&showSol?`<small>${esc(r.h)}</small>`:''}</div><span class="sr">${r.ok?'correcto':'pendiente'}</span></li>`).join('')}</ul>`;
  if(errs.length) h+=`<h4>Comandos que Git rechazó o dejó a medias (${errs.length})</h4><p class="mut">Algunos son parte del ejercicio (un conflicto, un push rechazado). Si no, lee el mensaje en la terminal: casi siempre dice qué falta.</p><div class="lab-cmds">${errs.slice(-12).map(e=>`<code class="err">${esc(e.cmd)}</code>`).join('')}</div>`;
  if(showSol){ const sol=s.querySelector('details.sol'), sc=solCmds(sol,spec.pane), mine=new Set(env.E.hist.map(x=>x.shape)), used=sc.filter(c=>mine.has(c.shape)).length;
    if(sc.length) h+=`<h4>Comandos de Git de la solución: has usado ${used} de ${sc.length}</h4><p class="mut">Verde = lo has usado (el mensaje o el hash pueden ser otros). No todos son obligatorios: algunos son comprobaciones o alternativas.</p><div class="lab-cmds">${sc.map(c=>`<code class="${mine.has(c.shape)?'ok':''}">${esc(c.cmd)}</code>`).join('')}</div>`;
    h+='</div>'; const d=sol.cloneNode(true); d.open=true; d.querySelectorAll('.copy').forEach(x=>x.remove()); d.querySelector('summary').innerHTML='Solución'; h+=d.outerHTML; }
  else h+=(n<rs.length?`<p class="mut" style="margin:.6em 0 0">¿Atascado? <b>Solución</b> muestra los comandos y qué te falta.</p>`:'')+'</div>';
  env.res=h; const res=$('#labRes'); res.innerHTML=h; wireTabs(res); res.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); }
const m=location.hash.match(/^#lab-(e-.+)$/); if(m){ const k=EX.findIndex(s=>s.id===m[1]); if(k>=0) open(k); }
}
})();
