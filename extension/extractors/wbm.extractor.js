// WBM Extractor for WohnBoard Extension

function extractWbm() {
  const url = window.location.href;

  function parseCleanNumber(text) {
    if (text === null || text === undefined) return null;
    if (typeof text === 'number') return text;
    if (typeof text !== 'string') text = String(text);
    let clean = text.replace(/ca\./gi, '').replace(/ca/gi, '');
    clean = clean.replace(/[^0-9,.-]/g, '').trim();
    if (!clean) return null;

    // Remove leading/trailing dots/commas
    clean = clean.replace(/^[.,]+|[.,]+$/g, '');

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
  let title = document.querySelector('.openimmo-detail__title')?.textContent?.trim();
  if (!title) {
    title = document.title || 'WBM Apartment';
  }

  // 2. Address & City & ZipCode
  const addressText = document.querySelector('.openimmo-detail__intro-address')?.textContent?.trim();
  let address = null;
  let zipCode = null;
  let city = null;

  if (addressText) {
    const parts = addressText.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      address = parts[0];
    }
    if (parts.length > 1) {
      const zipCityMatch = parts[1].match(/(\d{5})\s+(.*)/);
      if (zipCityMatch) {
        zipCode = zipCityMatch[1];
        city = zipCityMatch[2].trim();
      } else {
        city = parts[1];
      }
    }
  }

  // 3. Description
  const description = document.querySelector('.openimmo-detail__intro-text')?.textContent?.trim() || '';

  // 4. Costs
  let coldRent = null;
  let utilityCosts = null;
  let warmRent = null;
  document.querySelectorAll('.openimmo-detail__rental-costs-list-item').forEach(item => {
    const titleEl = item.querySelector('.openimmo-detail__rental-costs-list-item-title');
    const valueEl = item.querySelector('.openimmo-detail__rental-costs-list-item-value');
    if (titleEl && valueEl) {
      const text = titleEl.textContent.trim().toLowerCase();
      const val = parseCleanNumber(valueEl.textContent);
      if (text.includes('kaltmiete') || text.includes('nettokaltmiete')) {
        coldRent = val;
      } else if (text.includes('nebenkosten')) {
        utilityCosts = val;
      } else if (text.includes('warmmiete') || text.includes('bruttowarmmiete')) {
        warmRent = val;
      }
    }
  });

  const rentPrice = warmRent || coldRent;

  // 5. Deposit
  let deposit = null;
  const depositText = document.querySelector('.openimmo-detail__rental-costs-deposit')?.textContent?.trim();
  if (depositText) {
    let match = depositText.match(/([\d,.]+)\s*(?:EUR|€)/i);
    if (match) {
      deposit = parseCleanNumber(match[1]);
    } else {
      const mietenMatch = depositText.match(/(\d+)\s*(?:Monatsmieten|Mieten|Nettokaltmieten|Nettomieten)/i);
      if (mietenMatch && coldRent) {
        deposit = coldRent * parseInt(mietenMatch[1], 10);
      }
    }
  }

  // 6. Object Details
  let rooms = 1;
  let squareMeters = null;
  let floor = null;
  let listingId = null;
  let availability = null;

  document.querySelectorAll('.openimmo-detail__object-list-item').forEach(item => {
    const span = item.querySelector('span');
    if (span) {
      const label = span.textContent.trim().toLowerCase();
      const value = item.textContent.replace(span.textContent, '').trim();

      if (label.includes('zimmer')) {
        rooms = parseCleanNumber(value) || 1;
      } else if (label.includes('größe') || label.includes('wohnfläche')) {
        squareMeters = parseCleanNumber(value);
      } else if (label.includes('etage')) {
        floor = value;
      } else if (label.includes('objektnummer')) {
        listingId = value;
      } else if (label.includes('bezugsfertig') || label.includes('verfügbar')) {
        availability = value;
      }
    }
  });

  // 7. Energiekennzahlen
  let constructionYear = null;
  let heatingType = null;
  document.querySelectorAll('.openimmo-detail__energy-indicators-list-item').forEach(item => {
    const span = item.querySelector('span');
    if (span) {
      const label = span.textContent.trim().toLowerCase();
      const value = item.textContent.replace(span.textContent, '').trim();
      if (label.includes('baujahr')) {
        constructionYear = parseCleanNumber(value);
      } else if (label.includes('heizungsart')) {
        heatingType = value;
      }
    }
  });

  // 8. Furnished
  let furnished = false;
  document.querySelectorAll('.openimmo-detail__features-list-item').forEach(item => {
    const text = item.textContent.toLowerCase();
    if (text.includes('einbauküche') || text.includes('möbliert') || text.includes('furnished')) {
      furnished = true;
    }
  });
  if (!furnished && description.toLowerCase().includes('einbauküche')) {
    furnished = true;
  }

  // 9. Pets Allowed
  const petsAllowed = description.toLowerCase().includes('haustiere erlaubt') || description.toLowerCase().includes('pets allowed');

  // 10. Images
  const rawImages = [];
  function normalizeUrl(src) {
    if (!src) return null;
    if (src.startsWith('/')) {
      return window.location.origin + src;
    }
    return src;
  }

  document.querySelectorAll('.openimmo-detail__image-container img, .openimmo-detail__intro-image-container img, .openimmo-detail__layout img, .openimmo-detail__more-images-images img').forEach(img => {
    const src = img.getAttribute('src') || img.getAttribute('data-src');
    if (src) {
      const fullUrl = normalizeUrl(src);
      if (fullUrl && !rawImages.includes(fullUrl)) {
        rawImages.push(fullUrl);
      }
    }
  });

  const coverImage = rawImages.length > 0 ? rawImages[0] : null;

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
    sourcePlatform: 'wbm',
    coverImage,
    images: rawImages.slice(0, 10),
    description,
    utilityCosts,
    heatingCosts: null,
    heatingType,
    constructionYear
  };
}
