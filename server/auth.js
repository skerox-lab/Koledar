// Prijava, seje, gesla in vloge.
'use strict';
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const config = require('./config');
const { q } = require('./db');

// Vloge kot v prototipu (UROLES) → koda vloge v aplikaciji (S.role)
const UROLES = ['vodja projekta', 'računovodstvo', 'direktor', 'administrator', 'administrator, vodja projekta'];
function roleCode(role) {
  if (/administrator/.test(role)) return 'admin';
  if (role === 'direktor') return 'direktor';
  if (role === 'računovodstvo') return 'racun';
  return 'nejc'; // vodja projekta (v prototipu se koda imenuje 'nejc')
}
// Enako kot roleAccess() v prototipu
function roleAccess(v) {
  return /administrator/.test(v) ? 'vse' : v === 'direktor' ? 'vse, urejanje cenikov' : v === 'računovodstvo' ? 'vse razen poročil' : 'svoji objekti, svoja povpraševanja in ponudbe, plan ekip in ure';
}
const isBoss = code => code === 'admin' || code === 'direktor';

const hash = pw => bcrypt.hashSync(pw, 12);
const check = (pw, h) => !!h && bcrypt.compareSync(pw, h);
function tempPassword() {
  const A = 'abcdefghjkmnpqrstuvwxyz23456789';
  const b = crypto.randomBytes(12);
  let s = '';
  for (let i = 0; i < 12; i++) { s += A[b[i] % A.length]; if (i === 3 || i === 7) s += '-'; }
  return s;
}

// ---------------------------------------------------------------- seje
const COOKIE = 'msd_sid';
function parseCookies(h) {
  const o = {};
  String(h || '').split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return o;
}
function createSession(res, user, ip) {
  const id = crypto.randomBytes(32).toString('hex');
  const exp = Date.now() + config.sessionDays * 864e5;
  q('INSERT INTO sessions(id,user_id,username,expires_at,ip) VALUES(?,?,?,?,?)').run(id, user.id, user.username, exp, ip || '');
  res.setHeader('Set-Cookie', `${COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${config.sessionDays * 86400}${config.secureCookie ? '; Secure' : ''}`);
}
function clearSession(req, res) {
  const sid = parseCookies(req.headers.cookie)[COOKIE];
  if (sid) q('DELETE FROM sessions WHERE id=?').run(sid);
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${config.secureCookie ? '; Secure' : ''}`);
}
// Razvojni uporabnik (samo MSD_DEV=1): vidi vse, vloga se menja v glavi kot v prototipu.
const DEV_USER = { id: -1, name: 'Nejc', role: 'administrator, vodja projekta', must_change: 0 };

// Doda req.user (ali null). Seja se podaljša ob uporabi.
function sessionMiddleware(req, res, next) {
  req.user = null;
  const sid = parseCookies(req.headers.cookie)[COOKIE];
  if (sid) {
    const s = q('SELECT * FROM sessions WHERE id=?').get(sid);
    if (s && s.expires_at > Date.now()) {
      let u = null;
      if (s.user_id === -1 && config.dev) u = Object.assign({}, DEV_USER, { username: s.username });
      else if (s.user_id !== -1) u = q('SELECT * FROM users WHERE id=?').get(s.user_id);
      if (u) {
        req.user = { id: u.id, name: u.name, username: u.username, role: u.role, code: roleCode(u.role), mustChange: !!u.must_change, sid };
        if (s.expires_at - Date.now() < (config.sessionDays - 1) * 864e5)
          q('UPDATE sessions SET expires_at=? WHERE id=?').run(Date.now() + config.sessionDays * 864e5, sid);
      }
    } else if (s) q('DELETE FROM sessions WHERE id=?').run(sid);
  }
  next();
}
// Za vse podatkovne zahtevke: prijavljen uporabnik z veljavnim (ne začasnim) geslom.
function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Nisi prijavljen' });
  if (req.user.mustChange) return res.status(403).json({ error: 'Najprej nastavi novo geslo' });
  next();
}
function requireBoss(req, res, next) {
  if (!isBoss(req.user.code)) return res.status(403).json({ error: 'Nimaš dovoljenega dostopa' });
  next();
}

// Preprosta zaščita pred ugibanjem gesel: 10 napačnih poskusov v 15 minutah → zaklep
const fails = new Map();
function loginBlocked(key) {
  const f = fails.get(key);
  return f && f.n >= 10 && Date.now() - f.t < 15 * 60e3;
}
function loginFailed(key) {
  const f = fails.get(key);
  if (!f || Date.now() - f.t > 15 * 60e3) fails.set(key, { n: 1, t: Date.now() }); else f.n++;
}
const loginOk = key => fails.delete(key);

module.exports = {
  UROLES, roleCode, roleAccess, isBoss, hash, check, tempPassword, DEV_USER,
  createSession, clearSession, sessionMiddleware, requireUser, requireBoss,
  loginBlocked, loginFailed, loginOk,
};
