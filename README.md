# Montaža Škerjanec Digital

Interna aplikacija Montaža Škerjanec d.o.o. To je prenos prototipa **v178** (`prototip/index.html`) na strežnik podjetja.
Izgled, besedila, izračuni in povezave so iz prototipa. Zamenjano je samo shranjevanje: prej je bilo vse v
brskalniku, zdaj je na strežniku (podatkovna baza + mapa z datotekami).

- **Navodila za namestitev na Synology (za nas):** [`docs/NAMESTITEV-SYNOLOGY.md`](docs/NAMESTITEV-SYNOLOGY.md)
- **Kaj se razlikuje od prototipa in kaj še ni narejeno:** [`docs/RAZLIKE-IN-ODPRTO.md`](docs/RAZLIKE-IN-ODPRTO.md)
- **Seznam vseh popravkov kode prototipa (samodejno):** [`docs/POPRAVKI-PROTOTIPA.md`](docs/POPRAVKI-PROTOTIPA.md)
- **Rezultat testov (prototip ↔ nova aplikacija):** [`PREVERJANJE.md`](PREVERJANJE.md), tabela Rezultat

---

## Za programerja

### Zgradba

```
prototip/              izvirni prototip v178 (EDINI VIR RESNICE) + Kalcer cenik PDF – ne spreminjaj
scripts/build-frontend.js  iz prototipa naredi public/index.html in public/app.js (preveri SHA-256, uporabi popravke)
public/
  index.html, app.js   ustvarjeno z `npm run build` – NE UREJAJ ROČNO
  msd.js               povezava s strežnikom (shranjevanje, datoteke, prijava, prenos, gesla)
  vendor/, fonts/      knjižnice (iste verzije kot v prototipu) in pisave lokalno
server/
  index.js             Express: prijava, API, statične datoteke, varnostne glave
  auth.js              gesla (bcrypt), seje (piškotek msd_sid), vloge
  state.js             podatki: branje/zapis s pravicami po vlogah, datoteke, sled sprememb
  db.js                SQLite (vgrajen node:sqlite), shema
  backup.js            dnevna varnostna kopija baze
  integracije.js       Outlook, AJPES/FURS, Bizi, VASCO – vmesniki, še niso povezani
  data/rparch.json     arhiv cen za Poročila (strežnik ga pošlje samo direktorju in administratorju)
scripts/               uvoz.js, odstrani-vzorec.js, varnostna-kopija.js
tests/                 Playwright: scenariji, posnetki zaslona, strežnik, skripte
```

### Kako je narejeno

Prototip ima vse podatke v globalnih spremenljivkah. `save()` jih zapiše, `load()` jih prebere (seznam `KEYS`,
podatki po objektu `DATAK`). V novi aplikaciji:

| Prototip | Nova aplikacija |
|---|---|
| `localStorage['msd-vzorec2']` | tabela `state` (en ključ = ena vrstica, JSON + verzija) |
| `OBJ` in podatki odprtega objekta (`SIT`, `DOD`, … = `DATAK`) | tabela `objekti` (en objekt = ena vrstica, `DATAK` v polju `d`) |
| `CUR`, `DISM` | tabela `user_state` (nastavitev posameznega uporabnika) |
| `USERS` | tabela `users` (gesla bcrypt) |
| `AUDIT` | tabela `audit` (strežnik zapiše dejanskega uporabnika) |
| IndexedDB `msd-files` | `data/files/<objekt>/<mapa>/<id>__<ime>` + tabela `files` |
| `claude.use('downloads')` | navaden prenos (Blob + `<a download>`), enako ime datoteke |
| cdnjs, Google Fonts | `public/vendor`, `public/fonts` |

`msd.js` pošlje samo spremenjene ključe in objekte, skupaj z verzijo, ki jo je prebral. Če je isti podatek medtem
spremenil nekdo drug, strežnik vrne 409 in stran se osveži (nič se ne prepiše tiho).

**Pravice preverja strežnik** (`server/state.js`):
- vodja projekta dobi samo objekte, kjer je `vodja` = njegovo ime, samo svoja povpraševanja in ponudbe (`POVP`) in datoteke svojih objektov; zapis v tuj objekt vrne 403;
- uporabnike, sled sprememb, koš ter napake in predloge dobita samo direktor in administrator; ostali lahko v koš in med predloge samo dodajajo;
- arhiv cen za Poročila (`RPARCH`) dobita samo direktor in administrator.

Ime uporabnika (»ime in priimek«) se mora ujemati s poljem `vodja` na objektih in ponudbah. Ob preimenovanju
uporabnika v Administraciji strežnik to polje samodejno popravi.

### Zagon za razvoj

```bash
npm install
npm run build      # iz prototipa naredi public/index.html in public/app.js
npm run dev        # http://localhost:8080, razvojni način: katerokoli geslo, menjava vloge v glavi, podatki v ./data-dev
npm start          # pravi način (prijava, pravice), podatki v ./data
npm test           # vsi testi, rezultat v tests/out/REZULTAT.md (rabi Playwright + Chromium)
```

Node.js 22.13 ali novejši (zaradi vgrajenega `node:sqlite`).

### Nova verzija prototipa

1. Zamenjaj `prototip/index.html`.
2. V `scripts/build-frontend.js` popravi `SHA256`.
3. Poženi `npm run build`. Če se kateri popravek ne ujema več, se build ustavi in pove, katerega je treba prilagoditi.
4. Poženi `npm test` in preglej `tests/out/REZULTAT.md`.

### Uvoz in vzorčni podatki

- Dokler ni pravih podatkov, aplikacija ob prvem zagonu pokaže vzorec iz prototipa (Šenčur, Westlink …).
- `npm run uvoz -- izvoz.json --zamenjaj` uvozi izvoz iz prototipa. To je vsebina `localStorage['msd-vzorec2']`; v konzoli brskalnika pri prototipu: `copy(localStorage.getItem('msd-vzorec2'))`.
- `npm run odstrani-vzorec -- --potrdi` odstrani vzorčne objekte, ponudbe, datoteke, monterje in PDEF. Ceniki ostanejo.
- Obe skripti najprej naredita kopijo baze v `data/backup/`.
