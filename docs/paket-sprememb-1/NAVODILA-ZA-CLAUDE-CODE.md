Paket sprememb 1 za »Montaža Škerjanec Digital«: prototip od verzije 178 (prvotna predaja) do verzije 200. Odgovarjaj v slovenščini.

## Vsebina paketa
- `prototip/index.html` – prototip, verzija 200. Od zdaj je to EDINI VIR RESNICE (nadomešča `prototip/index.html` iz prvotne predaje, verzija 178).
- `SPREMEMBE-PO-PREDAJI.md` – opis vseh 22 sprememb (verzije 179–200), po vrsti.
- `razlike-178-na-200.diff` – točna razlika kode med verzijama 178 in 200 (`diff -u`).
- `PREVERJANJE-SPREMEMBE.md` – scenariji za vsako spremembo + popravki scenarijev iz prvotnega PREVERJANJE.md.

Cenik `prototip/ceniki/kalcer-cenik-2026-06-15.pdf` se ni spremenil (ostane iz prvotne predaje).

## Kontrolne vsote (SHA-256)
- verzija 178 (izhodišče): `d3d56bdaae2117169f988a500f0dbd8b03b84b7c5ae91593314747e65ee38123`
- verzija 200 (ta paket): `681cc320424648f0a13617f36f9c267b8e37b7d5b31833b31d615c60ef0093df`

Najprej preveri obe vsoti (178 proti datoteki iz prvotne predaje, 200 proti `prototip/index.html` v tem paketu). Če se ne ujemata, se ustavi in mi povej.

## Glavno pravilo (enako kot pri predaji)
Izgled in vedenje morata ostati IDENTIČNA prototipu verzije 200. Ne izboljšuj, ne preoblikuj, ne preimenuj, ne spreminjaj besedil, barv, vrstnega reda, decimalk, imen izvoženih datotek ali formul. Ne odstranjuj funkcij. Če misliš, da je kaj narobe, mi napiši vprašanje.

## Pristop
1. Preberi `SPREMEMBE-PO-PREDAJI.md` in `razlike-178-na-200.diff` v celoti, preden spremeniš kodo.
2. Če je frontend v aplikaciji prevzet iz prototipa (kot je bilo dogovorjeno), prenesi spremembe kode iz diff-a dobesedno. Spreminjaj samo plast za shranjevanje in okolje, kot pri predaji.
3. Spremembe prenašaj po vrsti, po točkah 1–22. Po vsaki točki zaženi njen scenarij iz `PREVERJANJE-SPREMEMBE.md`.
4. Pazi na točke, ki zahtevajo tudi strežnik:
   - **1 (Claude v aplikaciji):** strežnik kliče Claude API z istimi orodji. Orodja berejo iz baze in preverjajo pravice na strežniku. API ključ je samo na strežniku. Pred vklopom me vprašaj za odločitev o GDPR (kateri podatki gredo v Claude API). Do odločitve naj bo gumb skrit ali onemogočen.
   - **2 (vloge):** v bazi so dovoljene samo vloge vodja projekta, računovodstvo, direktor, administrator. Migracija pretvori kombinirano vlogo v »administrator«.
   - **5 (Dodaj monterja):** monterji so zapis v bazi, ne omejeni na 15.
   - **6, 7 (pričetek, trajanje, opombe objekta):** nova polja objekta v bazi (`start`, `mes`, `op`) in zapis v Sled sprememb.
   - **21, 22 (ločevanje po vodjih):** ponudba/povpraševanje dobi vodjo = prijavljeni uporabnik (na strežniku, ne iz brskalnika). Pri urejanju se vodja ne spremeni. Skupine in vsote po vodjih se računajo iz podatkov, ki jih vloga sme videti. Vodja projekta dobi samo svoje (strežnik vrne 403 za tuje).
   - **7, 20, 22 (izvozi Finančnega pregleda):** obseg podatkov določi strežnik po pravicah vloge.
5. Pravice, gesla, GDPR in shranjevanje na internem strežniku ostanejo, kot je določeno v prvotni predaji.

## Preverjanje (obvezno, preden rečeš, da je končano)
1. Playwright: vsi scenariji iz `PREVERJANJE-SPREMEMBE.md` in iz prvotnega `PREVERJANJE.md` (s popravki iz poglavja »Popravki«), hkrati na prototipu 200 in na aplikaciji z enakimi začetnimi podatki. Primerjaj besedila, številke in izvožene datoteke (Excel celice, PDF število strani in orientacija).
2. Posnetki zaslona vseh strani za vse 4 vloge pri 1400 × 900, primerjava s prototipom 200.
3. Izpolni tabelo »Rezultat« v `PREVERJANJE-SPREMEMBE.md`.
4. Na koncu mi napiši seznam vsega, kar se razlikuje od prototipa (tudi namerno), in vsega, kar še ni narejeno.
