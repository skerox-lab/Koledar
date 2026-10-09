// Prava prijava in pravice na strežniku (pravi način, ne razvojni). Samo nova aplikacija.
'use strict';
const L = require('./lib');

async function run(browser, url) {
  const rows = [];
  const ok = (name, cond, got) => { rows.push({ name, ok: !!cond, got: String(got) }); console.log(`${cond ? 'OK  ' : 'NAPAKA'} strežnik: ${name} → ${got}`); };
  const api = async (cookie, path, opt) => {
    opt = opt || {};
    const r = await fetch(url + path, { method: opt.method || 'GET', headers: Object.assign({ 'Content-Type': 'application/json' }, cookie ? { Cookie: cookie } : {}), body: opt.body ? JSON.stringify(opt.body) : undefined });
    let j = null; try { j = await r.json(); } catch (e) { }
    return { status: r.status, j: j || {}, cookie: (r.headers.get('set-cookie') || '').split(';')[0] };
  };
  const login = async (u, p) => (await api(null, 'api/login', { method: 'POST', body: { username: u, password: p } }));

  // 1. prvi zagon
  let s = await api(null, 'api/session');
  ok('Prvi zagon: strežnik zahteva ustvarjanje administratorja', s.j.setup === true, JSON.stringify(s.j));
  const A = await L.open(browser, 'new', url, { login: false });
  await A.waitForSelector('#su_n');
  await A.fill('#su_n', 'Nejc'); await A.fill('#su_u', 'nejc@montaza-skerjanec.si');
  await A.fill('#su_p', 'Admin-geslo-1'); await A.fill('#su_p2', 'Admin-geslo-1');
  await A.click('#login button[type=submit]');
  await A.waitForSelector('#view h1', { timeout: 15000 });
  ok('Administrator ustvarjen in prijavljen, vidi Administracijo', (await A.locator('#nav').innerText()).includes('Administracija'), (await A.locator('#nav').innerText()).replace(/\n/g, ' / '));
  ok('Spustni seznam »Prijavljen:« v pravem načinu ni viden', !(await A.locator('#role').isVisible()), 'viden: ' + (await A.locator('#role').isVisible()));
  await A.evaluate(() => { openObj('sencur'); tabGo('korespondenca'); });
  const kor = await A.locator('#view').innerText();
  await A.evaluate(() => { tabGo('dokumenti'); S.folder = '11'; render(); });
  const dok = await A.locator('#view').innerText();
  const olVis = await A.locator('#olbtn').isVisible() || await A.locator('#sync').isVisible();
  ok('Outlook skrit v pravem načinu (glava, Korespondenca, Dokumenti)', !olVis && !/Poveži Outlook/.test(kor + dok), `glava ${olVis ? 'vidna' : 'skrita'}, »Poveži Outlook« ${/Poveži Outlook/.test(kor + dok) ? 'najden' : 'ni najden'}`);
  await A.evaluate(() => { menuGo('objekti'); });
  await A.waitForTimeout(1000);
  const ac = (await A.context().cookies())[0];
  const adminCookie = ac.name + '=' + ac.value;

  // 2. dodajanje uporabnikov v Administraciji (začasno geslo)
  const addUser = async (n, m, v) => {
    await A.evaluate(() => { menuGo('admin'); S.asub = 'users'; render(); addUser(); });
    await A.fill('#ue_n', n); await A.fill('#ue_m', m); await A.selectOption('#ue_v', v);
    await A.evaluate(() => uSave());
    await A.waitForSelector('.uiask-b', { timeout: 10000 });
    const t = await A.locator('.uiask-b > div').first().innerText();
    await A.click('.uiask-y');
    return (t.match(/\):\n(\S+)/) || [])[1];
  };
  const tMatej = await addUser('Matej', 'matej@montaza-skerjanec.si', 'vodja projekta');
  const tRac = await addUser('Računovodstvo', 'racunovodstvo@montaza-skerjanec.si', 'računovodstvo');
  ok('Nov uporabnik dobi začasno geslo', /^\w{4}-\w{4}-\w{4}$/.test(tMatej || ''), tMatej ? 'da (oblika xxxx-xxxx-xxxx)' : 'ne');

  // 3. prijava z začasnim geslom → menjava gesla
  const M = await L.open(browser, 'new', url, { login: false });
  await M.waitForSelector('#lgu'); await M.waitForTimeout(300);
  await M.fill('#lgu', 'matej@montaza-skerjanec.si'); await M.fill('#lgp', 'napacno-geslo');
  await M.click('#login button[type=submit]');
  await M.waitForTimeout(400);
  ok('Napačno geslo je zavrnjeno', (await M.evaluate(() => document.getElementById('toast').textContent)).includes('Napačno'), await M.evaluate(() => document.getElementById('toast').textContent));
  await M.fill('#lgp', tMatej);
  await M.click('#login button[type=submit]');
  await M.waitForSelector('#pw_p', { timeout: 10000 });
  ok('Začasno geslo: pred delom mora nastaviti svoje geslo', true, 'okno »Nastavi novo geslo«');
  await M.fill('#pw_p', 'Matej-geslo-1'); await M.fill('#pw_p2', 'Matej-geslo-1');
  await M.click('#login button[type=submit]');
  await M.waitForSelector('#view h1', { timeout: 15000 });
  const mc = (await M.context().cookies())[0];
  const matejCookie = mc.name + '=' + mc.value;
  const nav = (await M.locator('#nav').innerText()).replace(/\n/g, ' / ');
  ok('Vodja: meni brez Poročil in Administracije', !nav.includes('Poročila') && !nav.includes('Administracija'), nav);
  const vis = await M.evaluate(() => ({ obj: Object.values(OBJ).map(o => o.name + ' (' + o.vodja + ')'), povp: POVP.map(p => p.num + ' (' + p.vodja + ')'), users: window.USERS, rp: RPARCH.length }));
  ok('Vodja dobi samo svoje objekte', vis.obj.every(x => x.endsWith('(Matej)')), vis.obj.join(', '));
  ok('Vodja dobi samo svoja povpraševanja in ponudbe', vis.povp.every(x => x.endsWith('(Matej)')), vis.povp.join(', ') || '(nobene)');
  ok('Vodja ne dobi uporabnikov in arhiva cen (Poročila)', vis.users == null && vis.rp === 0, `USERS=${JSON.stringify(vis.users)}, RPARCH vrstic=${vis.rp}`);

  // 4. 403 za tuj objekt in tuje datoteke
  let r = await api(matejCookie, 'api/objekti/sencur');
  ok('Vodja: strežnik vrne 403 za tuj objekt (Šenčur)', r.status === 403, r.status + ' ' + (r.j.error || ''));
  r = await api(matejCookie, 'api/objekti/westlink');
  ok('Vodja: svoj objekt (WESTLINK) dobi', r.status === 200, r.status);
  const st = await api(matejCookie, 'api/state');
  r = await api(matejCookie, 'api/state', { method: 'PUT', body: { keys: {}, objs: { sencur: { v: { id: 'sencur', vodja: 'Matej', name: 'x' }, base: 0 } }, del: {} } });
  ok('Vodja: zapis v tuj objekt je zavrnjen (403)', r.status === 403, r.status + ' ' + (r.j.error || ''));
  await fetch(url + 'api/files/ftest1', { method: 'PUT', headers: { Cookie: adminCookie, 'Content-Type': 'application/octet-stream' }, body: Buffer.from('%PDF-test') });
  const ast = await api(adminCookie, 'api/state');
  const F = ast.j.state.FILES.concat([{ id: 'ftest1', obj: 'sencur', folder: '06', name: 'test.pdf', size: 9, when: new Date().toISOString(), who: 'Nejc' }]);
  r = await api(adminCookie, 'api/state', { method: 'PUT', body: { keys: { FILES: { v: F, base: ast.j.vers.keys.FILES || 0 } }, objs: {}, del: {} } });
  const fm = await fetch(url + 'api/files/ftest1', { headers: { Cookie: matejCookie } });
  const fa = await fetch(url + 'api/files/ftest1', { headers: { Cookie: adminCookie } });
  ok('Datoteka Šenčurja: vodja drugega objekta 403, administrator 200', fm.status === 403 && fa.status === 200, `vodja ${fm.status}, administrator ${fa.status}`);
  ok('Vodja ne vidi datotek tujih objektov v seznamu', !(await api(matejCookie, 'api/state')).j.state.FILES.some(f => f.obj === 'sencur'), 'seznam FILES brez Šenčurja');

  // 5. vodja spremeni svojo ponudbo → tuje ostanejo
  const before = ast.j.state.POVP.length;
  await M.evaluate(() => { const p = POVP[0]; if (p) { p.opc = 30; save(); } });
  await M.waitForTimeout(800);
  const after = (await api(adminCookie, 'api/state')).j.state.POVP;
  ok('Vodja shrani svojo ponudbo, ponudbe drugih ostanejo', after.length === before && after.some(p => p.vodja === 'Nejc'), `pred ${before}, po ${after.length}`);

  // 6. sled sprememb z dejanskim uporabnikom
  await M.evaluate(() => { menuGo('plan'); });
  const c1 = M.locator('input[aria-label="Marko tor 13"]');
  await c1.fill('WC 8'); await c1.press('Tab');
  await M.waitForTimeout(800);
  const aud = (await api(adminCookie, 'api/state')).j.state.AUDIT;
  ok('Sled sprememb na strežniku z dejanskim uporabnikom', aud.some(a => a[1] === 'Matej' && /Plan ekip/.test(a[2])), aud.slice(0, 2).map(a => a.join(' · ')).join(' / '));

  // 7. hkratna sprememba istega podatka
  const s1 = await api(adminCookie, 'api/state');
  const base = s1.j.vers.keys.PLEG;
  r = await api(adminCookie, 'api/state', { method: 'PUT', body: { keys: { PLEG: { v: s1.j.state.PLEG, base } }, objs: {}, del: {} } });
  const r2 = await api(adminCookie, 'api/state', { method: 'PUT', body: { keys: { PLEG: { v: s1.j.state.PLEG, base } }, objs: {}, del: {} } });
  ok('Hkratna sprememba istega podatka: drugi zapis dobi 409 (ne prepiše)', r.status === 200 && r2.status === 409, `${r.status}, nato ${r2.status}`);

  // 7b. hkratno urejanje v brskalniku: drugi dobi okno in osvežene podatke
  const A2 = await L.open(browser, 'new', url, { user: 'nejc@montaza-skerjanec.si', password: 'Admin-geslo-1' });
  await A.evaluate(() => { menuGo('plan'); });
  await A2.evaluate(() => { menuGo('plan'); });
  let cA = A2.locator('input[aria-label="Luka sre 14"]'); await cA.fill('HK 8'); await cA.press('Tab');
  await A2.waitForTimeout(800);
  cA = A.locator('input[aria-label="Jure čet 15"]'); await cA.fill('WC 8'); await cA.press('Tab');
  await A.waitForSelector('.uiask-b', { timeout: 10000 });
  const msg = await A.locator('.uiask-b > div').first().innerText();
  let dialog = false; A.on('dialog', d => { dialog = true; d.dismiss(); });
  await Promise.all([A.waitForNavigation(), A.click('.uiask-y')]);
  await A.waitForSelector('#view h1');
  await A.evaluate(() => { menuGo('plan'); });
  const luka = await A.locator('input[aria-label="Luka sre 14"]').inputValue();
  ok('Hkratno urejanje v brskalniku: okno, osvežitev, vidi spremembo drugega', /spremenil drug uporabnik/.test(msg) && luka === 'HK 8' && !dialog, msg.split('\n')[0] + ' → po osvežitvi Luka sre 14 = ' + luka + (dialog ? ' (NEŽELENO vprašanje brskalnika)' : ''));
  await A2.context().close();

  // 8. administracija: sebe in zadnjega administratorja ni mogoče izbrisati
  const us = (await api(adminCookie, 'api/state')).j.state.USERS;
  r = await api(adminCookie, 'api/state', { method: 'PUT', body: { keys: { USERS: { v: us.filter(u => u[1] !== 'nejc@montaza-skerjanec.si'), base: 0 } }, objs: {}, del: {} } });
  ok('Samega sebe ni mogoče izbrisati (strežnik)', r.status === 400, r.status + ' ' + r.j.error);
  r = await api(adminCookie, 'api/state', { method: 'PUT', body: { keys: { USERS: { v: us.map(u => u[1] === 'nejc@montaza-skerjanec.si' ? [u[0], u[1], 'direktor', u[3], u[4], u[5]] : u), base: 0 } }, objs: {}, del: {} } });
  ok('Zadnjega administratorja ni mogoče odstraniti (strežnik)', r.status === 400 && /administrator/.test(r.j.error), r.status + ' ' + r.j.error);
  await A.evaluate(() => { menuGo('admin'); S.asub = 'users'; render(); });
  const i = await A.evaluate(() => USERS.findIndex(u => u[0] === 'Računovodstvo'));
  await A.evaluate(i => { uDel(i); }, i);
  await A.click('.uiask-y');
  await A.waitForTimeout(800);
  r = await login('racunovodstvo@montaza-skerjanec.si', tRac);
  ok('Izbrisan uporabnik se ne more več prijaviti', r.status === 401, r.status);
  await A.evaluate(() => { S.uEdit = USERS.findIndex(u => u[0] === 'Matej'); render(); });
  await A.selectOption('#ue_v', 'direktor');
  await A.evaluate(() => uSave());
  await A.waitForTimeout(800);
  r = await api(matejCookie, 'api/session');
  ok('Sprememba vloge odjavi uporabnika (nova vloga ob naslednji prijavi)', r.j.user === null, JSON.stringify(r.j.user));

  // 9. gesla: Nastavi geslo (administrator)
  await A.evaluate(() => { const i = USERS.findIndex(u => u[0] === 'Matej'); MSD.pwSet(i); });
  await A.fill('.uiask-i', 'Novo-geslo-123'); await A.click('.uiask-y');
  await A.waitForSelector('.uiask-b'); await A.click('.uiask-n'); // brez menjave ob prijavi
  await A.waitForTimeout(500);
  r = await login('matej@montaza-skerjanec.si', 'Novo-geslo-123');
  const sm = await api(r.cookie, 'api/session');
  ok('Administrator nastavi geslo, uporabnik se prijavi z njim', r.status === 200 && sm.j.user && !sm.j.user.mustChange && sm.j.user.role === 'direktor', JSON.stringify(sm.j.user));
  for (let k = 0; k < 11; k++) r = await login('matej@montaza-skerjanec.si', 'x');
  ok('Zaščita pred ugibanjem gesla (10 napačnih → zaklep 15 min)', r.status === 429, r.status + ' ' + r.j.error);
  r = await api(null, 'api/state');
  ok('Brez prijave ni podatkov', r.status === 401, r.status);
  const errs = [...A.__errors, ...M.__errors].filter(e => !/40[139]|429/.test(e));
  ok('Brez napak v brskalniku', !errs.length, errs.join(' | ') || 'ni napak');
  await A.context().close(); await M.context().close();
  return rows;
}
module.exports = { run };
