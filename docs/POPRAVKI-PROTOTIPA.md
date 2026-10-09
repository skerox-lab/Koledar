# Popravki prototipa v novi aplikaciji

Samodejno ustvarjeno z `npm run build` iz `scripts/build-frontend.js`. To so VSE spremembe kode prototipa (v178, SHA-256 `d3d56bdaae2117169f988a500f0dbd8b03b84b7c5ae91593314747e65ee38123`). Vse ostalo je dobesedno enako.

| # | Datoteka | Popravek | Zadetkov |
|---|---|---|---|
| 1 | index.html | Google pisave → lokalne pisave | 1 |
| 2 | index.html | knjižnica xlsx.full.min.js lokalno | 1 |
| 3 | index.html | knjižnica html2canvas.min.js lokalno | 1 |
| 4 | index.html | knjižnica jspdf.umd.min.js lokalno | 1 |
| 5 | index.html | knjižnica jszip.min.js lokalno | 1 |
| 6 | index.html | knjižnica pdf-lib.min.js lokalno | 1 |
| 7 | index.html | knjižnica exceljs.min.js lokalno | 1 |
| 8 | index.html | knjižnica pdf.min.js lokalno | 1 |
| 9 | index.html | knjižnica pdf.worker.min.js lokalno | 1 |
| 10 | index.html | naslov zavihka brez »· vzorec« (odločitev 9. 10. 2026) | 1 |
| 11 | index.html | Odjava gre na strežnik | 1 |
| 12 | app.js | vodja = prijavljeni uporabnik (v razvojnem načinu Nejc kot v prototipu) | 1 |
| 13 | app.js | začetna vloga iz prijave | 1 |
| 14 | app.js | saveFile: navaden prenos v brskalniku (namesto claude.use downloads) | 1 |
| 15 | app.js | pdf.js worker lokalno | 4 |
| 16 | app.js | save(): shranjevanje na strežnik namesto localStorage | 1 |
| 17 | app.js | load(): podatki s strežnika namesto localStorage | 1 |
| 18 | app.js | resetAll: ponastavitev na strežniku (samo razvojni način) | 1 |
| 19 | app.js | Sled sprememb: dejanski uporabnik, zapis tudi na strežnik | 1 |
| 20 | app.js | »kdo« pri datotekah, košu in prijavah = dejanski uporabnik | 4 |
| 21 | app.js | prijava: seja na strežniku | 1 |
| 22 | app.js | prijavno okno: predizpolnjeno ime samo v razvojnem načinu | 1 |
| 23 | app.js | prijavno okno: »katerokoli geslo« samo v razvojnem načinu | 1 |
| 24 | app.js | prijava: preverjanje gesla na strežniku | 1 |
| 25 | app.js | datoteke na strežniku namesto IndexedDB (fPut) | 1 |
| 26 | app.js | datoteke na strežniku namesto IndexedDB (fGet) | 1 |
| 27 | app.js | datoteke na strežniku namesto IndexedDB (fDel) | 1 |
| 28 | app.js | useObj: brez napake, če trenutnega objekta uporabnik ne vidi | 1 |
| 29 | app.js | nova ponudba: vodja = prijavljeni uporabnik (dSave) | 1 |
| 30 | app.js | nova ponudba: vodja = prijavljeni uporabnik (dSend) | 1 |
| 31 | app.js | Administracija: Ponastavi geslo zares, dodan gumb Nastavi geslo | 1 |
| 32 | app.js | PDEF (vzorčni podatki partnerjev) ne velja več, ko je vzorec odstranjen (npm run odstrani-vzorec) | 1 |
| 33 | app.js | Naročnik: Enter brez puščice izbere prvi predlog (odločitev 9. 10. 2026, PREVERJANJE F1) | 1 |
| 34 | app.js | RPARCH: arhiv cen s strežnika (samo direktor in administrator) | 1 |
