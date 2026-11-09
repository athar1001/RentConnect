// Mock window and document
const testUrls = [
  // ImmoScout24
  { url: 'https://www.immobilienscout24.de/expose/12345678', expected: true },
  { url: 'https://www.immobilienscout24.de/projekte/12345', expected: true },
  { url: 'https://www.immobilienscout24.de/Suche/S-T/Wohnung-Miete/Berlin/Berlin', expected: false },
  
  // WG-Gesucht
  { url: 'https://www.wg-gesucht.de/wg-zimmer-in-Berlin-Neukoelln.1234567.html', expected: true },
  { url: 'https://www.wg-gesucht.de/wg-zimmer-in-Berlin.8.0.1.0.html', expected: false },

  // Kleinanzeigen
  { url: 'https://www.kleinanzeigen.de/s-anzeige/ehrenfeld-simrockstr-11-2-zimmer-wohnung-mit-balkon/123456-203-999', expected: true },
  { url: 'https://www.kleinanzeigen.de/s-wohnung-mieten/berlin/c203l3331', expected: false },

  // Immowelt
  { url: 'https://www.immowelt.de/expose/12345abc', expected: true },
  { url: 'https://www.immowelt.de/suche/berlin/wohnungen/mieten', expected: false },

  // HousingAnywhere
  { url: 'https://housinganywhere.com/room/123456/de', expected: true },
  { url: 'https://housinganywhere.com/s/Berlin--Germany', expected: false },

  // Wunderflats
  { url: 'https://wunderflats.com/en/flat/berlin-mitte/12345678', expected: true },
  { url: 'https://wunderflats.com/en/search/berlin', expected: false },

  // Spotahome
  { url: 'https://www.spotahome.com/berlin/for-rent:rooms/123456', expected: true },
  { url: 'https://www.spotahome.com/s/berlin', expected: false },

  // TAG Wohnen
  { url: 'https://tag-wohnen.de/immosuche/expose?object_id=3520/30323/1251', expected: true },
  { url: 'https://tag-wohnen.de/immosuche?filters%5Bfittings%5D[]=Bad%20mit%20Fenster', expected: false }
];

function isListingPage(urlStr) {
  const url = urlStr;
  const parsed = new URL(urlStr);
  const host = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();

  if (pathname === '/' || pathname === '') {
    return false;
  }

  // 1. ImmoScout24
  if (host.includes('immobilienscout24.de')) {
    return url.includes('/expose') || url.includes('/projekte') || url.includes('/neubau/');
  }

  // 2. WG-Gesucht
  if (host.includes('wg-gesucht.de')) {
    return /-\d{5,}\.html/.test(url) || /\.\d{5,}\.html/.test(url);
  }

  // 3. Kleinanzeigen
  if (host.includes('kleinanzeigen.de')) {
    return url.includes('/s-anzeige');
  }

  // 4. Immowelt
  if (host.includes('immowelt.de')) {
    return url.includes('/expose');
  }

  // 5. Immonet
  if (host.includes('immonet.de')) {
    return url.includes('/angebot');
  }

  // 6. HousingAnywhere
  if (host.includes('housinganywhere.com')) {
    return /\/(?:room|rent|listings)/.test(url) && !url.includes('/search');
  }

  // 7. Wunderflats
  if (host.includes('wunderflats.com')) {
    return url.includes('/flat') || url.includes('/furnished-apartment');
  }

  // 8. Spotahome
  if (host.includes('spotahome.com')) {
    return /\/(?:for-rent|apartments|rooms|studios|flats)/.test(url) && /\/\d+/.test(url);
  }

  // 9. Degewo
  if (host.includes('degewo.de')) {
    return url.includes('/properties') || url.includes('/details');
  }

  // 10. Gesobau
  if (host.includes('gesobau.de')) {
    return (url.includes('/detail') || /-[a-zA-Z0-9]+\/?$/.test(url)) && !url.includes('/suche') && !url.includes('/search');
  }

  // 11. Howoge
  if (host.includes('howoge.de')) {
    return url.includes('/detail');
  }

  // 12. Gewobag
  if (host.includes('gewobag.de')) {
    return url.includes('/angebot') || url.includes('/mietangebote');
  }

  // 13. WBM
  if (host.includes('wbm.de')) {
    return url.includes('/openimmo-detail') || url.includes('/expose') || url.includes('/details');
  }

  // 14. Stadt und Land
  if (host.includes('stadtundland.de')) {
    return url.includes('/scheine') || url.includes('/details') || url.includes('/expose') || (url.includes('/wohnungssuche/') && pathname !== '/wohnungssuche' && pathname !== '/wohnungssuche/');
  }

  // 15. Berlinovo
  if (host.includes('berlinovo.de')) {
    return url.includes('/apartments') || url.includes('/expose') || url.includes('/details');
  }

  // 16. Vonovia
  if (host.includes('vonovia.de')) {
    return url.includes('/expose') || url.includes('/details') || url.includes('/immobilien');
  }

  // 17. Deutsche Wohnen
  if (host.includes('deutsche-wohnen.com')) {
    return url.includes('/expose') || url.includes('/details') || url.includes('/mietangebote');
  }

  // 18. LEG Wohnen
  if (host.includes('leg-wohnen.de')) {
    return url.includes('/expose') || url.includes('/details');
  }

  // 19. Buwog
  if (host.includes('buwog.de')) {
    return url.includes('/expose') || url.includes('/details');
  }

  // 20. Grand City Property
  if (host.includes('grandcityproperty.de')) {
    return url.includes('/expose') || url.includes('/details') || (url.includes('/wohnungssuche/') && pathname !== '/wohnungssuche' && pathname !== '/wohnungssuche/');
  }

  // 21. TAG Wohnen
  if (host.includes('tag-wohnen.de')) {
    return url.includes('/expose') || url.includes('/details');
  }

  // 22. Saga Hamburg
  if (host.includes('saga.hamburg')) {
    return url.includes('/expose') || url.includes('/details');
  }

  return false;
}

let allPassed = true;
for (const test of testUrls) {
  const result = isListingPage(test.url);
  if (result !== test.expected) {
    console.error(`FAIL: ${test.url} -> got ${result}, expected ${test.expected}`);
    allPassed = false;
  } else {
    console.log(`PASS: ${test.url} -> ${result}`);
  }
}

if (allPassed) {
  console.log("All isListingPage tests passed successfully!");
}
