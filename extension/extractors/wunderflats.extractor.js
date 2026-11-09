// Wunderflats Extractor for WohnBoard Extension

function extractWunderflats() {
  const url = window.location.href;

  function parsePrice(text) {
    if (text === null || text === undefined) return null;
    if (typeof text === 'number') return text;
    if (typeof text !== 'string') text = String(text);
    
    let cleaned = text.replace(/[^0-9,.-]/g, '').trim();
    if (!cleaned) return null;

    if (cleaned.includes('.') && cleaned.includes(',')) {
      const dotIdx = cleaned.indexOf('.');
      const commaIdx = cleaned.indexOf(',');
      if (dotIdx < commaIdx) {
        cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
      } else {
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (cleaned.includes(',')) {
      const parts = cleaned.split(',');
      if (parts[parts.length - 1].length === 3) {
        cleaned = cleaned.replace(/,/g, '');
      } else {
        cleaned = cleaned.replace(/,/g, '.');
      }
    } else if (cleaned.includes('.')) {
      const parts = cleaned.split('.');
      if (parts[parts.length - 1].length === 3) {
        cleaned = cleaned.replace(/\./g, '');
      }
    }

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  // 1. Title
  const title = document.querySelector('.ListingDetails-title, .qa-listing-title')?.textContent?.trim() || 'Wunderflats Listing';

  // 2. Listing ID
  const match = url.match(/(?:flat|furnished-apartment)\/(?:[^/]+\/)?([a-f0-9]{24}|[a-zA-Z0-9-]+)/i);
  const listingId = match ? match[1] : null;

  // 3. Stats (rooms, squareMeters, floor)
  let squareMeters = null;
  let floor = null;
  let rooms = null;

  document.querySelectorAll('.ListingDetails-statsElt').forEach(el => {
    const text = el.textContent.trim();
    const m2Match = text.match(/([\d.,]+)\s*(?:m²|m2)/i);
    if (m2Match) {
      squareMeters = parseFloat(m2Match[1].replace(',', '.'));
    }
    const floorMatch = text.match(/Floor\s*:\s*(\d+)/i);
    if (floorMatch) {
      floor = floorMatch[1];
    }
    const roomMatch = text.match(/(\d+)\s*Rooms?/i);
    if (roomMatch) {
      rooms = parseInt(roomMatch[1], 10);
    }
  });

  // 4. Rent Prices (Wunderflats is all inclusive / warm rent)
  const rentValueEl = document.querySelector('.ListingPriceText__value') || 
                      Array.from(document.querySelectorAll('.CostOverview-itemRow')).find(el => el.querySelector('h4')?.textContent?.toLowerCase().includes('monthly rent'))?.querySelector('p');
  
  let warmRent = null;
  if (rentValueEl) {
    warmRent = parsePrice(rentValueEl.textContent);
  }
  const rentPrice = warmRent;

  // 5. Deposit
  let deposit = null;
  document.querySelectorAll('.CostOverview-itemRow').forEach(row => {
    const h4 = row.querySelector('h4');
    const p = row.querySelector('p');
    if (h4 && p) {
      const key = h4.textContent.toLowerCase();
      if (key.includes('deposit') || key.includes('kaution')) {
        deposit = parsePrice(p.textContent);
      }
    }
  });

  // 6. Address, City, ZipCode
  const addressEl = document.querySelector('[data-testid="ListingDetailsPage-address"]');
  let address = null;
  let zipCode = null;
  let city = null;
  if (addressEl) {
    const text = addressEl.textContent.trim();
    const parts = text.split(',').map(p => p.trim());
    if (parts.length > 0) address = parts[0];
    if (parts.length > 1) {
      if (/^\d+$/.test(parts[1])) {
        zipCode = parts[1];
        if (parts.length > 2) {
          city = parts[2];
        }
      } else {
        const zipCityMatch = parts[1].match(/^(\d{5})\s+(.*)$/);
        if (zipCityMatch) {
          zipCode = zipCityMatch[1];
          city = zipCityMatch[2];
        } else {
          city = parts[1];
        }
      }
    }
  }

  // 7. Availability
  const availability = document.querySelector('[data-testid="ListingDetailsPage-availabilityDate"] .statsText')?.textContent?.trim() || null;

  // 8. Furnished & Pets
  const furnished = true; // Wunderflats is always furnished
  let petsAllowed = false;
  document.querySelectorAll('.ListingDetails-houseRule').forEach(rule => {
    const text = rule.textContent.toLowerCase();
    if (text.includes('pet') || text.includes('haustier')) {
      if (text.includes('not allowed') || text.includes('nicht erlaubt') || text.includes('keine')) {
        petsAllowed = false;
      } else if (text.includes('allowed') || text.includes('erlaubt')) {
        petsAllowed = true;
      }
    }
  });

  // 9. Description
  const description = document.querySelector('#aboutListing p')?.textContent?.trim() || null;

  // 10. Images extraction (ignore Similar Listings)
  const rawImages = [];
  document.querySelectorAll('img, source').forEach(img => {
    if (img.closest('.SimilarListings, [data-testid="SimilarListings"], .ListingsList')) {
      return;
    }
    let src = img.getAttribute('data-src') || img.getAttribute('src') || img.src;
    if (src) {
      if (src.startsWith('/')) {
        src = window.location.origin + src;
      }
      const isListingImg = src.includes('listingimages.wunderflats.com') || img.classList.contains('CoverImage-image');
      if (isListingImg && !rawImages.includes(src)) {
        rawImages.push(src);
      }
    }
  });

  const coverImage = rawImages.length > 0 ? rawImages[0] : null;

  return {
    title,
    rentPrice,
    warmRent,
    coldRent: null,
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
    sourcePlatform: 'wunderflats',
    coverImage,
    images: rawImages.slice(0, 10),
    description
  };
}
