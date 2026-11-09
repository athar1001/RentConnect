// WG-Gesucht Extractor for WohnBoard Extension

function extractWGGesucht() {
  const url = window.location.href;
  const listingIdMatch = url.match(/-(\d+)\.html/);
  const listingId = listingIdMatch ? listingIdMatch[1] : null;

  let title = document.querySelector('h1.headline, h1#headline, .headline-active')?.textContent?.trim();
  if (!title) {
    title = document.querySelector('title')?.textContent?.replace('WG-Gesucht.de', '').trim();
  }

  const images = extractPageImages();
  const adData = parseAdFields();
  const details = adData.details;

  const pageText = document.body.innerText.toLowerCase();
  const furnished = pageText.includes('möbliert') || pageText.includes('furnished') || pageText.includes('einbauküche');
  const petsAllowed = pageText.includes('haustiere erlaubt') || pageText.includes('tierhaltung gestattet') || pageText.includes('pets allowed');

  const constructionYearText = details['baujahr'] || details['baujahr des gebäudes'];
  const constructionYear = adData.constructionYear || (constructionYearText ? parseInt(constructionYearText) || null : null);
  const heatingType = adData.heatingType || null;
  const energySource = adData.energySource || null;
  const energyClass = adData.energyClass || null;
  const certificateType = adData.certificateType || null;
  const description = document.querySelector('#ad_description_text, .ad_description_text, [class*="beschreibung"], #description')?.textContent?.trim() || null;

  let heatingCostsIncluded = false;
  for (const key in details) {
    const val = details[key] ? details[key].toLowerCase() : '';
    if (key.toLowerCase().includes('heizkosten enthalten') || key.toLowerCase().includes('in warmmiete enthalten') || key.toLowerCase().includes('in nebenkosten enthalten')) {
      heatingCostsIncluded = val.includes('ja') || val.includes('yes') || val.includes('inklusive') || val.includes('inbegriffen');
    }
  }
  if (!heatingCostsIncluded) {
    heatingCostsIncluded = pageText.includes('heizkosten enthalten') || pageText.includes('heizkosten in warmmiete enthalten');
  }

  return {
    title: title || 'WG-Gesucht Listing',
    rentPrice: adData.rentPrice,
    warmRent: adData.warmRent,
    coldRent: adData.coldRent,
    deposit: adData.deposit,
    rooms: adData.rooms,
    squareMeters: adData.squareMeters,
    address: adData.address,
    city: adData.city,
    zipCode: adData.zipCode,
    floor: adData.floor,
    availability: adData.availability,
    furnished,
    petsAllowed,
    originalListingUrl: url,
    listingId,
    sourcePlatform: 'wg-gesucht',
    coverImage: images[0] || null,
    images: images.slice(0, 10),

    // New fields
    energyClass,
    utilityCosts: adData.utilityCosts,
    heatingCostsIncluded,
    heatingCosts: adData.heatingCosts,
    constructionYear,
    heatingType,
    energySource,
    certificateType,
    description
  };
}
