// Podatkovna baza SQLite (ena datoteka: <MSD_DATA>/msd.db).
'use strict';
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const config = require('./config');

fs.mkdirSync(config.dataDir, { recursive: true });
const db = new DatabaseSync(path.join(config.dataDir, 'msd.db'));
db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

-- uporabniki in seje
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                       -- ime in priimek (tako se izpiše kot vodja objekta)
  username TEXT NOT NULL UNIQUE COLLATE NOCASE, -- službeni e-naslov
  role TEXT NOT NULL,                       -- 'vodja projekta' | 'računovodstvo' | 'direktor' | 'administrator' | 'administrator, vodja projekta'
  outlook TEXT NOT NULL DEFAULT 'ni povezan',
  pw_hash TEXT,
  must_change INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,                 -- v razvojnem načinu -1
  username TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at INTEGER NOT NULL,
  ip TEXT
);

-- podatki aplikacije: vsak ključ iz KEYS v prototipu je ena vrstica (vrednost = JSON)
CREATE TABLE IF NOT EXISTS state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  ver INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);
-- objekti (OBJ v prototipu): vsak objekt svoja vrstica, s podatki po objektu (DATAK) v polju d
CREATE TABLE IF NOT EXISTS objekti (
  id TEXT PRIMARY KEY,
  pos INTEGER NOT NULL,                     -- vrstni red kot v prototipu
  vodja TEXT,
  value TEXT NOT NULL,
  ver INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);
-- nastavitve posameznega uporabnika (trenutni objekt CUR, skrita obvestila DISM)
CREATE TABLE IF NOT EXISTS user_state (
  user_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);
-- datoteke (vsebina je na disku: <MSD_DATA>/files/<objekt>/<mapa>/<id>__<ime>)
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  obj TEXT,
  folder TEXT,
  name TEXT,
  path TEXT NOT NULL,
  size INTEGER,
  uploaded_by TEXT,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- sled sprememb (kar vidi Administracija › Sled sprememb)
CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  user_name TEXT,
  username TEXT,
  kje TEXT,
  kaj TEXT
);
-- tehnični dnevnik vsakega zapisa na strežnik (kdo, kdaj, kateri ključ)
CREATE TABLE IF NOT EXISTS changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  username TEXT,
  kind TEXT,
  key TEXT,
  ver INTEGER,
  bytes INTEGER
);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
`);

const q = sql => db.prepare(sql);
function tx(fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const r = fn(); db.exec('COMMIT'); return r; }
  catch (e) { try { db.exec('ROLLBACK'); } catch (x) { } throw e; }
}
const meta = {
  get: k => { const r = q('SELECT value FROM meta WHERE key=?').get(k); return r ? r.value : null; },
  set: (k, v) => q('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(k, String(v)),
  del: k => q('DELETE FROM meta WHERE key=?').run(k),
};

module.exports = { db, q, tx, meta };
