// Montaža Škerjanec Digital – strežnik.
// Zagon: node server/index.js   (nastavitve v server/config.js, okoljske spremenljivke v .env.example)
'use strict';
const path = require('path');
const express = require('express');
const config = require('./config');
const { q } = require('./db');
const auth = require('./auth');
const st = require('./state');
const integracije = require('./integracije');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback, linklocal, uniquelocal');

// Varnostne glave. Prototip uporablja vgrajene onclick/style in eval, zato 'unsafe-inline' in 'unsafe-eval'.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' blob: data:; worker-src 'self' blob:; frame-src 'self' blob:; object-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  next();
});
app.use(auth.sessionMiddleware);

const wrap = fn => (req, res) => {
  try {
    const r = fn(req, res);
    if (r !== undefined && !res.headersSent) res.json(r);
  } catch (e) {
    if (e instanceof st.HttpError) return res.status(e.status).json(Object.assign({ error: e.message }, e.extra || {}));
    console.error(e);
    res.status(500).json({ error: 'Napaka na strežniku' });
  }
};
const json = express.json({ limit: '100mb' });

// ---------------------------------------------------------------- prijava
app.get('/api/session', wrap(req => {
  const n = q('SELECT COUNT(*) n FROM users').get().n;
  const u = req.user;
  return {
    dev: config.dev,
    setup: !config.dev && n === 0,
    user: u ? { name: u.name, username: u.username, role: u.code, roleName: u.role, mustChange: u.mustChange } : null,
  };
}));
app.post('/api/setup', json, wrap((req, res) => {
  if (config.dev) throw new st.HttpError(400, 'V razvojnem načinu ni potrebno');
  const { name, username, password } = req.body || {};
  if (q('SELECT COUNT(*) n FROM users').get().n) throw new st.HttpError(403, 'Administrator že obstaja');
  if (!String(name || '').trim()) throw new st.HttpError(400, 'Vpiši ime in priimek');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(username || '').trim())) throw new st.HttpError(400, 'Uporabniško ime mora biti službeni e-naslov');
  if (String(password || '').length < 8) throw new st.HttpError(400, 'Geslo mora imeti najmanj 8 znakov');
  const r = q("INSERT INTO users(name,username,role,pw_hash,must_change) VALUES(?,?,'administrator',?,0)").run(name.trim(), username.trim().toLowerCase(), auth.hash(password));
  const user = q('SELECT * FROM users WHERE id=?').get(Number(r.lastInsertRowid));
  st.addAudit({ name: user.name, username: user.username }, 'Uporabniki', 'prvi zagon, ustvarjen administrator ' + user.name);
  auth.createSession(res, user, req.ip);
  return { ok: true };
}));
app.post('/api/login', json, wrap((req, res) => {
  const username = String((req.body || {}).username || '').trim().toLowerCase();
  const password = String((req.body || {}).password || '');
  if (config.dev) { // razvojni način: kot v prototipu deluje katerokoli geslo
    auth.createSession(res, Object.assign({}, auth.DEV_USER, { username: username || 'nejc@montaza-skerjanec.si' }), req.ip);
    return { ok: true };
  }
  const key = req.ip + '|' + username;
  if (auth.loginBlocked(key)) throw new st.HttpError(429, 'Preveč napačnih poskusov. Poskusi znova čez 15 minut.');
  const u = q('SELECT * FROM users WHERE username=?').get(username);
  if (!u || !auth.check(password, u.pw_hash)) {
    auth.loginFailed(key);
    throw new st.HttpError(401, 'Napačno uporabniško ime ali geslo');
  }
  auth.loginOk(key);
  auth.createSession(res, u, req.ip);
  st.addAudit(u, 'Prijava', 'prijavljen' + (u.must_change ? ' z začasnim geslom' : ''));
  return { ok: true };
}));
app.post('/api/logout', wrap((req, res) => { auth.clearSession(req, res); return { ok: true }; }));
app.post('/api/password', json, wrap(req => {
  if (!req.user || req.user.id < 0) throw new st.HttpError(401, 'Nisi prijavljen');
  const p = String((req.body || {}).password || '');
  if (p.length < 8) throw new st.HttpError(400, 'Geslo mora imeti najmanj 8 znakov');
  q("UPDATE users SET pw_hash=?, must_change=0, updated_at=datetime('now') WHERE id=?").run(auth.hash(p), req.user.id);
  q('DELETE FROM sessions WHERE user_id=? AND id<>?').run(req.user.id, req.user.sid);
  st.addAudit(req.user, 'Uporabniki', req.user.name + ': geslo zamenjano');
  return { ok: true };
}));

// ---------------------------------------------------------------- podatki
app.get('/api/state', auth.requireUser, wrap(req => st.getState(req.user)));
app.put('/api/state', auth.requireUser, json, wrap(req => st.putState(req.user, req.body)));
app.post('/api/audit', auth.requireUser, json, wrap(req => { st.addAudit(req.user, (req.body || {}).where, (req.body || {}).what); return { ok: true }; }));
app.get('/api/objekti/:id', auth.requireUser, wrap(req => st.getObj(req.user, req.params.id)));

// ---------------------------------------------------------------- datoteke
app.put('/api/files/:id', auth.requireUser, express.raw({ type: () => true, limit: config.maxUploadMb + 'mb' }), wrap(req => {
  st.putFile(req.user, req.params.id, Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0));
  return { ok: true };
}));
app.get('/api/files/:id', auth.requireUser, wrap((req, res) => {
  const abs = st.getFile(req.user, req.params.id);
  res.setHeader('Cache-Control', 'private, no-cache');
  res.sendFile(abs);
}));
app.delete('/api/files/:id', auth.requireUser, wrap(req => { st.delFile(req.user, req.params.id); return { ok: true }; }));

// ---------------------------------------------------------------- uporabniki (gesla)
app.post('/api/users/:id/reset', auth.requireUser, auth.requireBoss, wrap(req => {
  const u = q('SELECT * FROM users WHERE id=?').get(+req.params.id);
  if (!u) throw new st.HttpError(404, 'Uporabnika ni');
  const t = auth.tempPassword();
  q("UPDATE users SET pw_hash=?, must_change=1, updated_at=datetime('now') WHERE id=?").run(auth.hash(t), u.id);
  q('DELETE FROM sessions WHERE user_id=?').run(u.id);
  return { temp: t };
}));
app.post('/api/users/:id/password', auth.requireUser, auth.requireBoss, json, wrap(req => {
  const u = q('SELECT * FROM users WHERE id=?').get(+req.params.id);
  if (!u) throw new st.HttpError(404, 'Uporabnika ni');
  const p = String((req.body || {}).password || '');
  if (p.length < 8) throw new st.HttpError(400, 'Geslo mora imeti najmanj 8 znakov');
  q("UPDATE users SET pw_hash=?, must_change=?, updated_at=datetime('now') WHERE id=?").run(auth.hash(p), (req.body || {}).mustChange ? 1 : 0, u.id);
  q('DELETE FROM sessions WHERE user_id=? AND id<>?').run(u.id, req.user.sid);
  return { ok: true };
}));

// ---------------------------------------------------------------- integracije (zaenkrat kot v prototipu)
app.get('/api/integracije', auth.requireUser, wrap(() => integracije.stanje()));

app.get('/api/varnostne-kopije', auth.requireUser, auth.requireBoss, wrap(() => {
  const b = require('./backup'), fs = require('fs');
  const d = b.dir();
  return fs.existsSync(d) ? fs.readdirSync(d).filter(n => n.endsWith('.db')).sort().reverse().map(n => ({ datoteka: n, velikost: fs.statSync(path.join(d, n)).size })) : [];
}));

// ---------------------------------------------------------------- razvojni način
if (config.dev) app.post('/api/dev/reset', wrap(() => { st.devReset(); return { ok: true }; }));

app.use('/api', (req, res) => res.status(404).json({ error: 'Ni najdeno' }));

// ---------------------------------------------------------------- frontend
const PUB = path.join(__dirname, '..', 'public');
app.use('/vendor', express.static(path.join(PUB, 'vendor'), { maxAge: '30d', immutable: true }));
app.use('/fonts', express.static(path.join(PUB, 'fonts'), { maxAge: '30d', immutable: true }));
app.use(express.static(PUB, { index: 'index.html', setHeaders: res => res.setHeader('Cache-Control', 'no-cache') }));
// Prototip se sklicuje na ceniki/kalcer-cenik-2026-06-15.pdf (gumb PDF pri dobavitelju)
app.use('/ceniki', auth.requireUser, express.static(path.join(__dirname, '..', 'prototip', 'ceniki')));

if (require.main === module) {
  require('./backup').start();
  app.listen(config.port, () => {
    console.log(`Montaža Škerjanec Digital teče na http://localhost:${config.port}` + (config.dev ? '  (RAZVOJNI NAČIN – ne uporabljaj za prave podatke)' : ''));
    console.log('Podatki: ' + config.dataDir);
  });
}
module.exports = app;
