#!/usr/bin/env node
// Ročna varnostna kopija baze v <MSD_DATA>/backup (strežnik jo naredi tudi sam vsak dan, glej server/backup.js).
'use strict';
const { backupDb } = require('./_skupno');
console.log('Varnostna kopija: ' + backupDb('rocno'));
