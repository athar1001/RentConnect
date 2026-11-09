// Grand City Property Extractor for WohnBoard Extension

function extractGrandCityProperty() {
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

  // Try to parse JSON-LD first
  let ldJson = null;
  const scriptEl = document.querySelector('script[type="application/ld+json"]');
  if (scriptEl) {
    try {
      let rawText = scriptEl.textContent || '';
      if (rawText.includes('&')) {
        const txtEl = document.createElement('textarea');
        txtEl.innerHTML = rawText;
        rawText = txtEl.value;
      }
      const sanitized = rawText.replace(/[\n\r\t]+/g, ' ');
      ldJson = JSON.parse(sanitized);
    } catch (e) {
      console.error("Failed to parse JSON-LD", e);
    }
  }

  // 1. Title
  let title = document.querySelector('.real-estate-detail-section h1')?.textContent?.trim() ||
              document.querySelector('h1')?.textContent?.trim();
  if (!title && ldJson && ldJson.name) {
    title = ldJson.name.replace(/\s+/g, ' ').trim();
  }
  if (!title) {
    title = document.title || 'Grand City Property';
  }

  // 2. Costs parsing
  let coldRent = null;
  let warmRent = null;
  let deposit = null;
  let utilityCosts = null;
  let heatingCosts = null;

  document.querySelectorAll('.real-estate-detail-section .details li, .real-estate-detail-section .details ul li').forEach(li => {
    const labelEl = li.querySelector('.col-7 label, .col-7, .col-4');
    const valueEl = li.querySelector('.col-5, .col-8');
    if (labelEl && valueEl) {
      const labelText = labelEl.textContent.trim().toLowerCase();
      const valText = valueEl.textContent.trim();
      if (labelText.includes('kaltmiete')) {
        coldRent = parseCleanNumber(valText);
      } else if (labelText.includes('gesamtmiete') || labelText.includes('gesamt')) {
        warmRent = parseCleanNumber(valText);
      } else if (labelText.includes('kaution')) {
        deposit = parseCleanNumber(valText);
      } else if (labelText.includes('nebenkosten')) {
        utilityCosts = parseCleanNumber(valText);
      } else if (labelText.includes('heizkosten')) {
        heatingCosts = parseCleanNumber(valText);
      }
    }
  });

  // Fallback for coldRent if found in header price
  if (!coldRent) {
    const priceEl = document.querySelector('.featured_slick_gallery .price');
    if (priceEl) {
      const clone = priceEl.cloneNode(true);
      const span = clone.querySelector('span');
      if (span) span.remove();
      coldRent = parseCleanNumber(clone.textContent);
    }
  }

  const rentPrice = warmRent || coldRent;

  // 3. Rooms and SquareMeters
  let rooms = null;
  let squareMeters = null;
  let floor = null;
  const features = [];

  document.querySelectorAll('.additionals .additional').forEach(el => {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    features.push(text);
    
    if (text.toLowerCase().includes('zimmer')) {
      const match = text.match(/([\d,.]+)\s*zimmer/i);
      rooms = match ? parseCleanNumber(match[1]) : parseCleanNumber(text);
    } else if (text.toLowerCase().includes('fläche') || text.toLowerCase().includes('m²') || text.toLowerCase().includes('m2')) {
      const match = text.match(/([\d,.]+)\s*(?:m²|m2|fläche)/i);
      squareMeters = match ? parseCleanNumber(match[1]) : parseCleanNumber(text);
    } else if (text.toLowerCase().includes('stock') || text.toLowerCase().includes('etage') || text.toLowerCase().includes('obergeschoss')) {
      floor = text;
    }
  });

  // Fallback / refine rooms and squareMeters from JSON-LD
  if (ldJson) {
    if (!rooms && ldJson.numberOfRooms) {
      rooms = parseCleanNumber(ldJson.numberOfRooms);
    }
    if (!squareMeters && ldJson.floorSize && ldJson.floorSize.value) {
      squareMeters = parseCleanNumber(ldJson.floorSize.value);
    }
  }

  // Ensure fallback default for rooms
  if (!rooms) rooms = 1;

  // 4. Address parsing
  let address = null;
  let zipCode = null;
  let city = null;

  if (ldJson && ldJson.address) {
    city = ldJson.address.addressLocality || null;
    zipCode = ldJson.address.postalCode || null;
    address = ldJson.address.streetAddress || null;
  }

  // Fallback / refine street address from DOM
  const locationEl = document.querySelector('.infos .info');
  if (locationEl) {
    const locText = locationEl.textContent.replace('Auf Karte anzeigen', '').trim();
    const parts = locText.split(',').map(p => p.trim());
    if (parts.length > 0 && parts[0]) {
      address = parts[0];
    }
    if (!city && parts.length > 1 && parts[1]) {
      city = parts[1];
    }
  }

  // 5. Listing ID
  let listingId = null;
  if (ldJson && ldJson.sku) {
    listingId = ldJson.sku;
  }
  if (!listingId) {
    document.querySelectorAll('.real-estate-detail-section .details li, .real-estate-detail-section .details ul li').forEach(li => {
      const labelEl = li.querySelector('.col-6');
      const valueEl = li.querySelector('.col-6.text-right, .col-6.adjusttext');
      if (labelEl && valueEl) {
        const labelText = labelEl.textContent.trim().toLowerCase();
        if (labelText.includes('objekt id') || labelText.includes('id')) {
          listingId = valueEl.textContent.trim();
        }
      }
    });
  }

  // 6. Availability and Baujahr (constructionYear)
  let availability = null;
  document.querySelectorAll('.infos .info').forEach(info => {
    if (info.textContent.toLowerCase().includes('verfügbar ab')) {
      availability = info.textContent.replace(/Verfügbar ab:/i, '').trim();
    }
  });

  let constructionYear = null;
  document.querySelectorAll('.real-estate-detail-section .details li, .real-estate-detail-section .details ul li').forEach(li => {
    const labelEl = li.querySelector('.col-6');
    const valueEl = li.querySelector('.col-6.text-right, .col-6.adjusttext');
    if (labelEl && valueEl) {
      const labelText = labelEl.textContent.trim().toLowerCase();
      if (labelText.includes('baujahr')) {
        constructionYear = parseCleanNumber(valueEl.textContent);
      }
    }
  });

  // 7. Furnished and Pets Allowed
  const furnished = features.some(f => f.toLowerCase().includes('ebk') || f.toLowerCase().includes('einbauküche') || f.toLowerCase().includes('möbliert'));
  const petsAllowed = features.some(f => f.toLowerCase().includes('haustier') || f.toLowerCase().includes('tierhaltung') || f.toLowerCase().includes('hund'));

  // 8. Description
  let description = null;
  document.querySelectorAll('.real-estate-detail-section .content').forEach(content => {
    const h2 = content.querySelector('h2');
    if (h2 && h2.textContent.toLowerCase().includes('objektbeschreibung')) {
      const p = content.querySelector('p');
      if (p) {
        description = p.textContent.trim();
      }
    }
  });
  if (!description && ldJson && ldJson.description) {
    if (Array.isArray(ldJson.description)) {
      description = ldJson.description.join(', ').trim();
    } else if (typeof ldJson.description === 'string') {
      description = ldJson.description.trim();
    }
  }

  // 9. Images
  const rawImages = [];

  // Check slick slider images
  document.querySelectorAll('.real-estate-detail-slide img.img-fluid').forEach(img => {
    const src = img.getAttribute('src');
    if (src && !rawImages.includes(src)) {
      rawImages.push(src);
    }
  });

  // Check fullscreen gallery
  document.querySelectorAll('.sp-slides img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && !rawImages.includes(src)) {
      rawImages.push(src);
    }
  });

  // Resolve relative paths and filter out advertising/trust/logo images
  const resolvedImages = rawImages
    .map(src => {
      if (src.startsWith('/')) {
        return window.location.origin + src;
      }
      return src;
    })
    .filter(src => {
      const lower = src.toLowerCase();
      if (lower.includes('service-app') || lower.includes('gcp%20service') || lower.includes('gcp-service') || lower.includes('favicon') || lower.includes('logo')) {
        return false;
      }
      return true;
    });

  // Extract cover image
  let coverImage = null;
  if (resolvedImages.length > 0) {
    coverImage = resolvedImages.find(img => !img.toLowerCase().includes('grundriss') && !img.toLowerCase().includes('plan')) || resolvedImages[0];
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
    petsAllowed,
    originalListingUrl: url,
    listingId,
    sourcePlatform: 'grandcityproperty',
    coverImage,
    images: resolvedImages.slice(0, 10),
    description,
    utilityCosts,
    heatingCosts,
    constructionYear
  };
}
