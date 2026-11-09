// Gesobau Extractor for WohnBoard Extension

function extractGesobau() {
  const url = window.location.href;
  
  // Helper to safely parse and clean numbers
  function parseCleanNumber(text) {
    if (text === null || text === undefined) return null;
    if (typeof text === 'number') return text;
    if (typeof text !== 'string') text = String(text);
    const clean = text.replace(/[^0-9,.-]/g, '').trim();
    if (!clean) return null;
    let num = parseFloat(clean.replace(/\./g, '').replace(',', '.'));
    return isNaN(num) ? null : num;
  }

  // 1. Title & Subtitle
  let title = document.querySelector('.immoHero__title, h1')?.textContent?.trim() || document.title;
  const subtitle = document.querySelector('.immoHero__subtitle')?.textContent?.trim();
  if (subtitle && title && !title.includes(subtitle)) {
    title = `${title} - ${subtitle}`;
  }

  // 2. Listing ID
  let listingId = null;
  const idMatch = url.match(/detail\/([a-zA-Z0-9-]+)/) || url.match(/-([a-zA-Z0-9]+)\/?$/) || url.match(/\/([a-zA-Z0-9-]+)\.html/);
  if (idMatch) listingId = idMatch[1];

  // 3. Metadata items (fallback/primary rooms & size)
  let heroRent = null;
  let rooms = 1;
  let squareMeters = null;
  let floor = null;
  let availability = null;

  const metaItems = document.querySelectorAll('.immoHero__metaData li');
  metaItems.forEach(li => {
    const text = li.textContent.trim();
    if (text.includes('€')) {
      heroRent = parseCleanNumber(text);
    } else if (text.toLowerCase().includes('zimmer')) {
      rooms = parseCleanNumber(text) || 1;
    } else if (text.includes('m²')) {
      squareMeters = parseCleanNumber(text);
    } else if (text.toLowerCase().includes('etage') || text.toLowerCase().includes('geschoss') || text.toLowerCase().includes('og') || text.toLowerCase().includes('eg')) {
      floor = text;
    } else if (text.toLowerCase().includes('sofort') || text.match(/\d{2}\.\d{2}\.\d{4}/)) {
      availability = text;
    }
  });

  // 4. Parse detailed tables (e.g. Kosten, Details)
  const details = {};
  document.querySelectorAll('.immoDetailTable tr').forEach(tr => {
    const th = tr.querySelector('th');
    const td = tr.querySelector('td');
    if (th && td) {
      const key = th.textContent.trim().toLowerCase().replace(/:/g, '').replace(/\s+/g, ' ');
      const val = td.textContent.trim().replace(/\s+/g, ' ');
      details[key] = val;
    }
  });

  // Map details to fields
  const coldRent = parseCleanNumber(details['kaltmiete']);
  const warmRent = parseCleanNumber(details['miete inkl. nk'] || details['warmmiete']);
  const rentPrice = warmRent || coldRent || heroRent;
  const deposit = parseCleanNumber(details['kaution']);
  const utilityCosts = parseCleanNumber(details['betriebskosten'] || details['nebenkosten']);
  const heatingCosts = parseCleanNumber(details['heizkosten']);

  if (details['etage']) {
    floor = details['etage'];
  }
  if (details['verfügbar ab']) {
    availability = details['verfügbar ab'];
  }

  // 5. Address, zipCode, city
  let address = null;
  let zipCode = null;
  let city = null;

  const addressEl = document.querySelector('.immoHero__address');
  if (addressEl) {
    const fullAddress = addressEl.textContent.trim();
    // e.g. "Zossener Straße 152, 12629 Berlin"
    const parts = fullAddress.split(',');
    if (parts.length > 1) {
      address = parts[0].trim();
      const cityPart = parts[1].trim();
      const zipMatch = cityPart.match(/(\d{5})\s+(.*)/);
      if (zipMatch) {
        zipCode = zipMatch[1];
        city = zipMatch[2].trim();
      } else {
        city = cityPart;
      }
    } else {
      address = fullAddress;
    }
  }

  // 6. Description & Features
  const descriptionEl = document.querySelector('.rte, .c-rich-text, [class*="description"]');
  const description = descriptionEl ? descriptionEl.textContent.trim() : null;

  const features = [];
  document.querySelectorAll('.immoHero__tags li').forEach(li => {
    features.push(li.textContent.trim());
  });
  const furnished = features.some(f => f.toLowerCase().includes('möbliert') || f.toLowerCase().includes('einbauküche'));

  // 7. Images
  const images = [];
  document.querySelectorAll('a[href*="/fileadmin/"]').forEach(a => {
    const href = a.getAttribute('href');
    if (href && !href.toLowerCase().includes('grundriss') && !images.includes(href)) {
      const lower = href.toLowerCase();
      if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp')) {
        images.push(href);
      }
    }
  });

  if (images.length === 0) {
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('data-src') || img.src || img.getAttribute('src');
      if (src && !src.startsWith('data:') && !images.includes(src)) {
        images.push(src);
      }
    });
  }

  // Resolve absolute paths if they are relative URLs
  const resolvedImages = images.map(src => {
    if (src.startsWith('/')) {
      return window.location.origin + src;
    }
    return src;
  });

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
    petsAllowed: false,
    originalListingUrl: url,
    listingId,
    sourcePlatform: 'gesobau',
    coverImage: resolvedImages[0] || null,
    images: resolvedImages.slice(0, 10),
    description,
    utilityCosts,
    heatingCosts
  };
}
