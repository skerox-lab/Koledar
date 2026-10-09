// Skripte: odstranitev vzorca in uvoz iz prototipa (izvoz localStorage »msd-vzorec2«).
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const L = require('./lib');

const node = (script, args, dataDir) => execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning', path.join(L.ROOT, 'scripts', script), ...args], { env: Object.assign({}, process.env, { MSD_DATA: dataDir }) }).toString().trim();

async function run(browser, protoUrl, newUrl, devReset, dataDir, OUT) {
  const rows = [];
  const ok = (name, cond, got) => { rows.push({ name, ok: !!cond, got: String(got) }); console.log(`${cond ? 'OK  ' : 'NAPAKA'} skripte: ${name} → ${got}`); };
  // 1. odstrani vzorec
  await devReset(newUrl);
  let p = await L.open(browser, 'new', newUrl);
  await p.waitForTimeout(1000);
  await p.context().close();
  let out = node('odstrani-vzorec.js', ['--potrdi'], dataDir);
  ok('npm run odstrani-vzorec', /odstranjeni/.test(out), out.split('\n')[0]);
  p = await L.open(browser, 'new', newUrl);
  const seen = [];
  for (const [name, js] of [['Moji objekti', "menuGo('objekti')"], ['Povpraševanja', "menuGo('povp')"], ['Plan', "menuGo('plan')"], ['Partner SGP', "menuGo('partnerji');S.partner='SGP Graditelj d.d.';render()"], ['Ceniki', "menuGo('ceniki')"], ['Poročila', "setRole('direktor');menuGo('porocila')"], ['Administracija', "setRole('admin');menuGo('admin')"], ['Nova ponudba', "menuGo('povp');DRAFT=null;novaPonudba()"]]) {
    await p.evaluate(js); await p.waitForTimeout(300);
    seen.push(name + ': ' + (await p.locator('#view').innerText()).split('\n').slice(0, 3).join(' / '));
  }
  await p.screenshot({ path: path.join(OUT, 'brez-vzorca-objekti.png'), fullPage: true });
  const st = await p.evaluate(() => ({ obj: Object.keys(OBJ).length, povp: POVP.length, plan: PLAN.own.filter(r => r.n).length, pdef: Object.keys(PDEF).length, sys: SYS.length }));
  ok('Brez vzorca: ni objektov, ponudb, monterjev, PDEF; ceniki ostanejo', st.obj === 0 && st.povp === 0 && st.plan === 0 && st.pdef === 0 && st.sys > 10, JSON.stringify(st));
  ok('Brez vzorca: vse strani se odprejo brez napak', !p.__errors.length, p.__errors.join(' | ') || seen.join(' || '));
  // nov objekt brez vzorca: nova ponudba → potrjena → objekt
  await p.evaluate("setRole('admin');menuGo('povp');DRAFT=null;novaPonudba()");
  await p.fill('#narIn', 'Test naročnik d.o.o.'); await p.locator('#narIn').press('Tab');
  await p.evaluate("dSet('proj','Testni objekt');dSet('total','10000')");
  await p.evaluate(() => dSave());
  await p.waitForTimeout(500);
  await p.evaluate(() => { const i = POVP.findIndex(x => x.proj === 'Testni objekt'); POVP[i].st = 'nepotrjeno'; POVP[i].sent = '2026-10-01'; pvSet(i, 'potrjeno'); });
  await p.waitForTimeout(800);
  await p.reload(); await p.waitForSelector('#view h1');
  const o2 = await p.evaluate(() => Object.values(OBJ).map(o => o.name));
  ok('Brez vzorca: ponudba → potrjena → nov objekt ostane po osvežitvi', o2.includes('Testni objekt') && !p.__errors.length, o2.join(', ') + (p.__errors.length ? ' NAPAKE: ' + p.__errors.join(' | ') : ''));
  await p.context().close();
  // 2. uvoz iz prototipa
  const P = await L.open(browser, 'proto', protoUrl);
  await P.evaluate(() => { menuGo('plan'); });
  const c = P.locator('input[aria-label="Tilen pon 12"]'); await c.fill('VOŠ 7'); await c.press('Tab');
  await P.evaluate(() => { setRole('admin'); openObj('westlink'); save(); });
  await P.waitForTimeout(300);
  const dump = await P.evaluate(() => localStorage.getItem('msd-vzorec2'));
  await P.context().close();
  const f = path.join(OUT, 'tmp', 'izvoz-prototipa.json');
  fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, dump);
  let refused = '';
  try { node('uvoz.js', [f], dataDir); } catch (e) { refused = e.stderr.toString().trim(); }
  ok('Uvoz brez --zamenjaj ne prepiše obstoječih podatkov', /--zamenjaj/.test(refused), refused);
  out = node('uvoz.js', [f, '--zamenjaj'], dataDir);
  ok('npm run uvoz -- izvoz.json --zamenjaj', /Uvoženo/.test(out), out);
  p = await L.open(browser, 'new', newUrl);
  await p.evaluate(() => { menuGo('plan'); });
  const v = await p.locator('input[aria-label="Tilen pon 12"]').inputValue();
  const objs = await p.evaluate(() => Object.keys(OBJ).join(','));
  await p.evaluate(() => { setRole('admin'); openObj('sencur'); tabGo('situacije'); });
  const sitT = await p.locator('#view').innerText(); const sit = /situacij/i.test(sitT) && !/V vzorcu so vs/.test(sitT);
  ok('Po uvozu so podatki iz prototipa v aplikaciji (plan, objekti, situacije)', v === 'VOŠ 7' && objs.includes('sencur') && sit && !p.__errors.length, `celica ${v}, objekti ${objs}, situacije: ${sitT.split('\n').slice(0, 12).join(' / ')}` + (p.__errors.length ? ' NAPAKE: ' + p.__errors.join(' | ') : ''));
  await p.context().close();
  await devReset(newUrl);
  return rows;
}
module.exports = { run };
