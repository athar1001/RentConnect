// Stadt und Land Extractor for WohnBoard Extension

function extractStadtUndLand() {
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
  let title = document.querySelector('#printArea h1')?.textContent?.trim() ||
              document.querySelector('h1')?.textContent?.trim();
  if (!title) {
    title = document.title || 'Stadt und Land Apartment';
  }

  // 2. Parse details table
  let listingId = null;
  let address = null;
  let availability = null;
  let squareMeters = null;
  let rooms = null;
  let floor = null;
  let coldRent = null;
  let utilityCosts = null;
  let heatingCosts = null;
  let warmRent = null;
  let deposit = null;
  let heatingType = null;
  let constructionYear = null;
  let energyClass = null;
  let detailsText = '';

  const tableRows = document.querySelectorAll('.ImmoDetail_tableWrapper__6mtVl tr, table tr');
  tableRows.forEach(row => {
    const labelEl = row.querySelector('th');
    const valueEl = row.querySelector('td');
    if (labelEl && valueEl) {
      const label = labelEl.textContent.trim().toLowerCase();
      const value = valueEl.textContent.trim();

      if (label.includes('objekt-nr.')) {
        listingId = value;
      } else if (label.includes('adresse')) {
        address = value;
      } else if (label.includes('verfügbar ab')) {
        availability = value;
      } else if (label.includes('wohnfläche')) {
        squareMeters = parseCleanNumber(value.split('/')[0]);
      } else if (label.includes('zimmer')) {
        rooms = parseCleanNumber(value);
      } else if (label.includes('etage')) {
        floor = value;
      } else if (label.includes('kaltmiete')) {
        coldRent = parseCleanNumber(value);
      } else if (label.includes('nebenkosten')) {
        utilityCosts = parseCleanNumber(value);
      } else if (label.includes('heizkosten')) {
        heatingCosts = parseCleanNumber(value);
      } else if (label.includes('gesamtmiete')) {
        warmRent = parseCleanNumber(value);
      } else if (label.includes('kaution')) {
        deposit = parseCleanNumber(value);
      } else if (label.includes('heizungsart')) {
        heatingType = value;
      } else if (label.includes('baujahr')) {
        constructionYear = parseCleanNumber(value);
      } else if (label.includes('energieeffizienzklasse')) {
        const img = valueEl.querySelector('img');
        if (img) {
          const alt = img.getAttribute('alt') || '';
          const match = alt.match(/klasse\s*([A-H\+]+)/i);
          energyClass = match ? match[1] : alt.replace(/Energieklasse\s*/i, '').trim();
        }
      } else if (label.includes('ausstattung')) {
        detailsText = value;
      }
    }
  });

  const rentPrice = warmRent || coldRent;

  // Split address: Lily-Braun-Str. 13, 12619 Berlin
  let zipCode = null;
  let city = null;
  if (address) {
    const parts = address.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      const zipCityMatch = parts[1].match(/(\d{5})\s+(.*)/);
      if (zipCityMatch) {
        zipCode = zipCityMatch[1];
        city = zipCityMatch[2].trim();
      } else {
        city = parts[1];
      }
      address = parts[0];
    }
  }

  // 3. Fallback for address/city/zip from introText
  if (!address) {
    const introEl = document.querySelector('.introText');
    if (introEl) {
      const text = introEl.textContent.trim();
      const parts = text.split(',').map(p => p.trim()).filter(Boolean);
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
  }

  // 4. Description & Location
  let description = '';
  const descHeader = Array.from(document.querySelectorAll('h2')).find(el => el.textContent.includes('Beschreibung'));
  if (descHeader) {
    let next = descHeader.nextElementSibling;
    while (next && next.tagName !== 'H2') {
      description += next.textContent.trim() + ' ';
      next = next.nextElementSibling;
    }
  }
  
  const locHeader = Array.from(document.querySelectorAll('h2')).find(el => el.textContent.includes('Lage'));
  if (locHeader) {
    let next = locHeader.nextElementSibling;
    while (next && next.tagName !== 'H2') {
      description += '\nLage: ' + next.textContent.trim();
      next = next.nextElementSibling;
    }
  }

  description = description.trim();
  if (!description) {
    description = document.querySelector('.ImmoDetail_locationContainer__BsvAW')?.textContent || '';
  }

  // 5. Furnished & Pets Allowed
  let furnished = false;
  if (detailsText.toLowerCase().includes('einbauküche') || detailsText.toLowerCase().includes('ebk') || description.toLowerCase().includes('einbauküche')) {
    furnished = true;
  }
  let petsAllowed = false;

  // 6. Images
  const rawImages = [];
  
  function decodeNextImageUrl(src) {
    if (!src) return null;
    if (src.includes('/_next/image') && src.includes('url=')) {
      try {
        const search = src.split('?')[1];
        const params = new URLSearchParams(search);
        const targetUrl = params.get('url');
        if (targetUrl) {
          return decodeURIComponent(targetUrl);
        }
      } catch (e) {
        // Fallback
      }
    }
    if (src.startsWith('/')) {
      return window.location.origin + src;
    }
    return src;
  }

  document.querySelectorAll('.MiniGallery_miniGallery__LAZoW img, .MiniGallery_grid__Ta0ts img').forEach(img => {
    const src = img.getAttribute('src') || img.getAttribute('data-src');
    if (src) {
      const decoded = decodeNextImageUrl(src);
      if (decoded && !rawImages.includes(decoded)) {
        rawImages.push(decoded);
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
    rooms: rooms || 1,
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
    sourcePlatform: 'stadtundland',
    coverImage,
    images: rawImages.slice(0, 10),
    description,
    utilityCosts,
    heatingCosts,
    heatingType,
    constructionYear,
    energyClass
  };
}
