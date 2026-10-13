---
title: "MS Digital – navodila za administratorja"
date: "13. 10. 2026"
---

## Osnovno

Montaža Škerjanec Digital teče na Synology DS224+ v pisarni na naslovu **http://192.168.10.50:8080**. Administrator skrbi za uporabnike, gesla, varnostne kopije in posodobitve.

| Kaj | Kje |
| --- | --- |
| Aplikacija | http://192.168.10.50:8080 |
| Synology (DSM) | http://192.168.10.50:5000, administratorski račun Synology |
| Datoteke aplikacije | File Station › docker › msd |
| Podatki (baza, datoteke, kopije) | File Station › docker › msd › data |
| Zagon in ustavitev | Container Manager › Project › msd |
| Koda in navodila za programerja | GitHub skerox-lab/Koledar, veja claude/ms-digital-predaja-6671vi |

Mape **data** nikoli ne briši. V njej so vsi podatki.

## Prvi zagon in prijava

Ob prvem odprtju aplikacija pokaže okno **Prvi zagon**. Tako se ustvari prvi administrator.

1. Odpri http://192.168.10.50:8080.
2. Vpiši ime in priimek, uporabniško ime (službeni e-naslov) in geslo (vsaj 8 znakov).
3. Klikni **Ustvari administratorja**. Odpre se aplikacija.

Okno Prvi zagon se pokaže samo enkrat. Pozneje se vsi prijavljajo z e-naslovom in geslom.

- Prijava velja 14 dni, nato se je treba prijaviti znova.
- **Odjava**: gumb zgoraj desno.
- Po 10 napačnih geslih zapored se prijava za ta račun zaklene za 15 minut.

## Uporabniki in gesla

Uporabnike ureja administrator (in direktor) v **Administracija › Uporabniki in vloge**.

**Nov uporabnik**

1. Klikni **Dodaj uporabnika**.
2. Vpiši ime in priimek, uporabniško ime (službeni e-naslov) in izberi vlogo.
3. Klikni **Shrani**. Prikaže se okno z **začasnim geslom** (npr. `abcd-efgh-2345`).
4. Začasno geslo sporoči uporabniku osebno ali po telefonu. Ob prvi prijavi ga mora zamenjati s svojim.

**Gesla**

- **Ponastavi geslo**: uporabnik dobi novo začasno geslo, vse njegove prijave se odjavijo. Uporabi, ko uporabnik pozabi geslo.
- **Nastavi geslo**: geslo vpišeš sam. Nato izbereš, ali ga mora uporabnik ob prvi prijavi zamenjati (V redu = da).
- Geslo ima vsaj 8 znakov. Gesla so na strežniku shranjena zašifrirano, nihče jih ne more prebrati.

**Urejanje in izbris**

- **Uredi**: ime, uporabniško ime, vloga. Sprememba vloge uporabnika odjavi; nova vloga velja ob naslednji prijavi.
- **Izbriši**: uporabnik se ne more več prijaviti. Objekti, ponudbe in vnosi ostanejo.
- Samega sebe ne moreš izbrisati. Vedno mora ostati vsaj en administrator.

**Pomembno: ime vodje projekta**

Vodja vidi samo objekte in ponudbe, kjer je v polju »Vodja« zapisano **točno njegovo ime** iz Administracije. Nova ponudba dobi vodjo samodejno (tistega, ki jo ustvari). Če uporabnika preimenuješ, aplikacija sama popravi vodjo na njegovih objektih in ponudbah.

## Kaj vidi katera vloga

Pravice preverja strežnik, zato uporabnik podatkov, ki jih ne sme videti, sploh ne dobi.

| Vloga | Objekti in ponudbe | Plan ekip in ure | Partnerji, Ceniki | Poročila | Administracija |
| --- | --- | --- | --- | --- | --- |
| Vodja projekta | samo svoji | vse | vidi in ureja | ne | ne |
| Računovodstvo | vsi, razvrščeni po vodjih | vse | vidi in ureja | ne | ne |
| Direktor | vsi, razvrščeni po vodjih | vse | vidi in ureja | da | da |
| Administrator | vsi, razvrščeni po vodjih | vse | vidi in ureja | da | da |

Izvoz Finančnega pregleda projektov vsebuje samo podatke, ki jih vloga vidi. Vodja dobi samo svoje objekte.

## Dostop od doma

Od doma se poveže prek **obstoječega VPN** (enako kot za DS File) in odpre isti naslov http://192.168.10.50:8080.

Javni naslov s HTTPS (npr. https://msd.montaza-skerjanec.si) vklopi šele, ko kodo pregleda programer:

1. Synology: Control Panel › Login Portal › Advanced › Reverse Proxy › Create. Vir HTTPS, ime `msd.<domena>`, vrata 443; cilj HTTP, localhost, vrata 8080.
2. Control Panel › Security › Certificate: Let's Encrypt potrdilo za to ime.
3. V `docker/msd/docker-compose.yml` nastavi `MSD_SECURE_COOKIE: "1"` in v Container Managerju projekt ponovno zgradi (Action › Build).

## Varnostne kopije

Aplikacija vsako noč ob 2:00 sama naredi kopijo baze v `docker/msd/data/backup` in jo hrani 30 dni. Kopija samo na istem Synologyju ne pomaga ob okvari, kraji ali izsiljevalskem virusu, zato nastavi še Hyper Backup.

**Hyper Backup (enkratna nastavitev)**

1. Package Center › namesti **Hyper Backup**.
2. Priklopi USB disk na Synology.
3. Hyper Backup › **+** › Data backup task › cilj **Local folder & USB** › USB disk.
4. Vir: mapa `docker/msd/data`.
5. Urnik: vsak dan ob **3:00**. Rotacija: **30 različic**.

Preveri enkrat na mesec, ali je zadnja kopija uspela (Hyper Backup › zelena kljukica).

**Obnova baze iz kopije**

1. Container Manager › Project › msd › Action › **Stop**.
2. File Station › `docker/msd/data`: preimenuj `msd.db` v `msd-pokvarjena.db`.
3. Iz `data/backup` kopiraj želeno kopijo (npr. `msd-2026-10-20-dnevna.db`) v `data` in jo preimenuj v `msd.db`.
4. Action › **Start**.

Pred prenosom večjih sprememb (uvoz, odstranitev vzorca) aplikacija sama naredi dodatno kopijo.

## Spremembe izgleda in nove funkcije

Vse spremembe gredo po isti poti: najprej v prototip, nato v aplikacijo. Tako prototip ostane edini vir resnice in testi lahko preverijo, da je aplikacija enaka.

1. **Spremeni prototip** v Claude Chat (kot do zdaj): opiši, kaj ti ni všeč ali kaj želiš dodati, in preizkusi.
2. **Pripravi paket sprememb** (ZIP z novim `index.html` in opisom sprememb), kot paket sprememb 1.
3. **Pošlji ga v Claude Code** (to sejo ali novo). Claude Code prenese spremembe v aplikacijo, požene vse teste in jih shrani na GitHub.
4. **Posodobi Synology** (spodaj).

Manjše stvari (besedilo, barva, stolpec) lahko naročiš tudi neposredno v Claude Code. Takrat Claude Code popravi tudi prototip, da ostaneta enaka.

**Posodobitev na Synologyju (podatki ostanejo)**

1. Prenesi nov ZIP: https://github.com/skerox-lab/Koledar/archive/refs/heads/claude/ms-digital-predaja-6671vi.zip
2. File Station › `docker/msd`: izbriši vse **razen mape `data`**.
3. Naloži ZIP › Extract Here › vsebino mape `Koledar-claude-…` premakni v `docker/msd` (če vpraša, Overwrite).
4. Container Manager › Project › msd › Action › **Build**, nato **Start**.
5. Uporabniki naj stran osvežijo (F5).

## Vzorčni in pravi podatki

Aplikacija trenutno pokaže vzorčne podatke iz prototipa (Šenčur, Westlink, Kušar, Mačkovci, Gaj). Ostanejo, dokler jih ne odstraniš.

- **Odstranitev vzorca**: izbriše vzorčne objekte, ponudbe, datoteke in monterje. Ceniki, partnerji in uporabniki ostanejo.
- **Uvoz iz prototipa**: prenese podatke, ki si jih vnesel v prototip (brez datotek).

Obe operaciji požene Claude Code ali programer v Container Manager › Container › msd › Terminal, npr. `npm run odstrani-vzorec -- --potrdi`. Pred tem se samodejno naredi kopija baze.

## Sled sprememb, koš, napake in predlogi

V **Administracija** so poleg uporabnikov še:

- **Napake in predlogi**: kar sodelavci pošljejo z gumbom »Prijavi napako ali predlog«. Stanje nastaviš na novo, v delu, rešeno ali zavrnjeno.
- **Sled sprememb**: kdo je kdaj kaj spremenil, z dejanskim imenom uporabnika. Prikazanih je zadnjih 500 vnosov.
- **Koš**: izbrisani objekti in ponudbe. Z **Obnovi** jih vrneš.
- Izbrisane datoteke se ne izbrišejo dokončno, ampak gredo v `docker/msd/data/files/_izbrisano`.

## Težave in rešitve

| Težava | Rešitev |
| --- | --- |
| Stran se ne odpre (ERR_CONNECTION_REFUSED) | Container Manager › Container › msd: mora biti **Running**. Če ni, Start. |
| Vsebnik kaže »Restarting« | Container › msd › zavihek **Log**; posnetek zadnjih vrstic pošlji Claude Code. |
| »Bind mount failed … data does not exist« | V `docker/msd` ustvari mapo `data`. |
| Uporabnik je pozabil geslo | Administracija › Uporabniki › **Ponastavi geslo**. |
| »Preveč napačnih poskusov« | Počakaj 15 minut ali ponastavi geslo. |
| Vodja ne vidi svojega objekta | Ime v Administraciji se mora ujemati s poljem Vodja na objektu. |
| Okno »podatke je medtem spremenil drug uporabnik« | Dva sta hkrati spremenila isto. Stran se osveži, zadnji vnos ponovi. |
| Pozabljeno administratorsko geslo | Drug administrator ali direktor ga ponastavi. Če ga ni, pomaga Claude Code prek terminala vsebnika. |

## Kaj še ni vklopljeno

| Funkcija | Stanje | Kaj je potrebno |
| --- | --- | --- |
| Outlook | skrit | registracija aplikacije v Azure (Directory ID, Application ID) |
| Claude v aplikaciji | skrit | odločitev o GDPR, API ključ na strežniku |
| Predlogi naročnika iz AJPES/FURS | iz znanih podatkov | potrditev, da gremo na seznam FURS |
| Izvoz za VASCO | CSV kot v prototipu | primer uvozne datoteke iz VASCO |
| Administracija › Povezave in stanje | vzorčne vrednosti | povezava s pravim stanjem strežnika |
