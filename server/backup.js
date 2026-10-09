// Samodejna dnevna varnostna kopija baze v <MSD_DATA>/backup (privzeto ob 2:00, hrani 30 dni).
// Datoteke (mapa files) in kopije baze naj Synology Hyper Backup vsako noč kopira na drug disk.
'use strict';
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { q } = require('./db');

const HOUR = +(process.env.MSD_BACKUP_HOUR || 2);
const KEEP_DAYS = +(process.env.MSD_BACKUP_DAYS || 30);
const dir = () => path.join(config.dataDir, 'backup');

function backupNow(label) {
  fs.mkdirSync(dir(), { recursive: true });
  const f = path.join(dir(), `msd-${new Date().toISOString().slice(0, 10)}-${label || 'dnevna'}.db`);
  if (fs.existsSync(f)) fs.unlinkSync(f);
  q(`VACUUM INTO '${f.replace(/'/g, "''")}'`).run();
  for (const n of fs.readdirSync(dir())) {
    const p = path.join(dir(), n);
    if (/^msd-.*\.db$/.test(n) && Date.now() - fs.statSync(p).mtimeMs > KEEP_DAYS * 864e5) fs.unlinkSync(p);
  }
  return f;
}
function start() {
  let last = '';
  setInterval(() => {
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    if (now.getHours() === HOUR && last !== day) {
      last = day;
      try { console.log('Varnostna kopija: ' + backupNow()); } catch (e) { console.error('Varnostna kopija ni uspela', e); }
    }
  }, 60e3).unref();
}
module.exports = { backupNow, start, dir };
