---
title: "MS Digital – navodila za uporabnike"
date: "13. 10. 2026"
---

Montaža Škerjanec Digital odpreš v brskalniku na **http://192.168.10.50:8080**. Vse se shranjuje samodejno na strežnik v pisarni.

## Prva prijava

1. Od administratorja dobiš uporabniško ime (tvoj službeni e-naslov) in **začasno geslo**.
2. Odpri http://192.168.10.50:8080, vpiši e-naslov in začasno geslo, klikni **Prijava**.
3. Odpre se okno **Nastavi novo geslo**. Vpiši svoje geslo (vsaj 8 znakov) dvakrat in klikni **Shrani geslo**.
4. Odpre se aplikacija. Prijava velja 14 dni.

- **Odjava**: gumb zgoraj desno. Na skupnih računalnikih se vedno odjavi.
- **Pozabljeno geslo**: pokliči administratorja, da ga ponastavi.
- **Od doma**: najprej se poveži v službeni VPN, nato odpri isti naslov.
- Priporočen brskalnik: Chrome ali Edge.

## Meni in kaj vidiš

Levo je meni: **Moji objekti · Povpraševanja in ponudbe · Plan ekip in ure · Partnerji · Ceniki**. Direktor in administrator imata še **Poročila** in **Administracijo**. Gumb **‹ Nazaj** zgoraj levo vrne na prejšnjo stran.

| Vloga | Kaj vidi |
| --- | --- |
| Vodja projekta | samo svoje objekte in ponudbe; plan ekip in ure v celoti |
| Računovodstvo | vse razen Poročil in Administracije, razvrščeno po vodjih |
| Direktor, administrator | vse, razvrščeno po vodjih |

Vse spremembe se shranijo same, takoj ko zapustiš polje (Tab ali klik drugam).

## Moji objekti

Začetna stran s seznamom odprtih objektov.

- **Razpredelnica**: objekt in naročnik, vodja, pogodba, obračunano. Klik na vrstico odpre objekt.
- **Pričetek del, Trajanje (mes.), Opombe**: vpišeš neposredno v vrstico. Trajanje lahko z vejico, npr. `2,5`.
- **Časovnica objektov**: pas za vsak objekt od pričetka do konca. Rdeča črta je danes, rdeč rob pomeni pretečen rok. Klik na pas odpre objekt.
- **Aktualno**: naloge in opozorila (situacije v pripravi, nepotrjena dodatna dela, ponudbe brez odgovora). Obvestilo skriješ z ✕, nazaj ga prikažeš s »Prikaži skrita«. Sklop zložiš s klikom na naslov.
- **Končani objekti**: zloženi na dnu strani.
- **Izvozi v Excel / Ustvari PDF** (zgoraj desno): Finančni pregled projektov za kolegij, s projekti v izvedbi, v pridobivanju in časovnico. Vsebuje samo objekte, ki jih vidiš.

## Objekt

Nad zavihki je časovnica objekta: povpraševanje, ponudba, dodatne ponudbe, izvedba, obračun.

| Zavihek | Kaj tam delaš |
| --- | --- |
| Pregled | finance (pogodba, izvedeno, obračunano, stroški, rezultat), črte napredka, pogodbeni pogoji, udeleženci; Označi kot končan, Izbriši objekt |
| Ponudba | osnovna ponudba in dodatne ponudbe; potrditev dodatne ponudbe z vpisom podlage (aneks, naročilnica, e-pošta) |
| Situacije | v modri stolpec vpišeš količine za tekoči mesec; situacija gre iz »v pripravi« v »v uskladitvi« in »za račun«; izvoz Excel, PDF in za računovodstvo |
| Podizvajalci | obračuni kooperantov (Excel, PDF, CSV), cenik za kooperante |
| Stroški | material iz dobavnic, podizvajalci, lastne ekipe (ure iz plana × 27 €/h), ostale kategorije; izvoz Excel in PDF |
| Dokumenti | mape 01–16; datoteke povlečeš v okvir ali klikneš za nalaganje; dobavnica v mapi Dobavitelji se sama prenese v stroške |
| Korespondenca | udeleženci in sporočila (.msg, .eml) dodana ročno |

## Povpraševanja in ponudbe

**Nova ponudba**

1. Klikni **Nova ponudba**.
2. Popis naročnika (Excel) povleci v okvir ali ga prilepi s Ctrl+V. Postavke se preberejo samo iz lista popisa, ne iz lista »Ponudba«. PDF popisa je neobvezen.
3. **Naročnik**: začni tipkati (vsaj 2 znaka), izberi predlog s klikom ali Enter. Naslov in e-pošta se izpolnita sama.
4. Vpiši projekt, DDV, popust, rok izvedbe, opcijo.
5. **Predogled** pokaže končni PDF; **Izvozi PDF** in **Izvozi Excel** ga preneseta.
6. **Shrani ponudbo**. Ponudba dobi stanje »v pripravi«, ti si njen vodja.

**Seznam ponudb**

- **Uredi** odpre ponudbo z datotekami. Vodja ponudbe ostane isti.
- **Poslano** označi, da je ponudba poslana; začne teči opcija in interni opomnik.
- **Potrjeno** / **Zavrnjeno**: potrjena ponudba odpre nov objekt v Mojih objektih.
- Opomnik po 3 mesecih brez odgovora se pokaže v Aktualno.

## Plan ekip in ure

Ena stran za plan in opravljene ure. Pogledi **Teden / Mesec / Leto**, puščici ‹ › premikata obdobje.

**Vpis v celico** (velike ali male črke):

| Vpišeš | Pomeni |
| --- | --- |
| `WC` | 8 ur na objektu z oznako WC |
| `WC 6` | 6 ur na WC |
| `WC 4 HK 4` | 4 ure na WC, 4 na HK |
| `WC 6 R-WC 2` | 6 ur dela in 2 režijski uri na WC |
| `dopust`, `bolniška`, `odsoten`, `praznik` | odsotnost (bela celica) |

- Režijska ura ima vedno oznako objekta (`R-WC`). Samo `R` obarva celico rdeče in se ne šteje nobenemu objektu.
- Dva objekta brez ur (`WC HK`) šteje 4 + 4 in obarva celico rdeče.
- Oznake in barve objektov so v legendi pod tabelo.
- Prazniki: rdeč datum z imenom praznika; prazna celica na praznik je praznik.
- **Shrani** shrani tudi vpis, ki ga še nisi potrdil s Tab.
- **+ Dodaj monterja** doda vrstico na konec. ✕ pomeni, da monter ne dela več (pretekli plan ostane).

**Ure in statistika** (pod tabelo): opravljene ure, prazniki, bolniške, dopusti, odsotnosti, tabeli po objektih in po monterjih. **Obdobje od–do**, »Ta mesec«, »Letos do danes«; »Kot plan zgoraj« vrne na obdobje plana.

**Izvozi**: Excel (plan, ure, statistika), CSV za računovodstvo, PDF (letni na ležečem A4). Ure iz plana se samodejno prenesejo v stroške objekta.

## Partnerji, Ceniki, Poročila

- **Partnerji**: stranke, projektanti, kooperanti, podizvajalci, dobavitelji. Filtri po skupinah, Dodaj partnerja, Uredi, Izbriši. Kartica partnerja ima povezavi na Bizi in AJPES.
- **Ceniki**: zavihki Sistemi, Dodatna dela, Kooperanti, Dobavitelji.
    - Vsaka vrstica ima **Uredi** in **Izbriši**, na dnu **+ Dodaj postavko**.
    - **Osveži cenik**: priloži PDF ali Excel in datum veljavnosti; pred potrditvijo vidiš spremenjene, nove in odstranjene cene.
    - Pri sistemih je **Kalkulacija na m²**: material iz cenika Kalcer, delo kooperanta, bandaža, strošek, prodajna cena in razlika.
- **Poročila** (direktor, administrator): analiza poslovanja, po vodjih projektov, dosežene cene po sistemih; izvoz Excel in PDF.

## Napake, predlogi in pogoste težave

Napako ali predlog pošlješ z gumbom **Prijavi napako ali predlog** zgoraj desno. Pride do administratorja.

| Težava | Kaj narediti |
| --- | --- |
| Stran se ne odpre | Si v pisarni ali v VPN? Če še vedno ne gre, pokliči administratorja. |
| Pozabljeno geslo ali zaklep po napačnih geslih | Administrator ponastavi geslo. |
| Ne vidim svojega objekta | Preveri z administratorjem, ali je na objektu vpisan pravi vodja. |
| Okno »Te podatke je medtem spremenil drug uporabnik« | Nekdo je hkrati spremenil isto. Klikni V redu, stran se osveži, zadnji vnos ponovi. |
| Obvestilo »Strežnik ni dosegljiv« | Povezava je padla; spremembe se shranijo, ko spet deluje. Strani ne zapiraj. |
| »Nimaš dovoljenega dostopa do te strani« | Ta stran za tvojo vlogo ni na voljo. |
