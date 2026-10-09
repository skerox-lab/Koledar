// Nastavitve strežnika (okoljske spremenljivke, glej .env.example).
'use strict';
const path = require('path');
const env = process.env;
module.exports = {
  port: +(env.PORT || 8080),
  dataDir: path.resolve(env.MSD_DATA || path.join(__dirname, '..', 'data')),
  // Razvojni način: prijava s katerimkoli geslom, spustni seznam »Prijavljen:« za menjavo vloge,
  // brez filtriranja po vlogah. NIKOLI ne vklopi na pravem strežniku.
  dev: env.MSD_DEV === '1',
  // Piškotek seje samo prek HTTPS (vklopi, ko je pred aplikacijo HTTPS, npr. Synology reverse proxy).
  secureCookie: env.MSD_SECURE_COOKIE === '1',
  sessionDays: +(env.MSD_SESSION_DAYS || 14),
  timeZone: env.TZ || 'Europe/Ljubljana',
  maxUploadMb: +(env.MSD_MAX_UPLOAD_MB || 200),
};
