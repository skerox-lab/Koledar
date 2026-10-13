# Preverjanje sprememb 1–22 (prototip verzija 200)

Vsak scenarij izvedi v prototipu (`prototip/index.html`, verzija 200) in v aplikaciji z enakimi začetnimi (vzorčnimi) podatki. Rezultat mora biti enak do zadnje številke in besede. Datum »danes« v primerih je 13. 10. 2026.

## Popravki prvotnega PREVERJANJE.md
- **E3** se zdaj glasi: Moji objekti, razpredelnica ima stolpca »Pričetek del« in »Trajanje (mes.)« ter »Opombe«. Stolpcev »Izvedeno« in »Izid« ni.
- **E2** ostane: mape 01–16 po abecedi, 16 = Gradbena knjiga.
- **G1** ostane. Dodatno: pri vlogah direktor, računovodstvo in administrator so na straneh Moji objekti ter Povpraševanja in ponudbe skupine po vodjih (točka 21).

## Scenariji po točkah
| Točka | Scenarij | Pričakovano |
|---|---|---|
| 1 | Klik na oranžen gumb »✦ Claude« v glavi | Panel desno (do 440 px), Nov pogovor, ✕, Pošlji (oranžen), Ustavi. Vodja prek orodij ne dobi tujih objektov. |
| 2 | Administracija › uredi uporabnika › Vloga | Možnosti samo: vodja projekta, računovodstvo, direktor, administrator |
| 3 | Ure in statistika › Obdobje 1. 10. – 31. 10. 2026 | Naslov »1. 10. 2026 – 31. 10. 2026«, kvadratki in tabeli za to obdobje; »Kot plan zgoraj« vrne obdobje plana |
| 4 | Odpri Claude panel | Brez sivega imena strani v glavi panela |
| 5 | Plan › »+ Dodaj monterja« (teden, mesec, leto) | Nova vrstica na koncu, kurzor v imenu; v letnem pogledu preklop na teden; zapis v Sled sprememb; več kot 15 vrstic mogoče |
| 6 | Moji objekti › vpiši Pričetek in Trajanje `2,5` | Sprejme vejico, časovnica pokaže pas, sprememba v Sledi sprememb |
| 7 | Moji objekti › Opombe, Aktualno zložljivo, Izvozi v Excel / Ustvari PDF | Opomba shranjena; ▸/▾ pri Aktualno; datoteki »Finančni pregled projektov 13. 10. 2026.xlsx/.pdf« |
| 8–9 | Časovnica objektov na strani | Ni povzetka ob naslovu in ni legende; samo »Brez pričetka ali trajanja: …«, če velja |
| 10 | PDF Finančnega pregleda | Glava podjetja, naslovni trak, »Datum kolegija«, tabeli s stolpci Zap. št., Ponudba, Naziv objekta, Investitor, Vrednost del brez DDV €, DDV €, Vrednost del z DDV €, Opombe; A4 ležeče |
| 11 | Vodja Nejc, Projekti v pridobivanju | 6 vrstic, med njimi »… · dodatna ponudba za Večstanovanjski objekt Šenčur« (0533/2026); Skupaj 321.909,97 / 70.820,19 / 392.730,16 |
| 12 | Ceniki › Sistemi › podrobnosti sistema | Ni sekcije »Doseženo na projektih« |
| 13 | Plan › Po monterjih | Brez stavka o zasedenosti |
| 14 | Po objektih (stran, Excel, PDF) | Stolpci: Oznaka, Objekt, Ure, Od tega režija, Monterji |
| 15 | Ure in statistika | Kvadratki: Opravljene ure, Prazniki, Bolniške, Dopusti, Odsotnosti; opomba »Prazniki, bolniške, dopusti in odsotnosti so v dnevih.« |
| 16 | PDF Finančnega pregleda | Brez štirih kvadratkov |
| 17–18 | Podpis v izvozu | Napis nad črto, ime na črti; vodja: »VODJA PROJEKTOV« + Nejc |
| 19 | Glave stolpcev v izvozu | »Vrednost del brez DDV €« in »Vrednost del z DDV €« v eni vrstici (PDF in Excel) |
| 20 | Izvoz PDF: 3 strani pri direktorju (2 finančni pregled + časovnica), Excel list »Časovnica objektov« | Vodja: samo svoji objekti; direktor/računovodstvo/admin: vsi odprti objekti |
| 21 | Prijavljen kot direktor › Moji objekti | Skupine »Vodja projektov: Matej (2)«, »Vodja projektov: Nejc (3)«; po novi ponudbi direktorja in potrditvi: prva skupina »Moji projekti · Marjan (direktor)« |
| 21 | Direktor › nova ponudba › shrani | Vodja ponudbe = Marjan; pri urejanju tuje ponudbe vodja ostane |
| 21 | Vodja Nejc › Moji objekti | Brez skupin: Večstanovanjski objekt Šenčur, Hiša Kušar, Podrožniška, Mačkovci 80 |
| 22 | Direktor › Izvozi v Excel (vzorčni podatki) | Izvedba: »Vodja projektov: Matej (2)«, Skupaj Matej 1.858.097,31 / 408.781,41 / 2.266.878,72; »Vodja projektov: Nejc (3)«, Skupaj Nejc 269.782,21 / 59.352,09 / 329.134,30; Skupaj v izvedbi 2.127.879,52 / 468.133,50 / 2.596.013,02. Pridobivanje: »Vodja projektov: Nejc (6)«, Skupaj Nejc 321.909,97. Vrednost vseh del 2.449.789,49 / 538.953,69 / 2.988.743,18. Povzetek po vodjih: Matej 1.858.097,31 / 0,00 / 1.858.097,31 / 2.266.878,72; Nejc 269.782,21 / 321.909,97 / 591.692,18 / 721.864,46. Podpis PRIPRAVIL – Marjan |
| 22 | Direktor › Ustvari PDF | Enake številke; Povzetek z vrstico »Vrednost vseh del« 2.127.879,52 / 321.909,97 / 2.449.789,49 / 2.988.743,18; časovnica: skupina Matej (WESTLINK Campus, Gaj Preserje C4), nato Nejc (Hiša Kušar, Večstanovanjski objekt Šenčur, Mačkovci 80) |
| 22 | Vodja Nejc › izvoz | Brez skupin in brez Povzetka; Vrednost vseh del 591.692,18 / 130.172,28 / 721.864,46; podpis VODJA PROJEKTOV – Nejc |

## Rezultat
Izpolnjeno 13. 10. 2026 iz samodejnih testov (`npm test`). Prototip v200 in aplikacija sta tekla v Chromiumu pri 1400 × 900
z enakimi vzorčnimi podatki in datumom 13. 10. 2026. Aplikacija je tekla v razvojnem načinu (podatki na strežniku,
menjava vloge kot v prototipu). Točke, ki zadevajo pravi način (prijava, pravice, strežnik), so preverjene posebej
(zadnji del tabele). Podrobni izpisi so v `tests/out/REZULTAT.md`.

| Točka | Prototip | Aplikacija | Enako (da/ne) |
|---|---|---|---|
| 1, 4 Claude | oranžen gumb »✦ Claude« (rgb 217,119,6), panel 440 px, Nov pogovor, ✕, Pošlji, Ustavi; brez imena strani v glavi panela | razvojni način: enako; **pravi način: gumb skrit do odločitve o GDPR** | da / namerno |
| 2 Vloge | vodja projekta, računovodstvo, direktor, administrator | enako; strežnik kombinirane vloge ne sprejme, obstoječe pretvori v »administrator« | da |
| 3 Obdobje statistike | »Ure in statistika · 1. 10. 2026 – 31. 10. 2026«, Ta mesec, Letos do danes, Kot plan zgoraj vrne »12. – 18. oktober 2026« | enako | da |
| 5 Dodaj monterja | 16, 17, 18 vrstic; fokus v imenu; v letnem pogledu preklop na teden; »dodan monter 16/17/18« v Sledi sprememb | enako | da |
| 6 Pričetek, trajanje `2,5` | Gaj Preserje C4: 1. 12. 2026, 2,5 mes.; pas v časovnici; dva zapisa v Sledi sprememb | enako | da |
| 7 Opombe, Aktualno, izvoz | opomba v Sledi; Aktualno ▸/▾; »Finančni pregled projektov 13. 10. 2026.xlsx/.pdf« | enako (enake celice, enak odtis PDF) | da |
| 8–9 Časovnica na strani | brez povzetka in legende | enako | da |
| 10, 16, 19 PDF in Excel oblika | glava podjetja, Datum kolegija, 8 stolpcev, brez kvadratkov, A4 ležeče | enako | da |
| 11 Vodja Nejc, pridobivanje | 6 vrstic, »… dodatna ponudba za Večstanovanjski objekt Šenčur«, Skupaj 321.909,97 / 70.820,19 / 392.730,16 | enako | da |
| 12 Ceniki › Sistemi | ni »Doseženo na projektih« | enako | da |
| 13–15 Statistika | kvadratki Opravljene ure, Prazniki, Bolniške, Dopusti, Odsotnosti; Po objektih: Oznaka, Objekt, Ure, Od tega režija, Monterji (tudi Excel); opomba samo o dnevih | enako | da |
| 17–18 Podpis | vodja: »VODJA PROJEKTOV« + Nejc; ostali »PRIPRAVIL« + ime | enako; v pravem načinu ime prijavljenega | da |
| 20 Časovnica v izvozu | PDF 3 strani A4 ležeče, Excel list »Časovnica objektov«; vodja samo svoji objekti | enako | da |
| 21 Direktor | »Vodja projektov: Matej (2)«, »Vodja projektov: Nejc (3)«; nova ponudba → vodja Marjan; urejanje tuje 0391/2026 → vodja ostane Nejc; po potrditvi »Moji projekti · Marjan (direktor) (1)« | enako | da |
| 21 Vodja Nejc | brez skupin: Šenčur, Hiša Kušar, Mačkovci 80 | enako | da |
| 22 Direktor Excel | Skupaj Matej 1.858.097,31 / 408.781,41 / 2.266.878,72; Skupaj Nejc 269.782,21 / 59.352,09 / 329.134,30; v izvedbi 2.127.879,52 / 468.133,50 / 2.596.013,02; vseh del 2.449.789,49 / 538.953,69 / 2.988.743,18; Povzetek po vodjih; PRIPRAVIL Marjan | enako | da |
| 22 Direktor, računovodstvo, administrator PDF | 3 strani, A4 ležeče | enako, enak odtis slik | da |
| 22 Vodja Nejc izvoz | brez skupin in Povzetka; vseh del 591.692,18 / 130.172,28 / 721.864,46; VODJA PROJEKTOV | enako | da |
| Prvotni PREVERJANJE (B–G, E3 popravljen) | vsi scenariji | enako | da |
| Posnetki zaslona | 30 strani × 4 vloge + prijava = 121 | razlika 0 pikslov | da |
| Pravi način (strežnik) | – | 38 preverjanj: prijava, 403 za tuj objekt in datoteko, vodja ponudbe določi strežnik, vloge, Claude skrit, Outlook skrit, hkratno urejanje, skripte | da |
