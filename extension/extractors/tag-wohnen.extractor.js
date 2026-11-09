// TAG Wohnen Extractor for WohnBoard Extension

function extractTagWohnen() {
  const url = window.location.href;

  function parseCleanNumber(text) {
    if (text === null || text === undefined) return null;
    if (typeof text === 'number') return text;
    if (typeof text !== 'string') text = String(text);
    
    let clean = text.replace(/m2/gi, '').replace(/m²/g, '').replace(/qm/gi, '').replace(/sqm/gi, '');
    clean = clean.replace(/ca\./gi, '').replace(/ca/gi, '');
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

  // Parse key-values from expose-stage__list-item, box-rent__list, and tables
  const details = {};

  document.querySelectorAll('.expose-stage__list-item, .box-rent__list dt').forEach(el => {
    const dt = el.querySelector('dt') || el;
    const dd = el.querySelector('dd') || (el.nextElementSibling && el.nextElementSibling.tagName === 'DD' ? el.nextElementSibling : null);
    if (dt && dd) {
      const key = dt.textContent.trim().toLowerCase();
      const val = dd.textContent.trim();
      details[key] = val;
    }
  });

  document.querySelectorAll('table tr').forEach(tr => {
    const th = tr.querySelector('th');
    const td = tr.querySelector('td');
    if (th && td) {
      const key = th.textContent.trim().toLowerCase();
      const val = td.textContent.trim();
      details[key] = val;
    }
  });

  // 1. Title
  let title = document.querySelector('.expose-header__headline h1, h1')?.textContent?.trim();
  if (!title) {
    title = document.title || 'TAG Wohnen Listing';
  }

  // 2. Listing ID
  let listingId = details['objekt id'] || null;
  if (!listingId) {
    const idMatch = url.match(/object_id=([^&]+)/) || url.match(/\/expose\/([^?#]+)/);
    if (idMatch) {
      listingId = decodeURIComponent(idMatch[1]);
    }
  }

  // 3. Costs
  const coldRent = parseCleanNumber(details['nettokaltmiete'] || details['kaltmiete']);
  const warmRent = parseCleanNumber(details['gesamtmiete'] || details['warmmiete']);
  const rentPrice = warmRent || coldRent;
  const utilityCosts = parseCleanNumber(details['nebenkosten']);
  const heatingCosts = parseCleanNumber(details['heizkosten']);

  let deposit = null;
  const depositText = details['kaution'];
  if (depositText) {
    const numericDep = parseCleanNumber(depositText);
    if (numericDep !== null) {
      deposit = numericDep;
    } else {
      const match = depositText.match(/(\d+)\s*(?:x|kaltmiete|nettokaltmiete|miete|monatsmiete)/i);
      if (match && coldRent) {
        deposit = parseInt(match[1]) * coldRent;
      }
    }
  }

  // 4. Basic Specs
  const rooms = parseCleanNumber(details['zimmer']) || 1;
  const squareMeters = parseCleanNumber(details['wohnfläche'] || details['größe']);
  const availability = details['verfügbarkeit'] || null;
  const floor = details['etage'] || null;

  // 5. Address / City / ZipCode
  let address = null;
  let city = null;
  let zipCode = null;

  const kickerEl = document.querySelector('.expose-header__kicker');
  if (kickerEl) {
    const text = kickerEl.textContent.replace(/[\r\n\t]+/g, ' ').trim();
    const match = text.match(/^(.*?),\s*(\d{5})\s+(.*)$/);
    if (match) {
      address = match[1].trim();
      zipCode = match[2].trim();
      city = match[3].trim();
    } else {
      address = text;
    }
  }

  if (!address) {
    document.querySelectorAll('.article-content__block').forEach(el => {
      const headline = el.querySelector('h2');
      if (headline && headline.textContent.toLowerCase().includes('lage')) {
        const pEl = el.querySelector('p');
        if (pEl) {
          const parts = pEl.innerHTML.split(/<br\s*\/?>/i);
          if (parts.length >= 2) {
            address = parts[0].replace(/<[^>]*>/g, '').trim();
            const cityPart = parts[1].replace(/<[^>]*>/g, '').trim();
            const zipMatch = cityPart.match(/^(\d{5})\s+(.*)$/);
            if (zipMatch) {
              zipCode = zipMatch[1];
              city = zipMatch[2];
            } else {
              city = cityPart;
            }
          }
        }
      }
    });
  }

  // 6. Furnished & Pets Allowed
  const pageText = (document.body.textContent || '').toLowerCase();
  let furnished = false;
  if (pageText.includes('möbliert') || pageText.includes('einbauküche') || pageText.includes('ebk')) {
    furnished = true;
  }
  
  let petsAllowed = null;
  if (pageText.includes('haustiere erlaubt') || pageText.includes('tierhaltung erlaubt') || pageText.includes('hunde erlaubt')) {
    petsAllowed = true;
  } else if (pageText.includes('keine haustiere') || pageText.includes('tierhaltung nicht gestattet') || pageText.includes('hunde nicht erlaubt') || pageText.includes('keine hundehaltung')) {
    petsAllowed = false;
  }

  // 7. Images
  const rawImages = [];
  document.querySelectorAll('.gallery__slider-thumb, .gallery__slider-item a.figure__media').forEach(el => {
    const href = el.getAttribute('href');
    if (href && href.startsWith('http') && !rawImages.includes(href)) {
      rawImages.push(href);
    }
  });

  if (rawImages.length === 0) {
    document.querySelectorAll('.gallery img, .expose-stage__gallery img').forEach(img => {
      const src = img.getAttribute('src') || img.getAttribute('data-src');
      if (src && src.startsWith('http') && !rawImages.includes(src)) {
        rawImages.push(src);
      }
    });
  }

  const coverImage = rawImages.length > 0 ? rawImages[0] : null;

  // 8. Description
  const descParts = [];
  document.querySelectorAll('.article-content__block--text .text p, .article-content__block--text p').forEach(el => {
    const text = el.textContent.trim();
    if (text) {
      descParts.push(text);
    }
  });
  const description = descParts.join('\n\n') || null;

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
    sourcePlatform: 'tag-wohnen',
    coverImage,
    images: rawImages.slice(0, 10),
    description,
    utilityCosts,
    heatingCosts
  };
}
