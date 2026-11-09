// Immowelt Extractor for WohnBoard Extension

function extractImmowelt() {
  const url = window.location.href;

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

  // 1. Title
  const title = document.querySelector('[data-testid="cdp-main-description-title"]')?.textContent?.trim() || 
                document.querySelector('[data-testid="cdp-hardfacts-title"]')?.textContent?.trim() || 
                document.title;

  // 2. Listing ID
  let listingId = null;
  const onlineIdEl = Array.from(document.querySelectorAll('b, span')).find(el => el.textContent.includes('Online-ID'));
  if (onlineIdEl && onlineIdEl.nextSibling) {
    listingId = onlineIdEl.nextSibling.textContent.replace(/:/g, '').trim();
  }
  if (!listingId) {
    const idMatch = url.match(/expose\/([a-zA-Z0-9]+)/);
    if (idMatch) listingId = idMatch[1];
  }

  // 3. Rent Prices (Cold & Warm)
  let coldRent = null;
  let warmRent = null;

  document.querySelectorAll('[data-testid="rent-price"]').forEach(el => {
    const label = el.textContent.toLowerCase();
    const valEl = el.querySelector('[data-testid*="value"]');
    if (valEl) {
      const val = parseCleanNumber(valEl.textContent);
      if (label.includes('kaltmiete')) {
        coldRent = val;
      } else if (label.includes('warmmiete')) {
        warmRent = val;
      }
    }
  });

  // Fallbacks for rent prices from Mietkosten details if not set
  let utilityCosts = null;
  let heatingCosts = null;
  let heatingCostsIncluded = false;
  let depositText = null;

  document.querySelectorAll('.css-umvut2, .css-nj8bdf, [class*="umvut2"], [class*="nj8bdf"]').forEach(row => {
    const text = row.textContent;
    if (text.includes('Nebenkosten')) {
      utilityCosts = parseCleanNumber(row.querySelector('.css-lxebfo, div, span')?.textContent);
    } else if (text.includes('Heizkosten')) {
      if (text.toLowerCase().includes('in warmmiete enthalten')) {
        heatingCostsIncluded = true;
      } else {
        heatingCosts = parseCleanNumber(row.querySelector('.css-lxebfo, div, span')?.textContent);
      }
    }
  });

  // Kaution / Deposit
  const kautionEl = Array.from(document.querySelectorAll('*')).find(el => el.textContent.trim() === 'Kaution');
  if (kautionEl) {
    const valEl = kautionEl.parentElement?.querySelector('.css-1nifwsu, [class*="1nifwsu"]');
    if (valEl) {
      depositText = valEl.textContent.trim();
    }
  }

  let deposit = null;
  if (depositText) {
    const match = depositText.match(/(\d+)\s*Nettokaltmiete/i);
    if (match && coldRent) {
      deposit = parseInt(match[1]) * coldRent;
    } else {
      deposit = parseCleanNumber(depositText);
    }
  }

  const rentPrice = warmRent || coldRent;

  // 4. Keyfacts (Rooms, Size, Floor, Availability)
  let rooms = 1;
  let squareMeters = null;
  let floor = null;
  let availability = null;

  document.querySelectorAll('[data-testid="cdp-hardfacts-keyfacts"] span, .css-pmfdtn span').forEach(span => {
    const text = span.textContent.trim();
    if (text.toLowerCase().includes('zimmer')) {
      rooms = parseCleanNumber(text) || 1;
    } else if (text.includes('m²')) {
      squareMeters = parseCleanNumber(text);
    } else if (text.toLowerCase().includes('geschoss') || text.toLowerCase().includes('etage') || text.toLowerCase().includes('og') || text.toLowerCase().includes('eg')) {
      floor = text.replace(/•/g, '').trim();
    } else if (text.toLowerCase().includes('frei ab') || text.toLowerCase().includes('sofort') || text.match(/\d{2}\.\d{2}\.\d{4}/)) {
      availability = text.replace(/•/g, '').trim();
    }
  });

  // 5. Address, City, ZipCode
  let address = null;
  let zipCode = null;
  let city = null;

  const addressEl = document.querySelector('[data-testid="cdp-location-address"] .css-wpv6zq, .css-1ytyjyb');
  if (addressEl) {
    const fullAddress = addressEl.textContent.trim();
    const parts = fullAddress.split(',');
    if (parts.length > 0) {
      address = parts[0].trim();
    }
    const zipMatch = fullAddress.match(/\((\d{5})\)/) || fullAddress.match(/(\d{5})/);
    if (zipMatch) {
      zipCode = zipMatch[1];
    }
    if (parts.length > 2) {
      city = parts[2].replace(/\(\d{5}\)/, '').replace(/\d{5}/, '').replace(/[()]/g, '').trim();
    } else if (parts.length > 1) {
      city = parts[1].replace(/\(\d{5}\)/, '').replace(/\d{5}/, '').replace(/[()]/g, '').trim();
    }
  }

  // 6. Description & Lage
  const descEl = document.querySelector('[data-testid="cdp-main-description-expandable-text"], .DescriptionTexts');
  const locEl = document.querySelector('[data-testid="cdp-location-description-expandable-text"]');
  const descriptionParts = [
    descEl ? descEl.textContent.trim() : null,
    locEl ? `Lage:\n${locEl.textContent.trim()}` : null
  ].filter(Boolean);
  const description = descriptionParts.join('\n\n') || null;

  // 7. Features & Furnished
  const features = [];
  document.querySelectorAll('.FeaturesPreview .css-qjxbdv, [data-testid="cdp-features"] .css-qjxbdv').forEach(el => {
    features.push(el.textContent.trim());
  });
  const furnished = features.some(f => f.toLowerCase().includes('möbliert') || f.toLowerCase().includes('einbauküche'));

  // 8. Bausubstanz und Energie
  const energyClass = document.querySelector('[data-testid="cdp-preview-scale-highlighted"], .css-e06dzv')?.textContent?.trim() || null;
  let constructionYear = null;
  let heatingType = null;
  let energySource = null;

  document.querySelectorAll('[data-testid="cdp-energy-features"] li, .css-rnqikx li').forEach(li => {
    const labelEl = li.querySelector('.css-2bd70b, span:nth-of-type(1)');
    const valEl = li.querySelector('.css-by4u4l, span:nth-of-type(2)');
    if (labelEl && valEl) {
      const label = labelEl.textContent.trim().toLowerCase();
      const val = valEl.textContent.trim();
      if (label.includes('baujahr')) {
        constructionYear = parseInt(val) || null;
      } else if (label.includes('heizungsart')) {
        heatingType = val;
      } else if (label.includes('energieträger')) {
        energySource = val;
      }
    }
  });

  // 9. Images
  const images = [];
  document.querySelectorAll('[data-testid="cdp-gallery"] img, .Gallery img, [id^="_r_g_-"]').forEach(img => {
    const src = img.src || img.getAttribute('data-src') || img.getAttribute('src');
    if (src && !src.startsWith('data:') && !images.includes(src)) {
      images.push(src);
    }
  });

  if (images.length === 0) {
    document.querySelectorAll('img').forEach(img => {
      const src = img.src || img.getAttribute('data-src');
      if (src && src.includes('immowelt.de/e/') && !images.includes(src)) {
        images.push(src);
      }
    });
  }

  // Use higher-res versions by replacing ?w=1024 or similar parameters if necessary
  const resolvedImages = images.map(src => {
    if (src.startsWith('/')) {
      return window.location.origin + src;
    }
    return src;
  });

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
    sourcePlatform: 'immowelt',
    coverImage: resolvedImages[0] || null,
    images: resolvedImages.slice(0, 10),
    description,
    energyClass,
    utilityCosts,
    heatingCostsIncluded,
    heatingCosts,
    constructionYear,
    heatingType,
    energySource
  };
}
