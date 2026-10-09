// Skupno za skripte: zapis podatkov v bazo na enak način kot strežnik.
'use strict';
const fs = require('fs');
const path = require('path');
const config = require('../server/config');
const { q, tx, meta } = require('../server/db');
const { DATAK } = require('../server/state');

function backupDb(label) {
  const dir = path.join(config.dataDir, 'backup');
  fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, `msd-${new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)}-${label}.db`);
  q(`VACUUM INTO '${f.replace(/'/g, "''")}'`).run();
  return f;
}
function setKey(k, v, who) {
  const s = JSON.stringify(v);
  const row = q('SELECT ver FROM state WHERE key=?').get(k);
  if (row) q("UPDATE state SET value=?, ver=ver+1, updated_at=datetime('now'), updated_by=? WHERE key=?").run(s, who, k);
  else q('INSERT INTO state(key,value,ver,updated_by) VALUES(?,?,1,?)').run(k, s, who);
}
module.exports = { config, q, tx, meta, DATAK, backupDb, setKey };
