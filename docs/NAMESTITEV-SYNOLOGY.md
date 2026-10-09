# Namestitev na Synology – korak za korakom

Za namestitev ne potrebuješ programerja. Potrebuješ administratorski dostop do Synology (DSM) in približno 30 minut.

## 0. Preveri, ali Synology zna poganjati Docker

1. Prijavi se v Synology (DSM), na isti naslov kot vedno.
2. **Nadzorna plošča › Informacijski center**: zapiši **model** (npr. DS920+), **procesor** in **RAM**.
3. **Center za pakete**: poišči **Container Manager**.
   - Če ga lahko namestiš: namesti ga in nadaljuj.
   - Če ga ni (starejši ali »j« modeli z ARM procesorjem): ustavi se in mi pošlji model. Takrat bo aplikacija tekla na drugem računalniku ali virtualki.

Priporočeno: vsaj 2 GB RAM. Aplikacija sama porabi približno 150 MB.

## 1. Prenesi aplikacijo na Synology

1. Na GitHubu odpri repozitorij `skerox-lab/Koledar` (vejo, ki ti jo povem), **Code › Download ZIP**.
2. V Synology odpri **File Station**.
   - Če mape `docker` še ni: **Nadzorna plošča › Mapa v skupni rabi › Ustvari**, ime `docker`.
3. V mapi `docker` ustvari mapo `msd`.
4. Naloži ZIP v `docker/msd`, desni klik › **Razširi › Razširi sem**. V `docker/msd` morajo biti neposredno datoteke `Dockerfile`, `docker-compose.yml`, `package.json` in mape `server`, `public` …

## 2. Zaženi

1. **Container Manager › Projekt › Ustvari**.
2. Ime projekta: `msd`. Pot: `/docker/msd`. Vir: **uporabi obstoječi docker-compose.yml**.
3. **Naprej › Končano**. Synology zgradi in zažene aplikacijo (prvič traja nekaj minut).
4. Na računalniku v pisarni odpri `http://<IP-naslov-Synology>:8080`, npr. `http://192.168.1.10:8080`.

## 3. Prvi zagon

1. Odpre se okno **Prvi zagon**. Vpiši ime in priimek, službeni e-naslov (uporabniško ime) in geslo (vsaj 8 znakov). To je prvi administrator.
2. Aplikacija pokaže vzorčne podatke iz prototipa (Šenčur, Westlink …). Ostanejo, dokler ne uvozimo pravih.
3. **Administracija › Uporabniki in vloge › Dodaj uporabnika**: ime in priimek, službeni e-naslov, vloga, nato **Shrani**.
   - Prikaže se **začasno geslo**. Sporoči ga uporabniku; ob prvi prijavi ga mora zamenjati.
   - **Ponastavi geslo** da uporabniku novo začasno geslo.
   - **Nastavi geslo**: geslo vpišeš sam.

> **Pomembno:** vodja projekta vidi objekt kot svojega samo, če se njegovo ime v Administraciji ujema s poljem »Vodja« na objektu. Primer: Matej vidi WESTLINK, ker je tam vodja »Matej«.

## 4. Dostop od doma

**Priporočeno: prek obstoječega VPN, tako kot zdaj za DS File.** Ko si povezan v VPN, odpreš isti naslov `http://<IP>:8080`.

Javni naslov s HTTPS (npr. `https://msd.montaza-skerjanec.si`) vklopi šele, ko kodo pregleda programer:

1. **Nadzorna plošča › Prijavni portal › Napredno › Obratni posredniški strežnik › Ustvari**.
   - Vir: HTTPS, ime gostitelja `msd.<domena>`, vrata 443.
   - Cilj: HTTP, `localhost`, vrata 8080.
2. **Nadzorna plošča › Varnost › Potrdilo**: Let's Encrypt potrdilo za `msd.<domena>`.
3. V `docker-compose.yml` nastavi `MSD_SECURE_COOKIE: "1"` in v Container Managerju projekt ponovno zgradi.

## 5. Varnostne kopije

Aplikacija vsako noč ob 2:00 sama naredi kopijo baze v `docker/msd/data/backup` in jo hrani 30 dni.
Datoteke (dobavnice, pogodbe, fotografije) so v `docker/msd/data/files`.

**Hyper Backup** (Center za pakete) › Ustvari › Opravilo za varnostno kopiranje podatkov:
- Cilj: **USB disk**, priklopljen na Synology (priporočeno), ali drug Synology / Synology C2.
- Vir: mapa `docker/msd/data`.
- Urnik: vsak dan ob **3:00**, ko je kopija baze že narejena.
- Rotacija: **30 različic**. Hyper Backup vsako datoteko shrani samo enkrat, zato kopije zasedejo malo več prostora kot sami podatki.

Okvirna poraba prostora:
- baza: nekaj MB, tudi po letih manj kot 100 MB;
- datoteke: 5–50 GB v nekaj letih, odvisno od fotografij.

> Kopija samo na istem Synology ne pomaga ob okvari diska, kraji ali izsiljevalskem virusu. Imej vsaj USB disk.

## 6. Posodobitev aplikacije

1. Prenesi novo verzijo (ZIP) in z njo prepiši datoteke v `docker/msd`. **Mape `data` ne briši.**
2. **Container Manager › Projekt › msd › Dejanje › Zgradi**. Podatki ostanejo.

## 7. Uvoz pravih podatkov in odstranitev vzorca

Uvoz in odstranitev vzorca opravi programer ali jaz. Navodila so v `README.md`, razdelek »Uvoz in vzorčni podatki«.
Ukaze se požene v Container Manager › Vsebnik `msd` › Terminal, npr.:

```
npm run odstrani-vzorec -- --potrdi
```

Pred vsako od teh operacij se samodejno naredi kopija baze.
