// Berlinovo Extractor for WohnBoard Extension

function extractBerlinovo() {
  const url = window.location.href;

  function parseCleanNumber(text) {
    if (text === null || text === undefined) return null;
    if (typeof text === 'number') return text;
    if (typeof text !== 'string') text = String(text);
    let clean = text.replace(/[^0-9,.-]/g, '').trim();
    if (!clean) return null;

    if (clean.includes('.') && !clean.includes(',')) {
      const parts = clean.split('.');
      if (parts[parts.length - 1].length <= 2) {
        let num = parseFloat(clean);
        return isNaN(num) ? null : num;
      }
    }

    let num = parseFloat(clean.replace(/\./g, '').replace(',', '.'));
    return isNaN(num) ? null : num;
  }

  // 1. Title
  let title = document.querySelector('h1')?.textContent?.trim() ||
              document.querySelector('.field--name-title')?.textContent?.trim();
  if (!title) {
    title = document.title || 'Berlinovo Apartment';
  }

  // 2. Listing ID from article
  const listingId = document.querySelector('article[data-history-node-id]')?.getAttribute('data-history-node-id') || null;

  // 3. Costs parsing (standard fields)
  const totalRentEl = document.querySelector('.field--name-field-total-rent .field__item') ||
                      document.querySelector('.field--name-field-total-rent [content]');
  let warmRent = totalRentEl ? parseCleanNumber(totalRentEl.getAttribute('content') || totalRentEl.textContent) : null;
  let coldRent = null;
  let utilityCosts = null;
  let heatingCosts = null;
  let deposit = null;

  // One-time final cleaning fee
  const cleaningEl = document.querySelector('.field--name-field-finalcleaning .field__item') ||
                     document.querySelector('.field--name-field-finalcleaning [content]');
  const finalCleaning = cleaningEl ? parseCleanNumber(cleaningEl.getAttribute('content') || cleaningEl.textContent) : null;

  // 4. Area
  const areaEl = document.querySelector('.field--name-field-net-area .field__item') ||
                 document.querySelector('.field--name-field-net-area [content]');
  let squareMeters = areaEl ? parseCleanNumber(areaEl.getAttribute('content') || areaEl.textContent) : null;

  // 5. Rooms
  let rooms = null;
  const roomsText = document.querySelector('.field--name-field-rooms-description')?.textContent?.trim();
  if (roomsText) {
    const match = roomsText.match(/(\d+(?:[.,]\d+)?)(?:-zimmer|-room|zimmer|room)/i);
    if (match) {
      rooms = parseCleanNumber(match[1]);
    }
  }

  // 6. Generic Details block parsing (as fallbacks/enrichment)
  const details = {};
  document.querySelectorAll('.details-block .field, .immo .field').forEach(el => {
    const label = el.querySelector('.field__label')?.textContent?.trim()?.toLowerCase();
    const itemEl = el.querySelector('.field__item');
    if (label && itemEl) {
      const val = itemEl.getAttribute('content') || itemEl.textContent?.trim();
      if (val) {
        details[label] = val;
      }
    }
  });

  for (const [key, val] of Object.entries(details)) {
    const parsedVal = parseCleanNumber(val);
    if (parsedVal !== null) {
      if (key.includes('inklusivmiete') || key.includes('warmmiete') || key.includes('gesamtmiete')) {
        if (warmRent === null) warmRent = parsedVal;
      } else if (key.includes('kaltmiete') || key.includes('nettokaltmiete') || key.includes('grundmiete')) {
        if (coldRent === null) coldRent = parsedVal;
      } else if (key.includes('betriebskosten') || key.includes('nebenkosten')) {
        if (utilityCosts === null) utilityCosts = parsedVal;
      } else if (key.includes('heizkosten')) {
        if (heatingCosts === null) heatingCosts = parsedVal;
      } else if (key.includes('kaution')) {
        if (deposit === null) deposit = parsedVal;
      } else if (key.includes('wohnfläche') || key.includes('net-area')) {
        if (squareMeters === null) squareMeters = parsedVal;
      } else if (key.includes('zimmer')) {
        if (rooms === null) rooms = parsedVal;
      }
    }
  }

  const rentPrice = warmRent || coldRent;

  // Fallback to body description if net area is missing
  if (!squareMeters) {
    const bodyText = document.querySelector('.field--name-body')?.textContent;
    if (bodyText) {
      const match = bodyText.match(/([\d,.]+)\s*(?:m²|m2|quadratmeter)/i);
      if (match) {
        squareMeters = parseCleanNumber(match[1]);
      }
    }
  }

  // Title fallback for rooms
  if (!rooms) {
    const titleMatch = title.match(/(\d+(?:[.,]\d+)?)(?:-zimmer|-room|zimmer|room)/i);
    if (titleMatch) {
      rooms = parseCleanNumber(titleMatch[1]);
    }
  }
  if (!rooms) rooms = 1;

  // 7. Address parsing
  let address = null;
  let zipCode = null;
  let city = null;

  const addressEl = document.querySelector('.field--name-field-location');
  if (addressEl) {
    address = addressEl.querySelector('.address-line1')?.textContent?.trim() || null;
    zipCode = addressEl.querySelector('.postal-code')?.textContent?.trim() || null;
    city = addressEl.querySelector('.locality')?.textContent?.trim() || null;
  }

  // Fallback check standard address tag
  if (!address) {
    const addrEl = document.querySelector('.address, address');
    if (addrEl) {
      const text = addrEl.textContent.trim();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) address = lines[0];
      if (lines.length > 1) {
        const zipMatch = lines[1].match(/(\d{5})\s+(.*)/);
        if (zipMatch) {
          zipCode = zipMatch[1];
          city = zipMatch[2].trim();
        } else {
          city = lines[1];
        }
      }
    }
  }

  // 8. Availability
  const availability = document.querySelector('[class*="vermietungsstatus"] .text, .block-berlinovo-apartment-vermietungsstatus .text, .block-berlinovo-apartment-vermietungsstatus .body')?.textContent?.trim() || null;

  // 9. Description
  let description = null;
  const descEl = document.querySelector('[class*="block-field-blocknode"][class*="body"] .field--name-body') ||
                 document.querySelector('.block-field-blocknodetemporary-apartmentbody .field--name-body');
  if (descEl) {
    description = descEl.textContent.trim();
  } else {
    document.querySelectorAll('.field--name-body').forEach(el => {
      const txt = el.textContent.trim();
      if (txt && txt !== 'Drucken' && (!description || txt.length > description.length)) {
        description = txt;
      }
    });
  }

  // Extract services
  const services = [];
  document.querySelectorAll('.field--name-field-services .field__item').forEach(el => {
    const txt = el.textContent?.trim();
    if (txt) services.push(txt);
  });

  // Extract distances
  const distances = [];
  document.querySelectorAll('.field--type-distance .field__item, .destination-block .field__item, .distance-filter .field__item').forEach(el => {
    const txt = el.textContent?.replace(/\s+/g, ' ')?.trim();
    if (txt) distances.push(txt);
  });

  // Build description suffix
  let suffix = '';
  if (services.length > 0) {
    suffix += `\n\nServices:\n- ${services.join('\n- ')}`;
  }
  if (distances.length > 0) {
    suffix += `\n\nEntfernungen:\n- ${distances.join('\n- ')}`;
  }
  if (details['max. belegung']) {
    suffix += `\n\nMax. Belegung: ${details['max. belegung']}`;
  }

  if (description) {
    description += suffix;
  } else {
    description = suffix.trim() || null;
  }

  // 10. Furnished (default true for Berlinovo temporary apartments)
  const furnished = true;

  // 11. Pets Allowed
  const petsAllowed = false; // Berlinovo typically does not allow pets in temporary apartments

  // 12. Images (Only target main slider to avoid thumbnail duplicates)
  const rawImages = [];
  document.querySelectorAll('.slick--main img, .slick--optionset--gallery-main img').forEach(img => {
    const src = img.getAttribute('data-lazy') || img.getAttribute('src');
    if (src && !src.startsWith('data:') && !rawImages.includes(src)) {
      rawImages.push(src);
    }
  });

  // Fallback to general images block if main slider is empty
  if (rawImages.length === 0) {
    document.querySelectorAll('[class*="field-blocknode"][class*="field-images"] img, [class*="field--name-field-images"] img').forEach(img => {
      const src = img.getAttribute('data-lazy') || img.getAttribute('src');
      if (src && !src.startsWith('data:') && !rawImages.includes(src)) {
        rawImages.push(src);
      }
    });
  }

  const resolvedImages = rawImages.map(src => {
    if (src.startsWith('/')) {
      return window.location.origin + src;
    }
    return src;
  }).filter(src => {
    const lower = src.toLowerCase();
    if (lower.includes('banner') || lower.includes('logo') || lower.includes('favicon') || lower.includes('hero_slim')) {
      return false;
    }
    return true;
  });

  let coverImage = resolvedImages.length > 0 ? resolvedImages[0] : null;

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
    floor: null,
    availability,
    furnished,
    petsAllowed,
    originalListingUrl: url,
    listingId,
    sourcePlatform: 'berlinovo',
    coverImage,
    images: resolvedImages.slice(0, 10),
    description,
    utilityCosts,
    heatingCosts,
    additionalFees: finalCleaning ? [{ name: 'Endreinigung (einmalig)', price: finalCleaning }] : []
  };
}
