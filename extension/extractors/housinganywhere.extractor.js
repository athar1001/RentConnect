// HousingAnywhere Extractor for WohnBoard Extension

function extractHousingAnywhere() {
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
  const street = document.querySelector('[data-test-locator="Listing/ListingInfo/street"]')?.textContent?.trim();
  const kind = document.querySelector('[data-test-locator="HighlightsTags/Kind"]')?.textContent?.trim();
  let title = '';
  if (kind && street) {
    title = `${kind} – ${street}`;
  } else {
    title = street || document.querySelector('h1')?.textContent?.trim();
  }
  if (!title) {
    title = document.title || 'HousingAnywhere Listing';
  }

  // 2. Costs
  const priceEl = document.querySelector('[data-test-locator="Listing/ListingInfo/Price"]');
  const rentPrice = priceEl ? parseCleanNumber(priceEl.textContent) : null;

  // 3. Description
  const descEl = document.querySelector('[data-test-locator="LongParagraph"]') || 
                 document.querySelector('.css-jtt5vl-breakWord-description');
  const description = descEl ? descEl.textContent.trim() : '';

  // 4. Deposit from description regex
  let deposit = null;
  if (description) {
    const depositMatch = description.match(/(?:security\s+)?deposit\s+(?:of\s+)?(?:€|EUR)?\s*([\d,.]+)/i) || 
                         description.match(/kaution\s+(?:von\s+)?(?:€|EUR)?\s*([\d,.]+)/i);
    if (depositMatch) {
      deposit = parseCleanNumber(depositMatch[1]);
    }
  }

  // 5. Rooms
  let rooms = 1;
  const chips = Array.from(document.querySelectorAll('.MuiChip-root, [class*="MuiChip-root"], [data-test-locator*="HighlightsTags/"]'));
  chips.forEach(chip => {
    const text = chip.textContent.toLowerCase();
    if (text.includes('bedroom')) {
      const match = text.match(/(\d+)\s*bedroom/);
      if (match) {
        rooms = parseInt(match[1], 10);
      }
    }
  });

  // 6. Area
  let squareMeters = null;
  const bedroomChip = document.querySelector('[data-test-locator="HighlightsTags/Bedroom"]');
  if (bedroomChip) {
    squareMeters = parseCleanNumber(bedroomChip.textContent);
  }
  if (!squareMeters) {
    const propertyChip = document.querySelector('[data-test-locator="HighlightsTags/Property"]');
    if (propertyChip) {
      squareMeters = parseCleanNumber(propertyChip.textContent);
    }
  }

  // 7. Address
  let address = street || null;
  let city = null;
  let zipCode = null;

  // Parse address details from breadcrumbs
  const breadcrumbLinks = Array.from(document.querySelectorAll('[data-test-locator*="Breadcrumbs"] a, [data-test-locator*="PageBreadcrumbsList"] a'));
  const cityLink = breadcrumbLinks.find(link => link.getAttribute('href')?.includes('/s/'));
  if (cityLink) {
    city = cityLink.textContent.trim();
  } else {
    // Check all link texts for cities or standard structure
    breadcrumbLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.includes('housinganywhere.com/s/')) {
        const text = link.textContent.trim();
        if (text && text !== 'Home') {
          city = text;
        }
      }
    });
  }

  // 8. Furnished
  const furnishedChip = document.querySelector('[data-test-locator="HighlightsTags/Furnished"]');
  const furnished = !!furnishedChip || description.toLowerCase().includes('furnished') || description.toLowerCase().includes('möbliert');

  // 9. Pets Allowed
  const petsAllowed = description.toLowerCase().includes('pets allowed') || description.toLowerCase().includes('haustiere erlaubt');

  // 10. Listing ID
  let listingId = null;
  const idMatch = url.match(/(?:room|rent|listings)\/([a-zA-Z0-9-]+)/);
  if (idMatch) {
    listingId = idMatch[1];
  }

  // 11. Images
  const rawImages = [];
  
  function cleanImgixUrl(src) {
    if (!src) return null;
    try {
      const urlObj = new URL(src, window.location.origin);
      urlObj.searchParams.delete('w');
      urlObj.searchParams.delete('h');
      urlObj.searchParams.delete('q');
      urlObj.searchParams.delete('dpr');
      return urlObj.toString();
    } catch (e) {
      return src;
    }
  }

  document.querySelectorAll('img[data-test-locator="imgix"], [data-test-locator*="ImageSlider"] img, .css-13oz2h0-img').forEach(img => {
    const src = img.getAttribute('src') || img.getAttribute('data-src');
    if (src) {
      const cleaned = cleanImgixUrl(src);
      if (cleaned && !rawImages.includes(cleaned)) {
        rawImages.push(cleaned);
      }
    }
  });

  const coverImage = rawImages.length > 0 ? rawImages[0] : null;

  return {
    title,
    rentPrice,
    warmRent: rentPrice,
    coldRent: null,
    deposit,
    rooms,
    squareMeters,
    address,
    city,
    zipCode,
    floor: null,
    availability: null,
    furnished,
    petsAllowed,
    originalListingUrl: url,
    listingId,
    sourcePlatform: 'housinganywhere',
    coverImage,
    images: rawImages.slice(0, 10),
    description,
    utilityCosts: null,
    heatingCosts: null
  };
}
