# Spremembe po predaji (od verzije 178)

## 1. Claude v aplikaciji (verzija 179)
- V glavi, levo od »Prijavi napako ali predlog«, oranžen gumb **✦ Claude** (#D97706, hover #B45309).
- Odpre stranski panel desno (širina do 440 px): naslov, trenutna stran, »Nov pogovor«, ✕, pogovor, vnos (Enter pošlje, Shift+Enter nova vrstica), Pošlji (oranžen), Ustavi.
- Claude odgovarja v slovenščini in podatke dobi SAMO prek orodij, ki upoštevajo pravice vloge:
  `seznam_objektov`, `objekt_finance`, `ure_v_obdobju`, `isci_cenik`, `kalkulacija_sistema`, `ponudbe`.
- V prototipu teče prek zmožnosti »sample« (na računu uporabnika). V pravi aplikaciji: strežnik kliče Claude API z istimi orodji, ki berejo iz baze in na strežniku preverjajo pravice. API ključ samo na strežniku. Pred uporabo odločitev o GDPR (kateri podatki gredo v Claude API).

## 2. Vloga »administrator, vodja projekta« izbrisana (verzija 180)
- Vloge pri uporabnikih so samo še: vodja projekta, računovodstvo, direktor, administrator.
- Nejc ima vlogo »administrator« (vidi vse). Obstoječi zapisi s kombinirano vlogo se ob nalaganju pretvorijo v »administrator«.

## 3. Ure in statistika – izbira obdobja (verzija 181)
- Pod naslovom »Ure in statistika« vrstica »Obdobje [od] do [do]« + gumba »Ta mesec« in »Letos do danes«; ko je izbrano lastno obdobje, še »Kot plan zgoraj« (vrne na teden/mesec/leto plana).
- Naslov kaže izbrano obdobje (npr. »1. 10. 2026 – 31. 10. 2026«). Vsi kvadratki in obe tabeli se računajo za to obdobje.
- Izvoz v Excel/PDF ostane za obdobje plana zgoraj.

## 4. Claude panel brez sivega imena strani (verzija 182)
- V glavi panela Claude ni več sivega napisa trenutne strani (npr. »Moji objekti«). Claude še vedno ve, na kateri strani je uporabnik (v navodilih pogovora).

## 5. Plan ekip in ure – Dodaj monterja (verzija 183)
- Pod tabelo monterjev (teden, mesec, leto) povezava »+ Dodaj monterja«: doda novo vrstico na konec, skoči nanjo in postavi kurzor v polje za ime; v letnem pogledu preklopi na teden. Zapis v Sled sprememb.
- Število vrstic ni več omejeno na 15.

## 6. Moji objekti – pričetek del, trajanje in časovnica (verzija 184)
- Razpredelnica: stolpec »Izvedeno« zamenjan s stolpcema **Pričetek del** (datum) in **Trajanje (mes.)** (decimalno, korak 0,5, vejica dovoljena). Urejata se neposredno v vrstici, sprememba v Sled sprememb. Polji imata tudi novi objekti iz potrjenih ponudb (prazni).
- Pod »Aktualno« **Časovnica objektov** (Gantt): vrstica na objekt (ime, vodja), pas od pričetka do pričetek + trajanje v barvi objekta iz legende Plana ekip in ur, napis »datum – datum · x mes.«, rdeča navpična črta = danes, rdeč rob = rok pretečen in objekt ni končan, klik odpre objekt.
- Spodaj vrstica **Sočasno objektov** po mesecih (intenziteta barve) in povzetek »največ sočasno N (meseci)«. Objekti brez datuma/trajanja so našteti pod grafom.
- Konec = pričetek + celi meseci + ostanek × 30,44 dni. Vzorčni objekti imajo vzorčne datume.

## 7. Moji objekti – urejanje strani in Finančni pregled projektov (verzija 185)
- Časovnica brez vrstice »Sočasno objektov«; premaknjena nad »Aktualno«.
- »Aktualno« je zložljivo kot »Končani objekti« (▸/▾, število obvestil; »Prikaži skrita« ostane).
- Razpredelnica: nov stolpec **Opombe** (prosto besedilo, privzeto prikazana faza/situacija kot namig), zapis v Sled sprememb.
- Gumba **Izvozi v Excel** in **Ustvari PDF** zgoraj desno → dokument »Finančni pregled projektov« po vzoru datoteke podjetja (FINANČNI PREGLED PROJEKTOV.xls), A4 ležeče, Times New Roman:
  - DATUM KOLEGIJA (danes);
  - PROJEKTI V IZVEDBI (modra #0066CC): odprti objekti, ki jih vloga vidi – zap. št., naziv, investitor, vrednost brez DDV (pogodba + potrjene dodatne ponudbe), DDV (22 %, 9,5 % kjer je tak režim), z DDV, opombe; vrstica vsote (#33CCCC);
  - PROJEKTI V PRIDOBIVANJU (svetlo modra #00CCFF): ponudbe brez objekta v stanju »nepotrjeno« ali »v pripravi«; opomba privzeto »ponudba X poslana d. m. llll«; vrstica »VREDNOST VSEH DEL:«;
  - podpis: »VODJA PROJEKTA:« (vodja) ali »PRIPRAVIL:« (ostale vloge) + ime (#99CCFF).
  - Excel z ExcelJS (oblikovan, merged celice, format € ), ime »Finančni pregled projektov d. m. llll.xlsx/.pdf«.

## 8. Časovnica brez povzetka (verzija 186)
- Ob naslovu »Časovnica objektov« ni več sivega povzetka (število objektov in obdobje).

## 9. Časovnica brez legende (verzija 187)
- Pod časovnico ni več legende (danes, barve, rdeč rob, klik). Ostane samo opozorilo »Brez pričetka ali trajanja: …«, če kak objekt nima podatkov.

## 10. Finančni pregled projektov v obliki dokumentov podjetja (verzija 188)
- PDF in Excel zdaj v istem slogu kot obračuni/situacije/stroški: glava Montaža Škerjanec (logotip, naziv, naslov in kontakti), naslovni trak »FINANČNI PREGLED PROJEKTOV«, »Datum kolegija«, v PDF štiri kvadratki (v izvedbi, v pridobivanju, vse brez DDV, vse z DDV), tabeli z glavo #F1F3F5 in temno modro črto #1F3A5F, vrstice vsot, na koncu »Vrednost vseh del« in podpis (VODJA PROJEKTA / PRIPRAVIL + ime). A4 ležeče.
- Stolpci obeh tabel: Zap. št., Ponudba, Naziv objekta, Investitor, Vrednost del brez DDV €, DDV €, Vrednost del z DDV €, Opombe.
- Projekti v pridobivanju = ponudbe s strani »Povpraševanja in ponudbe« (brez objekta, stanje »v pripravi« ali »nepotrjeno«, po pravicah vloge): številka, projekt, naročnik, vrednost; opomba »poslana d. m. llll, opcija do d. m. llll« ali »v pripravi«.
- Nadomešča obliko iz točke 7 (modri/turkizni trakovi, Times New Roman).

## 11. Projekti v pridobivanju – vse odprte ponudbe (verzija 189)
- V »Projekti v pridobivanju« gredo vse ponudbe s strani Povpraševanja in ponudbe, ki niso potrjene ali zavrnjene (po pravicah vloge), tudi nepotrjene dodatne ponudbe; te imajo pri nazivu »dodatna ponudba za <objekt>«.

## 12. Ceniki › Sistemi brez »Doseženo na projektih« (verzija 190)
- V podrobnostih sistema ni več sekcije »Doseženo na projektih« (dosežene cene ostanejo v Poročilih).

## 13. Po monterjih – opomba brez zasedenosti (verzija 191)
- Iz sive opombe pod tabelo »Po monterjih« je odstranjen stavek »Zasedenost = ure med tednom / razpoložljive ure.« Ostalo besedilo ostane.

## 14. Po objektih – brez stolpcev Delež in Človek-dni (verzija 192)
- Tabela »Po objektih« ima stolpce: Oznaka, Objekt, Ure, Od tega režija, Monterji. Enako v izvozu Excel (list Statistika) in PDF.

## 15. Ure in statistika – samo 5 kvadratkov (verzija 193)
- Kvadratki v eni vrsti: Opravljene ure, Prazniki, Bolniške, Dopusti, Odsotnosti. Odstranjeni: Razpoložljive ure, kvadratki po objektih, Režija brez oznake, Režijske ure (podatki ostanejo v tabelah).
- Opomba pod »Po monterjih« samo še: »Prazniki, bolniške, dopusti in odsotnosti so v dnevih.«

## 16. Finančni pregled projektov brez kvadratkov (verzija 194)
- PDF nima več štirih kvadratkov z vsotami nad tabelami; za »Datum kolegija« takoj sledi »Projekti v izvedbi«. Excel jih ni imel. Vsote ostanejo v vrsticah »Skupaj« in »Vrednost vseh del«.

## 17. Podpis – ime na črti (verzija 195)
- Finančni pregled projektov (PDF in Excel): spodaj desno najprej »VODJA PROJEKTA« / »PRIPRAVIL«, nato ime, ki stoji na podpisni črti (črta pod imenom, kot pri podpisu).

## 18. Podpis »VODJA PROJEKTOV« (verzija 196)
- V Finančnem pregledu projektov (PDF, Excel) nad podpisno črto pri vodji piše »VODJA PROJEKTOV« (prej »VODJA PROJEKTA«). Pri ostalih vlogah ostane »PRIPRAVIL«.

## 19. Glave stolpcev v eni vrstici (verzija 197)
- Finančni pregled projektov: glave »Vrednost del brez DDV €« in »Vrednost del z DDV €« (in ostale) se ne prelamljajo. PDF: širine stolpcev 5/9/17/14/14/8/14/19 %, nowrap; Excel: širine stolpcev 8/14/34/28/24/12/24/42, glava brez preloma.

## 20. Časovnica objektov v izvozu Finančnega pregleda (verzija 198)
- PDF: za finančnim pregledom nova stran »ČASOVNICA OBJEKTOV« z glavo podjetja in »Stanje na dan«: vrstica na objekt (ime, vodja, od–do), pas v barvi objekta z »x mes.«, rdeča črta danes, rdeč okvir = rok pretečen in objekt ni končan, opomba z legendo in seznamom objektov brez datumov. A4 ležeče.
- Excel: nov list »Časovnica objektov«: Objekt, Vodja, Pričetek, Konec, Mesecev + stolpec za vsak mesec, aktivni meseci pobarvani v barvi objekta, rdeča navpična črta pri tekočem mesecu, rdeča obroba za pretečen rok.
- Obseg po pravicah: vodja projekta dobi samo svoje objekte; direktor, računovodstvo in administrator vse odprte objekte vseh vodij.

## 21. Direktor – ločevanje po vodjih projektov (verzija 199)
- Moji objekti in Povpraševanja in ponudbe: pri vlogah direktor, računovodstvo in administrator so vrstice razdeljene v skupine po vodji (vmesna vrstica »Vodja projektov: <ime> (n)«), skupine po abecedi.
- Prva skupina je vedno prijavljeni uporabnik: »Moji projekti · <ime> (direktor)« oz. »Moji projekti · <ime>«.
- Vodja projekta ostane brez skupin (vidi samo svoje).
- Nova ponudba/povpraševanje dobi vodjo = prijavljeni uporabnik (direktor → Marjan iz Administracije). Pri urejanju obstoječe ponudbe vodja ostane nespremenjen. Objekt iz potrjene ponudbe dobi vodjo iz ponudbe, zato direktorjevi projekti pristanejo v »Moji projekti«.
- Situacije, obračuni in stroški pripadajo objektu, zato sledijo skupini vodje objekta.

## 22. Finančni pregled projektov – po vodjih projektov (verzija 200)
- Velja za direktorja, računovodstvo in administratorja (vodja projekta dobi izvoz kot prej, brez skupin).
- PDF in Excel: v »Projekti v izvedbi« in »Projekti v pridobivanju« so vrstice razdeljene po vodjih (vrstica »Moji projekti · Marjan (direktor)« oz. »Vodja projektov: <ime> (n)«, enak vrstni red kot na strani), pod vsako skupino vrstica »Skupaj <ime>« (brez DDV, DDV, z DDV). Zap. št. teče neprekinjeno čez celo tabelo. Vrstici »Skupaj« oz. »Skupaj v izvedbi/pridobivanju« ostaneta.
- Nova tabela **Povzetek po vodjih projektov**: Vodja projektov, V izvedbi brez DDV €, V pridobivanju brez DDV €, Skupaj brez DDV €, Skupaj z DDV €; v PDF še vrstica »Vrednost vseh del«. V Excelu je pod vrstico »Vrednost vseh del«.
- Časovnica objektov (PDF stran in Excel list): objekti razvrščeni po skupinah vodij z vmesnim napisom skupine, znotraj skupine po pričetku.
- Podpis »PRIPRAVIL«: pri direktorju in računovodstvu ime uporabnika te vloge iz Administracije (npr. Marjan).
