// ImmoScout24 Extractor for WohnBoard Extension

function extractImmoScout24() {
  const url = window.location.href;
  const isNeubau = !!(document.querySelector('[data-testid="project-name"]') || document.querySelector('[data-testid="project-id"]'));

  // Helper to safely parse and clean numbers
  function parseCleanNumber(text) {
    if (text === null || text === undefined) return null;
    if (typeof text === 'number') return text;
    if (typeof text !== 'string') text = String(text);
    // Remove range indicator if present to get the first number
    if (text.includes('-')) {
      text = text.split('-')[0].trim();
    }
    const clean = text.replace(/[^0-9,.-]/g, '').trim();
    if (!clean) return null;
    let num = parseFloat(clean.replace(/\./g, '').replace(',', '.'));
    return isNaN(num) ? null : num;
  }

  if (isNeubau) {
    // === Neubau Project Page Layout Scraper ===
    let title = document.querySelector('[data-testid="project-name"]')?.textContent?.trim();
    const subtitle = document.querySelector('[data-testid="project-title"]')?.textContent?.trim();
    if (title && subtitle) {
      title = `${title} - ${subtitle}`;
    } else if (!title) {
      title = subtitle || 'ImmoScout24 Neubau Project';
    }

    let listingId = null;
    const projectIdEl = document.querySelector('[data-testid="project-id"]');
    if (projectIdEl) {
      const idMatch = projectIdEl.textContent.match(/:\s*([a-zA-Z0-9_-]+)/) || projectIdEl.textContent.match(/([a-zA-Z0-9_-]+)/);
      if (idMatch) {
        listingId = idMatch[1];
      }
    }
    if (!listingId) {
      const urlMatch = url.match(/\/(\d+)\/?(?:[?#].*)?$/) || url.match(/\/([a-zA-Z0-9_-]+)\.html/);
      if (urlMatch) listingId = urlMatch[1];
    }

    const details = {};

    // Scan info box values
    document.querySelectorAll('[class*="ProjectInfoBox_mainValue"]').forEach(el => {
      const parent = el.parentElement;
      if (parent) {
        const labelEl = parent.querySelector('[class*="ProjectInfoBox_labelText"]');
        if (labelEl) {
          const key = labelEl.textContent.trim().toLowerCase();
          details[key] = el.textContent.trim();
        }
      }
    });

    // Scan overview items
    const overviewContainer = document.querySelector('[class*="ProjectOverview_overviewContainer"]');
    if (overviewContainer) {
      const spans = overviewContainer.querySelectorAll('span');
      for (let i = 0; i < spans.length; i += 2) {
        if (i + 1 < spans.length) {
          const key = spans[i].textContent.trim().toLowerCase();
          details[key] = spans[i+1].textContent.trim();
        }
      }
    }

    // Rent, Rooms, Square Meters
    let coldRent = parseCleanNumber(details['kaltmiete']);
    let rooms = parseCleanNumber(details['zimmer']);
    let squareMeters = parseCleanNumber(details['wohnflächen'] || details['größe'] || details['fläche']);
    let availability = details['bezugsfrei ab'] || null;

    // Address
    let address = null;
    let zipCode = null;
    let city = null;

    const addressEl = document.querySelector('[data-testid="project-address-link"], [class*="AddressRow_addressLink"]');
    if (addressEl) {
      address = addressEl.textContent.trim();
    }

    if (address) {
      const zipCityMatch = address.match(/(\d{5})\s+([^,]+)/);
      if (zipCityMatch) {
        zipCode = zipCityMatch[1];
        city = zipCityMatch[2].trim();
        address = address.replace(zipCityMatch[0], '').trim().replace(/,\s*$/, '');
        if (address === '') address = null;
      }
    }

    // Description & Furnished
    const descEl = document.querySelector('[data-testid="project-description-content"] [data-testid="expandable-text"]');
    const equipEl = document.querySelector('[data-testid="project-characteristics-content"] [data-testid="expandable-text"]');
    const description = [
      descEl ? descEl.textContent.trim() : null,
      equipEl ? `Ausstattung:\n${equipEl.textContent.trim()}` : null
    ].filter(Boolean).join('\n\n') || null;

    const pageText = document.body.innerText.toLowerCase();
    const furnished = pageText.includes('möbliert') || pageText.includes('furnished') || pageText.includes('einbauküche');

    // Images
    let images = extractPageImages();
    if (images.length === 0) {
      document.querySelectorAll('img').forEach(el => {
        const src = el.src || el.getAttribute('data-src') || el.getAttribute('src');
        if (src && !images.includes(src)) {
          const lowerSrc = src.toLowerCase();
          const isIcon = lowerSrc.includes('logo') || lowerSrc.includes('avatar') || lowerSrc.includes('icon') || lowerSrc.includes('marker');
          if (!isIcon) {
            images.push(src);
          }
        }
      });
    }

    return {
      title: title || 'ImmoScout24 Neubau Listing',
      rentPrice: coldRent,
      warmRent: null,
      coldRent,
      deposit: null,
      rooms: rooms || 1,
      squareMeters,
      address,
      city,
      zipCode,
      floor: null,
      availability,
      furnished,
      petsAllowed: false,
      originalListingUrl: url,
      listingId,
      sourcePlatform: 'immobilienscout24',
      coverImage: images[0] || null,
      images: images.slice(0, 10),
      description,
      details
    };
  }

  // === Standard Expose Page Layout Scraper ===
  const listingIdMatch = url.match(/expose\/(\d+)/);
  const listingId = listingIdMatch ? listingIdMatch[1] : null;

  // 1. Title
  let title = document.querySelector('h1#expose-title, h1[data-qa="expose-title"]')?.textContent?.trim();
  if (!title) {
    title = document.querySelector('h1.main-criteria__title, title')?.textContent?.trim();
  }
  if (title && (title.toLowerCase().includes('immobilienscout24') || title.toLowerCase().includes('immoscout24'))) {
    const headerTitle = document.querySelector('.expose-title-container h1, h1[class*="title"]')?.textContent?.trim();
    if (headerTitle) title = headerTitle;
  }

  // 2. Images
  const images = extractPageImages();

  // 3. Core Criteria from the main criteria bar
  const mainColdRentEl = document.querySelector('.is24qa-maincriteria-baserent-label-main, .is24-preis-section .is24-preis-value');
  let coldRent = mainColdRentEl ? parseCleanNumber(mainColdRentEl.textContent) : null;

  const mainWarmRentEl = document.querySelector('.is24qa-maincriteria-rentincludingutilities-label-main');
  let warmRent = mainWarmRentEl ? parseCleanNumber(mainWarmRentEl.textContent) : null;

  const mainRoomsEl = document.querySelector('.is24qa-maincriteria-numberofrooms-label-main');
  let rooms = mainRoomsEl ? parseCleanNumber(mainRoomsEl.textContent) : null;

  const mainAreaEl = document.querySelector('.is24qa-maincriteria-space-label-main');
  let squareMeters = mainAreaEl ? parseCleanNumber(mainAreaEl.textContent) : null;

  // 4. Fallbacks/Additional fields from costs tables/details
  const details = {};
  
  // Parse standard costs and details if present on page
  document.querySelectorAll('dl.grid, .criteriagroup dl').forEach(dl => {
    const dt = dl.querySelector('dt');
    const dd = dl.querySelector('dd');
    if (dt && dd) {
      const key = dt.textContent.trim().replace(/\s+/g, ' ').toLowerCase();
      const val = dd.textContent.trim().replace(/\s+/g, ' ');
      details[key] = val;
    }
  });

  // Extract from details map
  if (!coldRent) {
    coldRent = parseCleanNumber(details['kaltmiete'] || details['nettokaltmiete']);
  }
  if (!warmRent) {
    warmRent = parseCleanNumber(details['gesamtmiete'] || details['warmmiete']);
  }
  if (!rooms) {
    rooms = parseCleanNumber(details['zimmer']);
  }
  if (!squareMeters) {
    squareMeters = parseCleanNumber(details['wohnfläche ca.'] || details['wohnfläche']);
  }

  let deposit = parseCleanNumber(details['kaution o. genossenschaftsanteile'] || details['kaution']);
  if (!deposit) {
    const depositEl = document.querySelector('.is24qa-kaution-o-genossenschaftsanteile, .is24qa-kaution');
    if (depositEl) deposit = parseCleanNumber(depositEl.textContent);
  }

  let utilityCosts = parseCleanNumber(details['nebenkosten']);
  let heatingCosts = parseCleanNumber(details['heizkosten']);

  // Availability
  let availability = details['bezugsfrei ab'] || null;
  if (!availability) {
    const availEl = document.querySelector('.is24qa-bezugsfrei-ab');
    if (availEl) availability = availEl.textContent.trim();
  }

  // Address
  let address = null;
  let zipCode = null;
  let city = null;

  const cleanAddrEl = document.querySelector('.zip-region-and-country, .is24qa-adresse');
  if (cleanAddrEl) {
    address = cleanAddrEl.textContent.trim().replace(/\s+/g, ' ');
  } else {
    const addrEl = document.querySelector('.address-block');
    if (addrEl) {
      address = addrEl.textContent.trim().replace(/\s+/g, ' ');
    }
  }

  if (address) {
    // Strip common disclaimer text
    address = address.replace(/Die vollständige Adresse.*?erhalten Sie vom Anbieter\./i, '').trim();
    address = address.replace(/,\s*$/, '').trim();

    const zipCityMatch = address.match(/(\d{5})\s+([^,]+)/);
    if (zipCityMatch) {
      zipCode = zipCityMatch[1];
      city = zipCityMatch[2].trim();
      address = address.replace(zipCityMatch[0], '').trim().replace(/,\s*$/, '');
      if (address === '') address = null;
    }
  }

  // Furnished & Pets
  const pageText = document.body.innerText.toLowerCase();
  const furnished = pageText.includes('möbliert') || pageText.includes('furnished') || pageText.includes('einbauküche') || !!document.querySelector('.is24qa-einbaukueche-label');
  const petsAllowed = pageText.includes('haustiere erlaubt') || pageText.includes('tierhaltung gestattet') || pageText.includes('pets allowed');

  // Bausubstanz
  const constructionYearText = details['baujahr'] || document.querySelector('.is24qa-baujahr')?.textContent;
  const constructionYear = constructionYearText ? parseInt(constructionYearText) || null : null;
  
  const heatingType = details['heizungsart'] || document.querySelector('.is24qa-heizungsart')?.textContent?.trim() || null;
  
  const energySource = details['wesentliche energieträger'] || document.querySelector('.is24qa-wesentliche-energietraeger')?.textContent?.trim() || null;
  
  const energyClassImg = document.querySelector('.is24qa-energyefficiencyclass img, .is24qa-energieeffizienzklasse img');
  const energyClass = energyClassImg ? energyClassImg.getAttribute('alt')?.trim() : (details['energieeffizienzklasse'] || null);
  
  const certificateType = details['energieausweistyp'] || document.querySelector('.is24qa-energieausweistyp')?.textContent?.trim() || null;

  let heatingCostsIncluded = false;
  const heatingCostsLabel = details['heizkosten'] || '';
  if (heatingCostsLabel.toLowerCase().includes('in nebenkosten enthalten') || heatingCostsLabel.toLowerCase().includes('in warmmiete enthalten')) {
    heatingCostsIncluded = true;
  }
  if (!heatingCostsIncluded) {
    heatingCostsIncluded = pageText.includes('heizkosten in nebenkosten enthalten') || pageText.includes('heizkosten in warmmiete enthalten');
  }

  // Description
  const descriptionEl = document.querySelector('.is24qa-objektbeschreibung, .is24-text.is24-long-text-attribute pre');
  const description = descriptionEl ? descriptionEl.textContent.trim() : null;

  // Final resolve of rent price
  if (!warmRent && coldRent && utilityCosts) {
    warmRent = coldRent + utilityCosts + (heatingCosts || 0);
  }
  if (!coldRent && warmRent && utilityCosts) {
    coldRent = warmRent - utilityCosts - (heatingCosts || 0);
  }
  const rentPrice = warmRent || coldRent;

  return {
    title: title || 'ImmoScout24 Listing',
    rentPrice,
    warmRent,
    coldRent,
    deposit,
    rooms: rooms || 1,
    squareMeters,
    address,
    city,
    zipCode,
    floor: details['etage'] || null,
    availability,
    furnished,
    petsAllowed,
    originalListingUrl: url,
    listingId,
    sourcePlatform: 'immobilienscout24',
    coverImage: images[0] || null,
    images: images.slice(0, 10),
    energyClass,
    utilityCosts,
    heatingCostsIncluded,
    heatingCosts,
    constructionYear,
    heatingType,
    energySource,
    certificateType,
    description
  };
}
