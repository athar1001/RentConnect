// Spotahome Extractor for WohnBoard Extension

function extractSpotahome() {
  const url = window.location.href;

  function parseCleanNumber(text) {
    if (text === null || text === undefined) return null;
    if (typeof text === 'number') return text;
    if (typeof text !== 'string') text = String(text);
    
    // Strip unit names and common words that might contain numbers (e.g. m2 contains digit 2)
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

  // 1. Title
  let title = document.querySelector('h1.simplified-property-title__heading, h1')?.textContent?.trim();
  if (!title) {
    title = document.title || 'Spotahome Listing';
  }

  // 2. Listing ID
  let listingId = null;
  const idMatch = url.match(/(?:for-rent|apartments|rooms|studios|flats)\/[^/]+\/(\d+)/) || url.match(/\/(\d+)(?:\.html)?$/) || url.match(/-(\d+)$/);
  if (idMatch) {
    listingId = idMatch[1];
  }

  // 3. Size and Rooms from details
  let rooms = 1;
  let squareMeters = null;

  document.querySelectorAll('.property-description-item').forEach(el => {
    const text = el.textContent.toLowerCase();
    const valueSpan = el.querySelector('.property-description-item__value');
    if (valueSpan) {
      const val = parseFloat(valueSpan.textContent.trim());
      if (!isNaN(val)) {
        if (text.includes('room') && !text.includes('bathroom') && !text.includes('bedroom')) {
          rooms = val;
        } else if (text.includes('bedroom')) {
          rooms = val;
        }
      }
    }
  });

  document.querySelectorAll('.property-description-item, ._chip_1ae7a_183, .listing-chips-container__tag').forEach(el => {
    const text = el.textContent.toLowerCase();
    if (text.includes('m2') || text.includes('m²')) {
      const valEl = el.querySelector('.property-description-item__value, ._chip__label_1ae7a_257');
      const valText = valEl ? valEl.textContent : el.textContent;
      const num = parseCleanNumber(valText);
      if (num) {
        squareMeters = num;
      }
    }
  });

  // 4. Rent / Price
  let rentPrice = null;
  const rentEl = document.querySelector('.listing-payments-module__price-amount, [data-test="price"], [data-cy="price"]');
  if (rentEl) {
    rentPrice = parseCleanNumber(rentEl.textContent);
  }
  
  if (!rentPrice) {
    document.querySelectorAll('.list-row, tr, li').forEach(el => {
      const text = el.textContent.toLowerCase();
      if (text.includes('monthly rent') || text.includes('rent') || text.includes('miete')) {
        const valEl = el.querySelector('.listing-payments-module__price-amount, td, span, p:last-child');
        if (valEl) {
          const val = parseCleanNumber(valEl.textContent);
          if (val && !rentPrice) {
            rentPrice = val;
          }
        }
      }
    });
  }

  const warmRent = rentPrice;
  const coldRent = null;

  // 5. Deposit
  let deposit = null;
  let noDeposit = false;
  document.querySelectorAll('.listing-label-item, ._booknow-card-features__item').forEach(el => {
    const titleEl = el.querySelector('.listing-label-item__title, ._booknow-card-features__item-title');
    if (titleEl) {
      const text = titleEl.textContent.toLowerCase();
      if (text.includes('no deposit') || text.includes('deposit-free')) {
        noDeposit = true;
        deposit = 0;
      }
    }
  });

  if (!noDeposit) {
    const pageText = (document.body.textContent || '').toLowerCase();
    const depositMatch = pageText.match(/deposit\s*:\s*€?\s*(\d+)/i) || pageText.match(/kaution\s*:\s*€?\s*(\d+)/i) || pageText.match(/deposit\s*(?:of|is)\s*€?\s*(\d+)/i);
    if (depositMatch) {
      deposit = parseCleanNumber(depositMatch[1]);
    }
  }

  // 6. Address & City & ZipCode
  let address = null;
  let city = null;
  let zipCode = null;

  const breadcrumbItems = document.querySelectorAll('._search-breadcrumbs_1bqp5_183 [itemprop="name"], .listing__breadcrumb [itemprop="name"]');
  if (breadcrumbItems.length > 0) {
    const lastItemText = breadcrumbItems[breadcrumbItems.length - 1].textContent.trim();
    if (lastItemText.toLowerCase().includes('in ')) {
      address = lastItemText.replace(/^Apartment in\s+/i, '').replace(/^Room in\s+/i, '').replace(/^Property in\s+/i, '').trim();
    }
    if (breadcrumbItems.length >= 2) {
      city = breadcrumbItems[1].textContent.trim();
    }
  }

  if (!city) {
    const titleText = title.toLowerCase();
    const cities = ['berlin', 'münchen', 'munich', 'hamburg', 'köln', 'cologne', 'frankfurt', 'düsseldorf', 'stuttgart'];
    for (const c of cities) {
      if (titleText.includes(c)) {
        city = c.charAt(0).toUpperCase() + c.slice(1);
        break;
      }
    }
  }

  if (!address) {
    const titleText = title;
    const inMatch = titleText.match(/in\s+([^,]+)/i);
    if (inMatch) {
      address = inMatch[1].trim();
    }
  }

  if (address) {
    address = address.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // 7. Availability
  let availability = null;
  document.querySelectorAll('.list-row').forEach(el => {
    const rowEl = el.querySelector('.listing-availabilities-structured__row');
    const valEl = el.querySelector('.listing-availabilities-structured__row--bold');
    if (rowEl && valEl && rowEl.textContent.toLowerCase().includes('available from')) {
      availability = valEl.textContent.trim();
    }
  });

  if (!availability) {
    const availEl = document.querySelector('.listing-availabilities-structured__row--bold');
    if (availEl) {
      availability = availEl.textContent.trim();
    }
  }

  // 8. Furnished & Pets Allowed
  let furnished = false;
  let petsAllowed = false;

  document.querySelectorAll('._chip_1ae7a_183, .listing-chips-container__tag').forEach(el => {
    const text = el.textContent.toLowerCase();
    if (text.includes('furnished') || text.includes('möbliert')) {
      furnished = true;
    }
    if (text.includes('pets are allowed') || text.includes('pets allowed') || text.includes('haustiere erlaubt')) {
      petsAllowed = true;
    } else if (text.includes('pets are not allowed') || text.includes('pets not allowed') || text.includes('keine haustiere')) {
      petsAllowed = false;
    }
  });

  // 9. Images
  const rawImages = [];
  document.querySelectorAll('.imageMosaic img, .slider__container img, .carousel-items-wrapper img, [class*="imageMosaic"] img').forEach(img => {
    const src = img.getAttribute('src') || img.getAttribute('data-src');
    if (src && !rawImages.includes(src)) {
      rawImages.push(src);
    }
  });

  const coverImage = rawImages.length > 0 ? rawImages[0] : null;

  // 10. Description
  const descParts = [];
  document.querySelectorAll('.listing-overview__listing-description, [class*="listing-description"]').forEach(el => {
    const text = (el.innerText || el.textContent || '').trim();
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
    floor: null,
    availability,
    furnished,
    petsAllowed,
    originalListingUrl: url,
    listingId,
    sourcePlatform: 'spotahome',
    coverImage,
    images: rawImages.slice(0, 10),
    description,
    utilityCosts: null,
    heatingCosts: null
  };
}
