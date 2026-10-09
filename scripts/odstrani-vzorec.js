#!/usr/bin/env node
// Odstrani vzorčne podatke iz prototipa (Šenčur, Westlink, Kušar, Mačkovci, Gaj, vzorčne ponudbe, datoteke,
// monterji v planu, vzorčni podizvajalci, napake in predlogi, sled sprememb, PDEF podatki partnerjev).
// Ostanejo: ceniki (sistemi, dodatna dela, kooperanti, Kalcer), seznam partnerjev, uporabniki, arhiv cen za Poročila.
//
//   npm run odstrani-vzorec -- --potrdi
//
// Poženi ŠELE, ko so pravi podatki pripravljeni za vnos ali uvoz. Pred tem se naredi varnostna kopija baze.
'use strict';
const fs = require('fs');
const path = require('path');
const { config, q, tx, meta, backupDb, setKey } = require('./_skupno');

if (!process.argv.includes('--potrdi')) {
  console.error('To izbriše vse vzorčne objekte, ponudbe in datoteke. Za izvedbo dodaj --potrdi.');
  process.exit(1);
}
if (!meta.get('seeded')) { console.error('Baza je prazna (aplikacija še ni bila odprta). Najprej se prijavi kot administrator.'); process.exit(1); }
const bk = backupDb('pred-odstranitvijo-vzorca');
const prazenPlan = { own: Array.from({ length: 15 }, () => ({ n: '', c: ['', '', '', '', '', '', ''], d: {} })), koop: [], v2: true, v3: true };
// Ključ → prazna vrednost. Ključ, ki ga ni v bazi, bi aplikacija vzela iz vzorca, zato se zapišejo vsi.
const PRAZNO = {
  POVP: [], PON: [], POP: [], FILES: [], TRASH: [], FB: [], DOCHID: [], PODI: [],
  PLAN: prazenPlan, PLEG: [], URE: [], URE_PLAN: [], UREH: { _v2: 1, _m: 1 },
  PART: {}, AUDIT: [],
};
tx(() => {
  q('DELETE FROM objekti').run();
  q('DELETE FROM user_state').run();
  for (const [k, v] of Object.entries(PRAZNO)) setKey(k, v, 'odstranitev vzorca');
  q('DELETE FROM files').run();
  q('DELETE FROM audit').run();
  meta.set('brez_vzorca', new Date().toISOString());
  q("INSERT INTO audit(user_name,username,kje,kaj) VALUES('skrbnik','skrbnik','Vzorčni podatki','odstranjeni')").run();
});
const fdir = path.join(config.dataDir, 'files');
if (fs.existsSync(fdir)) fs.renameSync(fdir, path.join(config.dataDir, 'files-vzorec-' + Date.now()));
console.log('Vzorčni podatki odstranjeni. Varnostna kopija: ' + bk + '\nStare datoteke so v mapi files-vzorec-* (izbriši jo, ko preveriš).');
