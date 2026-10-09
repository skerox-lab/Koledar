# Preverjanje enakosti s prototipom (vsak korak mora uspeti)

Vsak scenarij izvedi v prototipu (`prototip/index.html`) in v novi aplikaciji z enakimi začetnimi podatki. Rezultat mora biti enak do zadnje številke in besede. Zapiši rezultat v tabelo na koncu.

## A. Vizualna enakost
1. Za vsako stran in zavihek (seznam v SPECIFIKACIJA.md, poglavja 2–10) naredi posnetek zaslona pri 1400 × 900 v obeh aplikacijah. Razlik ne sme biti (dovoljeni so le drugačni datumi »danes«).
2. Vloge: ponovi posnetke za vodjo, računovodstvo, direktorja, administratorja.

## B. Plan ekip in ure
1. Teden 12.–18. 10. 2026, Marko, torek: vpiši `wc 6 r-wc 2` → celica `WC 6 R-WC 2`, Σ vrstice +8.
2. Luka, torek: `wc 6 r 2` → celica rdeča + opozorilo o oznaki objekta; v statistiki vrstica »režija brez oznake objekta« 2 uri.
3. `bolniška` → bela celica, kvadratek Bolniške +1 dan · 8 ur.
4. Teden 21.–27. 12. 2026: petek rdeč »božič«, prazne celice »praznik«; kvadratek Prazniki 4 dnevi (pri 4 monterjih), na vikend: dan samostojnosti in enotnosti 26. 12.
5. Teden 9.–15. 11. 2026: torek siv napis »dan znanosti«, ni prost dan.
6. Letni PDF: 2 strani, A4 ležeče (841,89 × 595,28 pt).
7. Gumb Shrani takoj po vpisu brez Tab: vpis shranjen.

## C. Stroški ↔ plan
1. Šenčur (oznaka VOŠ), vpiši 5.–7. 10. 2026 Marko `VOŠ`, Luka 6. 10. `VOŠ 4 WC 4`, Jure 7. 10. `VOŠ 6 R 2` (oz. `R-VOŠ 2`).
2. Stroški › Lastne ekipe, ure mora pokazati vse ure do danes, razdelitev po monterjih, režijske posebej, × 27 €/h; prihodnji dnevi kot »planirano naprej«.

## D. Ceniki ↔ kalkulacija ↔ izvozi
1. Sistemi, W112 PS 12/100: začetni strošek navadna 43,07 €/m², razlika 13,83 · 24 %.
2. Uredi: W112 PS 12/100 navadna 60,00; Kooperanti »Stena W112« 17,00; »Bandažiranje Q2« 3,60; Kalcer »GKB PLOŠČE 12,5 mm« 4,60; »PROFIL KNAUF CW 75« 2,00.
3. Pričakovano: Material 20,74 / Delo 17,00 / Bandaža 7,20 / Strošek 45,98 / Prodajna 60,00 / Razlika 14,02 · 23 %.
4. Poročila: cenik W112/100/GKB = 60.
5. Izvoz Excel in PDF za Sisteme, Dodatna dela, Kooperante vsebujejo nove vrednosti.
6. Izbris artikla GKB iz cenika Kalcer → opozorilo v potrditvi, kalkulacija oranžno »1 artiklov ni v ceniku«.
7. Osveži cenik z Excelom → pregled sprememb pred potrditvijo.

## E. Objekt
1. Pregled Šenčur: »48 % pogodbenih del«; potrditev dodatne ponudbe in povezava postavk → nova barvna črta »x % po ponudbi …«.
2. Dokumenti: mape 01–16 po abecedi, 04 Gradbena knjiga.
3. Moji objekti: stolpec Izvedeno, brez Izid.

## F. Ponudbe
1. Nova ponudba, naročnik tipkaj `gra` → predlog SGP Graditelj d.d., Enter → naslov »Maistrova ulica 7, 1241 Kamnik«.
2. `kalc` → Kalcer d.o.o., info@kalcer.si.
3. Excel z listom »Ponudba« in listom popisa → postavke samo iz popisa.

## G. Vloge
1. Računovodstvo odpre Poročila → obvestilo in Moji objekti.
2. Vodja ne vidi tujih objektov in ponudb; strežnik vrne 403 za tuj objekt.
3. Administracija: urejanje vloge, izbris; zadnjega administratorja ni mogoče izbrisati.

## Rezultat

Izpolnjeno 9. 10. 2026 iz samodejnih testov (`npm test`). Oba programa sta tekla v brskalniku Chromium pri
1400 × 900 z enakimi začetnimi podatki (vzorec iz prototipa) in datumom 9. 10. 2026 10:00. Nova aplikacija je tekla
v razvojnem načinu (podatki na strežniku, menjava vloge v glavi kot v prototipu). Podrobni izpisi vsakega koraka so v
`tests/out/REZULTAT.md` (ustvari ga `npm test`).

| Scenarij | Prototip | Nova aplikacija | Enako (da/ne) |
|---|---|---|---|
| A1 Posnetki vseh 28 strani in zavihkov + prijava | 113 posnetkov | 113 posnetkov, razlika 0 pikslov | da |
| A2 Vloge: vodja, računovodstvo, direktor, administrator | po 28 strani na vlogo | razlika 0 pikslov | da |
| B1 Marko tor `wc 6 r-wc 2` | celica `WC 6 R-WC 2`, Σ Marko 40 → 40 (¹) | enako | da |
| B2 Luka tor `wc 6 r 2` | celica rdeča, opozorilo o oznaki, »Režija brez oznake objekta 2 ur« | enako | da |
| B3 `bolniška` | bela celica, Bolniške 1 dan · 8 ur | enako | da |
| B4 Teden 21.–27. 12. 2026 | pet 25 rdeč »božič«, 15 celic »praznik«, Prazniki 4 dnevi, sob 26 »dan samostojnosti in enotnosti« | enako | da |
| B5 Teden 9.–15. 11. 2026 | tor 10 »dan znanosti«, 0 celic »praznik« | enako | da |
| B6 Letni PDF | 2 strani, 841,89 × 595,28 pt (A4 ležeče) | enako, enak odtis slik strani | da |
| B7 Shrani brez Tab | »vse spremembe so shranjene«, po osvežitvi `WC` | enako (shranjeno na strežniku) | da |
| C Stroški Šenčur ↔ plan | Lastne ekipe: 36 ur do danes (režijske 2) × 27 €/h = 972,00; Marko 24, Luka 4, Jure 8; planirano naprej še 32 ur (864,00 €) | enako | da |
| D1 W112 PS 12/100 začetno | strošek 43,07, razlika 13,83 · 24 % | enako | da |
| D2–3 Po spremembi cenikov | Material 20,74 / Delo 17,00 / Bandaža 7,20 / Strošek 45,98 / Prodajna 60,00 / Razlika 14,02 · 23 % | enako, ostane po osvežitvi | da |
| D4 Poročila | W112 100 mm GKB cenik 60,00 | enako | da |
| D5 Izvozi Sistemi, Dodatna dela, Kooperanti | Excel z 60 / 17 / 3,6; PDF 1 stran A4 pokončno | enake celice, enak odtis PDF | da |
| D6 Izbris GKB iz Kalcerja | opozorilo »… v normativu za kalkulacijo …«, »1 artiklov ni v ceniku, cena iz ponudbe« | enako | da |
| D7 Osveži cenik z Excelom | pregled: prebrano 19, spremenjene 1, nove 1, odstranjene 1, Prej → Novo | enako | da |
| E1 Šenčur | »48 % pogodbenih del«, »0 % po ponudbi 0533/2026«; po potrditvi postavke v situacijah pod »ponudba 0533/2026« (²) | enako | da |
| E2 Dokumenti | 01 Dobavitelji … 04 Gradbena knjiga … 16 Zapisniki | enako | da |
| E3 Moji objekti | stolpci Objekt, Vodja, Pogodba, Obračunano, Izvedeno; brez Izid | enako | da |
| E4 Naložena dobavnica (dodatno) | strošek materiala 1.234,56, datoteka ostane | enako, datoteka na strežniku v `files/sencur/06/` | da |
| F1 `gra` | predlog SGP Graditelj d.d. · Maistrova ulica 7, 1241 Kamnik; izbira s puščico + Enter | enako; **sam Enter izbere prvi predlog** (³) | da / namerno |
| F2 `kalc` | Kalcer d.o.o. · info@kalcer.si | enako | da |
| F3 Excel z listom Ponudba in popisom | 3 postavke samo iz popisa, 0 iz lista Ponudba | enako | da |
| G1 Računovodstvo › Poročila | »Nimaš dovoljenega dostopa …«, Moji objekti | enako | da |
| G2 Vodja ne vidi tujih objektov in ponudb | (prototip: samo brskalnik) | strežnik pošlje samo njegove; tuj objekt 403; tuja datoteka 403 | nova: da |
| G3 Administracija | (prototip: simulirano) | urejanje vloge, izbris; sebe in zadnjega administratorja ni mogoče izbrisati (preveri tudi strežnik) | nova: da |
| X Ostali izvozi (dodatno) | situacija, stroški, obračun kooperanta, VASCO CSV, plan, ure CSV, poročila | enaka imena datotek, celice, CSV, odtis PDF | da |

Opombe (odločeno 9. 10. 2026: »naredi tako, da bo smiselno in enostavno«):

1. **B1 »Σ vrstice +8«**: velja prototip. Marko ima v torek 13. 10. že `WC` (8 ur). `wc 6 r-wc 2` je spet 8 ur (6 + 2 režije), zato Σ ostane 40. Σ se poveča za 8 samo, če vpišeš v prazno celico. Besedilo testa je bilo napačno, program je pravilen.
2. **E1 nova črta »x % po ponudbi …«**: velja prototip. Črta pokaže, koliko dodatne ponudbe je **izvedeno**. Po potrditvi je 0 %, dokler v situaciji ne vpišeš količin teh postavk. Postavke se ob potrditvi prenesejo v Situacije pod »Dodatna dela · ponudba 0533/2026«.
3. **F1 »Enter → naslov«**: spremenjeno, kot piše v PREVERJANJE. Sam **Enter izbere prvi predlog** in izpolni naslov in e-pošto. Puščice in klik delujejo kot prej. V prototipu je bila potrebna puščica dol + Enter. Preverjeno s testom F1b.
