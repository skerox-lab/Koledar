#!/usr/bin/env node
// Iz prototipa (prototip/index.html) naredi frontend nove aplikacije:
//   public/index.html  – markup in CSS prototipa (knjižnice in pisave lokalno)
//   public/app.js      – JavaScript prototipa z NATANČNO NAŠTETIMI popravki spodaj
//   server/data/rparch.json – arhiv cen za Poročila (strežnik ga pošlje samo direktorju in administratorju)
//
// Vsak popravek mora najti točno pričakovano število zadetkov, sicer se build ustavi.
// Tako je razlika do prototipa vedno vidna na enem mestu. Ob novi verziji prototipa:
// zamenjaj prototip/index.html, popravi SHA256 spodaj in ponovno poženi `npm run build`.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'prototip', 'index.html');
const SHA256 = 'd3d56bdaae2117169f988a500f0dbd8b03b84b7c5ae91593314747e65ee38123';

const raw = fs.readFileSync(SRC);
const sha = crypto.createHash('sha256').update(raw).digest('hex');
if (sha !== SHA256) {
  console.error('NAPAKA: SHA-256 prototipa se ne ujema.\n  pričakovano ' + SHA256 + '\n  dobljeno    ' + sha);
  process.exit(1);
}
const html = raw.toString('utf8');

// ---------------------------------------------------------------- razdelitev
const SCRIPT_OPEN = '\n<script>\n';
const iApp = html.lastIndexOf(SCRIPT_OPEN);
const iEnd = html.indexOf('\n</script>', iApp + 1);
if (iApp < 0 || iEnd < 0) throw new Error('Ne najdem glavnega <script> v prototipu');
let head = html.slice(0, iApp);            // vse do glavnega skripta
let app = html.slice(iApp + SCRIPT_OPEN.length, iEnd) + '\n';
const tail = html.slice(iEnd + '\n</script>'.length); // </body></html>

const applied = [];
function patch(where, opis, find, repl, count) {
  count = count == null ? 1 : count;
  const src = where === 'app' ? app : head;
  const n = src.split(find).length - 1;
  if (n !== count) throw new Error(`Popravek »${opis}«: pričakovano ${count} zadetkov, najdeno ${n}`);
  const out = src.split(find).join(repl);
  if (where === 'app') app = out; else head = out;
  applied.push({ where, opis, count });
}

// ---------------------------------------------------------------- index.html
patch('head', 'Google pisave → lokalne pisave',
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Montserrat:wght@800&display=swap" rel="stylesheet">',
  '<link href="fonts/fonts.css" rel="stylesheet">');
for (const [lib, file] of [
  ['xlsx/0.18.5/', 'xlsx.full.min.js'], ['html2canvas/1.4.1/', 'html2canvas.min.js'], ['jspdf/2.5.1/', 'jspdf.umd.min.js'],
  ['jszip/3.10.1/', 'jszip.min.js'], ['pdf-lib/1.17.1/', 'pdf-lib.min.js'], ['exceljs/4.4.0/', 'exceljs.min.js'],
  ['pdf.js/3.11.174/', 'pdf.min.js'], ['pdf.js/3.11.174/', 'pdf.worker.min.js']]) {
  patch('head', 'knjižnica ' + file + ' lokalno',
    `<script src="https://cdnjs.cloudflare.com/ajax/libs/${lib}${file}"></script>`,
    `<script src="vendor/${file}"></script>`);
}
patch('head', 'Odjava gre na strežnik',
  `<button class="sm" onclick="try{sessionStorage.removeItem('msd-login')}catch(x){}window._li=false;render()">Odjava</button>`,
  `<button class="sm" onclick="MSD.logout()">Odjava</button>`);

// ---------------------------------------------------------------- app.js
patch('app', 'vodja = prijavljeni uporabnik (v razvojnem načinu Nejc kot v prototipu)',
  "const ME='Nejc';", "const ME=MSD.me||'Nejc';");
patch('app', 'začetna vloga iz prijave',
  "role:'nejc',cen:'sistemi'", "role:MSD.role||'nejc',cen:'sistemi'");
patch('app', 'saveFile: navaden prenos v brskalniku (namesto claude.use downloads)',
  "async function saveFile(name,data){let dl=null;try{dl=(typeof claude!=='undefined'&&claude.use)?await claude.use('downloads'):null}catch(x){}if(!dl){toast('Prenos datotek v tem pogledu ni na voljo');return}try{await dl.save({filename:name,data});toast('Pripravljeno: '+name)}catch(x){toast(x&&x.code==='declined'?'Prenos preklican':'Prenos ni uspel'+(x&&x.code?' ('+x.code+')':''))}}",
  "async function saveFile(name,data){try{await MSD.download(name,data);toast('Pripravljeno: '+name)}catch(x){toast('Prenos ni uspel')}}");
patch('app', 'pdf.js worker lokalno',
  "'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'", "'vendor/pdf.worker.min.js'", 4);
patch('app', 'save(): shranjevanje na strežnik namesto localStorage',
  "function save(){try{const o={};KEYS.forEach(k=>o[k]=eval(k));localStorage.setItem('msd-vzorec2',JSON.stringify(o))}catch(x){}}",
  "function save(){try{const o={};KEYS.forEach(k=>o[k]=eval(k));MSD.save(o)}catch(x){}}");
patch('app', 'load(): podatki s strežnika namesto localStorage',
  "function load(){try{const t=localStorage.getItem('msd-vzorec2');if(!t)return;const o=JSON.parse(t);KEYS.forEach(",
  "function load(){try{const o=MSD.state;if(!o)return;if(o._full)Object.keys(OBJ).forEach(id=>delete OBJ[id]);KEYS.forEach(");
patch('app', 'resetAll: ponastavitev na strežniku (samo razvojni način)',
  "try{localStorage.removeItem('msd-vzorec2')}catch(x){}location.reload()}",
  "MSD.reset()}");
patch('app', 'Sled sprememb: dejanski uporabnik, zapis tudi na strežnik',
  "function log(where,what){AUDIT.unshift(['pravkar',({nejc:'Nejc',direktor:'direktor',racun:'računovodstvo',admin:'Nejc (admin)'}[S.role]),where,what])}",
  "function log(where,what){AUDIT.unshift(['pravkar',MSD.who(),where,what]);MSD.audit(where,what)}");
patch('app', '»kdo« pri datotekah, košu in prijavah = dejanski uporabnik',
  "({nejc:'Nejc',direktor:'direktor',racun:'računovodstvo',admin:'Nejc (admin)'}[S.role])", 'MSD.who()', 4);
patch('app', 'prijava: seja na strežniku',
  "function loggedIn(){try{return sessionStorage.getItem('msd-login')==='1'}catch(x){return window._li}}",
  "function loggedIn(){return MSD.loggedIn}");
patch('app', 'prijavno okno: predizpolnjeno ime samo v razvojnem načinu',
  'autocomplete="username" value="nejc@montaza-skerjanec.si"',
  'autocomplete="username" value="${MSD.dev?\'nejc@montaza-skerjanec.si\':\'\'}"');
patch('app', 'prijavno okno: »katerokoli geslo« samo v razvojnem načinu',
  ' V vzorcu deluje katerokoli geslo.</div>', '${MSD.dev?\' V vzorcu deluje katerokoli geslo.\':\'\'}</div>');
patch('app', 'prijava: preverjanje gesla na strežniku',
  "function loginSubmit(){const u=(document.getElementById('lgu')||{}).value||'';if(!u.trim()){toast('Vpiši uporabniško ime ali e-naslov');return}window._user=u.trim();document.getElementById('login').remove();doLogin()}",
  "function loginSubmit(){const u=(document.getElementById('lgu')||{}).value||'';if(!u.trim()){toast('Vpiši uporabniško ime ali e-naslov');return}MSD.login(u.trim(),(document.getElementById('lgp')||{}).value||'')}");
patch('app', 'datoteke na strežniku namesto IndexedDB (fPut)',
  "async function fPut(id,data){if(data instanceof ArrayBuffer)data=new Uint8Array(data.slice(0));else if(ArrayBuffer.isView(data))data=new Uint8Array(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength));try{const db=await idb();await new Promise((res,rej)=>{const t=db.transaction('f','readwrite');t.objectStore('f').put(data,id);t.oncomplete=res;t.onerror=()=>rej(t.error)})}catch(x){window._mem=window._mem||{};window._mem[id]=data}}",
  "async function fPut(id,data){if(data instanceof ArrayBuffer)data=new Uint8Array(data.slice(0));else if(ArrayBuffer.isView(data))data=new Uint8Array(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength));try{await MSD.fPut(id,data)}catch(x){window._mem=window._mem||{};window._mem[id]=data;toast('Datoteke ni bilo mogoče shraniti na strežnik')}}");
patch('app', 'datoteke na strežniku namesto IndexedDB (fGet)',
  "async function fGet(id){try{const db=await idb();return await new Promise((res,rej)=>{const r=db.transaction('f').objectStore('f').get(id);r.onsuccess=()=>res(r.result||(window._mem||{})[id]);r.onerror=()=>rej(r.error)})}catch(x){return (window._mem||{})[id]}}",
  "async function fGet(id){try{return (await MSD.fGet(id))||(window._mem||{})[id]}catch(x){return (window._mem||{})[id]}}");
patch('app', 'datoteke na strežniku namesto IndexedDB (fDel)',
  "async function fDel(id){try{const db=await idb();db.transaction('f','readwrite').objectStore('f').delete(id)}catch(x){}}",
  "async function fDel(id){try{await MSD.fDel(id)}catch(x){}}");
patch('app', 'useObj: brez napake, če trenutnega objekta uporabnik ne vidi',
  "OBJ[CUR].d=snap();const d=OBJ[id].d;", "if(OBJ[CUR])OBJ[CUR].d=snap();const d=OBJ[id].d;");
patch('app', 'nova ponudba: vodja = prijavljeni uporabnik (dSave)',
  "ddv:d.ddv,obj:d.obj,vodja:'Nejc',file:", "ddv:d.ddv,obj:d.obj,vodja:ME,file:");
patch('app', 'nova ponudba: vodja = prijavljeni uporabnik (dSend)',
  "vodja:S.role==='nejc'?'Nejc':'Nejc',", "vodja:ME,");
patch('app', 'Administracija: Ponastavi geslo zares, dodan gumb Nastavi geslo',
  `<button class="sm" onclick="toast('Uporabnik \${r[0].replace(/'/g,'')} bo ob naslednji prijavi nastavil novo geslo')">Ponastavi geslo</button> `,
  `\${MSD.dev?\`<button class="sm" onclick="toast('Uporabnik \${r[0].replace(/'/g,'')} bo ob naslednji prijavi nastavil novo geslo')">Ponastavi geslo</button> \`:\`<button class="sm" onclick="MSD.pwReset(\${i})">Ponastavi geslo</button> <button class="sm" onclick="MSD.pwSet(\${i})">Nastavi geslo</button> \`}`);

patch('app', 'PDEF (vzorčni podatki partnerjev) ne velja več, ko je vzorec odstranjen (npm run odstrani-vzorec)',
  'const PDEF={', 'const PDEF=(MSD.state&&MSD.state._brezVzorca)?{}:{');

// Arhiv cen za Poročila: podatek ostane na strežniku, dobita ga samo direktor in administrator.
const mR = app.match(/const RPARCH=(\[.*?\]\]);/);
if (!mR) throw new Error('Ne najdem RPARCH');
const rparch = JSON.parse(mR[1]);
patch('app', 'RPARCH: arhiv cen s strežnika (samo direktor in administrator)', mR[0], 'const RPARCH=MSD.rparch||[];');

// Zagon: app.js naloži msd.js, ko ima podatke s strežnika.
head += '\n<script src="msd.js"></script>';

// ---------------------------------------------------------------- zapis
const OUT = path.join(ROOT, 'public');
fs.writeFileSync(path.join(OUT, 'index.html'), head + tail);
fs.writeFileSync(path.join(OUT, 'app.js'), app);
fs.mkdirSync(path.join(ROOT, 'server', 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'server', 'data', 'rparch.json'), JSON.stringify(rparch));
fs.writeFileSync(path.join(ROOT, 'docs', 'POPRAVKI-PROTOTIPA.md'),
  '# Popravki prototipa v novi aplikaciji\n\nSamodejno ustvarjeno z `npm run build` iz `scripts/build-frontend.js`. ' +
  'To so VSE spremembe kode prototipa (v' + '178, SHA-256 `' + SHA256 + '`). Vse ostalo je dobesedno enako.\n\n' +
  '| # | Datoteka | Popravek | Zadetkov |\n|---|---|---|---|\n' +
  applied.map((a, i) => `| ${i + 1} | ${a.where === 'app' ? 'app.js' : 'index.html'} | ${a.opis} | ${a.count} |`).join('\n') + '\n');
console.log('Prototip SHA-256 OK. Uporabljenih popravkov: ' + applied.length + ', RPARCH vrstic: ' + rparch.length);
