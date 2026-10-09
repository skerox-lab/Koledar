// Pomožne funkcije za teste: odpre prototip ali novo aplikacijo v enakih pogojih.
'use strict';
const path = require('path');
const fs = require('fs');
let pw;
try { pw = require('playwright'); } catch (e) { pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }

const ROOT = path.join(__dirname, '..');
const FONTS_CSS = fs.readFileSync(path.join(ROOT, 'public', 'fonts', 'fonts.css'), 'utf8');
const TODAY = '2026-10-09T10:00:00';

// Prototip uporablja claude.use('downloads'); v testu ga nadomestimo, da ujamemo izvožene datoteke.
const PROTO_INIT = `
window.__dl = [];
window.claude = { use: async (k) => k === 'downloads' ? { save: async ({ filename, data }) => {
  let u8;
  if (data instanceof Blob) u8 = new Uint8Array(await data.arrayBuffer());
  else if (data instanceof ArrayBuffer) u8 = new Uint8Array(data);
  else if (ArrayBuffer.isView(data)) u8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  else u8 = new TextEncoder().encode(String(data));
  let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
  window.__dl.push({ filename, b64: btoa(s) });
} } : null };`;

// UTF-8 jezikovne nastavitve: brez njih Chromium v Linux vsebniku šumnike v imenu prenesene datoteke zamenja z »download«
async function launch() { return pw.chromium.launch({ env: Object.assign({}, process.env, { LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' }) }); }

// kind: 'proto' | 'new'; base: URL
async function open(browser, kind, base, opt) {
  opt = opt || {};
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, locale: 'sl-SI', timezoneId: 'Europe/Ljubljana', acceptDownloads: true });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date(TODAY));
  page.__errors = [];
  page.on('pageerror', e => page.__errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') page.__errors.push(m.text()); });
  if (kind === 'proto') {
    await ctx.addInitScript(PROTO_INIT);
    // Google pisave: v testu iz lokalne kopije (iste datoteke kot v novi aplikaciji)
    await ctx.route(/fonts\.googleapis\.com/, r => r.fulfill({ contentType: 'text/css', body: FONTS_CSS.replace(/url\(/g, 'url(' + base.replace(/\/[^/]*$/, '') + '/__fonts/') }));
    await ctx.route(/\/__fonts\//, r => r.fulfill({ path: path.join(ROOT, 'public', 'fonts', r.request().url().split('/__fonts/')[1]) }));
    await ctx.route(/cdnjs\.cloudflare\.com\/ajax\/libs\//, r => r.fulfill({ path: path.join(ROOT, 'public', 'vendor', r.request().url().split('/').pop()) }));
  }
  page.__kind = kind;
  await page.goto(base);
  if (opt.login !== false) {
    await page.waitForSelector('#lgu');
    if (opt.user) await page.fill('#lgu', opt.user);
    await page.fill('#lgp', opt.password || 'geslo123');
    await page.click('#login button[type=submit]');
    await page.waitForSelector('#view h1', { timeout: 15000 });
  }
  return page;
}

// Izvožene datoteke: v prototipu iz window.__dl, v novi aplikaciji iz prenosov brskalnika
async function captureDownload(page, action) {
  if (page.__kind === 'proto') {
    const n = await page.evaluate(() => window.__dl.length);
    await action();
    await page.waitForFunction(n0 => window.__dl.length > n0, n, { timeout: 60000 });
    const d = await page.evaluate(() => window.__dl[window.__dl.length - 1]);
    return { name: d.filename, buf: Buffer.from(d.b64, 'base64') };
  }
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), action()]);
  const p = await dl.path();
  return { name: dl.suggestedFilename(), buf: fs.readFileSync(p) };
}

const text = async (page, sel) => (await page.locator(sel || '#view').innerText()).replace(/\s+\n/g, '\n').trim();
const go = (page, p) => page.evaluate(p => { menuGo(p); }, p);
const settle = page => page.waitForTimeout(250);

module.exports = { launch, open, captureDownload, text, go, settle, TODAY, ROOT };
