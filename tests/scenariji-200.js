// Scenariji iz PREVERJANJE-SPREMEMBE.md (paket sprememb 1, prototip v200), točke 1–22.
// Tečejo enako kot ostali: na prototipu in na novi aplikaciji (razvojni način), opažanji morata biti enaki.
'use strict';
module.exports = function (sc, H) {
  const { L, pdfInfo, xlsxInfo, line, cell, toastText } = H;
  const exp = async (p, label, fn) => {
    const f = await L.captureDownload(p, () => p.evaluate(fn));
    const info = /\.pdf$/i.test(f.name) ? await pdfInfo(f.buf) : /\.xlsx$/i.test(f.name) ? xlsxInfo(f.buf) : f.buf.toString('utf8');
    return `## ${label}\n${f.name}\n${info}`;
  };
  const role = (p, r) => p.evaluate(r => { setRole(r); }, r);
  const objekti = async p => { await p.evaluate(() => { menuGo('objekti'); }); await L.settle(p); };

  sc('S1+4', 'Claude: gumb v glavi, panel desno, brez sivega imena strani', ['✦ Claude', 'Nov pogovor', 'Pošlji', 'širina 440', 'oranžen: rgb(217, 119, 6)'], async p => {
    const btn = p.locator('.top button.aibtn');
    const bg = await btn.evaluate(el => getComputedStyle(el).backgroundColor);
    await btn.click();
    await p.waitForTimeout(400);
    const panel = p.locator('#aip');
    const w = Math.round((await panel.boundingBox()).width);
    const t = (await panel.innerText()).trim();
    const go = await p.locator('#aigo').evaluate(el => getComputedStyle(el).backgroundColor).catch(() => '?');
    return `gumb: ${(await btn.innerText()).trim()} · oranžen: ${bg}\npanel viden: ${await panel.isVisible()} · širina ${w}\nPošlji: ${go}\nbesedilo panela:\n${t}\nime strani v glavi panela: ${/Moji objekti/.test(await p.locator('#aip .aih').innerText()) ? 'je' : 'ni'}`;
  });
  sc('S2', 'Administracija › uredi uporabnika › vloge brez kombinirane', ['vodja projekta | računovodstvo | direktor | administrator\n'], async p => {
    await role(p, 'admin');
    await p.evaluate(() => { menuGo('admin'); S.asub = 'users'; render(); S.uEdit = 0; render(); });
    const o = await p.locator('#ue_v option').allInnerTexts();
    return o.join(' | ') + '\n' + (await L.text(p, '#view table'));
  });
  sc('S3', 'Ure in statistika › Obdobje 1.–31. 10. 2026, Kot plan zgoraj', ['1. 10. 2026 – 31. 10. 2026', 'Kot plan zgoraj'], async p => {
    await L.go(p, 'plan');
    await p.evaluate(() => { stSet('stOd', '2026-10-01'); stSet('stDo', '2026-10-31'); });
    await L.settle(p);
    const t = await L.text(p);
    const st = t.slice(t.indexOf('Ure in statistika'));
    await p.click('button:has-text("Kot plan zgoraj")');
    await L.settle(p);
    const t2 = await L.text(p);
    return st + '\n--- po »Kot plan zgoraj«:\n' + line(t2, /^Ure in statistika/);
  });
  sc('S5', 'Plan › + Dodaj monterja (teden, mesec, leto), več kot 15 vrstic', ['vrstic: 16', 'vrstic: 17', 'vrstic: 18', 'pogled po leto: w', 'dodan monter 18'], async p => {
    await L.go(p, 'plan');
    const o = [];
    for (const v of ['w', 'm', 'y']) {
      await p.evaluate(v => { pView(v); }, v);
      await L.settle(p);
      await p.click('a:has-text("+ Dodaj monterja"), button:has-text("+ Dodaj monterja"), :text("+ Dodaj monterja")');
      await p.waitForTimeout(300);
      const r = await p.evaluate(() => ({ n: PLAN.own.length, pv: S.pv || 'w', foc: document.activeElement && document.activeElement.getAttribute('aria-label') }));
      o.push(`po ${v === 'w' ? 'teden' : v === 'm' ? 'mesec' : 'leto'}: vrstic: ${r.n} · fokus: ${r.foc} · pogled po ${v === 'y' ? 'leto' : v}: ${r.pv}`);
    }
    o.push('sled: ' + (await p.evaluate(() => AUDIT.slice(0, 3).map(a => a.slice(1).join(' · ')).join(' / '))));
    return o.join('\n');
  });
  sc('S6', 'Moji objekti › Pričetek in Trajanje »2,5« → časovnica, sled sprememb', ['Gaj Preserje C4', '2,5 mes.', 'Časovnica objektov'], async p => {
    await role(p, 'admin');
    await objekti(p);
    const st = p.locator('input[aria-label="Pričetek del Gaj Preserje C4"]');
    await st.fill('2026-12-01'); await st.press('Tab'); await L.settle(p);
    const ms = p.locator('input[aria-label="Trajanje v mesecih Gaj Preserje C4"]');
    await ms.fill('2,5'); await ms.press('Tab'); await L.settle(p);
    const o = await p.evaluate(() => ({ start: OBJ.gaj.start, mes: OBJ.gaj.mes, sled: AUDIT.slice(0, 2).map(a => a.slice(1).join(' · ')) }));
    const t = await L.text(p);
    return `gaj: ${o.start} · ${o.mes}\nsled: ${o.sled.join(' / ')}\n` + t.slice(t.indexOf('Časovnica objektov'), t.indexOf('Aktualno'));
  });
  sc('S7', 'Moji objekti › Opombe, Aktualno zložljivo, izvozi Finančnega pregleda', ['Finančni pregled projektov 13. 10. 2026.xlsx', 'Finančni pregled projektov 13. 10. 2026.pdf', 'opomba: test opomba'], async p => {
    await objekti(p);
    const op = p.locator('input[aria-label="Opombe Večstanovanjski objekt Šenčur"]');
    await op.fill('test opomba'); await op.press('Tab'); await L.settle(p);
    const sled = await p.evaluate(() => AUDIT[0].slice(1).join(' · '));
    const sum = await p.locator('details summary').allInnerTexts();
    await p.locator('details summary', { hasText: 'Aktualno' }).click(); await L.settle(p);
    const zaprto = await p.evaluate(() => S.akClosed);
    const o = [`sled: ${sled}`, `zložljivo: ${sum.join(' | ')} · zaprto po kliku: ${zaprto}`];
    o.push(await exp(p, 'Excel', () => { expFpX(); }));
    o.push(await exp(p, 'PDF', () => { expFpP(); }));
    return o.join('\n');
  });
  sc('S8-9', 'Časovnica na strani: brez povzetka in legende', ['Časovnica objektov'], async p => {
    await role(p, 'admin');
    await objekti(p);
    const t = await L.text(p);
    return t.slice(t.indexOf('Časovnica objektov'), t.indexOf('Aktualno'));
  });
  for (const [r, rn] of [['nejc', 'vodja Nejc'], ['direktor', 'direktor'], ['racun', 'računovodstvo'], ['admin', 'administrator']]) {
    sc('S10-22 ' + rn, `Finančni pregled projektov – Excel in PDF (${rn})`, r === 'nejc'
      ? ['"VODJA PROJEKTOV"', '"Skupaj v pridobivanju" |  |  |  | 321,909.97 | 70,820.19 | 392,730.16', '"Vrednost vseh del" |  |  |  | 591,692.18 | 130,172.28 | 721,864.46', 'dodatna ponudba za Večstanovanjski objekt Šenčur', '[Časovnica objektov]', '841.89×595.28, 841.89×595.28, 841.89×595.28 (3 str.)']
      : ['| PRIPRAVIL', '"Vodja projektov: Matej (2)"', '"Skupaj Matej" |  |  |  | 1,858,097.31 | 408,781.41 | 2,266,878.72', '"Skupaj Nejc" |  |  |  | 269,782.21 | 59,352.09 | 329,134.30', '"Skupaj v izvedbi" |  |  |  | 2,127,879.52 | 468,133.50 | 2,596,013.02', '"Vrednost vseh del" |  |  |  | 2,449,789.49 | 538,953.69 | 2,988,743.18', '"Povzetek po vodjih projektov"', '[Časovnica objektov]', '(3 str.)'].concat(r === 'direktor' ? ['Marjan'] : []), async p => {
      await role(p, r);
      await objekti(p);
      const o = [];
      o.push('stran:\n' + (await L.text(p, '#view table')));
      o.push(await exp(p, 'Excel', () => { expFpX(); }));
      o.push(await exp(p, 'PDF', () => { expFpP(); }));
      return o.join('\n');
    });
  }
  sc('S12', 'Ceniki › Sistemi W112: ni »Doseženo na projektih«', ['Doseženo na projektih: ni'], async p => {
    await L.go(p, 'ceniki');
    const t = await L.text(p);
    return 'Doseženo na projektih: ' + (t.includes('Doseženo na projektih') ? 'je' : 'ni');
  });
  sc('S13-15', 'Ure in statistika: 5 kvadratkov, Po objektih brez Delež/Človek-dni, opomba', ['Oznaka\tObjekt\tUre\tOd tega režija\tMonterji', 'Prazniki, bolniške, dopusti in odsotnosti so v dnevih.', 'Zasedenost: ni'], async p => {
    await L.go(p, 'plan');
    const t = await L.text(p);
    const st = t.slice(t.indexOf('Ure in statistika'));
    const boxes = await p.locator('.grid5 .met .l').allInnerTexts();
    const x = await exp(p, 'Plan Excel (list Statistika)', () => { expPlanX(); });
    return `kvadratki: ${boxes.join(', ')}\nZasedenost: ${/Zasedenost/.test(st) ? 'je' : 'ni'}\n${st}\n${x.slice(x.indexOf('[Statistika]'))}`;
  });
  sc('S21 direktor', 'Direktor: skupine po vodjih; nova ponudba → vodja Marjan; potrditev → Moji projekti', ['Vodja projektov: Matej (2)', 'Vodja projektov: Nejc (3)', 'vodja nove ponudbe: Marjan', 'Moji projekti · Marjan (direktor)'], async p => {
    await role(p, 'direktor');
    await objekti(p);
    const g1 = await p.locator('#view table tr.grp').allInnerTexts();
    await p.evaluate(() => { menuGo('povp'); DRAFT = null; novaPonudba(); });
    await L.settle(p);
    await p.fill('#narIn', 'Test naročnik d.o.o.'); await p.locator('#narIn').press('Tab');
    await p.evaluate(() => { dSet('proj', 'Direktorjev objekt'); dSet('total', '5000'); });
    await p.evaluate(() => dSave());
    await L.settle(p);
    const pv = await p.evaluate(() => POVP.find(x => x.proj === 'Direktorjev objekt'));
    const gp = await p.locator('#view table tr.grp').allInnerTexts();
    // urejanje tuje ponudbe: vodja ostane
    const tuja = await p.evaluate(() => { const i = POVP.findIndex(x => x.num === '0391/2026'); novaPonudba(i); return i; });
    await L.settle(p);
    await p.evaluate(() => dSave()); await L.settle(p);
    const vt = await p.evaluate(() => POVP.find(x => x.num === '0391/2026').vodja);
    await p.evaluate(() => { const i = POVP.findIndex(x => x.proj === 'Direktorjev objekt'); POVP[i].st = 'nepotrjeno'; POVP[i].sent = '2026-10-10'; pvSet(i, 'potrjeno'); });
    await L.settle(p);
    await objekti(p);
    const g2 = await p.locator('#view table tr.grp').allInnerTexts();
    return `objekti: ${g1.join(' | ')}\nvodja nove ponudbe: ${pv && pv.vodja}\nponudbe: ${gp.join(' | ')}\nurejanje tuje (0391/2026, idx ${tuja}): vodja ${vt}\npo potrditvi: ${g2.join(' | ')}`;
  });
  sc('S21 vodja', 'Vodja Nejc › Moji objekti brez skupin', ['skupin: 0', 'Večstanovanjski objekt Šenčur', 'Hiša Kušar, Podrožniška', 'Mačkovci 80'], async p => {
    await role(p, 'nejc');
    await objekti(p);
    const g = await p.locator('#view table tr.grp').count();
    const n = await p.locator('#view table tbody tr.click td:first-child > div:first-child').allInnerTexts();
    return `skupin: ${g}\n${n.join('\n')}`;
  });
};
