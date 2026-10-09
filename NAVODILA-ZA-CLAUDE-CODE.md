Prenašaš delujoč prototip interne aplikacije »Montaža Škerjanec Digital« v pravo aplikacijo na internem strežniku podjetja. Odgovarjaj v slovenščini.

## Viri
- `prototip/index.html` je EDINI VIR RESNICE za izgled, besedila, izračune, povezave in vedenje. Preberi ga v celoti, preden karkoli napišeš.
- `prototip/ceniki/kalcer-cenik-2026-06-15.pdf` je datoteka, na katero se prototip sklicuje.
- `SPECIFIKACIJA.md` popisuje pravila in povezave iz prototipa ter kaj je v prototipu samo simulirano. Če se razlikuje od prototipa, velja prototip – razliko mi sporoči.
- `PREVERJANJE.md` so scenariji, ki morajo na koncu dati enak rezultat kot prototip.
- Najprej preveri SHA-256 obeh datotek v `prototip/` proti vrednostim v SPECIFIKACIJA.md. Če se ne ujemata, ustavi se in mi povej.

## Glavno pravilo
Izgled in vedenje morata ostati IDENTIČNA prototipu. Ne izboljšuj, ne preoblikuj, ne preimenuj, ne spreminjaj besedil, barv, vrstnega reda, števila decimalk, imen izvoženih datotek ali formul. Ne odstranjuj funkcij. Če misliš, da je nekaj narobe, mi to napiši kot vprašanje, ne spreminjaj sam.

## Pristop (da se nič ne izgubi)
1. Frontend: uporabi HTML, CSS in JavaScript iz `prototip/index.html` čim bolj dobesedno (lahko ga razdeliš na datoteke, logika in markup ostaneta enaka). Ne prepisuj v drug framework, razen če to izrecno odobrim.
2. Zamenjaj samo plast za shranjevanje in okolje:
   - `load()` / `save()` (localStorage, ključ `msd-vzorec2`, seznam `KEYS`) → API na strežniku in podatkovna baza. Vsak ključ v `KEYS` in `DATAK` (podatki po objektu, `useObj`/`dataOf`) mora imeti svoje mesto v bazi.
   - Datoteke iz IndexedDB `msd-files` → shramba datotek na strežniku po objektu in mapi.
   - `saveFile()` (`claude.use('downloads')`) → navaden prenos v brskalniku z istim imenom datoteke.
   - Knjižnice s cdnjs → iste verzije, lokalno na strežniku.
3. Prava prijava (zgoščena gesla), seje, odjava. Pravice iz SPECIFIKACIJA.md, poglavje 3, mora preverjati STREŽNIK pri vsakem zahtevku (vodja dobi samo svoje objekte in ponudbe; Poročila samo direktor in administrator; Administracija direktor in administrator). Spustni seznam »Prijavljen:« za menjavo vloge ostane samo v razvojnem načinu.
4. Sled sprememb (AUDIT) zapisuj na strežniku z dejanskim uporabnikom.
5. Simulirane dele (SPECIFIKACIJA.md, poglavje 1: Outlook, AJPES/Bizi, Ponastavi geslo, VASCO) naredi kot jasno ločene vmesnike. Kjer potrebuješ dostope, ključe ali mojo odločitev, se ustavi in vprašaj. Do odločitve naj delujejo enako kot v prototipu.
6. Vzorčni podatki ostanejo, dokler ne uvozimo pravih. Naredi skripto za uvoz in skripto, ki jih odstrani.

## Preden začneš pisati kodo
Vprašaj me in počakaj na odgovor:
- strežnik (operacijski sistem, kje teče, domena ali IP v interni mreži), podatkovna baza (predlagaj PostgreSQL), varnostne kopije;
- ali je frontend lahko enak prototipu (priporočeno) ali želim drug framework;
- odprta vprašanja iz SPECIFIKACIJA.md, poglavje 12.
Nato mi pokaži načrt po korakih in počakaj na potrditev.

## Preverjanje (obvezno, preden rečeš, da je končano)
1. Avtomatski testi (Playwright) za vse scenarije iz PREVERJANJE.md, ki tečejo hkrati na prototipu in na novi aplikaciji z enakimi začetnimi podatki in primerjajo besedila, številke in izvožene datoteke (Excel celice, PDF število strani in orientacija).
2. Posnetki zaslona vseh strani in zavihkov za vse 4 vloge pri 1400 × 900, primerjava s prototipom. Vsako razliko popravi ali mi jo pokaži.
3. Izpolni tabelo »Rezultat« v PREVERJANJE.md in mi jo pokaži. Ne trdi, da je enako, dokler test tega ne pokaže.
4. Na koncu mi napiši seznam vsega, kar se razlikuje od prototipa (tudi če je namerno), in vsega, kar še ni narejeno.
