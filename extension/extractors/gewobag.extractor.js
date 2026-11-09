// Gewobag Extractor for WohnBoard Extension

function extractGewobag() {
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

  // 1. Parse all tables
  const details = {};
  document.querySelectorAll('.overview-table tr').forEach(tr => {
    const th = tr.querySelector('th');
    const td = tr.querySelector('td');
    if (th && td) {
      const key = th.textContent.trim().toLowerCase().replace(/:/g, '').replace(/\s+/g, ' ');
      const val = td.textContent.trim().replace(/\s+/g, ' ');
      details[key] = val;
    }
  });

  // 2. Map Cost Fields
  const coldRent = parseCleanNumber(details['grundmiete'] || details['kaltmiete']);
  const warmRent = parseCleanNumber(details['gesamtmiete'] || details['warmmiete']);
  const rentPrice = warmRent || coldRent;
  const deposit = parseCleanNumber(details['kaution']);
  const utilityCosts = parseCleanNumber(details['vz betriebskosten'] || details['betriebskosten'] || details['nebenkosten']);

  // 3. Map General Fields
  const rooms = parseCleanNumber(details['anzahl zimmer'] || details['zimmer']) || 1;
  const squareMeters = parseCleanNumber(details['fläche in m²'] || details['wohnfläche'] || details['fläche']);
  let floor = details['etage'] || null;
  let availability = details['frei ab'] || details['verfügbar ab'] || null;
  const listingId = details['objektnummer'] || null;

  // 4. Address parsing
  let address = null;
  let zipCode = null;
  let city = null;

  const anschrift = details['anschrift'];
  if (anschrift) {
    const parts = anschrift.split(',');
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
      address = anschrift;
    }
  }

  // 5. Title & Title Fallback
  let title = document.querySelector('h1')?.textContent?.trim();
  if (!title) {
    title = document.querySelector('.angebot-title, .title, .entry-title')?.textContent?.trim();
  }
  if (!title) {
    if (address && rooms) {
      title = `${rooms}-Zimmer Wohnung - ${address}`;
    } else {
      title = document.title || 'Gewobag Apartment';
    }
  }

  // 6. Characteristics & Features
  const features = [];
  document.querySelectorAll('.details-characteristics li').forEach(li => {
    features.push(li.textContent.trim());
  });
  
  const furnished = features.some(f => f.toLowerCase().includes('möbliert') || f.toLowerCase().includes('einbauküche') || f.toLowerCase().includes('ebk'));
  const petsAllowed = features.some(f => f.toLowerCase().includes('haustiere erlaubt') || f.toLowerCase().includes('tierhaltung erlaubt') || f.toLowerCase().includes('hunde erlaubt'));

  // 7. Description
  const descriptionEl = document.querySelector('.details-description');
  const description = descriptionEl ? descriptionEl.textContent.trim() : null;

  // 8. Images
  const images = [];

  // Check the print container which is very clean
  document.querySelectorAll('.print-images-container img, img.print-images').forEach(img => {
    const src = img.getAttribute('src');
    if (src && !images.includes(src)) {
      images.push(src);
    }
  });

  // Check swiper gallery
  if (images.length === 0) {
    document.querySelectorAll('.swiper-slide a, .swiper-slide img').forEach(el => {
      const src = el.getAttribute('href') || el.getAttribute('src');
      if (src && !src.startsWith('data:') && !images.includes(src)) {
        const lower = src.toLowerCase();
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.gif')) {
          images.push(src);
        }
      }
    });
  }

  // Fallback to any images in the content tab
  if (images.length === 0) {
    document.querySelectorAll('#tabs-content img').forEach(img => {
      const src = img.getAttribute('src');
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

  // Extract cover image (first image not containing "grundriss" if possible)
  let coverImage = null;
  if (resolvedImages.length > 0) {
    coverImage = resolvedImages.find(img => !img.toLowerCase().includes('grundriss') && !img.toLowerCase().includes('plan')) || resolvedImages[0];
  }

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
    sourcePlatform: 'gewobag',
    coverImage,
    images: resolvedImages.slice(0, 10),
    description,
    utilityCosts,
    heatingCosts: null
  };
}
