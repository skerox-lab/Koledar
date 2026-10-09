# Razlike od prototipa in kaj še ni narejeno

Stanje 9. 10. 2026. Prototip v178 (SHA-256 `d3d56bda…e38123`).

Testi so pokazali, da se nova aplikacija v **razvojnem načinu** do piksla in do številke ujema s prototipom:
- 113 posnetkov zaslona (28 strani × 4 vloge + prijava);
- 24 scenarijev s številkami in izvozi.

Vse spodaj je razlika v **pravem načinu** (prava prijava, pravice na strežniku). Razlike so namerne ali neizogibne.
Popoln seznam sprememb kode je v [`POPRAVKI-PROTOTIPA.md`](POPRAVKI-PROTOTIPA.md).

## 1. Razlike, ki jih uporabnik vidi

| # | Kje | Prototip | Nova aplikacija | Zakaj |
|---|---|---|---|---|
| 1 | Prijava | sprejme katerokoli geslo; ime predizpolnjeno; stavek »V vzorcu deluje katerokoli geslo.« | preveri geslo; polje prazno; stavka ni; ob napaki »Napačno uporabniško ime ali geslo«; po 10 napačnih poskusih zaklep za 15 min | prava prijava |
| 2 | Prvi zagon | – | okno »Prvi zagon« za prvega administratorja (ime in priimek, e-naslov, geslo) | odločitev: prvi uporabnik je administrator |
| 3 | Začasno geslo | – | okno »Nastavi novo geslo« pred prvim delom | odločitev: kljukica za menjavo gesla |
| 4 | Glava | spustni seznam »Prijavljen: Nejc · vodja projekta …« | »Prijavljen: *ime*« brez spustnega seznama (seznam ostane samo v razvojnem načinu) | SPECIFIKACIJA 1 |
| 5 | Administracija › Uporabniki | »Ponastavi geslo« pokaže samo obvestilo | »Ponastavi geslo« naredi začasno geslo in ga pokaže v oknu; nov gumb **»Nastavi geslo«** (administrator vpiše geslo, izbere, ali ga mora uporabnik zamenjati) | odločitev: gesla ureja administrator ročno |
| 6 | Nov uporabnik | obvestilo »Ob prvi prijavi nastavi svoje geslo« | isto obvestilo, nato okno z **začasnim geslom** | brez gesla bi se lahko prijavil kdorkoli |
| 7 | Sled sprememb | »kdo« je Nejc / direktor / računovodstvo / Nejc (admin), »kdaj« pravkar | »kdo« je ime prijavljenega, »kdaj« npr. »danes 9:42«; zapis na strežniku, prikaz zadnjih 500 | SPECIFIKACIJA 1 |
| 8 | Datoteke, koš, predlogi | »kdo« po vlogi | ime prijavljenega | kot 7 |
| 9 | Nova ponudba | vodja je vedno »Nejc« | vodja je prijavljeni uporabnik | sicer vodja svoje ponudbe ne bi videl |
| 10 | Hkratno urejanje | – | če je isti podatek medtem spremenil drug uporabnik: okno »Te podatke je medtem spremenil drug uporabnik …« in osvežitev strani; zadnji vnos je treba ponoviti | da se nič ne prepiše tiho |
| 11 | Strežnik nedosegljiv | – | obvestilo; spremembe se shranijo, ko povezava spet deluje; ob zapiranju strani brskalnik opozori | |
| 12 | Prenos datotek | okno Claude za shranjevanje | navaden prenos brskalnika, **enaka imena datotek**, isto obvestilo »Pripravljeno: …« | SPECIFIKACIJA 1 |
| 13 | Trenutni objekt, skrita obvestila | skupno | vsak uporabnik ima svoje | več uporabnikov hkrati |
| 14 | Vodja projekta | prejme vse podatke, skrije jih brskalnik | strežnik pošlje samo njegove objekte, ponudbe in datoteke; tuj objekt ali datoteka vrne 403 | SPECIFIKACIJA 3 |
| 15 | Vodja, računovodstvo | – | ne prejmeta uporabnikov, sledi sprememb, koša, napak in predlogov ter arhiva cen za Poročila; v koš in med predloge lahko samo dodajata | SPECIFIKACIJA 3 |
| 16 | Izbris datoteke | izbris iz brskalnika | datoteka gre v `data/files/_izbrisano/<datum>/`, ne izbriše se dokončno | varnost |
| 17 | Nova ponudba › Naročnik | sam Enter ne izbere predloga, potrebna je puščica dol + Enter | **sam Enter izbere prvi predlog**, puščice in klik delujejo kot prej | odločitev 9. 10. 2026 (PREVERJANJE F1) |
| 18 | Naslov zavihka | »Montaža Škerjanec Digital · vzorec« | »Montaža Škerjanec Digital« | odločitev 9. 10. 2026 |
| 19 | Outlook | gumb »Poveži Outlook« in stanje v glavi, poziv v Korespondenci (simulacija) | skrito, dokler povezava ni narejena; sporočila se dodajo ročno (.msg, .eml) | odločitev 9. 10. 2026: počakava z Outlookom |
| 20 | Po `odstrani-vzorec` | – | vzorčni podatki partnerjev (PDEF) se ne prikazujejo več | SPECIFIKACIJA 1 |

## 2. Razlike, ki jih uporabnik ne vidi

- Knjižnice so iz npm (iste verzije, iste `dist` datoteke kot na cdnjs), shranjene lokalno. Neposredne primerjave s cdnjs nisem mogel narediti, ker je cdnjs v testnem okolju blokiran. Vsi izvozi (Excel, PDF, CSV) so bili v testih enaki prototipu.
- Pisave so iste datoteke kot na Google Fonts, shranjene lokalno.
- Varnostne glave (CSP, brez vgradnje v druge strani). Prototip uporablja `onclick` in `eval`, zato CSP to dovoli.
- Arhiv cen (`RPARCH`) ni več v `app.js`, ampak na strežniku (`server/data/rparch.json`).

## 3. Kaj še ni narejeno

| Kaj | Stanje | Kaj potrebujem |
|---|---|---|
| Outlook (Microsoft Graph) | odloženo; v pravem načinu skrito (vrstica 19) | Azure račun obstaja. Potrebna je registracija aplikacije v Entra ID (Directory/tenant ID, Application/client ID, client secret, preusmeritveni naslov) in odločitev o GDPR za AI povzetke |
| Predlogi naročnika iz AJPES/FURS | iz znanih podatkov kot v prototipu | potrditev, da gremo na brezplačni seznam FURS; preveril bom format |
| Bizi | samo povezava na kartici partnerja | odločitev o naročnini |
| Izvoz VASCO | CSV kot v prototipu | primer uvozne datoteke iz VASCO |
| Administracija › Povezave in stanje | prikazuje vzorčne vrednosti iz prototipa (»Prostor na disku 78 %«, »vzorec 0.3«) | strežnik že ima seznam varnostnih kopij (`/api/varnostne-kopije`), prikaz še ni povezan |
| Docker slika | Dockerfile napisan; enaki koraki ročno preverjeni (`npm ci --omit=dev`, zagon, prijava) | Docker Hub v testnem okolju ni bil dosegljiv (omejitev 429), zato slike nisem zgradil; zgradi jo Synology |
| Model Synologyja | ni znan | podatki iz Informacijskega centra, glej `NAMESTITEV-SYNOLOGY.md` |
| Uvoz datotek iz prototipa | izvoz localStorage vsebuje podatke, ne datotek (IndexedDB) | datoteke naložiti znova ali dodatna skripta |
| Sprotno osveževanje | spremembe drugih uporabnikov vidiš po osvežitvi strani | po potrebi kasneje |
| Plan ekip je en podatek | če dva hkrati spreminjata plan, drugi dobi okno in vnos ponovi | po potrebi kasneje razdelim po monterjih |
| Brskalniki | testirano v Chromiumu (Chrome, Edge) | Firefox, Safari in telefon še niso preizkušeni |
| Javni dostop (HTTPS) | pripravljeno (`MSD_SECURE_COOKIE`), navodila za Synology | pregled kode s strani programerja pred odprtjem na internet |

## 4. Odprta vprašanja iz SPECIFIKACIJA.md (12) – do odločitve kot v prototipu

1. Popusti v arhivskih cenah Poročil: arhiv ostane pred popustom.
2. Vodje vidijo in urejajo Partnerje in Cenike (strežnik to dovoli).
3. Interna urna postavka: 27 €/h (`URNA` v kodi prototipa).
4. GARNOL naslov: na kartici partnerja »Verovškova ulica 64A«.
5. VASCO: sedanji CSV.
6. Bizi: brez naročnine.

## 5. Odločeno pri razlikah med prototipom in PREVERJANJE.md (9. 10. 2026)

1. **B1**: velja prototip. Σ ostane 40, ker je imel Marko v torek že 8 ur. Program je pravilen, besedilo testa je bilo napačno.
2. **E1**: velja prototip. Črta kaže izvedeni delež dodatne ponudbe, zato je po potrditvi 0 %, dokler ni vpisanih količin.
3. **F1**: spremenjeno. Sam Enter izbere prvi predlog (glej tabelo zgoraj, vrstica 17).
