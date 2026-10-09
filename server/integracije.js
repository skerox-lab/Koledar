// Zunanje povezave. V prototipu so simulirane (SPECIFIKACIJA.md, poglavje 1) in v aplikaciji
// zaenkrat delujejo ENAKO kot v prototipu. Tu so ločeni vmesniki, ki jih je treba dokončati,
// ko so znane odločitve in dostopi. Nobena od teh funkcij še ne kliče zunanjih storitev.
'use strict';

const STANJE = {
  outlook: {
    stanje: 'simulirano kot v prototipu',
    potrebno: 'Microsoft 365 (službeni račun) + registracija aplikacije v Microsoft Entra ID (client id, tenant id, secret). Povzetki z AI šele po odločitvi o GDPR.',
  },
  ajpes: {
    stanje: 'predlogi naročnika iz znanih podatkov (kartice partnerjev, objekti, ponudbe) kot v prototipu',
    potrebno: 'Predlog: brezplačen javni seznam davčnih zavezancev FURS (naziv, naslov, davčna, matična), nočna osvežitev na strežniku. Odločitev in preverjanje formata.',
  },
  bizi: {
    stanje: 'samo povezava na bizi.si na kartici partnerja (kot v prototipu)',
    potrebno: 'Plačljiva naročnina Bizi API za e-pošto in bonitete – odločitev.',
  },
  vasco: {
    stanje: 'izvoz CSV kot v prototipu',
    potrebno: 'Primer uvozne datoteke ali navodila VASCO za uvoz prejetih/izdanih računov.',
  },
  geslo_po_epošti: {
    stanje: 'ni v uporabi – geslo ponastavi ali nastavi administrator (odločitev 9. 10. 2026)',
    potrebno: 'Če bo kdaj potrebno: SMTP strežnik za pošiljanje povezave.',
  },
};

// Vmesniki (podpisi funkcij), ki jih bo uporabil strežnik, ko bodo povezave narejene.
async function outlookSporocila(/* uporabnik, objekt */) { throw new Error('Outlook še ni povezan'); }
async function poisciPodjetje(/* iskalni niz */) { throw new Error('Iskanje v AJPES/FURS še ni narejeno'); }
async function osveziPartnerja(/* naziv */) { throw new Error('Osvežitev iz AJPES/Bizi še ni narejena'); }
function vascoIzvoz(/* vrstice */) { throw new Error('Format VASCO še ni potrjen'); }

module.exports = { stanje: () => STANJE, outlookSporocila, poisciPodjetje, osveziPartnerja, vascoIzvoz };
