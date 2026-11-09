function normalizeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    let host = parsed.hostname.toLowerCase();
    if (host.startsWith('www.')) {
      host = host.slice(4);
    }
    let path = parsed.pathname;
    if (path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return host + path;
  } catch (e) {
    return url.toLowerCase().replace(/\/$/, '');
  }
}

const SUPPORTED_HOSTS = [
  "immobilienscout24.de",
  "wg-gesucht.de",
  "kleinanzeigen.de",
  "immowelt.de",
  "immonet.de",
  "housinganywhere.com",
  "wunderflats.com",
  "spotahome.com",
  "nestpick.com",
  "degewo.de",
  "gesobau.de",
  "howoge.de",
  "gewobag.de",
  "wbm.de",
  "stadtundland.de",
  "berlinovo.de",
  "vonovia.de",
  "deutsche-wohnen.com",
  "leg-wohnen.de",
  "buwog.de",
  "grandcityproperty.de",
  "tag-wohnen.de",
  "saga.hamburg",
  "stw.berlin",
  "studierendenwerk-muenchen-oberbayern.de",
  "stwhh.de"
];

const TRANSLATIONS = {
  de: {
    // Header Status
    statusChecking: "Verbinden...",
    statusConnected: "Verbunden",
    statusDisconnected: "Getrennt",
    statusError: "Fehler",

    // Disconnected View (1)
    discTitle: "Wohnungen mit einem Klick speichern.",
    discDesc: "Verbinde dein WohnBoard-Konto, um Wohnungsanzeigen zu speichern.",
    discBtn: "Konto verbinden",
    discTrust: "Einfach • Sicher • DSGVO-konform • Kostenlos",

    // Connected - Not Supported View (2)
    unsupportedTitle: "Wohnung öffnen",
    unsupportedDesc: "Öffne eine Wohnungsanzeige, um sie in WohnBoard zu speichern.",
    unsupportedBtn: "WohnBoard öffnen",
    unsupportedHelp: "Nur unterstützte Wohnungsseiten.",

    // Connected - Detected View (3)
    detectedBadge: "Wohnung erkannt",
    detectedBtn: "In WohnBoard speichern",
    detectedHelp: "Details können später bearbeitet werden.",
    detectedSource: "Wohnungsseite",

    // Saving View (4)
    savingTitle: "Wohnung wird gespeichert...",
    savingDesc: "Bitte warten, während die Anzeige zu deinem Board hinzugefügt wird.",

    // Saved View (5)
    savedTitle: "Erfolgreich gespeichert",
    savedDesc: "Diese Wohnung wurde zu deinem WohnBoard hinzugefügt.",
    savedBtnOpenApartment: "Wohnung öffnen",
    savedBtnOpenBoard: "Board öffnen",
    savedHelp: "Du kannst jetzt Status, Dokumente und Erinnerungen verfolgen.",

    // Already Saved View (6)
    alreadyTitle: "Bereits gespeichert",
    alreadyDesc: "Diese Wohnung befindet sich bereits in deinem WohnBoard.",
    alreadyBtnOpenApartment: "Wohnung öffnen",

    // Failed View (7)
    failedTitle: "Anzeige konnte nicht gelesen werden",
    failedDesc: "Du kannst die Wohnung trotzdem manuell hinzufügen.",
    failedBtnAdd: "Manuell hinzufügen",
    failedBtnRetry: "Erneut versuchen"
  },
  en: {
    // Header Status
    statusChecking: "Checking...",
    statusConnected: "Connected",
    statusDisconnected: "Disconnected",
    statusError: "Error",

    // Disconnected View (1)
    discTitle: "Save apartments with one click.",
    discDesc: "Connect your WohnBoard account to start saving apartment listings.",
    discBtn: "Connect Account",
    discTrust: "Simple • Secure • GDPR Compliant • Free",

    // Connected - Not Supported View (2)
    unsupportedTitle: "Open an apartment listing",
    unsupportedDesc: "Open an apartment listing page to save it to WohnBoard.",
    unsupportedBtn: "Open WohnBoard",
    unsupportedHelp: "Supported apartment websites only.",

    // Connected - Detected View (3)
    detectedBadge: "Apartment detected",
    detectedBtn: "Save to WohnBoard",
    detectedHelp: "Edit details after saving.",
    detectedSource: "Apartment website",

    // Saving View (4)
    savingTitle: "Saving apartment...",
    savingDesc: "Please wait while we add this listing to your board.",

    // Saved View (5)
    savedTitle: "Saved successfully",
    savedDesc: "This apartment has been added to your WohnBoard.",
    savedBtnOpenApartment: "Open Apartment",
    savedBtnOpenBoard: "Open Board",
    savedHelp: "You can now track status, documents and reminders.",

    // Already Saved View (6)
    alreadyTitle: "Already saved",
    alreadyDesc: "This apartment is already in your WohnBoard.",
    alreadyBtnOpenApartment: "Open Apartment",

    // Failed View (7)
    failedTitle: "Couldn't read this listing",
    failedDesc: "You can still save it manually in WohnBoard.",
    failedBtnAdd: "Add Manually",
    failedBtnRetry: "Try Again"
  }
};

let token = null;
let extractedData = null;
let savedApartmentId = null;
let appLanguage = navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en';

document.addEventListener('DOMContentLoaded', () => {
  translateUI();
  initConnection();
  setupEventListeners();
});

function setAppLanguage(lang) {
  if (!lang) return;
  const normalized = lang.toLowerCase().startsWith('de') ? 'de' : 'en';
  appLanguage = normalized;
  translateUI();
}

function translateUI() {
  const t = TRANSLATIONS[appLanguage];

  // 1. Disconnected
  document.getElementById('txt-disc-title').textContent = t.discTitle;
  document.getElementById('txt-disc-desc').textContent = t.discDesc;
  document.getElementById('btn-connect').textContent = t.discBtn;
  document.getElementById('txt-disc-trust').textContent = t.discTrust;

  // 2. Unsupported
  document.getElementById('txt-unsupported-title').textContent = t.unsupportedTitle;
  document.getElementById('txt-unsupported-desc').textContent = t.unsupportedDesc;
  document.getElementById('btn-open-dashboard').textContent = t.unsupportedBtn;
  document.getElementById('txt-unsupported-help').textContent = t.unsupportedHelp;

  // 3. Detected
  document.getElementById('badge-detected').textContent = t.detectedBadge;
  document.getElementById('btn-save').textContent = t.detectedBtn;
  document.getElementById('txt-save-help').textContent = t.detectedHelp;

  // 4. Saving
  document.getElementById('txt-saving-title').textContent = t.savingTitle;
  document.getElementById('txt-saving-desc').textContent = t.savingDesc;

  // 5. Saved
  document.getElementById('txt-saved-title').textContent = t.savedTitle;
  document.getElementById('txt-saved-desc').textContent = t.savedDesc;
  document.getElementById('btn-open-apartment').textContent = t.savedBtnOpenApartment;
  document.getElementById('btn-open-board').textContent = t.savedBtnOpenBoard;
  document.getElementById('txt-saved-help').textContent = t.savedHelp;

  // 6. Already Saved
  document.getElementById('txt-already-title').textContent = t.alreadyTitle;
  document.getElementById('txt-already-desc').textContent = t.alreadyDesc;
  document.getElementById('btn-open-apartment-dup').textContent = t.alreadyBtnOpenApartment;

  // 7. Failed
  document.getElementById('txt-failed-title').textContent = t.failedTitle;
  document.getElementById('txt-failed-desc').textContent = t.failedDesc;
  document.getElementById('btn-add-manually').textContent = t.failedBtnAdd;
  document.getElementById('btn-try-again').textContent = t.failedBtnRetry;

  // Privacy link
  document.getElementById('lnk-privacy').textContent = appLanguage === 'de' ? "Datenschutzerklärung" : "Privacy Policy";
}

function setupEventListeners() {
  // Inject Dev State Switcher if running directly in a browser page
  if (!chrome.runtime || !chrome.runtime.id || !chrome.cookies) {
    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'fixed';
    debugDiv.style.bottom = '20px';
    debugDiv.style.left = '390px';
    debugDiv.style.display = 'flex';
    debugDiv.style.flexDirection = 'column';
    debugDiv.style.gap = '6px';
    debugDiv.style.padding = '12px';
    debugDiv.style.background = '#ffffff';
    debugDiv.style.border = '1px solid #e2e8f0';
    debugDiv.style.borderRadius = '12px';
    debugDiv.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
    debugDiv.style.zIndex = '99999';

    const title = document.createElement('div');
    title.textContent = 'Dev State Switcher';
    title.style.fontWeight = '700';
    title.style.fontSize = '12px';
    title.style.color = '#0f172a';
    title.style.marginBottom = '4px';
    debugDiv.appendChild(title);

    const states = ['disconnected', 'unsupported', 'detected', 'saving', 'saved', 'already-saved', 'failed'];
    states.forEach(state => {
      const btn = document.createElement('button');
      btn.textContent = state.toUpperCase();
      btn.style.padding = '6px 12px';
      btn.style.fontSize = '11px';
      btn.style.fontWeight = '600';
      btn.style.border = 'none';
      btn.style.borderRadius = '6px';
      btn.style.cursor = 'pointer';
      btn.style.background = '#3b82f6';
      btn.style.color = '#ffffff';
      btn.style.textAlign = 'left';

      btn.addEventListener('click', () => {
        showView(state);
        updateStatusIndicator(state === 'disconnected' ? 'Disconnected' : 'Connected', state === 'disconnected' ? 'disconnected' : 'connected');
        if (state === 'detected') {
          const mock = {
            title: appLanguage === 'de' ? "2-Zimmer Wohnung in Berlin" : "2-Room Apartment in Berlin",
            warmRent: 950,
            squareMeters: 54,
            city: "Berlin",
            sourcePlatform: appLanguage === 'de' ? "Wohnungsseite" : "Apartment website"
          };
          extractedData = mock;
          renderPreview(mock);
        } else if (state === 'saved') {
          extractedData = {
            title: appLanguage === 'de' ? "2-Zimmer Wohnung in Berlin" : "2-Room Apartment in Berlin",
            warmRent: 950,
            squareMeters: 54,
            city: "Berlin"
          };
          document.getElementById('saved-title').textContent = extractedData.title;
          document.getElementById('saved-info').textContent = appLanguage === 'de' ? "950 € • 54 m² • Berlin" : "950 € • 54 m² • Berlin";
        }
      });

      debugDiv.appendChild(btn);
    });

    const langBtn = document.createElement('button');
    langBtn.textContent = 'TOGGLE LANGUAGE (DE / EN)';
    langBtn.style.padding = '6px 12px';
    langBtn.style.fontSize = '11px';
    langBtn.style.fontWeight = '700';
    langBtn.style.border = '1px solid #3b82f6';
    langBtn.style.borderRadius = '6px';
    langBtn.style.cursor = 'pointer';
    langBtn.style.background = '#ffffff';
    langBtn.style.color = '#3b82f6';
    langBtn.style.marginTop = '6px';

    langBtn.addEventListener('click', () => {
      setAppLanguage(appLanguage === 'de' ? 'en' : 'de');
    });
    debugDiv.appendChild(langBtn);

    document.body.appendChild(debugDiv);
    document.body.style.overflow = 'visible';
    document.documentElement.style.overflow = 'visible';
  }

  // Disconnected
  document.getElementById('btn-connect').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3001/login' });
  });

  // Unsupported
  document.getElementById('btn-open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3001/app/apartments' });
  });

  // Detected
  document.getElementById('btn-save').addEventListener('click', saveListing);

  // Saved
  document.getElementById('btn-open-apartment').addEventListener('click', () => {
    if (savedApartmentId) {
      chrome.tabs.create({ url: `http://localhost:3001/app/apartments/${savedApartmentId}` });
    }
  });
  document.getElementById('btn-open-board').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3001/app/apartments' });
  });

  // Already Saved
  document.getElementById('btn-open-apartment-dup').addEventListener('click', () => {
    if (savedApartmentId) {
      chrome.tabs.create({ url: `http://localhost:3001/app/apartments/${savedApartmentId}` });
    } else {
      chrome.tabs.create({ url: 'http://localhost:3001/app/apartments' });
    }
  });

  // Failed
  document.getElementById('btn-add-manually').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3001/app/apartments' });
  });
  document.getElementById('btn-try-again').addEventListener('click', () => {
    checkCurrentPage();
  });
}

function initConnection() {
  updateStatusIndicator('Checking...', 'checking');

  // Try to sync language cookie NEXT_LOCALE
  try {
    if (chrome.cookies) {
      chrome.cookies.getAll({ name: 'NEXT_LOCALE' }, (localeCookies) => {
        const localLocales = (localeCookies || []).filter(c => 
          c.domain.includes('localhost') || c.domain.includes('127.0.0.1')
        );
        if (localLocales.length > 0 && localLocales[0].value) {
          setAppLanguage(localLocales[0].value);
        }
      });
    }
  } catch (err) {
    console.warn('NEXT_LOCALE cookie read failed:', err);
  }

  // Session token lookup
  try {
    if (chrome.cookies) {
      chrome.cookies.getAll({ name: 'access_token' }, (cookies) => {
        const localCookies = (cookies || []).filter(c => 
          c.domain.includes('localhost') || c.domain.includes('127.0.0.1')
        );

        const diagEl = document.getElementById('diag-cookies');
        if (diagEl) {
          const list = localCookies.map(c => `${c.domain}:${c.name}`).join(', ');
          diagEl.textContent = `Localhost cookies: ${list || 'None'}`;
        }

        const localCookie = localCookies[0];
        if (localCookie && localCookie.value) {
          token = localCookie.value;
          verifySession();
        } else {
          showView('disconnected');
          updateStatusIndicator('Disconnected', 'disconnected');
        }
      });
    } else {
      showView('disconnected');
      updateStatusIndicator('Disconnected', 'disconnected');
    }
  } catch (err) {
    console.error('initConnection error:', err);
    updateStatusIndicator('Error', 'error');
    showView('failed');
  }
}

function verifySession() {
  fetch('http://localhost:3000/auth/extension/status', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  })
  .then(res => {
    if (res.status === 200) return res.json();
    throw new Error('Unauthorized');
  })
  .then(user => {
    updateStatusIndicator('Connected', 'connected');
    if (user && user.preferredLanguage) {
      setAppLanguage(user.preferredLanguage);
    }
    checkCurrentPage();
  })
  .catch(err => {
    console.error('Session verification failed:', err);
    token = null;
    showView('disconnected');
    updateStatusIndicator('Disconnected', 'disconnected');
  });
}

function checkCurrentPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) {
      showView('unsupported');
      return;
    }

    const url = tab.url || '';
    const isSupported = SUPPORTED_HOSTS.some(sh => url.includes(sh));

    if (isSupported) {
      try {
        chrome.tabs.sendMessage(tab.id, { action: 'extract' }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('Content script not ready', chrome.runtime.lastError.message);
            showView('failed');
            return;
          }

          if (response && response.success) {
            extractedData = response.data;
            
            // Check if this listing has already been saved
            if (token) {
              fetch('http://localhost:3000/apartments', {
                headers: { 'Authorization': `Bearer ${token}` }
              })
              .then(res => {
                if (res.ok) return res.json();
                throw new Error('Failed to fetch apartments');
              })
              .then(list => {
                const match = list.find(a => {
                  const normA = normalizeUrl(a.originalListingUrl);
                  const normB = normalizeUrl(extractedData.originalListingUrl);
                  return (normA && normB && normA === normB) || 
                         (a.listingId && a.listingId === extractedData.listingId);
                });
                if (match) {
                  savedApartmentId = match.id;
                  showView('already-saved');
                } else {
                  renderPreview(extractedData);
                }
              })
              .catch(err => {
                console.warn('Failed to check already-saved status:', err);
                renderPreview(extractedData);
              });
            } else {
              renderPreview(extractedData);
            }
          } else {
            showView('failed');
          }
        });
      } catch (err) {
        console.error('Failed to send message to content script:', err);
        showView('failed');
      }
    } else {
      showView('unsupported');
    }
  });
}

function renderPreview(data) {
  showView('detected');

  document.getElementById('preview-title').textContent = data.title || 'Untitled Listing';
  
  // Format Rent
  let rentStr = '-';
  if (data.warmRent || data.rentPrice) {
    rentStr = `${data.warmRent || data.rentPrice} €`;
  } else if (data.coldRent) {
    rentStr = `${data.coldRent} €`;
  }
  document.getElementById('preview-rent').textContent = rentStr;

  // Format Area/Size
  document.getElementById('preview-size').textContent = data.squareMeters ? `${data.squareMeters} m²` : '-';

  // Format City/Address
  document.getElementById('preview-city').textContent = data.city || (data.address ? data.address.split(',')[0].trim() : '-');

  // Format Source label
  const sourceText = document.getElementById('preview-source-text');
  sourceText.textContent = data.sourcePlatform || 'Website';
}

function saveListing() {
  if (!extractedData || !token) return;

  showView('saving');

  fetch('http://localhost:3000/apartments/extension-import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(extractedData)
  })
  .then(async res => {
    if (res.ok) {
      return res.json();
    } else if (res.status === 409) {
      throw new Error('DUPLICATE');
    } else {
      throw new Error('SAVE_FAILED');
    }
  })
  .then(savedApartment => {
    if (savedApartment && savedApartment.id) {
      savedApartmentId = savedApartment.id;
    }

    // Notify active page tab to show "Already Saved"
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: 'mark-saved' }, () => {
          if (chrome.runtime.lastError) {}
        });
      }
    });

    // Populate success card metrics
    document.getElementById('saved-title').textContent = extractedData.title || 'Imported Apartment';
    
    let rentStr = '-';
    if (extractedData.warmRent || extractedData.rentPrice) {
      rentStr = `${extractedData.warmRent || extractedData.rentPrice} €`;
    } else if (extractedData.coldRent) {
      rentStr = `${extractedData.coldRent} €`;
    }
    
    const sizeStr = extractedData.squareMeters ? `${extractedData.squareMeters} m²` : '-';
    const cityStr = extractedData.city || (extractedData.address ? extractedData.address.split(',')[0].trim() : '-');
    document.getElementById('saved-info').textContent = `${rentStr} • ${sizeStr} • ${cityStr}`;

    showView('saved');
  })
  .catch(async err => {
    console.error('Error saving listing:', err);
    if (err.message === 'DUPLICATE') {
      // Find the ID of the duplicate by fetching the user's apartments
      try {
        const fetchRes = await fetch('http://localhost:3000/apartments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (fetchRes.ok) {
          const list = await fetchRes.json();
          const match = list.find(a => {
            const normA = normalizeUrl(a.originalListingUrl);
            const normB = normalizeUrl(extractedData.originalListingUrl);
            return (normA && normB && normA === normB) || 
                   (a.listingId && a.listingId === extractedData.listingId);
          });
          if (match) {
            savedApartmentId = match.id;
          }
        }
      } catch (fetchErr) {
        console.warn('Failed to retrieve duplicate ID:', fetchErr);
      }

      // Notify active page tab to show "Already Saved"
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab) {
          chrome.tabs.sendMessage(tab.id, { action: 'mark-saved' }, () => {
            if (chrome.runtime.lastError) {}
          });
        }
      });

      showView('already-saved');
    } else {
      showView('failed');
    }
  });
}

function showView(viewName) {
  // Hide all views
  const views = ['disconnected', 'unsupported', 'detected', 'saving', 'saved', 'already-saved', 'failed'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.add('hidden');
  });

  // Show target view
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.remove('hidden');
}

function updateStatusIndicator(labelKey, className) {
  const indicator = document.getElementById('connection-indicator');
  const labelEl = document.getElementById('txt-status-label');

  if (!indicator || !labelEl) return;

  indicator.className = 'status-indicator';
  if (className) indicator.classList.add(className);

  const t = TRANSLATIONS[appLanguage];
  if (labelKey === 'Checking...') labelEl.textContent = t.statusChecking;
  else if (labelKey === 'Connected') labelEl.textContent = t.statusConnected;
  else if (labelKey === 'Disconnected') labelEl.textContent = t.statusDisconnected;
  else if (labelKey === 'Error') labelEl.textContent = t.statusError;
  else labelEl.textContent = labelKey;
}
