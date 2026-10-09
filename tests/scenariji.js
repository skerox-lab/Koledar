// Scenariji iz PREVERJANJE.md. Vsak scenarij teče na prototipu in na novi aplikaciji (razvojni način,
// enaki začetni podatki = vzorec iz prototipa) in vrne »opažanje« (besedilo, številke, izvozi).
// Opažanji morata biti enaki; »pricakovano« so vrednosti iz PREVERJANJE.md.
'use strict';
const fs = require('fs');
const path = require('path');
const XLSX = require('../public/vendor/xlsx.full.min.js');
const { PDFDocument, PDFName } = require('../public/vendor/pdf-lib.min.js');
const L = require('./lib');

const OUT = path.join(__dirname, 'out');

// ---------------------------------------------------------------- pomožne
async function cell(p, label, value, opt) {
  const loc = p.locator(`input[aria-label="${label}"]`);
  await loc.click();
  await loc.fill(value);
  if (!opt || opt.tab !== false) await loc.press('Tab');
  await L.settle(p);
}
const cellVal = (p, label) => p.locator(`input[aria-label="${label}"]`).inputValue();
const cellStyle = (p, label) => p.locator(`input[aria-label="${label}"]`).getAttribute('style');
const toastText = p => p.evaluate(() => document.getElementById('toast').textContent);
async function confirmAsk(p, input) {
  await p.waitForSelector('.uiask-b');
  const t = (await p.locator('.uiask-b > div').first().innerText()).trim();
  if (input != null) await p.fill('.uiask-i', input);
  await p.click('.uiask-y');
  await L.settle(p);
  return t;
}
async function pdfInfo(buf) {
  const d = await PDFDocument.load(buf);
  // vsebina strani so slike (html2canvas); primerjamo njihov odtis
  const h = require('crypto').createHash('sha256');
  for (const [, o] of d.context.enumerateIndirectObjects()) if (o && o.contents && o.dict && String(o.dict.get(PDFName.of('Subtype'))) === '/Image') h.update(o.contents);
  return d.getPages().map(pg => { const s = pg.getSize(); return `${s.width.toFixed(2)}×${s.height.toFixed(2)}`; }).join(', ') + ` (${d.getPageCount()} str.) · odtis slik ${h.digest('hex').slice(0, 12)}`;
}
function xlsxInfo(buf) {
  const wb = XLSX.read(buf, { type: 'buffer' });
  return wb.SheetNames.map(n => '[' + n + ']\n' + XLSX.utils.sheet_to_csv(wb.Sheets[n], { FS: ' | ' })).join('\n');
}
function line(text, re) { return (text.split('\n').filter(l => re.test(l)).join(' / ')) || '(ni vrstice)'; }
async function editRow(p, setup, idxFn, values) {
  await p.evaluate(setup);
  const i = await p.evaluate(idxFn);
  await p.evaluate(i => cenEd(i), i);
  for (const [id, v] of Object.entries(values)) await p.fill('#' + id, v);
  await p.click('button.pri:has-text("Shrani")');
  await L.settle(p);
  return i;
}
// Spremembe cenikov iz scenarija D2
async function d2Edits(p) {
  await L.go(p, 'ceniki');
  await editRow(p, "S.cen='sistemi';render()", () => SYS.findIndex(r => r[1] === 'PS 12/100'), { ce_p0: '60,00' });
  await editRow(p, "S.cen='kooperanti';render()", () => CEN_KOOP.findIndex(r => r[0] === 'Stena W112'), { ce_p0: '17,00' });
  await editRow(p, "S.cen='kooperanti';render()", () => CEN_KOOP.findIndex(r => r[0] === 'Bandažiranje Q2'), { ce_p0: '3,60' });
  await editRow(p, "S.cen='dobavitelji';S.dsel='kalcer';render()", () => SUPC.kalcer.rows.findIndex(r => r[2] === 'GKB PLOŠČE 12,5 mm'), { ce_p0: '4,60' });
  await editRow(p, "S.cen='dobavitelji';S.dsel='kalcer';render()", () => SUPC.kalcer.rows.findIndex(r => r[2] === 'PROFIL KNAUF CW 75'), { ce_p0: '2,00' });
  await p.evaluate("S.cen='sistemi';S.dsel=null;S.sysi=SYS.findIndex(r=>r[1]==='PS 12/100');render()");
  await L.settle(p);
}
const kalk = t => t.slice(t.indexOf('Kalkulacija na m²'), t.indexOf('Prodajna cena (cenik)') + 60);
async function reloadKeep(p) {
  await p.reload();
  await p.waitForSelector('#view h1', { timeout: 15000 });
}
function writeTmp(name, buf) { fs.mkdirSync(path.join(OUT, 'tmp'), { recursive: true }); const f = path.join(OUT, 'tmp', name); fs.writeFileSync(f, buf); return f; }

// ---------------------------------------------------------------- scenariji
const S = [];
const sc = (id, opis, pricakovano, run) => S.push({ id, opis, pricakovano, run });

sc('B1', 'Plan: Marko torek »wc 6 r-wc 2«', ['WC 6 R-WC 2'], async p => {
  await L.go(p, 'plan');
  const before = await p.evaluate(() => pRowH(PLAN.own[0], pDays()));
  await cell(p, 'Marko tor 13', 'wc 6 r-wc 2');
  const after = await p.evaluate(() => pRowH(PLAN.own[0], pDays()));
  return `celica: ${await cellVal(p, 'Marko tor 13')}\nΣ Marko: ${before} → ${after}\n` + line(await L.text(p), /Režijske|Opravljene/);
});
sc('B2', 'Plan: Luka torek »wc 6 r 2« (režija brez oznake)', ['bad', 'oznako objekta', 'brez oznake objekta'], async p => {
  await L.go(p, 'plan');
  await cell(p, 'Luka tor 13', 'wc 6 r 2');
  const t = await L.text(p);
  const i = t.indexOf('Režija brez oznake objekta');
  return `celica: ${await cellVal(p, 'Luka tor 13')}\nslog: ${await cellStyle(p, 'Luka tor 13')}\nobvestilo: ${await toastText(p)}\nstatistika: ${i >= 0 ? t.slice(i, i + 40).replace(/\n/g, ' ') : '(ni kvadratka)'}`;
});
sc('B3', 'Plan: »bolniška« → bela celica, Bolniške +1 dan', ['#FFFFFF', 'Bolniške\n1 dan · 8 ur'], async p => {
  await L.go(p, 'plan');
  await cell(p, 'Jure sre 14', 'bolniška');
  const t = await L.text(p);
  return `celica: ${await cellVal(p, 'Jure sre 14')}\nslog: ${await cellStyle(p, 'Jure sre 14')}\n` + t.slice(t.indexOf('Bolniške'), t.indexOf('Bolniške') + 25);
});
sc('B4', 'Plan: teden 21.–27. 12. 2026 (božič, prazniki)', ['božič', 'Prazniki\n4 dnevi', 'dan samostojnosti in enotnosti'], async p => {
  await L.go(p, 'plan');
  await p.evaluate("S.pw='2026-12-21';render()");
  const t = await L.text(p);
  const ph = await p.locator('input.cell[placeholder="praznik"]').count();
  return `celic s »praznik«: ${ph}\n` + t.slice(0, t.indexOf('Lastne ekipe')) + '\n' + t.slice(t.indexOf('Prazniki'), t.indexOf('Prazniki') + 30) + '\n' + line(t, /samostojnosti|božič/);
});
sc('B5', 'Plan: teden 9.–15. 11. 2026 (dan znanosti ni prost dan)', ['znanosti'], async p => {
  await L.go(p, 'plan');
  await p.evaluate("S.pw='2026-11-09';render()");
  const t = await L.text(p);
  const ph = await p.locator('input.cell[placeholder="praznik"]').count();
  return `celic s »praznik«: ${ph}\n` + t.slice(0, t.indexOf('Lastne ekipe')) + '\n' + line(t, /Prazniki|Razpoložljive ure$/);
});
sc('B6', 'Plan: letni PDF (2 strani, A4 ležeče)', ['841.89×595.28, 841.89×595.28 (2 str.)'], async p => {
  await L.go(p, 'plan');
  await p.evaluate("S.pv='y';render()");
  const f = await L.captureDownload(p, () => p.evaluate(() => { expPlanP(); }));
  return `datoteka: ${f.name}\n${await pdfInfo(f.buf)}`;
});
sc('B7', 'Plan: Shrani takoj po vpisu brez Tab, vpis ostane po osvežitvi', ['po osvežitvi: WC'], async p => {
  await L.go(p, 'plan');
  await cell(p, 'Tilen pon 12', 'wc', { tab: false });
  await p.click('button.pri:has-text("Shrani")');
  await L.settle(p);
  const t1 = await toastText(p);
  await p.waitForTimeout(800);
  await reloadKeep(p);
  await L.go(p, 'plan');
  return `obvestilo: ${t1}\npo osvežitvi: ${await cellVal(p, 'Tilen pon 12')}`;
});
sc('C', 'Stroški Šenčur ↔ plan (lastne ekipe, ure × 27 €/h)', ['27', 'planirano naprej'], async p => {
  await L.go(p, 'plan');
  await p.evaluate("S.pw='2026-10-05';render()");
  await cell(p, 'Marko pon 5', 'VOŠ'); await cell(p, 'Marko tor 6', 'VOŠ'); await cell(p, 'Marko sre 7', 'VOŠ');
  await cell(p, 'Luka tor 6', 'VOŠ 4 WC 4');
  await cell(p, 'Jure sre 7', 'VOŠ 6 R-VOŠ 2');
  await p.evaluate(() => { openObj('sencur'); tabGo('stroski'); });
  await L.settle(p);
  const t = await L.text(p);
  return line(t, /Lastne ekipe/) + '\n' + line(t, /planirano|režijsk|Marko|Luka|Jure/);
});
sc('D1', 'Ceniki › Sistemi W112 PS 12/100 začetno', ['Strošek\t43,07', '13,83', '24 %'], async p => {
  await L.go(p, 'ceniki');
  const t = await L.text(p);
  return kalk(t) + '\n' + line(t, /Razlika/);
});
sc('D2-3', 'Ceniki: spremembe cen → kalkulacija W112', ['Strošek\t45,98', '60,00', '14,02', '23 %', '20,74', '17,00', '7,20'], async p => {
  await d2Edits(p);
  const t = await L.text(p);
  await p.waitForTimeout(800);
  await reloadKeep(p);
  await p.evaluate("menuGo('ceniki');S.cen='sistemi';S.sysi=SYS.findIndex(r=>r[1]==='PS 12/100');render()");
  const t2 = await L.text(p);
  return kalk(t) + '\n' + line(t, /Razlika/) + '\npo osvežitvi strani enako: ' + (kalk(t) === kalk(t2) ? 'da' : 'NE\n' + kalk(t2));
});
sc('D4', 'Poročila: cenik W112 / 100 / GKB = 60', ['60,00'], async p => {
  await d2Edits(p);
  await p.evaluate("setRole('direktor');menuGo('porocila');S.pHide={};render()");
  const t = await L.text(p);
  return line(t, /^W112\t100 mm\tGKB\t/);
});
sc('D5', 'Izvozi cenikov (Excel, PDF) z novimi vrednostmi', ['W112 | "PS 12/100" | "predelna stena, dvojna obloga" | 60 |', '"Stena W112" | m² | 17', '"Bandažiranje Q2" | m² | 3.6'], async p => {
  await d2Edits(p);
  let o = '';
  for (const tab of ['sistemi', 'dodatna', 'kooperanti']) {
    await p.evaluate(t => { S.cen = t; render(); }, tab);
    const x = await L.captureDownload(p, () => p.evaluate(() => { cenXls(); }));
    const f = await L.captureDownload(p, () => p.evaluate(() => { cenPdf(); }));
    o += `\n## ${tab}\n${x.name}\n${xlsxInfo(x.buf)}\n${f.name}: ${await pdfInfo(f.buf)}`;
  }
  return o.trim();
});
sc('D6', 'Izbris GKB iz cenika Kalcer → opozorilo, oranžno »1 artiklov ni v ceniku«', ['1 artiklov ni v ceniku'], async p => {
  await L.go(p, 'ceniki');
  await p.evaluate("S.cen='dobavitelji';S.dsel='kalcer';render()");
  const i = await p.evaluate(() => SUPC.kalcer.rows.findIndex(r => r[2] === 'GKB PLOŠČE 12,5 mm'));
  await p.evaluate(i => { cenDel(i); }, i);
  const q = await confirmAsk(p);
  await p.evaluate("S.cen='sistemi';S.dsel=null;render()");
  const t = await L.text(p);
  return `potrditev: ${q}\n` + kalk(t);
});
sc('D7', 'Osveži cenik z Excelom → pregled sprememb pred potrditvijo', ['Prej', 'Novo'], async p => {
  await L.go(p, 'ceniki');
  await p.evaluate("S.cen='kooperanti';render()");
  const rows = await p.evaluate(() => CEN_KOOP.map(r => r.slice()));
  rows[0][2] = '12,00'; rows.push(['Nova postavka iz testa', 'm²', '5,00']); rows.splice(1, 1);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Postavka', 'em', '€/em'], ...rows]), 'Cenik');
  const f = writeTmp('kooperanti-test.xlsx', XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  await p.evaluate(() => { cenRefresh(); });
  await p.setInputFiles('#cen_f', f);
  await p.fill('#cen_d', '2026-10-09');
  await p.click('button:has-text("Naloži in preglej")');
  await p.waitForTimeout(1200);
  return (await p.locator('#cenm').innerText()).trim();
});
sc('E1', 'Objekt Šenčur: 48 % pogodbenih del, potrditev dodatne ponudbe → nova črta', ['48 % pogodbenih del', 'po ponudbi 0533/2026'], async p => {
  await p.evaluate(() => openObj('sencur'));
  await L.settle(p);
  const t1 = line(await L.text(p), /pogodbenih del|po ponudbi/);
  const i = await p.evaluate(() => POVP.findIndex(x => x.num === '0533/2026'));
  await p.evaluate(i => { pvDodOk(i); }, i);
  const q = await confirmAsk(p, 'e-pošta naročnika 9. 10. 2026');
  await p.evaluate(() => { S.tab = 'pregled'; render(); });
  await L.settle(p);
  const t2 = line(await L.text(p), /pogodbenih del|po ponudbi/);
  await p.evaluate(() => { tabGo('situacije'); });
  const t3 = line(await L.text(p), /0533/);
  return `pred: ${t1}\npotrditev: ${q}\npo: ${t2}\nsituacije: ${t3}`;
});
sc('E2', 'Dokumenti: mape 01–16 po abecedi, 04 Gradbena knjiga', ['01 Dobavitelji', '04 Gradbena knjiga', '16 Zapisniki'], async p => {
  await p.evaluate(() => { openObj('sencur'); tabGo('dokumenti'); });
  await L.settle(p);
  const t = await L.text(p, '#view .grid2 > div:first-child');
  return t;
});
sc('E3', 'Moji objekti: stolpec Izvedeno, brez Izid', ['Izvedeno'], async p => {
  await L.go(p, 'objekti');
  const h = await L.text(p, '#view table thead');
  return h + '\nIzid: ' + (h.includes('Izid') ? 'je' : 'ni');
});
sc('F1-2', 'Nova ponudba: predlogi naročnika »gra«, »kalc«', ['puščica + Enter: SGP Graditelj d.d. | Maistrova ulica 7, 1241 Kamnik', 'puščica + Enter: Kalcer d.o.o. | Ljubljanska cesta 51, 1236 Trzin | info@kalcer.si'], async p => {
  await p.evaluate(() => { menuGo('povp'); novaPonudba(); });
  await L.settle(p);
  await p.click('#narIn'); await p.keyboard.type('gra');
  await p.waitForTimeout(300);
  const s1 = (await p.locator('#narBox').innerText()).trim();
  await p.keyboard.press('Enter'); await L.settle(p);
  const e1 = `samo Enter (brez puščice): ${await p.locator('#narIn').inputValue()} | ${await p.locator('#narAdr').inputValue()}`;
  await p.evaluate(() => { DRAFT = null; novaPonudba(); });
  await L.settle(p);
  await p.click('#narIn'); await p.keyboard.type('gra');
  await p.waitForTimeout(300);
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await L.settle(p);
  const a1 = `${await p.locator('#narIn').inputValue()} | ${await p.locator('#narAdr').inputValue()} | ${await p.locator('#narMail').inputValue()}`;
  await p.evaluate(() => { DRAFT = null; novaPonudba(); });
  await L.settle(p);
  await p.click('#narIn'); await p.keyboard.type('kalc');
  await p.waitForTimeout(300);
  const s2 = (await p.locator('#narBox').innerText()).trim();
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await L.settle(p);
  const a2 = `${await p.locator('#narIn').inputValue()} | ${await p.locator('#narAdr').inputValue()} | ${await p.locator('#narMail').inputValue()}`;
  return `gra → predlogi: ${s1.replace(/\n/g, ' / ')}\n${e1}\npuščica + Enter: ${a1}\nkalc → predlogi: ${s2.replace(/\n/g, ' / ')}\npuščica + Enter: ${a2}`;
});
sc('F3', 'Excel z listom »Ponudba« in listom popisa → postavke samo iz popisa', ['postavk: 3', 'iz Ponudba: 0'], async p => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['MONTAŽA ŠKERJANEC d.o.o.'], ['PONUDBA 0999/2026'], ['Poz', 'Opis', 'em', 'Količina', 'Cena', 'Vrednost'], ['1', 'NAŠA GLAVA NE SME BITI POSTAVKA', 'kpl', 1, 999, 999]]), 'Ponudba');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Poz', 'Opis', 'em', 'Količina', 'Cena/em', 'Vrednost'], ['1', 'Predelna stena W112 12,5 cm', 'm²', 100, 55, 5500], ['2', 'Spuščeni strop D112', 'm²', 50, 32, 1600], ['3', 'Revizijska vratca 40/40', 'kos', 4, 45, 180], ['', 'SKUPAJ', '', '', '', 7280]]), 'Popis');
  const f = writeTmp('popis-test.xlsx', XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  await p.evaluate(() => { menuGo('povp'); novaPonudba(); });
  await L.settle(p);
  await p.setInputFiles('#fi', f);
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => ({ items: (DRAFT.items || []).map(x => x.opis), total: DRAFT.total, sheets: (DRAFT.sheets || []).map(s => s.name + (s.use ? '' : ' (ne)')) }));
  return `postavk: ${r.items.length}\n${r.items.join('\n')}\niz Ponudba: ${r.items.filter(x => /NAŠA GLAVA/.test(x)).length}\nznesek: ${r.total}\nlisti: ${r.sheets.join(', ')}`;
});
sc('G1', 'Računovodstvo odpre Poročila → obvestilo in Moji objekti', ['Nimaš dovoljenega dostopa do te strani', 'Moji objekti'], async p => {
  await p.evaluate("setRole('racun');menuGo('porocila')");
  await p.waitForTimeout(300);
  return `obvestilo: ${await toastText(p)}\nstran: ${await p.locator('#view h1').innerText()}\nmeni: ${(await p.locator('#nav').innerText()).replace(/\n/g, ' / ')}`;
});

module.exports = { S, L };
