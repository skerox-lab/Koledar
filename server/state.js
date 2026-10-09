// Podatki aplikacije: branje in shranjevanje s pravicami po vlogah.
//
// Prototip je imel vse podatke v enem objektu v brskalniku (ključi KEYS). Tu:
//  - vsak ključ je vrstica v tabeli state (JSON) z verzijo,
//  - vsak objekt (OBJ) je vrstica v tabeli objekti, s podatki po objektu (DATAK) v polju d,
//  - CUR (trenutno odprt objekt) in DISM (skrita obvestila) sta nastavitvi posameznega uporabnika,
//  - USERS so uporabniki iz tabele users, AUDIT je sled sprememb iz tabele audit.
// Strežnik pri vsakem zahtevku preveri pravice (SPECIFIKACIJA.md, poglavje 3):
//  - vodja projekta dobi in sme spreminjati samo svoje objekte, svoja povpraševanja/ponudbe in datoteke svojih objektov,
//  - Administracijo (uporabniki, sled sprememb, koš, napake in predlogi) dobita samo direktor in administrator,
//  - arhiv cen za Poročila (RPARCH) dobita samo direktor in administrator.
'use strict';
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { q, tx, meta } = require('./db');
const auth = require('./auth');

const DATAK = ['SIT', 'DOD', 'PREV', 'PAID', 'MONTHS', 'SITST', 'IZM', 'KOOP', 'MAIL', 'DOBA', 'RAZNO'];
const DATAK_EMPTY = () => ({ SIT: [], DOD: [], PREV: [], PAID: [], MONTHS: [], SITST: { n: 1, st: 'v pripravi' }, IZM: [], KOOP: [], MAIL: [], DOBA: [], RAZNO: [] });
const USER_KEYS = ['CUR', 'DISM'];
const RPARCH = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'rparch.json'), 'utf8'));

class HttpError extends Error { constructor(status, msg, extra) { super(msg); this.status = status; this.extra = extra; } }

// ---------------------------------------------------------------- pravice
function ctx(user) {
  const dev = config.dev;
  const code = user.code;
  const vodja = !dev && code === 'nejc';
  const boss = dev || auth.isBoss(code);
  const ownsObj = row => !vodja || (row && row.vodja === user.name);
  return { user, dev, code, vodja, boss, ownsObj };
}
function visibleObjIds(c) {
  return new Set(q('SELECT id, vodja FROM objekti').all().filter(r => c.ownsObj(r)).map(r => r.id));
}
// Filtri za ključe s podatki več uporabnikov (samo vodja projekta)
const SCOPED = {
  POVP: { id: p => p && p.num, vis: (c, p) => p && p.vodja === c.user.name },
  FILES: { id: f => f && f.id, vis: (c, f, ids) => f && ids.has(f.obj) },
  DOCHID: { id: s => s, vis: (c, s, ids) => ids.has(String(s).split('|')[0]) },
};
const BOSS_ONLY_APPEND = ['TRASH', 'FB']; // ostali uporabniki lahko samo dodajo (npr. »Prijavi napako«, izbris v koš)

// ---------------------------------------------------------------- branje
function fmtWhen(iso) {
  const tz = config.timeZone;
  const parts = d => Object.fromEntries(new Intl.DateTimeFormat('sl-SI', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(d).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  const d = parts(new Date(iso)), t = parts(new Date()), y = parts(new Date(Date.now() - 864e5));
  const hm = (+d.hour) + ':' + d.minute;
  const same = (a, b) => a.year === b.year && a.month === b.month && a.day === b.day;
  if (same(d, t)) return 'danes ' + hm;
  if (same(d, y)) return 'včeraj ' + hm;
  return `${+d.day}. ${+d.month}. ${d.year} ${hm}`;
}
function usersRows() {
  return q('SELECT * FROM users ORDER BY id').all().map(u => [u.name, u.username, u.role, auth.roleAccess(u.role), u.outlook, u.id]);
}
function auditRows() {
  return q('SELECT * FROM audit ORDER BY id DESC LIMIT 500').all().map(a => [fmtWhen(a.at), a.user_name, a.kje, a.kaj]);
}
function userState(uid, key) {
  const r = q('SELECT value FROM user_state WHERE user_id=? AND key=?').get(uid, key);
  return r ? JSON.parse(r.value) : undefined;
}

function getState(user) {
  const c = ctx(user);
  if (!meta.get('seeded')) {
    if (!c.boss) throw new HttpError(503, 'Program še ni pripravljen. Najprej se mora prijaviti administrator.');
    return { state: null, vers: { keys: {}, objs: {} }, rparch: RPARCH };
  }
  const st = {}, vers = { keys: {}, objs: {} };
  const ids = visibleObjIds(c);
  for (const r of q('SELECT key, value, ver FROM state').all()) {
    let v = JSON.parse(r.value);
    if (c.vodja && SCOPED[r.key]) v = (v || []).filter(e => SCOPED[r.key].vis(c, e, ids));
    if (!c.boss && BOSS_ONLY_APPEND.includes(r.key)) v = [];
    st[r.key] = v; vers.keys[r.key] = r.ver;
  }
  if (!c.dev) {
    if (c.boss) { st.USERS = usersRows(); st.AUDIT = auditRows(); }
    else { delete st.USERS; st.AUDIT = []; }
  }
  delete vers.keys.USERS; delete vers.keys.AUDIT;
  if (c.dev && st.USERS === undefined) st.USERS = null;
  // objekti
  st.OBJ = {};
  for (const r of q('SELECT id, vodja, value, ver FROM objekti ORDER BY pos').all()) {
    if (!c.ownsObj(r)) continue;
    st.OBJ[r.id] = JSON.parse(r.value); vers.objs[r.id] = r.ver;
  }
  // nastavitve uporabnika
  let cur = userState(user.id, 'CUR');
  if (!cur || !st.OBJ[cur]) {
    const L = Object.values(st.OBJ);
    cur = st.OBJ.sencur ? 'sencur' : ((L.find(o => o.full && o.d) || L.find(o => o.d) || {}).id || '');
  }
  st.CUR = cur;
  st.DISM = userState(user.id, 'DISM') || [];
  const d = (st.OBJ[cur] && st.OBJ[cur].d) || DATAK_EMPTY();
  DATAK.forEach(k => { st[k] = d[k] !== undefined ? d[k] : DATAK_EMPTY()[k]; });
  st._full = true;
  return { state: st, vers, rparch: c.boss ? RPARCH : null };
}

// ---------------------------------------------------------------- shranjevanje
function mergeScoped(def, stored, incoming, c, ids) {
  stored = Array.isArray(stored) ? stored : [];
  if (!Array.isArray(incoming)) throw new HttpError(400, 'Napačni podatki');
  for (const e of incoming) if (!def.vis(c, e, ids)) throw new HttpError(403, 'Nimaš pravice za te podatke');
  const known = new Set(stored.map(def.id));
  let lead = 0;
  while (lead < incoming.length && !known.has(def.id(incoming[lead]))) lead++;
  const leading = incoming.slice(0, lead), rest = incoming.slice(lead);
  const out = []; let placed = false;
  for (const e of stored) {
    if (def.vis(c, e, ids)) { if (!placed) { out.push(...rest); placed = true; } }
    else out.push(e);
  }
  if (!placed) out.push(...rest);
  return leading.concat(out);
}
function mergeAppend(stored, incoming) {
  stored = Array.isArray(stored) ? stored : [];
  if (!Array.isArray(incoming)) throw new HttpError(400, 'Napačni podatki');
  const seen = new Set(stored.map(e => JSON.stringify(e)));
  return incoming.filter(e => !seen.has(JSON.stringify(e))).concat(stored);
}

// USERS (samo direktor/administrator): uskladi tabelo users s seznamom iz Administracije
function syncUsers(c, rows) {
  if (!Array.isArray(rows)) throw new HttpError(400, 'Napačni podatki o uporabnikih');
  const cur = q('SELECT * FROM users ORDER BY id').all();
  const byId = new Map(cur.map(u => [u.id, u]));
  const keep = new Set(rows.filter(r => r[5]).map(r => +r[5]));
  const final = rows.map(r => ({ id: r[5] ? +r[5] : null, name: String(r[0] || '').trim(), username: String(r[1] || '').trim().toLowerCase(), role: String(r[2] || ''), outlook: r[4] || 'ni povezan' }));
  for (const u of final) {
    if (!u.name) throw new HttpError(400, 'Vpiši ime uporabnika');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.username)) throw new HttpError(400, 'Uporabniško ime mora biti službeni e-naslov');
    if (!auth.UROLES.includes(u.role)) throw new HttpError(400, 'Neznana vloga ' + u.role);
    if (u.id && !byId.has(u.id)) throw new HttpError(409, 'Uporabnik ne obstaja več');
  }
  const names = final.map(u => u.username);
  if (new Set(names).size !== names.length) throw new HttpError(400, 'Uporabniško ime že obstaja');
  if (!final.some(u => /administrator/.test(u.role))) throw new HttpError(400, 'Ostati mora vsaj en administrator');
  if (!keep.has(c.user.id)) throw new HttpError(400, 'Samega sebe ne moreš izbrisati');
  const temp = [], renames = [];
  for (const u of cur) if (!keep.has(u.id)) { q('DELETE FROM sessions WHERE user_id=?').run(u.id); q('DELETE FROM user_state WHERE user_id=?').run(u.id); q('DELETE FROM users WHERE id=?').run(u.id); }
  for (const u of final) {
    if (u.id) {
      const o = byId.get(u.id);
      if (o.name !== u.name) renames.push([o.name, u.name]);
      if (o.role !== u.role || o.username.toLowerCase() !== u.username) q('DELETE FROM sessions WHERE user_id=? AND id<>?').run(u.id, c.user.sid || '');
      q("UPDATE users SET name=?, username=?, role=?, outlook=?, updated_at=datetime('now') WHERE id=?").run(u.name, u.username, u.role, u.outlook, u.id);
    } else {
      const t = auth.tempPassword();
      const r = q('INSERT INTO users(name,username,role,outlook,pw_hash,must_change) VALUES(?,?,?,?,?,1)').run(u.name, u.username, u.role, u.outlook, auth.hash(t));
      u.id = Number(r.lastInsertRowid);
      temp.push({ name: u.name, username: u.username, temp: t });
    }
  }
  // Preimenovan uporabnik: popravi vodjo na objektih in ponudbah, da jih še vedno vidi kot svoje
  for (const [from, to] of renames) {
    for (const r of q('SELECT id, value FROM objekti WHERE vodja=?').all(from)) {
      const v = JSON.parse(r.value); v.vodja = to;
      q('UPDATE objekti SET value=?, vodja=?, ver=ver+1 WHERE id=?').run(JSON.stringify(v), to, r.id);
    }
    const p = q("SELECT value FROM state WHERE key='POVP'").get();
    if (p) {
      const L = JSON.parse(p.value); let ch = 0;
      L.forEach(x => { if (x && x.vodja === from) { x.vodja = to; ch++; } });
      if (ch) q("UPDATE state SET value=?, ver=ver+1 WHERE key='POVP'").run(JSON.stringify(L));
    }
  }
  return { users: usersRows(), temp };
}

function putState(user, body) {
  const c = ctx(user);
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Napačni podatki');
  const keys = body.keys || {}, objs = body.objs || {}, del = body.del || {};
  const seeded = !!meta.get('seeded');
  if (!seeded && !c.boss) throw new HttpError(503, 'Program še ni pripravljen. Najprej se mora prijaviti administrator.');
  const who = user.name || user.username;
  const out = { vers: { keys: {}, objs: {} } };
  let organize = false;
  tx(() => {
    const conflicts = [];
    // objekti najprej (vodja lahko v istem zahtevku ustvari objekt in naloži datoteko nanj)
    let pos = (q('SELECT MAX(pos) m FROM objekti').get().m || 0);
    for (const [id, { v, base }] of Object.entries(objs)) {
      if (!v || typeof v !== 'object') throw new HttpError(400, 'Napačni podatki objekta');
      const row = q('SELECT vodja, ver, updated_by FROM objekti WHERE id=?').get(id);
      if ((row ? row.ver : 0) !== (base || 0)) { conflicts.push({ key: 'OBJ:' + id, who: row && row.updated_by }); continue; }
      if (c.vodja && ((row && row.vodja !== user.name) || v.vodja !== user.name)) throw new HttpError(403, 'Ta objekt vodi ' + ((row && row.vodja) || v.vodja) + '. Spreminjaš lahko samo svoje objekte.');
      const s = JSON.stringify(v);
      if (row) q("UPDATE objekti SET value=?, vodja=?, ver=ver+1, updated_at=datetime('now'), updated_by=? WHERE id=?").run(s, v.vodja || null, who, id);
      else q('INSERT INTO objekti(id,pos,vodja,value,ver,updated_by) VALUES(?,?,?,?,1,?)').run(id, ++pos, v.vodja || null, s, who);
      const nv = row ? row.ver + 1 : 1;
      out.vers.objs[id] = nv;
      q('INSERT INTO changes(username,kind,key,ver,bytes) VALUES(?,?,?,?,?)').run(user.username, 'objekt', id, nv, s.length);
    }
    for (const [id, base] of Object.entries(del)) {
      const row = q('SELECT vodja, ver, updated_by FROM objekti WHERE id=?').get(id);
      if (!row) continue;
      if (row.ver !== (base || 0)) { conflicts.push({ key: 'OBJ:' + id, who: row.updated_by }); continue; }
      if (c.vodja && row.vodja !== user.name) throw new HttpError(403, 'Objekt lahko izbriše samo njegov vodja, direktor ali administrator');
      q('DELETE FROM objekti WHERE id=?').run(id);
      q('INSERT INTO changes(username,kind,key,ver,bytes) VALUES(?,?,?,?,?)').run(user.username, 'izbris objekta', id, row.ver, 0);
    }
    const ids = visibleObjIds(c);
    for (const [k, { v, base }] of Object.entries(keys)) {
      if (k === 'OBJ' || DATAK.includes(k) || k[0] === '_') continue;
      if (USER_KEYS.includes(k)) {
        q('INSERT INTO user_state(user_id,key,value) VALUES(?,?,?) ON CONFLICT(user_id,key) DO UPDATE SET value=excluded.value').run(user.id, k, JSON.stringify(v));
        continue;
      }
      if (!c.dev && k === 'AUDIT') continue;
      if (!c.dev && k === 'USERS') {
        if (!c.boss) continue;
        Object.assign(out, syncUsers(c, v));
        continue;
      }
      const row = q('SELECT value, ver, updated_by FROM state WHERE key=?').get(k);
      if ((row ? row.ver : 0) !== (base || 0)) { conflicts.push({ key: k, who: row && row.updated_by }); continue; }
      let nv = v;
      if (c.vodja && SCOPED[k]) nv = mergeScoped(SCOPED[k], row ? JSON.parse(row.value) : [], v, c, ids);
      else if (!c.boss && BOSS_ONLY_APPEND.includes(k)) nv = mergeAppend(row ? JSON.parse(row.value) : [], v);
      const s = JSON.stringify(nv);
      if (row) q("UPDATE state SET value=?, ver=ver+1, updated_at=datetime('now'), updated_by=? WHERE key=?").run(s, who, k);
      else q('INSERT INTO state(key,value,ver,updated_by) VALUES(?,?,1,?)').run(k, s, who);
      out.vers.keys[k] = row ? row.ver + 1 : 1;
      q('INSERT INTO changes(username,kind,key,ver,bytes) VALUES(?,?,?,?,?)').run(user.username, 'ključ', k, out.vers.keys[k], s.length);
      if (k === 'FILES') organize = true;
    }
    if (conflicts.length) throw new HttpError(409, 'Hkratna sprememba', { conflict: conflicts.map(x => x.key), who: [...new Set(conflicts.map(x => x.who).filter(Boolean))].join(', ') });
    if (!seeded) meta.set('seeded', new Date().toISOString());
  });
  if (organize) organizeFiles();
  return out;
}

// ---------------------------------------------------------------- datoteke
const FILES_DIR = () => path.join(config.dataDir, 'files');
const safe = s => String(s || '').normalize('NFC').replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').replace(/^\.+/, '_').slice(0, 150) || '_';
function filesMeta() {
  const r = q("SELECT value FROM state WHERE key='FILES'").get();
  return r ? JSON.parse(r.value) : [];
}
// Datoteke razporedi v mape po objektu in mapi: files/<objekt>/<mapa>/<id>__<ime>
function organizeFiles() {
  for (const f of filesMeta()) {
    if (!f || !f.id) continue;
    const row = q('SELECT * FROM files WHERE id=?').get(f.id);
    if (!row) continue;
    const rel = path.join(safe(f.obj || '_brez_objekta'), safe(f.folder || '_'), safe(f.id) + '__' + safe(f.name));
    if (row.path === rel) continue;
    const from = path.join(FILES_DIR(), row.path), to = path.join(FILES_DIR(), rel);
    try {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.renameSync(from, to);
      q('UPDATE files SET path=?, obj=?, folder=?, name=? WHERE id=?').run(rel, f.obj || null, f.folder || null, f.name || null, f.id);
    } catch (e) { console.error('Premik datoteke ni uspel', f.id, e.message); }
  }
}
function canFile(user, row, write) {
  const c = ctx(user);
  if (!c.vodja) return true;
  if (row.obj) {
    const o = q('SELECT vodja FROM objekti WHERE id=?').get(row.obj);
    return o ? o.vodja === user.name : row.uploaded_by === user.username;
  }
  // osnutki ponudb (drf-...): lastnik ponudbe ali tisti, ki je naložil
  if (row.uploaded_by === user.username) return true;
  const p = q("SELECT value FROM state WHERE key='POVP'").get();
  const P = p ? JSON.parse(p.value) : [];
  return !write && P.some(x => x && x.dkey && row.id.startsWith(x.dkey + '-') && x.vodja === user.name);
}
function fileRow(id) {
  const row = q('SELECT * FROM files WHERE id=?').get(id);
  if (row && !row.obj) { // povezava z objektom iz FILES (če je že shranjena)
    const f = filesMeta().find(x => x && x.id === id);
    if (f) row.obj = f.obj;
  }
  return row;
}
function putFile(user, id, buf) {
  if (!/^[\w.-]{1,120}$/.test(id)) throw new HttpError(400, 'Napačna oznaka datoteke');
  const old = fileRow(id);
  if (old && !canFile(user, old, true)) throw new HttpError(403, 'Nimaš dovoljenega dostopa do te datoteke');
  const rel = old ? old.path : path.join(id.startsWith('drf-') ? '_ponudbe' : '_novo', safe(id));
  const abs = path.join(FILES_DIR(), rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, buf);
  if (old) q("UPDATE files SET size=?, uploaded_by=?, uploaded_at=datetime('now') WHERE id=?").run(buf.length, user.username, id);
  else q('INSERT INTO files(id,path,size,uploaded_by) VALUES(?,?,?,?)').run(id, rel, buf.length, user.username);
  organizeFiles();
}
function getFile(user, id) {
  const row = fileRow(id);
  if (!row) throw new HttpError(404, 'Datoteke ni');
  if (!canFile(user, row, false)) throw new HttpError(403, 'Nimaš dovoljenega dostopa do te datoteke');
  const abs = path.join(FILES_DIR(), row.path);
  if (!fs.existsSync(abs)) throw new HttpError(404, 'Datoteke ni');
  return abs;
}
function delFile(user, id) {
  const row = fileRow(id);
  if (!row) return;
  if (!canFile(user, row, true)) throw new HttpError(403, 'Nimaš dovoljenega dostopa do te datoteke');
  // datoteka gre v koš na disku (files/_izbrisano), ne izbriše se dokončno
  const abs = path.join(FILES_DIR(), row.path);
  const to = path.join(FILES_DIR(), '_izbrisano', new Date().toISOString().slice(0, 10), path.basename(row.path));
  try { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.renameSync(abs, to); } catch (e) { }
  q('DELETE FROM files WHERE id=?').run(id);
}

// En objekt (za API in preverjanje pravic)
function getObj(user, id) {
  const c = ctx(user);
  const row = q('SELECT * FROM objekti WHERE id=?').get(id);
  if (!row) throw new HttpError(404, 'Objekta ni');
  if (!c.ownsObj(row)) throw new HttpError(403, 'Nimaš dovoljenega dostopa do tega objekta');
  return JSON.parse(row.value);
}

function addAudit(user, kje, kaj) {
  q('INSERT INTO audit(user_name,username,kje,kaj) VALUES(?,?,?,?)').run(user.name || user.username, user.username, String(kje || '').slice(0, 500), String(kaj || '').slice(0, 2000));
}

function devReset() {
  tx(() => {
    for (const t of ['state', 'objekti', 'user_state', 'files', 'audit', 'changes']) q('DELETE FROM ' + t).run();
    meta.del('seeded');
  });
  fs.rmSync(FILES_DIR(), { recursive: true, force: true });
}

module.exports = { HttpError, getState, putState, putFile, getFile, delFile, getObj, addAudit, devReset, DATAK };
