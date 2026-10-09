// Zažene vse teste: scenariji (prototip ↔ nova aplikacija), posnetki zaslona za 4 vloge,
// in teste prave prijave/pravic na strežniku. Rezultat: tests/out/REZULTAT.md
//   npm test                 vse
//   npm test -- scenariji    samo scenariji (lahko tudi: posnetki, streznik, ali id scenarija npr. D2-3)
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const express = require('express');
const { S, L } = require('./scenariji');
const posnetki = require('./posnetki');
const streznik = require('./streznik');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, 'out');
const only = process.argv.slice(2);
const want = k => !only.length || only.includes(k);

function startProto() {
  const app = express();
  app.use(express.static(path.join(ROOT, 'prototip')));
  return new Promise(res => { const s = app.listen(0, () => res({ s, url: `http://localhost:${s.address().port}/index.html` })); });
}
async function startNew(dev) {
  const dir = path.join(OUT, dev ? 'data-dev' : 'data-prod');
  fs.rmSync(dir, { recursive: true, force: true });
  const port = 18000 + Math.floor(Math.random() * 1000);
  const env = Object.assign({}, process.env, { PORT: String(port), MSD_DATA: dir, MSD_DEV: dev ? '1' : '0' });
  const ch = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', path.join(ROOT, 'server', 'index.js')], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  ch.stderr.on('data', d => process.stderr.write('[strežnik] ' + d));
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 100));
    const ok = await new Promise(r => http.get(`http://localhost:${port}/api/session`, x => r(x.statusCode === 200)).on('error', () => r(false)));
    if (ok) break;
  }
  return { ch, url: `http://localhost:${port}/` };
}
const devReset = url => fetch(url + 'api/dev/reset', { method: 'POST' });
const esc = s => String(s).replace(/\|/g, '\\|').replace(/\t/g, ' ').replace(/\n/g, '<br>');

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const proto = await startProto();
  const dev = await startNew(true);
  const browser = await L.launch();
  const rows = [], detail = [];
  let fail = 0;
  try {
    for (const s of S) {
      if (only.length && !only.includes('scenariji') && !only.includes(s.id)) continue;
      const res = {};
      for (const kind of ['proto', 'new']) {
        let page;
        try {
          if (kind === 'new') await devReset(dev.url);
          page = await L.open(browser, kind, kind === 'proto' ? proto.url : dev.url);
          res[kind] = await s.run(page);
          if (page.__errors.length) res[kind] += '\nNAPAKE V BRSKALNIKU: ' + page.__errors.join(' | ');
        } catch (e) {
          res[kind] = 'NAPAKA TESTA: ' + (e.message || e).split('\n')[0];
        } finally { if (page) await page.context().close(); }
      }
      const same = res.proto === res.new;
      const miss = k => s.pricakovano.filter(x => !res[k].includes(x));
      const mp = miss('proto'), mn = miss('new');
      if (!same || mn.length) fail++;
      rows.push(`| ${s.id} ${esc(s.opis)} | ${mp.length ? '⚠️ ne vsebuje: ' + esc(mp.join(', ')) : 'pričakovano ✓'} | ${mn.length ? '⚠️ ne vsebuje: ' + esc(mn.join(', ')) : 'pričakovano ✓'} | ${same ? 'da' : '**NE**'} |`);
      detail.push(`### ${s.id} – ${s.opis}\n\nPričakovano (PREVERJANJE.md): ${s.pricakovano.map(x => '`' + x.replace(/\n/g, '⏎').replace(/\t/g, '⇥') + '`').join(', ')}\n\n**Prototip:**\n\n\`\`\`\n${res.proto}\n\`\`\`\n\n` + (same ? '**Nova aplikacija:** enako kot prototip.\n' : `**Nova aplikacija:**\n\n\`\`\`\n${res.new}\n\`\`\`\n`));
      console.log(`${same && !mn.length ? 'OK  ' : 'RAZL'} ${s.id} ${s.opis}`);
    }
    let shotRows = [];
    if (want('posnetki')) shotRows = await posnetki.run(browser, proto.url, dev.url, devReset, OUT);
    let srvRows = [];
    if (want('streznik')) {
      const prod = await startNew(false);
      try { srvRows = await streznik.run(browser, prod.url); } finally { prod.ch.kill(); }
    }
    const shotFail = shotRows.filter(r => !r.same).length, srvFail = srvRows.filter(r => !r.ok).length;
    const md = `# Rezultat preverjanja (samodejno, ${new Date().toISOString().slice(0, 16).replace('T', ' ')})\n\n` +
      `Prototip: \`prototip/index.html\` (v178). Nova aplikacija: razvojni način (enaki začetni podatki kot prototip), datum v brskalniku ${L.TODAY}.\n\n` +
      (rows.length ? `## Scenariji iz PREVERJANJE.md\n\n| Scenarij | Prototip | Nova aplikacija | Enako (da/ne) |\n|---|---|---|---|\n${rows.join('\n')}\n\n` : '') +
      (shotRows.length ? `## Posnetki zaslona (1400 × 900, cela stran), ${shotRows.length - shotFail}/${shotRows.length} enakih\n\n| Vloga | Stran | Razlika (piksli) | Enako |\n|---|---|---|---|\n${shotRows.map(r => `| ${r.role} | ${esc(r.name)} | ${r.diff}${r.note ? ' ' + esc(r.note) : ''} | ${r.same ? 'da' : '**NE**'} |`).join('\n')}\n\n` : '') +
      (srvRows.length ? `## Prava prijava in pravice na strežniku (samo nova aplikacija)\n\n| Preverjanje | Rezultat | OK |\n|---|---|---|\n${srvRows.map(r => `| ${esc(r.name)} | ${esc(r.got)} | ${r.ok ? 'da' : '**NE**'} |`).join('\n')}\n\n` : '') +
      (detail.length ? `## Podrobnosti scenarijev\n\n${detail.join('\n')}` : '');
    fs.writeFileSync(path.join(OUT, 'REZULTAT.md'), md);
    console.log(`\nScenariji z razliko: ${fail}, posnetki z razliko: ${shotFail}, strežnik napak: ${srvFail}\nRezultat: tests/out/REZULTAT.md`);
    process.exitCode = fail || shotFail || srvFail ? 1 : 0;
  } finally {
    await browser.close();
    dev.ch.kill();
    proto.s.close();
  }
}
main().catch(e => { console.error(e); process.exit(2); });
