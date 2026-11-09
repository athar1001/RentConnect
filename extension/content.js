// Content Script for WohnBoard Extension

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract') {
    try {
      const data = extractApartmentFromPage();
      sendResponse({ success: true, data });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  }

  if (request.action === 'mark-saved') {
    const btn = document.getElementById('wohnboard-save-btn');
    if (btn) {
      btn.className = 'success';
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Already Saved
      `;
    }
    sendResponse({ success: true });
  }

  return true;
});

function isListingPage() {
  const url = window.location.href;
  const host = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  if (pathname === '/' || pathname === '') {
    return false;
  }

  // 1. ImmoScout24
  if (host.includes('immobilienscout24.de')) {
    return url.includes('/expose') || url.includes('/projekte') || url.includes('/neubau/');
  }

  // 2. WG-Gesucht
  if (host.includes('wg-gesucht.de')) {
    return /-\d{5,}\.html/.test(url) || /\.\d{5,}\.html/.test(url);
  }

  // 3. Kleinanzeigen
  if (host.includes('kleinanzeigen.de')) {
    return url.includes('/s-anzeige');
  }

  // 4. Immowelt
  if (host.includes('immowelt.de')) {
    return url.includes('/expose');
  }

  // 5. Immonet
  if (host.includes('immonet.de')) {
    return url.includes('/angebot');
  }

  // 6. HousingAnywhere
  if (host.includes('housinganywhere.com')) {
    return /\/(?:room|rent|listings)/.test(url) && !url.includes('/search');
  }

  // 7. Wunderflats
  if (host.includes('wunderflats.com')) {
    return url.includes('/flat') || url.includes('/furnished-apartment');
  }

  // 8. Spotahome
  if (host.includes('spotahome.com')) {
    return /\/(?:for-rent|apartments|rooms|studios|flats)/.test(url) && /\/\d+/.test(url);
  }

  // 9. Degewo
  if (host.includes('degewo.de')) {
    return url.includes('/properties') || url.includes('/details');
  }

  // 10. Gesobau
  if (host.includes('gesobau.de')) {
    return (url.includes('/detail') || /-[a-zA-Z0-9]+\/?$/.test(url)) && !url.includes('/suche') && !url.includes('/search');
  }

  // 11. Howoge
  if (host.includes('howoge.de')) {
    return url.includes('/detail');
  }

  // 12. Gewobag
  if (host.includes('gewobag.de')) {
    return url.includes('/angebot') || url.includes('/mietangebote');
  }

  // 13. WBM
  if (host.includes('wbm.de')) {
    return url.includes('/openimmo-detail') || url.includes('/expose') || url.includes('/details');
  }

  // 14. Stadt und Land
  if (host.includes('stadtundland.de')) {
    return url.includes('/scheine') || url.includes('/details') || url.includes('/expose') || (url.includes('/wohnungssuche/') && pathname !== '/wohnungssuche' && pathname !== '/wohnungssuche/');
  }

  // 15. Berlinovo
  if (host.includes('berlinovo.de')) {
    return url.includes('/apartments') || url.includes('/expose') || url.includes('/details');
  }

  // 16. Vonovia
  if (host.includes('vonovia.de')) {
    return url.includes('/expose') || url.includes('/details') || url.includes('/immobilien');
  }

  // 17. Deutsche Wohnen
  if (host.includes('deutsche-wohnen.com')) {
    return url.includes('/expose') || url.includes('/details') || url.includes('/mietangebote');
  }

  // 18. LEG Wohnen
  if (host.includes('leg-wohnen.de')) {
    return url.includes('/expose') || url.includes('/details');
  }

  // 19. Buwog
  if (host.includes('buwog.de')) {
    return url.includes('/expose') || url.includes('/details');
  }

  // 20. Grand City Property
  if (host.includes('grandcityproperty.de')) {
    return url.includes('/expose') || url.includes('/details') || (url.includes('/wohnungssuche/') && pathname !== '/wohnungssuche' && pathname !== '/wohnungssuche/');
  }

  // 21. TAG Wohnen
  if (host.includes('tag-wohnen.de')) {
    return url.includes('/expose') || url.includes('/details');
  }

  // 22. Saga Hamburg
  if (host.includes('saga.hamburg')) {
    return url.includes('/expose') || url.includes('/details');
  }

  return false;
}



function injectSaveButton() {
  if (document.getElementById('wohnboard-save-btn')) return;

  // 1. Inject Styles
  const style = document.createElement('style');
  style.id = 'wohnboard-styles';
  style.innerHTML = `
    #wohnboard-save-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 8px;
      width: auto !important;
      max-width: max-content !important;
      box-sizing: border-box !important;
      background-color: #2563eb !important;
      color: #ffffff !important;
      border: none !important;
      border-radius: 9999px !important;
      padding: 12px 22px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3), 0 4px 6px -4px rgba(37, 99, 235, 0.3) !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      text-decoration: none !important;
    }
    #wohnboard-save-btn:hover {
      background-color: #1d4ed8 !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4), 0 8px 10px -6px rgba(37, 99, 235, 0.4) !important;
    }
    #wohnboard-save-btn:active {
      transform: translateY(0) !important;
    }
    #wohnboard-save-btn.saving {
      background-color: #3b82f6 !important;
      opacity: 0.8 !important;
      cursor: not-allowed !important;
    }
    #wohnboard-save-btn.success {
      background-color: #16a34a !important;
      box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.3) !important;
      cursor: default !important;
    }
    #wohnboard-save-btn.success:hover {
      transform: none !important;
      background-color: #16a34a !important;
    }
    #wohnboard-save-btn.error {
      background-color: #dc2626 !important;
      box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.3) !important;
    }
    #wohnboard-save-btn svg {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      margin: 0 !important;
      padding: 0 !important;
    }
  `;
  document.head.appendChild(style);

  // 2. Inject Button
  const btn = document.createElement('button');
  btn.id = 'wohnboard-save-btn';
  const originalHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
    Save to WohnBoard
  `;
  btn.innerHTML = originalHTML;
  document.body.appendChild(btn);

  // Check if this apartment is already saved
  try {
    const data = extractApartmentFromPage();
    chrome.runtime.sendMessage({ action: 'check-duplicate', data }, (res) => {
      if (chrome.runtime.lastError) return;
      if (res && res.isSaved) {
        btn.className = 'success';
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Already Saved
        `;
      }
    });
  } catch (err) {
    console.warn('WohnBoard duplicate check failed:', err);
  }

  // 3. Event Listener
  btn.addEventListener('click', () => {
    if (btn.classList.contains('saving') || btn.classList.contains('success')) return;

    btn.classList.add('saving');
    btn.innerHTML = `
      <svg style="animation: spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"></circle>
        <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
      </svg>
      Saving...
    `;

    if (!document.getElementById('wohnboard-spin-keyframes')) {
      const kf = document.createElement('style');
      kf.id = 'wohnboard-spin-keyframes';
      kf.innerHTML = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
      document.head.appendChild(kf);
    }

    try {
      const data = extractApartmentFromPage();

      try {
        chrome.runtime.sendMessage({ action: 'save-listing', data }, (res) => {
          if (chrome.runtime.lastError) {
            console.warn('WohnBoard: Runtime error during save:', chrome.runtime.lastError.message);
            btn.className = 'error';
            btn.innerHTML = 'Reload Page';
            return;
          }
          if (res && res.success) {
            btn.className = 'success';
            btn.innerHTML = `
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Saved to WohnBoard
            `;
          } else {
            btn.className = 'error';
            if (res && res.error === 'DUPLICATE') {
              btn.innerHTML = 'Already Saved';
            } else {
              btn.innerHTML = 'Error Saving';
              setTimeout(() => {
                btn.className = '';
                btn.innerHTML = originalHTML;
              }, 3000);
            }
          }
        });
      } catch (sendErr) {
        if (sendErr.message && sendErr.message.includes('context invalidated')) {
          console.info('WohnBoard extension context invalidated. Please refresh the page to save.');
          btn.className = 'error';
          btn.innerHTML = 'Reload Page';
        } else {
          throw sendErr;
        }
      }
    } catch (err) {
      console.error(err);
      btn.className = 'error';
      btn.innerHTML = 'Error Extracting';
      setTimeout(() => {
        btn.className = '';
        btn.innerHTML = originalHTML;
      }, 3000);
    }
  });
}

// Auto-check and inject
if (isListingPage()) {
  const runCheck = () => {
    try {
      chrome.runtime.sendMessage({ action: 'check-auth' }, (response) => {
        if (chrome.runtime.lastError) {
          // Extension might be updated/reloaded, ignore gracefully
          return;
        }
        if (response && response.authenticated) {
          injectSaveButton();
        }
      });
    } catch (sendErr) {
      if (sendErr.message && sendErr.message.includes('context invalidated')) {
        console.info('WohnBoard extension context invalidated. Reload page to enable extension.');
      } else {
        console.error('WohnBoard authentication check error:', sendErr);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCheck);
  } else {
    runCheck();
  }
}
