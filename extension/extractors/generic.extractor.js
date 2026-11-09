// Generic Extractor and Helper Functions for WohnBoard Extension

const SUPPORTED_HOSTS = [
  "immobilienscout24.de",
  "wg-gesucht.de",
  "kleinanzeigen.de",
  "immowelt.de",
  "immonet.de",
  "housinganywhere.com",
  "wunderflats.com",
  "spotahome.com",
  "nestpick.com",
  "degewo.de",
  "gesobau.de",
  "howoge.de",
  "gewobag.de",
  "wbm.de",
  "stadtundland.de",
  "berlinovo.de",
  "vonovia.de",
  "deutsche-wohnen.com",
  "leg-wohnen.de",
  "buwog.de",
  "grandcityproperty.de",
  "tag-wohnen.de",
  "saga.hamburg",
  "stw.berlin",
  "studierendenwerk-muenchen-oberbayern.de",
  "stwhh.de"
];

function extractPageImages() {
  const images = [];

  function getImgUrl(el) {
    let src = el.getAttribute('data-src') ||
      el.getAttribute('data-lazy') ||
      el.getAttribute('data-lazy-src') ||
      el.getAttribute('data-srcset') ||
      el.getAttribute('src') ||
      el.srcset ||
      el.src;
    if (src && src.includes(' ')) {
      src = src.trim().split(/\s+/)[0];
    }
    if (src && src.startsWith('http')) {
      return src;
    }
    if (src && src.startsWith('/')) {
      return window.location.origin + src;
    }
    return null;
  }

  // Search ONLY inside tags with class or id containing images, pictures, gallery, slider
  const containerSelectors = [
    '[class*="images"]',
    '[class*="pictures"]',
    '[class*="gallery"]',
    '[class*="slider"]',
    '[id*="images"]',
    '[id*="pictures"]',
    '[id*="gallery"]',
    '[id*="slider"]',
    'picture[class*="c-picture"]',
    '[class*="c-picture"]'
  ];

  document.querySelectorAll(containerSelectors.join(', ')).forEach(container => {
    container.querySelectorAll('img, source').forEach(el => {
      const src = getImgUrl(el);
      if (src && !images.includes(src)) {
        const lowerSrc = src.toLowerCase();
        const isIconOrLogo = lowerSrc.includes('logo') || lowerSrc.includes('avatar') || lowerSrc.includes('icon') || lowerSrc.includes('marker') || lowerSrc.includes('profile') || lowerSrc.includes('user') || lowerSrc.includes('badge') || lowerSrc.includes('social') || lowerSrc.includes('button');
        const isTracker = lowerSrc.includes('pixel') || lowerSrc.includes('analytics') || lowerSrc.includes('tracking') || lowerSrc.includes('doubleclick') || lowerSrc.includes('adsystem');

        const width = el.naturalWidth || el.width || 0;
        const height = el.naturalHeight || el.height || 0;
        const isTooSmall = (width > 0 && width < 120) || (height > 0 && height < 120);

        if (!isIconOrLogo && !isTracker && !isTooSmall) {
          images.push(src);
        }
      }
    });
  });

  return images.slice(0, 10);
}

function parseAdFields() {
  const details = {};

  // 1. Scan definition lists (dl, dt, dd)
  document.querySelectorAll('dl').forEach(dl => {
    const dts = dl.querySelectorAll('dt');
    const dds = dl.querySelectorAll('dd');
    dts.forEach((dt, idx) => {
      const dd = dds[idx];
      if (dt && dd) {
        const key = dt.textContent.trim().replace(/\s+/g, ' ');
        const val = dd.textContent.trim().replace(/\s+/g, ' ');
        if (key && val) {
          details[key] = val;
        }
      }
    });
  });

  // 2. Scan tables (tr, td/th)
  document.querySelectorAll('tr').forEach(tr => {
    const cells = tr.querySelectorAll('td, th');
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().replace(/\s+/g, ' ');
      const val = cells[1].textContent.trim().replace(/\s+/g, ' ');
      if (key && val) {
        details[key] = val;
      }
    }
  });

  // 3. Scan generic key-value layouts (e.g. elements containing colons)
  document.querySelectorAll('div, li, p, span').forEach(el => {
    if (el.children.length === 0 || (el.children.length <= 2 && el.textContent.includes(':'))) {
      const text = el.textContent.trim();
      const colonIdx = text.indexOf(':');
      if (colonIdx > 0 && colonIdx < text.length - 1) {
        const key = text.substring(0, colonIdx).trim().replace(/\s+/g, ' ');
        const val = text.substring(colonIdx + 1).trim().replace(/\s+/g, ' ');
        if (key.length > 1 && key.length < 50 && val.length > 0 && val.length < 200) {
          if (!details[key]) {
            details[key] = val;
          }
        }
      }
    }
  });

  // 4. Scan for Berlinovo / Drupal Field layout elements
  const locationField = document.querySelector('.field--name-field-location, [class*="field-location"]');
  if (locationField) {
    const streetEl = locationField.querySelector('.address-line1');
    const zipEl = locationField.querySelector('.postal-code');
    const cityEl = locationField.querySelector('.locality');
    if (streetEl) details['adresse_street'] = streetEl.textContent.trim();
    if (zipEl) details['plz'] = zipEl.textContent.trim();
    if (cityEl) details['stadt'] = cityEl.textContent.trim();
  }

  const totalRentField = document.querySelector('.field--name-field-total-rent, [class*="field-total-rent"], [class*="total-rent"]');
  if (totalRentField) {
    const rentItem = totalRentField.querySelector('.field__item');
    if (rentItem) {
      details['warmmiete'] = rentItem.getAttribute('content') || rentItem.textContent.trim();
    }
  }

  const netAreaField = document.querySelector('.field--name-field-net-area, [class*="field-net-area"], [class*="net-area"]');
  if (netAreaField) {
    const areaItem = netAreaField.querySelector('.field__item');
    if (areaItem) {
      details['größe'] = areaItem.getAttribute('content') || areaItem.textContent.trim();
    }
  }

  const roomsField = document.querySelector('.field--name-field-rooms-description, [class*="field-rooms-description"], [class*="rooms-description"]');
  if (roomsField) {
    details['zimmer'] = roomsField.textContent.trim();
  }

  const bodyText = document.body.innerText;
  const lines = bodyText.split('\n').map(l => l.trim()).filter(Boolean);

  const ALIAS_MAP = {
    coldRent: ['kaltmiete', 'nettokaltmiete', 'basismiete', 'net rent', 'cold rent'],
    warmRent: ['warmmiete', 'gesamtmiete', 'bruttomiete', 'warm rent', 'total rent', 'inklusivmiete', 'inklusivmiete mtl. ab', 'inklusivmiete mtl.', 'miete inkl. nk', 'miete inkl nk', 'inklusive miete'],
    deposit: ['kaution', 'mietkaution', 'deposit', 'kaution o. genossenschaftsanteile', 'kaution o. genossenschaftsanteil', 'kaution o.genossenschaftsanteile'],
    availability: ['verfügbarkeit', 'bezugsfrei ab', 'verfügbar ab', 'frei ab', 'verfügbar', 'available from'],
    rooms: ['zimmer', 'zi.', 'rooms', 'räume', 'anzahl zimmer', 'anzahl der zimmer', 'anzahl der räume'],
    squareMeters: ['größe', 'fläche', 'wohnfläche', 'size', 'area', 'net area', 'wohnfläche ab'],
    floor: ['geschoss', 'etage', 'stock', 'stockwerk', 'floor'],
    address: ['adresse', 'anschrift', 'lage', 'address'],
    constructionYear: ['baujahr', 'baujahr des gebäudes', 'year of construction', 'built in'],
    heatingType: ['heizungsart', 'heizung', 'heating type'],
    energySource: ['energieträger', 'energy source'],
    certificateType: ['ausweisart', 'ausweis', 'energieausweis', 'certificate type'],
    energyClass: ['energieeffizienzklasse', 'energy class'],
    heatingCosts: ['heizkosten', 'heating costs'],
    utilityCosts: ['nebenkosten', 'utility costs', 'betriebskosten']
  };

  function isValidValueForField(fieldKey, val) {
    if (!val || val.length > 200) return false;

    // Ignore values that look like labels themselves
    const hasDigit = /\d/.test(val);

    if (['coldRent', 'warmRent', 'deposit', 'heatingCosts', 'utilityCosts'].includes(fieldKey)) {
      const lowerVal = val.toLowerCase();
      const hasInvalidKeyword = lowerVal.includes('m²') ||
        lowerVal.includes('m2') ||
        lowerVal.includes('qm') ||
        lowerVal.includes('sqm') ||
        lowerVal.includes('/m') ||
        lowerVal.includes('pro m') ||
        lowerVal.includes('per sq') ||
        lowerVal.includes('zimmer') ||
        lowerVal.includes('rooms');
      const cleanNum = val.replace(/\s/g, '').replace(/[.,]/g, '');
      const isPureNumber = /^\d+$/.test(cleanNum);
      const hasEuro = val.includes('€') || lowerVal.includes('eur') || lowerVal.includes('euro') || lowerVal.includes('monats') || lowerVal.includes('kaltmiete') || isPureNumber;
      return hasDigit && !hasInvalidKeyword && hasEuro;
    }
    if (fieldKey === 'rooms') {
      const num = parseNumber(val);
      return hasDigit && num !== null && num > 0 && num < 20;
    }
    if (fieldKey === 'squareMeters') {
      return hasDigit && (val.includes('m²') || val.includes('qm') || parseNumber(val) > 5);
    }
    if (fieldKey === 'constructionYear') {
      const num = parseInt(val);
      return hasDigit && num > 1800 && num < 2100;
    }
    return true;
  }

  function findValueForField(fieldKey) {
    const aliases = ALIAS_MAP[fieldKey];
    if (!aliases) return null;

    // First try: from exact DOM details map populated from tables/dl
    for (const key in details) {
      const val = details[key];
      const normKey = key.toLowerCase().trim();
      const matched = aliases.some(alias => normKey === alias || normKey === alias + ':' || normKey.startsWith(alias + ' '));
      if (matched && isValidValueForField(fieldKey, val)) {
        return val;
      }
    }

    // Second try: scan lines of page text sequentially
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLower = line.toLowerCase();

      const matchedAlias = aliases.find(alias => {
        const normAlias = alias.toLowerCase();
        return lineLower === normAlias ||
          lineLower.startsWith(normAlias + ':') ||
          lineLower.startsWith(normAlias + ' ') ||
          (lineLower.includes(normAlias) && lineLower.includes(':'));
      });

      if (matchedAlias) {
        // Value might be on the same line or the next line
        let possibleVal = '';
        if (lineLower.includes(':')) {
          possibleVal = line.substring(line.indexOf(':') + 1).trim();
        } else if (lineLower.startsWith(matchedAlias)) {
          possibleVal = line.substring(matchedAlias.length).trim();
        }

        if (isValidValueForField(fieldKey, possibleVal)) {
          return possibleVal;
        }

        // Check next line
        if (i + 1 < lines.length) {
          possibleVal = lines[i + 1].trim();
          if (isValidValueForField(fieldKey, possibleVal)) {
            return possibleVal;
          }
        }
      }
    }

    return null;
  }

  // Populate actual parsed values
  const coldRentText = findValueForField('coldRent');
  const warmRentText = findValueForField('warmRent');
  const depositText = findValueForField('deposit');
  const availability = findValueForField('availability');
  const roomsText = findValueForField('rooms');
  const areaText = findValueForField('squareMeters');
  const floor = findValueForField('floor');
  const constructionYearText = findValueForField('constructionYear');
  const heatingType = findValueForField('heatingType');
  const energySource = findValueForField('energySource');
  const certificateType = findValueForField('certificateType');
  const energyClass = findValueForField('energyClass');
  const heatingCostsText = findValueForField('heatingCosts');
  const utilityCostsText = findValueForField('utilityCosts');

  let coldRent = parseNumber(coldRentText);
  let warmRent = parseNumber(warmRentText);
  let deposit = parseNumber(depositText);
  let rooms = parseNumber(roomsText);
  let squareMeters = parseNumber(areaText);
  let address = findValueForField('address');

  if (coldRentText) details['kaltmiete'] = coldRentText;
  if (warmRentText) details['warmmiete'] = warmRentText;
  if (depositText) details['kaution'] = depositText;
  if (availability) details['verfügbarkeit'] = availability;
  if (roomsText) details['zimmer'] = roomsText;
  if (areaText) details['größe'] = areaText;
  if (floor) details['geschoss'] = floor;
  if (address) details['adresse'] = address;
  if (constructionYearText) details['baujahr'] = constructionYearText;
  if (heatingType) details['heizungsart'] = heatingType;
  if (energySource) details['energieträger'] = energySource;
  if (certificateType) details['ausweisart'] = certificateType;
  if (energyClass) details['energieeffizienzklasse'] = energyClass;
  if (heatingCostsText) details['heizkosten'] = heatingCostsText;
  if (utilityCostsText) details['nebenkosten'] = utilityCostsText;

  if (!coldRent) {
    const fallbackCold = details['kaltmiete'] || details['nettokaltmiete'] || details['basismiete'];
    coldRent = parseNumber(fallbackCold);
  }
  if (!warmRent) {
    const fallbackWarm = details['warmmiete'] || details['gesamtmiete'] || details['bruttomiete'];
    warmRent = parseNumber(fallbackWarm);
  }
  if (!deposit) {
    const fallbackDeposit = details['kaution'] || details['mietkaution'] || details['kaution o. genossenschaftsanteile'];
    deposit = parseNumber(fallbackDeposit);
  }
  if (!rooms) {
    const fallbackRooms = details['zimmer'] || details['zi.'];
    rooms = parseNumber(fallbackRooms);
  }
  if (!rooms) {
    const pageText = document.body.innerText;
    const roomsMatch = pageText.match(/([0-9]+(?:,[0-9]+)?)\s*-?\s*Zi/i) || pageText.match(/([0-9]+(?:,[0-9]+)?)\s*-?\s*Zimmer/i);
    if (roomsMatch) {
      rooms = parseFloat(roomsMatch[1].replace(',', '.'));
    }
  }
  if (!squareMeters) {
    const fallbackArea = details['größe'] || details['fläche'] || details['wohnfläche'];
    squareMeters = parseNumber(fallbackArea);
  }

  let zipCode = details['plz'] || details['postleitzahl'];
  let city = details['stadt'] || details['ort'];
  let street = details['straße'] || details['strasse'] || details['adresse_street'];

  if (street) {
    address = street;
  } else if (!address) {
    const addrEl = document.querySelector('.address-block, .zip-code-and-city, .is24qa-adresse, a[href*="maps.google.com"], #address_block, address, [class*="address" i], [class*="location" i], [class*="adresse" i], [id*="address" i], [id*="adresse" i]');
    if (addrEl) {
      address = addrEl.textContent?.trim().replace(/\s+/g, ' ');
    }
  }

  if (address && !street) {
    const zipCityMatch = address.match(/(\d{5})\s+([^,]+)/);
    if (zipCityMatch) {
      if (!zipCode) zipCode = zipCityMatch[1];
      if (!city) city = zipCityMatch[2].trim();
      address = address.replace(zipCityMatch[0], '').trim().replace(/,\s*$/, '');
      if (address === '') address = null;
    }
  } else if (!address && (street || zipCode || city)) {
    address = [street, zipCode, city].filter(Boolean).join(', ');
  }

  if (details['miete'] && !coldRent && !warmRent) {
    coldRent = parseNumber(details['miete']);
  }

  const calculatedCosts = resolveCosts(details, coldRent, warmRent, deposit);

  return {
    rentPrice: calculatedCosts.rentPrice,
    warmRent: calculatedCosts.warmRent,
    coldRent: calculatedCosts.coldRent,
    deposit: calculatedCosts.deposit,
    utilityCosts: calculatedCosts.utilityCosts,
    heatingCosts: calculatedCosts.heatingCosts,
    rooms: rooms || 1,
    squareMeters,
    floor,
    address: address || null,
    city: city || null,
    zipCode: zipCode || null,
    availability,
    constructionYear: constructionYearText ? parseInt(constructionYearText) || null : null,
    heatingType,
    energySource,
    certificateType,
    energyClass,
    details
  };
}

function parseNumber(text) {
  if (text === null || text === undefined) return null;
  if (typeof text === 'number') return text;
  if (typeof text !== 'string') text = String(text);
  let cleaned = text.replace(/[^0-9,.-]/g, '').trim();
  if (!cleaned) return null;
  if (cleaned.indexOf('.') !== -1 && cleaned.indexOf(',') !== -1) {
    cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
  } else if (cleaned.indexOf(',') !== -1) {
    cleaned = cleaned.replace(/,/g, '.');
  }
  let num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function resolveCosts(details, fallbackCold, fallbackWarm, fallbackDeposit) {
  let coldRent = parseNumber(fallbackCold);
  let warmRent = parseNumber(fallbackWarm);
  let deposit = parseNumber(fallbackDeposit);
  let utilityCosts = null;
  let heatingCosts = null;

  for (const key in details) {
    const val = details[key];
    if (!val) continue;

    const lowerKey = key.toLowerCase();

    if (lowerKey.includes('kaltmiete') || lowerKey.includes('nettokaltmiete') || lowerKey.includes('basismiete')) {
      coldRent = parseNumber(val);
    } else if (lowerKey.includes('warmmiete') || lowerKey.includes('gesamtmiete') || lowerKey.includes('bruttomiete')) {
      warmRent = parseNumber(val);
    } else if (lowerKey.includes('kaution') || lowerKey.includes('mietkaution')) {
      deposit = parseNumber(val);
    } else if (lowerKey.includes('nebenkosten') || lowerKey.includes('betriebskosten')) {
      utilityCosts = parseNumber(val);
    } else if (lowerKey.includes('heizkosten') && !lowerKey.includes('enthalten') && !lowerKey.includes('inklusive')) {
      heatingCosts = parseNumber(val);
    }
  }

  if (details['miete'] && !coldRent && !warmRent) {
    coldRent = parseNumber(details['miete']);
  }

  if (!warmRent && coldRent && utilityCosts) {
    warmRent = coldRent + utilityCosts + (heatingCosts || 0);
  }
  if (!coldRent && warmRent && utilityCosts) {
    coldRent = warmRent - utilityCosts - (heatingCosts || 0);
  }

  const rentPrice = warmRent || coldRent;

  return {
    rentPrice,
    warmRent,
    coldRent,
    deposit,
    utilityCosts,
    heatingCosts
  };
}

function extractGeneric() {
  const url = window.location.href;
  const host = window.location.hostname;

  let sourcePlatform = 'other';
  for (const sh of SUPPORTED_HOSTS) {
    if (host.includes(sh)) {
      sourcePlatform = sh.split('.')[0];
      break;
    }
  }

  let title = document.querySelector('h1')?.textContent?.trim() || document.querySelector('title')?.textContent?.trim() || 'Apartment Listing';

  const images = extractPageImages();
  const adData = parseAdFields();
  const details = adData.details;

  const pageText = document.body.innerText.toLowerCase();
  const furnished = pageText.includes('möbliert') || pageText.includes('furnished') || pageText.includes('einbauküche');

  const constructionYearText = details['baujahr'] || details['baujahr des gebäudes'];
  const constructionYear = adData.constructionYear || (constructionYearText ? parseInt(constructionYearText) || null : null);
  const heatingType = adData.heatingType || null;
  const energySource = adData.energySource || null;
  const energyClass = adData.energyClass || null;
  const certificateType = adData.certificateType || null;
  const description = document.querySelector('article, main, [class*="description"], [class*="beschreibung"], #description, .description')?.textContent?.trim() || null;

  let heatingCostsIncluded = false;
  for (const key in details) {
    const val = details[key] ? details[key].toLowerCase() : '';
    if (key.toLowerCase().includes('heizkosten enthalten') || key.toLowerCase().includes('in warmmiete enthalten') || key.toLowerCase().includes('in nebenkosten enthalten')) {
      heatingCostsIncluded = val.includes('ja') || val.includes('yes') || val.includes('inklusive') || val.includes('inbegriffen');
    }
  }
  if (!heatingCostsIncluded) {
    heatingCostsIncluded = pageText.includes('heizkosten enthalten') || pageText.includes('heizkosten in warmmiete enthalten');
  }

  return {
    title,
    rentPrice: adData.rentPrice,
    warmRent: adData.warmRent,
    coldRent: adData.coldRent,
    deposit: adData.deposit,
    rooms: adData.rooms,
    squareMeters: adData.squareMeters,
    address: adData.address,
    city: adData.city,
    zipCode: adData.zipCode,
    floor: adData.floor,
    availability: adData.availability,
    furnished,
    petsAllowed: false,
    originalListingUrl: url,
    listingId: null,
    sourcePlatform,
    coverImage: images[0] || null,
    images,

    // New fields
    energyClass,
    utilityCosts: adData.utilityCosts,
    heatingCostsIncluded,
    heatingCosts: adData.heatingCosts,
    constructionYear,
    heatingType,
    energySource,
    certificateType,
    description
  };
}

function createPlatformExtractor(platformId, displayName, config) {
  return function() {
    const url = window.location.href;
    const listingIdMatch = config.idRegex ? url.match(config.idRegex) : null;
    const listingId = listingIdMatch ? listingIdMatch[1] : null;

    let title = displayName + ' Listing';
    if (config.titleSelectors) {
      for (const selector of config.titleSelectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent.trim()) {
          title = el.textContent.trim();
          break;
        }
      }
    }

    const images = extractPageImages();
    const adData = parseAdFields();
    const details = adData.details;

    const pageText = document.body.innerText.toLowerCase();
    const furnished = pageText.includes('möbliert') || pageText.includes('furnished') || pageText.includes('einbauküche');

    const constructionYearText = details['baujahr'] || details['baujahr des gebäudes'];
    const constructionYear = adData.constructionYear || (constructionYearText ? parseInt(constructionYearText) || null : null);
    const heatingType = adData.heatingType || null;
    const energySource = adData.energySource || null;
    const energyClass = adData.energyClass || null;
    const certificateType = adData.certificateType || null;
    const description = document.querySelector('article, main, [class*="description"], [class*="beschreibung"], #description, .description')?.textContent?.trim() || null;

    let heatingCostsIncluded = false;
    for (const key in details) {
      const val = details[key] ? details[key].toLowerCase() : '';
      if (key.toLowerCase().includes('heizkosten enthalten') || key.toLowerCase().includes('in warmmiete enthalten') || key.toLowerCase().includes('in nebenkosten enthalten')) {
        heatingCostsIncluded = val.includes('ja') || val.includes('yes') || val.includes('inklusive') || val.includes('inbegriffen');
      }
    }
    if (!heatingCostsIncluded) {
      heatingCostsIncluded = pageText.includes('heizkosten enthalten') || pageText.includes('heizkosten in warmmiete enthalten');
    }

    return {
      title,
      rentPrice: adData.rentPrice,
      warmRent: adData.warmRent,
      coldRent: adData.coldRent,
      deposit: adData.deposit,
      rooms: adData.rooms,
      squareMeters: adData.squareMeters,
      address: adData.address,
      city: adData.city,
      zipCode: adData.zipCode,
      floor: adData.floor,
      availability: adData.availability,
      furnished,
      petsAllowed: false,
      originalListingUrl: url,
      listingId,
      sourcePlatform: platformId,
      coverImage: images[0] || null,
      images,

      // New fields
      energyClass,
      utilityCosts: adData.utilityCosts,
      heatingCostsIncluded,
      heatingCosts: adData.heatingCosts,
      constructionYear,
      heatingType,
      energySource,
      certificateType,
      description
    };
  };
}

function extractVonoviaOrDeutscheWohnen(platformId) {
  const url = window.location.href;
  let data = null;

  const dataEl = document.querySelector('[data-vonovia-data]');
  if (dataEl) {
    try {
      const rawJson = dataEl.getAttribute('data-vonovia-data');
      if (rawJson) {
        data = JSON.parse(rawJson);
      }
    } catch (e) {
      console.error('Error parsing data-vonovia-data', e);
    }
  }

  // Helper to safely parse and clean numbers
  function parseCleanNumber(text) {
    if (text === null || text === undefined) return null;
    if (typeof text === 'number') return text;
    if (typeof text !== 'string') text = String(text);
    const clean = text.replace(/[^0-9,.-]/g, '').trim();
    if (!clean) return null;
    let num = parseFloat(clean.replace(/\./g, '').replace(',', '.'));
    return isNaN(num) ? null : num;
  }

  if (data) {
    // 1. Title
    const title = data.heading || document.title;

    // 2. Listing ID
    const listingId = data.objectId || null;

    // 3. Rent & Costs
    const coldRent = parseCleanNumber(data.rent);
    const warmRent = parseCleanNumber(data.warmRent);
    const deposit = parseCleanNumber(data.securityDeposit);
    const utilityCosts = parseCleanNumber(data.operatingCosts);
    const heatingCosts = parseCleanNumber(data.heatingCosts);
    const rentPrice = warmRent || coldRent;

    // 4. Details
    const rooms = parseCleanNumber(data.numberOfRooms) || 1;
    const squareMeters = parseCleanNumber(data.space);
    const availability = data.availableFrom || null;

    // 5. Address
    let address = data.streetAndHouseNumber || null;
    let zipCode = null;
    let city = null;

    if (data.postCodeAndCity) {
      const match = data.postCodeAndCity.match(/(\d{5})\s+(.*)/);
      if (match) {
        zipCode = match[1];
        city = match[2].trim();
      } else {
        city = data.postCodeAndCity.trim();
      }
    }

    // 6. Floor
    let floor = null;
    if (Array.isArray(data.sections)) {
      for (const sec of data.sections) {
        if (Array.isArray(sec.rows)) {
          const geschossRow = sec.rows.find(row => row && row.label && row.label.toLowerCase().includes('geschoss'));
          if (geschossRow) {
            floor = geschossRow.value;
          }
        }
      }
    }

    // 7. Furnished
    const features = Array.isArray(data.features) ? data.features : [];
    const furnished = features.some(f => f && (f.toLowerCase().includes('möbliert') || f.toLowerCase().includes('einbauküche')));

    // 8. Description
    const descriptionParts = [
      data.description || null,
      data.location ? `Lage:\n${data.location}` : null,
      data.miscellaneous ? `Sonstiges:\n${data.miscellaneous}` : null
    ].filter(Boolean);
    const description = descriptionParts.join('\n\n') || null;

    // 9. Images
    let images = [];
    if (Array.isArray(data.overlayImages) && data.overlayImages.length > 0) {
      images = data.overlayImages.map(img => img.url).filter(Boolean);
    } else if (Array.isArray(data.images)) {
      images = data.images.map(img => img.url).filter(Boolean);
    }

    return {
      title,
      rentPrice,
      warmRent,
      coldRent,
      deposit,
      rooms,
      squareMeters,
      address,
      city,
      zipCode,
      floor,
      availability,
      furnished,
      petsAllowed: false,
      originalListingUrl: url,
      listingId,
      sourcePlatform: platformId,
      coverImage: images[0] || null,
      images: images.slice(0, 10),
      energyClass: data.energyPassValueClass || null,
      utilityCosts,
      heatingCostsIncluded: false,
      heatingCosts,
      constructionYear: parseInt(data.constructionYear) || null,
      heatingType: data.heatingType || null,
      energySource: data.energySource || null,
      certificateType: data.energyPassType || null,
      description
    };
  }

  // === Fallback DOM-based scraper ===
  const title = document.querySelector('h1, h2.headline')?.textContent?.trim() || document.title;
  let listingId = null;
  const idMatch = url.match(/(\d{8,})/);
  if (idMatch) listingId = idMatch[1];

  const details = {};
  document.querySelectorAll('li').forEach(li => {
    const nameEl = li.querySelector('.name');
    const descEl = li.querySelector('.description');
    if (nameEl && descEl) {
      const key = nameEl.textContent.trim().toLowerCase().replace(/:/g, '');
      details[key] = descEl.textContent.trim();
    }
  });

  const coldRent = parseCleanNumber(details['kaltmiete'] || document.querySelector('.number:nth-of-type(1) .h4')?.textContent);
  const warmRent = parseCleanNumber(details['warmmiete'] || document.querySelector('.number:nth-of-type(2) .h4')?.textContent);
  const rooms = parseCleanNumber(details['zimmer'] || document.querySelector('.number:nth-of-type(5) .h4')?.textContent) || 1;
  const squareMeters = parseCleanNumber(details['größe'] || details['wohnfläche'] || document.querySelector('.number:nth-of-type(3) .h4')?.textContent);
  const deposit = parseCleanNumber(details['kaution']);
  
  let address = null;
  let zipCode = null;
  let city = null;

  const addressEl = document.querySelector('.top a, [class*="icon-location"]');
  if (addressEl) {
    const fullText = addressEl.textContent.trim();
    const parts = fullText.split('-');
    if (parts.length > 1) {
      address = parts[0].trim();
      const zipCityText = parts[1].trim();
      const zipMatch = zipCityText.match(/(\d{5})\s+(.*)/);
      if (zipMatch) {
        zipCode = zipMatch[1];
        city = zipMatch[2].trim();
      } else {
        city = zipCityText;
      }
    } else {
      address = fullText;
    }
  }

  const descEl = document.querySelector('.rte.text-collapse-mobile .content, .rte');
  const description = descEl ? descEl.textContent.trim() : null;

  const images = [];
  document.querySelectorAll('.image-slider img').forEach(img => {
    const src = img.src || img.getAttribute('data-src');
    if (src && !images.includes(src)) images.push(src);
  });

  return {
    title,
    rentPrice: warmRent || coldRent,
    warmRent,
    coldRent,
    deposit,
    rooms,
    squareMeters,
    address,
    city,
    zipCode,
    floor: details['geschoss'] || null,
    availability: details['verfügbar ab'] || null,
    furnished: false,
    petsAllowed: false,
    originalListingUrl: url,
    listingId,
    sourcePlatform: platformId,
    coverImage: images[0] || null,
    images: images.slice(0, 10),
    description
  };
}

