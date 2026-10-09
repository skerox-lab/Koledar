#!/usr/bin/env node
// Uvoz podatkov v bazo iz izvoza prototipa (vsebina localStorage ključa »msd-vzorec2«, JSON).
//
//   npm run uvoz -- pot/do/izvoz.json [--zamenjaj]
//
// Kako dobiš izvoz iz prototipa: odpri prototip v istem brskalniku, kjer si delal, pritisni F12 › Console in vpiši:
//   copy(localStorage.getItem('msd-vzorec2'))
// nato vsebino odložišča prilepi v datoteko izvoz.json. Datotek (IndexedDB) ta izvoz ne vsebuje – naloži jih znova.
//
// Pred uvozom se naredi varnostna kopija baze (data/backup). Uporabniki in sled sprememb se NE uvozijo
// (uporabnike vodi Administracija, sled piše strežnik). Ustavi strežnik med uvozom.
'use strict';
const fs = require('fs');
const { q, tx, meta, DATAK, backupDb, setKey } = require('./_skupno');

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
if (!file) { console.error('Uporaba: npm run uvoz -- izvoz.json [--zamenjaj]'); process.exit(1); }
const o = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!o || typeof o !== 'object' || !o.OBJ) { console.error('Datoteka ni izvoz prototipa (manjka OBJ).'); process.exit(1); }
if (meta.get('seeded') && !args.includes('--zamenjaj')) {
  console.error('V bazi že so podatki. Za zamenjavo vseh podatkov dodaj --zamenjaj (prej se naredi varnostna kopija).');
  process.exit(1);
}
const bk = backupDb('pred-uvozom');
const SKIP = new Set(['OBJ', 'CUR', 'DISM', 'USERS', 'AUDIT', ...DATAK]);
const cur = o.CUR;
tx(() => {
  q('DELETE FROM state').run();
  q('DELETE FROM objekti').run();
  q('DELETE FROM user_state').run();
  let n = 0;
  for (const [k, v] of Object.entries(o)) if (!SKIP.has(k) && v !== undefined) { setKey(k, v, 'uvoz'); n++; }
  let pos = 0;
  for (const [id, ob] of Object.entries(o.OBJ)) {
    const v = Object.assign({}, ob);
    if (id === cur) { v.d = {}; DATAK.forEach(k => { if (o[k] !== undefined) v.d[k] = o[k]; }); } // podatki odprtega objekta
    q('INSERT INTO objekti(id,pos,vodja,value,ver,updated_by) VALUES(?,?,?,?,1,?)').run(id, ++pos, v.vodja || null, JSON.stringify(v), 'uvoz');
  }
  meta.set('seeded', new Date().toISOString());
  meta.del('brez_vzorca');
  q("INSERT INTO audit(user_name,username,kje,kaj) VALUES('uvoz','uvoz','Uvoz podatkov',?)").run(`uvoženo iz ${require('path').basename(file)}: ${n} ključev, ${pos} objektov`);
  console.log(`Uvoženo: ${n} ključev, ${pos} objektov. Varnostna kopija pred uvozom: ${bk}`);
});
