# Montaža Škerjanec Digital – specifikacija za prenos v pravo aplikacijo

Stanje: prototip verzija 178, 9. 10. 2026.
Edini vir resnice je datoteka `prototip/index.html`. Ta dokument popisuje pravila in povezave, ki so v njej že narejena, da se pri prenosu nič ne izgubi. Če se ta dokument in prototip razlikujeta, velja prototip.

Kontrolna vsota prototipa (SHA-256):
- `prototip/index.html` → `d3d56bdaae2117169f988a500f0dbd8b03b84b7c5ae91593314747e65ee38123`
- `prototip/ceniki/kalcer-cenik-2026-06-15.pdf` → `b14898ded46a89b5f14773943cd6c2a0ccf2b1b2ac7e910cf652a80e7edaf536`

---

## 1. Kaj je v prototipu samo simulirano (v pravi aplikaciji mora biti zares)

| V prototipu | V pravi aplikaciji |
|---|---|
| Vsi podatki v `localStorage` (ključ `msd-vzorec2`), datoteke v IndexedDB (`msd-files`) | Podatkovna baza in datoteke na **internem strežniku podjetja**. Nič v brskalniku razen nastavitev prikaza. |
| Prijava sprejme katerokoli geslo | Prava prijava, gesla **zgoščena** (bcrypt/argon2), seje, odjava, »Ponastavi geslo« zares pošlje povezavo. |
| Vloga se zamenja s spustnim seznamom »Prijavljen:« v glavi | Vloga pride iz prijavljenega uporabnika. Spustni seznam za menjavo vloge obstaja samo v razvojnem načinu. |
| Pravice preverja samo brskalnik | Pravice (poglavje 3) **mora preverjati strežnik** pri vsakem zahtevku. Uporabnik brez pravice podatkov sploh ne dobi. |
| Prenos datotek gre prek `claude.use('downloads')` (funkcija `saveFile`) | Navaden prenos v brskalniku (Blob + `<a download>`). Imena datotek ostanejo enaka. |
| Outlook »povezan / ni povezan« | Prava povezava (Microsoft Graph). Povzetki e-pošte z AI šele po odločitvi o GDPR. |
| Predlogi naročnika iz znanih podatkov (kartice partnerjev, objekti, ponudbe) | Strežnik poizveduje v **AJPES (PRS)** za naziv in naslov ter v **Bizi** za e-pošto. Bizi je plačljiv – odločitev o naročnini. |
| »Osveži podatke« na kartici partnerja | Strežnik osveži podatke iz AJPES/Bizi. |
| Vzorčni podatki (Šenčur, Westlink, Kušar, Mačkovci, Gaj, vzorčne datoteke, PDEF podatki partnerjev) | Uvoz pravih podatkov. Vzorčne podatke odstrani šele, ko so pravi uvoženi. |
| Branje cenikov iz PDF v brskalniku (pdf.js) | Lahko ostane v brskalniku ali gre na strežnik, rezultat mora biti enak (pregled sprememb pred potrditvijo). |
| Knjižnice s cdnjs (xlsx 0.18.5, exceljs 4.4.0, jszip 3.10.1, html2canvas 1.4.1, jspdf 2.5.1, pdf-lib 1.17.1, pdf.js 3.11.174) | Iste verzije, shranjene lokalno na strežniku (brez odvisnosti od interneta). |
| Izvoz za računovodstvo (CSV) | Format je treba uskladiti z VASCO (format še ni potrjen). |

---

## 2. Strani in meni

Meni: Moji objekti · Povpraševanja in ponudbe · Plan ekip in ure · (ločilo) · Partnerji · Ceniki · Poročila (direktor, administrator) · (ločilo) · Administracija (direktor, administrator).

Strani `ure` ne obstaja več samostojno – pot `ure` odpre Plan ekip in ure.

---

## 3. Vloge in pravice

| Vloga | Vidi |
|---|---|
| Vodja projekta | samo **svoje** objekte, samo **svoja** povpraševanja in ponudbe (tudi opozorila in števec ob meniju), **Plan ekip in ure v celoti** |
| Računovodstvo | vse razen Poročil |
| Direktor | vse, tudi Poročila in Administracijo |
| Administrator | vse |

- Primarna zaščita: strani brez pravice niso v meniju.
- Rezerva: če uporabnik vseeno pride na stran brez pravice (ali vodja na tuj objekt), dobi obvestilo »Nimaš dovoljenega dostopa do te strani. Vrnjen si na začetno stran.« in gre na Moje objekte.
- Odprto vprašanje: ali vodje vidijo Partnerje in Cenike (zdaj jih vidijo).

---

## 4. Moji objekti

- Razpredelnica: Objekt (pod njim samo naročnik), Vodja, Pogodba, Obračunano, **Izvedeno** (% + tanka črta). Stolpca Izid ni.
- Izvedeno: za objekte s situacijami v programu = izvedena pogodbena dela × (1 − popust) / pogodba. Za objekte brez situacij = obračunano / pogodba (lahko > 100 %, črta oranžna, namig ob miški).
- Aktualno: brez sivih podnapisov, obvestila se lahko skrijejo (✕) in prikažejo nazaj.
- Končani objekti v zloženem razdelku.

### Objekt – zavihki: Pregled · Ponudba · Situacije · Podizvajalci · Stroški · Dokumenti · Korespondenca

**Časovnica** nad zavihki: Povpraševanje → Ponudba → vsaka **dodatna ponudba kot svoje vozlišče z datumom** → Izvedba → Obračun.

**Pregled**
- Finance: Pogodba, dodatne ponudbe potrjene/nepotrjene, Izvedeno pogodbena dela, Dodatna dela, popust na dodatna dela, »Popust x % na pogodbena dela«, Obračunano, Zadržano, Stroški do danes, **Rezultat**.
- Pod Financami črte napredka: modra »48 % pogodbenih del«, nato **ena črta za vsako dodatno ponudbo v svoji barvi** z napisom samo »97 % po ponudbi 0533/2026«. Nepotrjena = prazna črta, »0 % po ponudbi …«. Dodatna dela brez ponudbe nimajo vrstice.
- Gumba samo tu: Označi kot končan, Izbriši objekt. Gumba »Spremeni ime« ni.
- Izvoznih gumbov na Pregledu ni.

**Ponudba**
- Naslov »Osnovna ponudba«, številka večja, oznaka »potrjena · zaklenjena«, brez sivih stranskih besedil.
- Popisi zloženi s klikom na naslov (▾/▸).
- Seštevek: Skupaj / Popust x % / Vrednost brez DDV. Splošna določila.
- **Dodatne ponudbe**: vsaka ima **svojo številko** (iz istega števca kot ponudbe), enaka pravila in enak izgled kot osnovna; razlikuje se lahko le popust. Ob potrditvi je obvezna podlaga.
- Brez izvoznih gumbov.

**Situacije**
- Postavke osnovne ponudbe; dodatna dela razdeljena po številki dodatne ponudbe.
- V vseh izvozih situacije so številke ponudb (osnovna in dodatne z datumom in podlago).
- Zaključeno situacijo je mogoče izbrisati.
- Gumb »Izvoz za računovodstvo« (CSV, samo trenutni objekt).

**Podizvajalci**
- Obračuni kooperantov: Excel / PDF / CSV / Izbriši za vsak obračun.
- Zložljiv »Cenik za kooperante« prikazuje **Ceniki › Kooperanti** (ista podatkovna vrsta, ne kopija).

**Stroški**
- Material: samo iz dobavnic in računov, naloženih na ta objekt (mapa Dobavitelji); vsak objekt ima svoje.
- Podizvajalci in kooperanti: vsota obračunov.
- **Lastne ekipe, ure** = vse ure vseh monterjev na tem objektu iz Plana ekip in ur, **od prvega vpisa do danes**, tudi monterji, ki ne delajo več, **vključno z režijskimi urami R-oznaka objekta**, × 27 €/h interno. Prihodnje planirane ure se ne štejejo, prikažejo se kot »planirano naprej še X ur«. Ročnega popravka ni. Opis vrstice pove ure, od tega režijske, in razdelitev po monterjih.
- Fiksne kategorije po abecedi: Palete, Ploščad, Stroški gradbišča, Študenti, Transport in razklad, Vodja projekta (5 % obračunanega, popravljivo), Zavarovanja. Dodatne kategorije po meri.
- Izvoz Stroškov v Excel in PDF.

**Dokumenti** – mape po **abecedi, oštevilčene 01–16**:
01 Dobavitelji · 02 Dopisi · 03 Fotografije · 04 Gradbena knjiga · 05 Izjave · 06 Izvajalske pogodbe · 07 Korespondenca · 08 Menice, izvršnice, bančne garancije in zavarovanja · 09 Načrti · 10 Naročilnice · 11 Podizvajalci · 12 Pogodba · 13 Ponudbe · 14 Primopredaja in garancija · 15 Situacije · 16 Zapisniki.
- Številke se izračunajo iz abecednega vrstnega reda (nova mapa premakne številke).
- Mapa Podizvajalci prikazuje obračune kooperantov.
- Vsaka datoteka se lahko izbriše (gumbi enake velikosti). Izbris dobavnice izbriše tudi njen strošek.
- Brez izvoznih gumbov na Dokumentih in Korespondenci.

---

## 5. Povpraševanja in ponudbe

- Seznam: Uredi, Poslano, stanja, opomnik, vrednost. Gumba »Pošlji« ni.
- Nova ponudba: gumbi Predogled, Izvozi PDF, Izvozi Excel, **Shrani ponudbo**. Osnutek se ob Uredi obnovi skupaj z datotekami.
- Glava ponudbe: Številka (brez pomožnega besedila), **en sam Naročnik** s spustnim seznamom predlogov med tipkanjem (od 2 znakov, puščice + Enter, klik). Izbira samodejno izpolni Naslov in E-pošto; ročno vpisano se ne prepiše.
- **Postavke ponudbe se berejo samo iz lista popisa, nikoli iz lista »Ponudba«** (naša glava). Če postavk ni, opozorilo.
- Potrjeno / Zavrnjeno prek okna v aplikaciji (ne `confirm()`).

---

## 6. Plan ekip in ure (ena stran, en vir podatkov)

- Pogledi Teden / Mesec / Leto, gumbi Shrani, Izvozi v Excel, Izvozi v CSV (računovodstvo), Ustvari PDF.
- 15 vrstic monterjev, imena se urejajo. ✕ = »ne dela več« od danes (pretekli plan ostane).
- **Vpis v celico**: `WC` = 8 ur · `WC 6` · `WC 4 HK 4` · `WC 6 R-WC 2` · `dopust` · `bolniška` · `odsoten` · `praznik`.
- **Režijska ura ima vedno oznako objekta**: `R-WC` = režija na WESTLINK Campus. Samo `R` → celica rdeča + opozorilo; taka ura se ne šteje nobenemu objektu in je v statistiki ločeno kot »režija brez oznake objekta«.
- Dva objekta brez ur (`WC+HK` ali `WC HK`) → 4 + 4, celica rdeča, opozorilo.
- Barve objektov iz legende (paleta pik), oznake samodejno iz imena objekta. Dopust/Bolniška/Odsoten/Praznik bele.
- **Slovenski koledar** (gov.si, ZPDPD): dela prosti dnevi 1. in 2. 1., 8. 2., velikonočna nedelja in ponedeljek, 27. 4., 1. in 2. 5., binkoštna nedelja, 25. 6., 15. 8., 31. 10., 1. 11., 25. 12., 26. 12. Datum rdeč z imenom; prazna celica na praznik med tednom = praznik. Državni prazniki, ki niso dela prosti (8. 6., 17. 8., 15. 9., 23. 9., 25. 10., 10. 11., 23. 11.), samo siv napis.
- Σ ur na koncu vrstice v vseh pogledih.
- **Statistika** (zložljiva) – veliki kvadratki **samo z imenom in številko**, brez sivih podnapisov: Opravljene ure, Razpoložljive ure, Prazniki, Bolniške, Dopusti, Odsotnosti, en kvadratek za vsak objekt (ure vključno z režijo), Režija brez oznake objekta (če obstaja), Režijske ure. Kvadratka »Neplanirani dnevi« ni.
- Tabela Po objektih: Oznaka, Objekt, Ure, Od tega režija, Človek-dni, Monterji, Delež.
- Tabela Po monterjih: Monter, Ure, Režija, Dni dela, Prazniki, Bolniška, Dopust, Odsoten, Vikend / praznik, Objekti (**brez Zasedenosti**).
- Razpoložljive ure: v tednu/mesecu vsi delovni dnevi; v letu od prvega do zadnjega vpisa.
- Izvozi: Excel = plan + ure po monterjih + ure po objektih + statistika; PDF = plan + ure + statistika; **letni PDF na ležečem A4**.

---

## 7. Partnerji

- Filtri po skupinah, Dodaj partnerja, **Uredi** (naziv, vloga, skupina), Izbriši. Preimenovanje prenese podatke kartice.
- Kartica samo za branje z Uredi, Osveži podatke, neposredni povezavi Bizi in AJPES.

---

## 8. Ceniki

Zavihki Sistemi · Dodatna dela · Kooperanti · Dobavitelji.

- Sistemi, Dodatna dela, Kooperanti: zgoraj desno **Osveži cenik**, Izvozi v Excel, Ustvari PDF. Vsaka vrstica **Uredi** in **Izbriši**, na dnu **+ Dodaj postavko**.
- Dobavitelji: brez gumbov zgoraj; v vsaki vrstici **Osveži cenik**, PDF, **Izbriši**; pod seznamom **+ Dodaj dobavitelja**. Brez števila artiklov. V odprtem ceniku: iskanje, poglavja, Uredi/Izbriši/Dodaj postavko.
- **Osveži cenik**: priloži PDF/XLSX/XLS/CSV + »velja od« → pregled (prebrano, spremenjene cene prej→novo, nove, odstranjene) → Potrdi. Pri sistemih se ne briše nič. Zgodovina osvežitev nad seznamom.
- Vse spremembe v Sled sprememb.

### Kalkulacija na m² pri sistemih – POVEZAVE (morajo ostati točne)
- **Material** = Σ (količina/m² iz normativa Kalcer 26-PP05554) × (cena iz **Ceniki › Dobavitelji › Kalcer** zdaj) × (1 − 25 %) × (1 − 5 %). Povezava normativ → artikel v ceniku je v tabeli `KLINK` (naziv + zaporedna pojavitev + faktor enote). Če artikla ni, se vzame cena iz ponudbe in se oranžno označi.
- Vlagoodporna/ognjevarna: zamenjava GKB z GKB-I/GKF po cenah iz cenika Kalcer.
- **+ kalo 5 %**.
- **Delo kooperant** = postavka v **Ceniki › Kooperanti** po tabeli `KOOPLINK` (razpon → sredina).
- **Bandaža** = »Bandažiranje Q2« iz Ceniki › Kooperanti × število strani.
- **Prodajna cena** = cena sistema iz Ceniki › Sistemi; ista vrednost gre v Poročila.
- Pod vsako vrstico je napisan vir. Normativ in tehnični podatki so vezani na **naziv sistema** (npr. PS 12/100), ne na zaporedno številko.

---

## 9. Poročila (direktor, administrator)

- Brez sivega podnaslova. Vrstni red: Analiza → Po vodjih projektov → Dosežene cene po sistemih 2026 (zložljivo).
- Dosežene cene ločeno po sistemu, debelini in ploščah (GKB, GKB-I, GKF, GKF-I, Diamant), primerjava s stolpcem cenika.
- Izvoz Excel in PDF.
- **Odprto**: arhivske cene (RPARCH, 104 vrstic, brez GARNOL) so pred popustom, cene iz situacij po popustu – odločitev, ali arhiv preračunati s popusti.

---

## 10. Administracija

- Napake in predlogi, **Uporabniki in vloge** (Uredi: ime, uporabniško ime, vloga; Izbriši; Dodaj; Ponastavi geslo), Sled sprememb, Koš (obnovi), Povezave in stanje, Nastavitve.
- Ne moreš izbrisati sebe ali zadnjega administratorja.

---

## 11. Splošna pravila

- Jezik vmesnika slovenščina, števila slovenski zapis (1.234,56), datumi `d. m. llll`.
- Nikjer `alert/confirm/prompt` – samo okna v aplikaciji.
- Vsaka sprememba podatkov v Sled sprememb (kdo, kdaj, kaj).
- Imena izvoženih datotek ostanejo enaka kot v prototipu.

## 12. Odprta vprašanja (ne odloči sam)

1. Popusti v arhivskih cenah Poročil (WESTLINK 5 ali 4 %, GIC dodatni 4 %, GRADNIK %).
2. Ali vodje vidijo Partnerje in Cenike, in ali jih lahko urejajo.
3. Interna urna postavka (zdaj 27 €/h).
4. GARNOL naslov: objekt »Verovškova 54a«, AJPES »Verovškova ulica 64A«.
5. Format uvoza VASCO.
6. Naročnina Bizi API.
