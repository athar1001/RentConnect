// Kleinanzeigen Extractor for WohnBoard Extension

function extractKleinanzeigen() {
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

  // 1. ID
  let listingId = null;
  const idBox = document.querySelector('#viewad-ad-id-box');
  if (idBox) {
    const listItems = idBox.querySelectorAll('li');
    if (listItems.length >= 2) {
      listingId = listItems[1].textContent.trim();
    }
  }
  if (!listingId) {
    const idMatch = url.match(/\/(\d+)-\d+-\d+/);
    if (idMatch) {
      listingId = idMatch[1];
    }
  }

  // 2. Title
  let title = document.querySelector('h1#viewad-title, h1.headline')?.textContent?.trim();
  if (!title) {
    title = document.title || 'Kleinanzeigen Listing';
  }
  title = title.replace(/^(?:Reserviert •\s*|Gelöscht •\s*)+/gi, '').trim();

  // 3. Details scan
  const details = {};
  document.querySelectorAll('.addetailslist--detail, .addetails-list--item, [class*="addetails-list"] li, [class*="addetailslist"] li').forEach(li => {
    const valEl = li.querySelector('.addetailslist--detail--value, .addetails-list--item--value, [class*="value"]');
    if (valEl) {
      const val = valEl.textContent.trim().replace(/\s+/g, ' ');
      const key = li.textContent.replace(valEl.textContent, '').trim().replace(/\s+/g, ' ').replace(/:/g, '');
      if (key && val) {
        details[key.toLowerCase()] = val;
      }
    }
  });

  // 4. Main Price
  const mainPriceEl = document.querySelector('#viewad-price, .boxedarticle--price');
  const mainPrice = mainPriceEl ? parseCleanNumber(mainPriceEl.textContent) : null;

  // 5. Costs
  let coldRent = parseCleanNumber(details['kaltmiete'] || details['nettokaltmiete']);
  let warmRent = parseCleanNumber(details['warmmiete'] || details['gesamtmiete']);
  let deposit = parseCleanNumber(details['kaution'] || details['kaution / genoss.-anteile'] || details['mietkaution']);
  let rooms = parseCleanNumber(details['zimmer']);
  let squareMeters = parseCleanNumber(details['wohnfläche'] || details['größe']);
  let floor = details['etage'] || details['stock'] || null;
  let availability = details['verfügbar ab'] || details['bezugsfrei ab'] || null;

  if (mainPrice) {
    if (!coldRent && !warmRent) {
      const priceText = mainPriceEl.textContent.toLowerCase();
      if (priceText.includes('kalt')) {
        coldRent = mainPrice;
      } else {
        warmRent = mainPrice;
      }
    } else if (warmRent && !coldRent && mainPrice < warmRent) {
      coldRent = mainPrice;
    } else if (coldRent && !warmRent && mainPrice > coldRent) {
      warmRent = mainPrice;
    } else if (!coldRent && !warmRent) {
      warmRent = mainPrice;
    }
  }

  if (!warmRent && coldRent) {
    warmRent = coldRent;
  }
  const rentPrice = warmRent || coldRent;

  // 6. Address
  let address = null;
  let city = null;
  let zipCode = null;

  const streetEl = document.querySelector('#street-address, [itemprop="streetAddress"]');
  const localityEl = document.querySelector('#viewad-locality, [itemprop="addressLocality"]');

  if (streetEl) {
    address = streetEl.textContent.trim().replace(/^[,\s-]+|[,\s-]+$/g, '');
  }

  if (localityEl) {
    const localityText = localityEl.textContent.trim();
    const zipCityMatch = localityText.match(/(\d{5})\s+([^,-]+)/);
    if (zipCityMatch) {
      zipCode = zipCityMatch[1];
      city = zipCityMatch[2].trim();
      const rest = localityText.replace(zipCityMatch[0], '').trim().replace(/^[,\s-]+|[,\s-]+$/g, '');
      if (rest) {
        address = address ? `${address}, ${rest}` : rest;
      }
    } else {
      city = localityText;
    }
  }

  if (!address && localityEl) {
    address = localityEl.textContent.trim();
  }

  // 7. Description
  const descEl = document.querySelector('#viewad-description-text, [class*="description"], #description');
  const description = descEl ? (descEl.innerText || descEl.textContent || '').trim() : null;

  // 8. Features & Furnished & Pets
  const pageText = (document.body.textContent || document.body.innerText || '').toLowerCase();
  const furnished = pageText.includes('möbliert') || pageText.includes('furnished') || pageText.includes('einbauküche');
  let petsAllowed = false;
  if (pageText.includes('haustiere erlaubt') || pageText.includes('tierhaltung gestattet') || pageText.includes('pets allowed')) {
    petsAllowed = true;
  } else if (pageText.includes('keine haustiere') || pageText.includes('ohne haustiere') || pageText.includes('haustiere nicht erlaubt') || pageText.includes('tierhaltung nicht gestattet') || pageText.includes('no pets')) {
    petsAllowed = false;
  }

  // 9. Images
  const rawImages = [];
  document.querySelectorAll('.galleryimage-element img, #viewad-image, .imagebox-thumbnail img').forEach(img => {
    const src = img.getAttribute('src') || img.getAttribute('data-imgsrc') || img.getAttribute('data-src');
    if (src) {
      let cleanSrc = src;
      if (cleanSrc.includes('?')) {
        try {
          const urlObj = new URL(cleanSrc, window.location.origin);
          const rule = urlObj.searchParams.get('rule');
          if (rule) {
            urlObj.searchParams.set('rule', '$_59.JPG');
          }
          cleanSrc = urlObj.toString();
        } catch (e) {}
      }
      if (!rawImages.includes(cleanSrc)) {
        rawImages.push(cleanSrc);
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
    sourcePlatform: 'kleinanzeigen',
    coverImage,
    images: rawImages.slice(0, 10),
    description,
    utilityCosts: null,
    heatingCosts: null
  };
}
