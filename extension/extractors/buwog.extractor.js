// Buwog Extractor for WohnBoard Extension

function extractBuwog() {
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

  // 1. First parse the data-obj-props JSON attribute if available on query button
  let props = {};
  const propsEl = document.querySelector('a[data-obj-props]');
  if (propsEl) {
    try {
      const attr = propsEl.getAttribute('data-obj-props');
      if (attr) {
        props = JSON.parse(attr);
      }
    } catch (e) {
      console.error("Failed to parse data-obj-props", e);
    }
  }

  // 2. Title
  let title = document.querySelector('.main-object-title')?.textContent?.trim() ||
              document.querySelector('.object-title h1')?.textContent?.trim() ||
              document.querySelector('h1')?.textContent?.trim();
  if (!title) {
    title = document.title || 'BUWOG Apartment';
  }

  // 3. Costs
  let purchasePrice = props.purchase_price ? parseCleanNumber(props.purchase_price) : null;
  let rentPrice = props.rent_price ? parseCleanNumber(props.rent_price) : null;

  // DOM Fallback for prices
  if (!rentPrice && !purchasePrice) {
    const buyPriceEl = document.querySelector('.price-box.buy-box .price') || 
                       document.querySelector('.object-detail-info-list-item.price .bold-text');
    const detectedPrice = buyPriceEl ? parseCleanNumber(buyPriceEl.textContent) : null;
    
    if (document.querySelector('.price-box.buy-box')) {
      purchasePrice = detectedPrice;
    } else {
      rentPrice = detectedPrice;
    }
  }

  if (!rentPrice) {
    rentPrice = purchasePrice;
  }

  // 4. Listing ID
  const listingId = props.real_estate_id || 
                    document.querySelector('[data-refid]')?.getAttribute('data-refid') ||
                    document.querySelector('.object-location-wrapper')?.textContent?.match(/Objektnummer\s*:\s*([^\s]+)/)?.[1] ||
                    null;

  // 5. Rooms
  let rooms = props.total_rooms ? parseCleanNumber(props.total_rooms) : null;
  if (!rooms) {
    const roomsEl = document.querySelector('.object-detail-info-list-item.rooms .bold-text') ||
                    document.querySelector('.custom-detail-row:nth-child(2) div');
    if (roomsEl) {
      rooms = parseCleanNumber(roomsEl.textContent);
    }
  }
  if (!rooms) rooms = 1;

  // 6. Area
  let squareMeters = props.living_area_size ? parseCleanNumber(props.living_area_size) : null;
  if (!squareMeters) {
    const areaEl = document.querySelector('.object-detail-info-list-item.living-area .bold-text') ||
                   document.querySelector('.object-detail-info-list-item.living-area') ||
                   document.querySelector('.custom-detail-row:nth-child(3) div');
    if (areaEl) {
      squareMeters = parseCleanNumber(areaEl.textContent);
    }
  }

  // 7. Floor
  let floor = props.floor || null;
  if (!floor) {
    const floorEl = document.querySelector('.object-detail-info-list-item.floor .bold-text') ||
                    document.querySelector('.custom-detail-row:nth-child(1) div');
    if (floorEl) {
      floor = floorEl.textContent.trim();
    }
  }

  // 8. Address
  let address = null;
  let zipCode = null;
  let city = null;

  const addressEl = document.querySelector('.object-location-wrapper .address') ||
                    document.querySelector('.location span, .location');
  if (addressEl) {
    const text = addressEl.textContent.replace('Objektnummer', '').split(':')?.[0]?.trim();
    if (text) {
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

  // 9. Availability
  let availability = null;
  
  // 10. Description
  let description = null;
  const descEl = document.querySelector('.object-description .rte') ||
                 document.querySelector('.text-contact-wrapper .rte');
  if (descEl) {
    description = descEl.textContent.trim().replace(/\s+/g, ' ');
  }

  // 11. Furnished
  let furnished = false;
  if (description) {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('einbauküche') || lowerDesc.includes('ebk') || lowerDesc.includes('möbliert') || lowerDesc.includes('ausgestattet')) {
      furnished = true;
    }
  }

  // 12. Pets Allowed
  let petsAllowed = false;

  // 13. Images
  const rawImages = [];
  document.querySelectorAll('.object-detail-list img, .object-detail-item img').forEach(img => {
    const src = img.getAttribute('data-src') || img.getAttribute('src');
    if (src && !src.startsWith('data:') && !rawImages.includes(src)) {
      rawImages.push(src);
    }
  });

  if (rawImages.length === 0) {
    document.querySelectorAll('.image-list img, .image-wrapper img').forEach(img => {
      const src = img.getAttribute('data-src') || img.getAttribute('src');
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
    if (lower.includes('logo') || lower.includes('banner') || lower.includes('favicon')) {
      return false;
    }
    return true;
  });

  const coverImage = resolvedImages.length > 0 ? resolvedImages[0] : null;

  return {
    title,
    rentPrice,
    warmRent: rentPrice,
    coldRent: null,
    deposit: null,
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
    sourcePlatform: 'buwog',
    coverImage,
    images: resolvedImages.slice(0, 10),
    description,
    utilityCosts: null,
    heatingCosts: null
  };
}
