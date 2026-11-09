// Degewo Extractor for WohnBoard Extension

function extractDegewo() {
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
  let title = document.querySelector('h1.c-headline')?.textContent?.trim();
  if (!title) {
    title = document.title || 'Degewo Apartment';
  }

  // 2. Listing ID
  const bookmarkButton = document.querySelector('[data-openimmo-bookmark-item-uid]');
  let listingId = bookmarkButton ? bookmarkButton.getAttribute('data-openimmo-bookmark-item-uid') : null;
  if (!listingId) {
    const match = url.match(/details\/([a-zA-Z0-9-]+)/);
    if (match) listingId = match[1];
  }

  // 3. Extracted variables
  let warmRent = null;
  let coldRent = null;
  let utilityCosts = null;
  let heatingCosts = null;
  let deposit = null;
  let rooms = 1;
  let squareMeters = null;
  let availability = null;
  let floor = null;
  let constructionYear = null;

  // Scan hero box items
  document.querySelectorAll('.c-definition-list__item').forEach(item => {
    const dt = item.querySelector('dt');
    const dd = item.querySelector('dd');
    if (dt && dd) {
      const dtText = dt.textContent.trim().replace(/\s+/g, ' ');
      const ddText = dd.textContent.trim().replace(/\s+/g, ' ');

      if (ddText.toLowerCase().includes('warmmiete')) {
        warmRent = parseCleanNumber(dtText);
      } else if (ddText.toLowerCase().includes('zimmer')) {
        rooms = parseCleanNumber(dtText) || rooms;
      } else if (ddText.toLowerCase().includes('m²')) {
        squareMeters = parseCleanNumber(dtText);
      } else if (ddText.toLowerCase().includes('frei ab')) {
        availability = dtText;
      }
    }
  });

  // Scan detail table/list keys
  document.querySelectorAll('dt').forEach(dt => {
    const parent = dt.closest('.c-definition-list__item, div');
    if (parent) {
      const dd = parent.querySelector('dd');
      if (dd) {
        const key = dt.textContent.trim().replace(/\s+/g, ' ').toLowerCase();
        const val = dd.textContent.trim().replace(/\s+/g, ' ');

        if (key.includes('nettokaltmiete')) {
          coldRent = parseCleanNumber(val);
        } else if (key.includes('betriebskosten (kalt)')) {
          utilityCosts = parseCleanNumber(val);
        } else if (key.includes('betriebskosten (warm)')) {
          heatingCosts = parseCleanNumber(val);
        } else if (key.includes('kaution')) {
          if (val.toLowerCase().includes('drei') || val.toLowerCase().includes('3')) {
            deposit = 3;
          } else if (val.toLowerCase().includes('zwei') || val.toLowerCase().includes('2')) {
            deposit = 2;
          } else {
            const parsedDep = parseCleanNumber(val);
            if (parsedDep) deposit = parsedDep;
          }
        } else if (key.includes('zimmer')) {
          rooms = parseCleanNumber(val) || rooms;
        } else if (key.includes('wohnfläche')) {
          squareMeters = parseCleanNumber(val);
        } else if (key.includes('etage')) {
          floor = val;
        } else if (key.includes('baujahr')) {
          constructionYear = parseCleanNumber(val);
        }
      }
    }
  });

  // Resolve deposit multiplier
  if (deposit === 3 || deposit === 2) {
    if (coldRent) {
      deposit = Math.round((coldRent * deposit) * 10) / 10;
    } else {
      deposit = null;
    }
  }

  // 4. Address parsing
  let address = null;
  let zipCode = null;
  let city = null;
  const addressHeadline = Array.from(document.querySelectorAll('h3')).find(el => el.textContent.toLowerCase().includes('adresse:'));
  if (addressHeadline) {
    const rawAddress = addressHeadline.textContent.replace(/Adresse:\s*/i, '').trim();
    const parts = rawAddress.split(',').map(p => p.trim());
    if (parts.length > 0) address = parts[0];
    if (parts.length > 1) {
      const zipCityMatch = parts[parts.length - 1].match(/(\d{5})\s+(.*)/);
      if (zipCityMatch) {
        zipCode = zipCityMatch[1];
        city = zipCityMatch[2].trim();
      } else {
        city = parts[parts.length - 1];
      }
    }
  }

  // 5. Description
  const description = document.querySelector('article, main, [class*="description"], [class*="beschreibung"], #description, .description')?.textContent?.trim() || null;

  // 6. Furnished check
  const pageText = document.body.innerText.toLowerCase();
  const furnished = pageText.includes('möbliert') || pageText.includes('furnished') || pageText.includes('einbauküche') || pageText.includes('ebk');

  // 7. Images Extraction (from Swiper slides)
  const rawImages = [];
  document.querySelectorAll('.c-swiper__slide--main img.c-img').forEach(img => {
    let src = img.getAttribute('src') || img.src;
    if (src) {
      if (src.startsWith('/')) {
        src = window.location.origin + src;
      }
      if (!rawImages.includes(src)) {
        rawImages.push(src);
      }
    }
  });

  // Fallbacks for Swiper main container images
  if (rawImages.length === 0) {
    document.querySelectorAll('.c-swiper__container--main img').forEach(img => {
      let src = img.getAttribute('src') || img.src;
      if (src) {
        if (src.startsWith('/')) {
          src = window.location.origin + src;
        }
        if (!rawImages.includes(src)) {
          rawImages.push(src);
        }
      }
    });
  }

  const coverImage = rawImages.length > 0 ? rawImages[0] : null;

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
    floor,
    availability,
    furnished,
    petsAllowed: false,
    originalListingUrl: url,
    listingId,
    sourcePlatform: 'degewo',
    coverImage,
    images: rawImages.slice(0, 10),
    description,
    utilityCosts,
    heatingCosts,
    constructionYear
  };
}
