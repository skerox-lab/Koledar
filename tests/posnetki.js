// Posnetki zaslona vseh strani in zavihkov za 4 vloge pri 1400 × 900 (cela stran), prototip ↔ nova aplikacija.
'use strict';
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const L = require('./lib');

const ROLES = [['nejc', 'vodja projekta'], ['racun', 'računovodstvo'], ['direktor', 'direktor'], ['admin', 'administrator']];
const PAGES = [
  ['01 Moji objekti', "menuGo('objekti')"],
  ['02 Šenčur › Pregled', "openObj('sencur');tabGo('pregled')"],
  ['03 Šenčur › Ponudba', "openObj('sencur');tabGo('ponudba')"],
  ['04 Šenčur › Situacije', "openObj('sencur');tabGo('situacije')"],
  ['05 Šenčur › Podizvajalci', "openObj('sencur');tabGo('podi')"],
  ['06 Šenčur › Stroški', "openObj('sencur');tabGo('stroski')"],
  ['07 Šenčur › Dokumenti', "openObj('sencur');tabGo('dokumenti')"],
  ['08 Šenčur › Korespondenca', "openObj('sencur');tabGo('korespondenca')"],
  ['09 WESTLINK › Pregled', "openObj('westlink');tabGo('pregled')"],
  ['10 Povpraševanja in ponudbe', "menuGo('povp')"],
  ['11 Nova ponudba', "menuGo('povp');DRAFT=null;novaPonudba()"],
  ['12 Plan › Teden', "menuGo('plan');S.pv='w';render()"],
  ['13 Plan › Mesec', "menuGo('plan');pView('m')"],
  ['14 Plan › Leto', "menuGo('plan');pView('y')"],
  ['15 Partnerji', "menuGo('partnerji')"],
  ['16 Partner SGP Graditelj', "menuGo('partnerji');S.partner='SGP Graditelj d.d.';render()"],
  ['17 Ceniki › Sistemi', "menuGo('ceniki')"],
  ['18 Ceniki › Dodatna dela', "menuGo('ceniki');S.cen='dodatna';render()"],
  ['19 Ceniki › Kooperanti', "menuGo('ceniki');S.cen='kooperanti';render()"],
  ['20 Ceniki › Dobavitelji', "menuGo('ceniki');S.cen='dobavitelji';S.dsel=null;render()"],
  ['21 Ceniki › Dobavitelji › Kalcer', "menuGo('ceniki');S.cen='dobavitelji';S.dsel='kalcer';render()"],
  ['22 Poročila', "menuGo('porocila')"],
  ['23 Administracija › Napake in predlogi', "menuGo('admin');S.asub='fb';render()"],
  ['24 Administracija › Uporabniki', "menuGo('admin');S.asub='users';render()"],
  ['25 Administracija › Sled sprememb', "menuGo('admin');S.asub='audit';render()"],
  ['26 Administracija › Koš', "menuGo('admin');S.asub='trash';render()"],
  ['27 Administracija › Povezave', "menuGo('admin');S.asub='conn';render()"],
  ['28 Administracija › Nastavitve', "menuGo('admin');S.asub='set';render()"],
];

async function shot(p, setup) {
  if (setup) await p.evaluate(setup);
  await p.waitForTimeout(350);
  await p.evaluate(() => { const t = document.getElementById('toast'); if (t) t.classList.remove('on'); window.scrollTo(0, 0); });
  await p.waitForTimeout(400);
  return p.screenshot({ fullPage: true, animations: 'disabled' });
}
function compare(a, b, diffPath) {
  const A = PNG.sync.read(a), B = PNG.sync.read(b);
  if (A.width !== B.width || A.height !== B.height) return { diff: -1, note: `različna velikost ${A.width}×${A.height} / ${B.width}×${B.height}` };
  const D = new PNG({ width: A.width, height: A.height });
  const n = pixelmatch(A.data, B.data, D.data, A.width, A.height, { threshold: 0.1 });
  if (n) fs.writeFileSync(diffPath, PNG.sync.write(D));
  return { diff: n };
}

async function run(browser, protoUrl, newUrl, devReset, OUT) {
  const dir = path.join(OUT, 'posnetki');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const rows = [];
  // prijavno okno
  {
    const P = await L.open(browser, 'proto', protoUrl, { login: false });
    await devReset(newUrl);
    const N = await L.open(browser, 'new', newUrl, { login: false });
    await P.waitForSelector('#lgu'); await N.waitForSelector('#lgu');
    const a = await shot(P), b = await shot(N);
    fs.writeFileSync(path.join(dir, '00-prijava-prototip.png'), a); fs.writeFileSync(path.join(dir, '00-prijava-nova.png'), b);
    const c = compare(a, b, path.join(dir, '00-prijava-RAZLIKA.png'));
    rows.push({ role: '—', name: '00 Prijava', diff: c.diff, note: c.note, same: c.diff === 0 });
    await P.context().close(); await N.context().close();
  }
  for (const [role, rname] of ROLES) {
    const P = await L.open(browser, 'proto', protoUrl);
    await devReset(newUrl);
    const N = await L.open(browser, 'new', newUrl);
    for (const p of [P, N]) await p.evaluate(r => setRole(r), role);
    for (const [name, setup] of PAGES) {
      const a = await shot(P, setup), b = await shot(N, setup);
      const base = `${role}-${name.replace(/[ ›]+/g, '_')}`;
      fs.writeFileSync(path.join(dir, base + '-prototip.png'), a);
      fs.writeFileSync(path.join(dir, base + '-nova.png'), b);
      const c = compare(a, b, path.join(dir, base + '-RAZLIKA.png'));
      rows.push({ role: rname, name, diff: c.diff, note: c.note, same: c.diff === 0 });
      console.log(`${c.diff === 0 ? 'OK  ' : 'RAZL'} posnetek ${rname} · ${name}${c.diff ? ' (' + (c.note || c.diff + ' px') + ')' : ''}`);
    }
    const errs = [...P.__errors.map(x => 'prototip: ' + x), ...N.__errors.map(x => 'nova: ' + x)];
    if (errs.length) rows.push({ role: rname, name: 'napake v brskalniku', diff: errs.length, note: errs.join(' | '), same: false });
    await P.context().close(); await N.context().close();
  }
  return rows;
}
module.exports = { run };
