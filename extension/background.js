// Background script for WohnBoard Extension (Manifest V3)

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

// Multi-strategy localhost cookie reader
function getAuthToken() {
  return new Promise((resolve) => {
    try {
      chrome.cookies.getAll({ name: 'access_token' }, (cookies) => {
        if (chrome.runtime.lastError) {
          console.warn('Background cookie read error:', chrome.runtime.lastError.message);
        }
        
        const localCookies = (cookies || []).filter(c => 
          c.domain.includes('localhost') || c.domain.includes('127.0.0.1')
        );
        
        resolve(localCookies[0] ? localCookies[0].value : null);
      });
    } catch (err) {
      console.error('Background getAuthToken error:', err);
      resolve(null);
    }
  });
}

function verifySession(token) {
  return fetch('http://localhost:3000/auth/extension/status', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(res => {
    if (res.status === 200) {
      return res.json();
    }
    throw new Error('Unauthorized');
  });
}

function submitListing(token, data) {
  return fetch('http://localhost:3000/apartments/extension-import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  .then(res => {
    if (res.ok) {
      // Auto-connect to backend settings status
      fetch('http://localhost:3000/auth/extension/connect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
      return { success: true };
    } else if (res.status === 409) {
      return { success: false, error: 'DUPLICATE' };
    } else {
      return { success: false, error: 'SAVE_FAILED' };
    }
  })
  .catch(err => {
    console.error('Error saving in background service worker:', err);
    return { success: false, error: err.message };
  });
}

// Message Router
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'check-auth') {
    getAuthToken()
      .then(token => {
        if (!token) {
          sendResponse({ authenticated: false });
          return;
        }
        verifySession(token)
          .then(user => {
            sendResponse({ authenticated: true, user });
          })
          .catch(() => {
            sendResponse({ authenticated: false });
          });
      })
      .catch(() => {
        sendResponse({ authenticated: false });
      });
    return true; // Keep message channel open for async response
  }

  if (request.action === 'save-listing') {
    getAuthToken()
      .then(token => {
        if (!token) {
          sendResponse({ success: false, error: 'UNAUTHORIZED' });
          return;
        }
        submitListing(token, request.data)
          .then(result => {
            sendResponse(result);
          })
          .catch(err => {
            sendResponse({ success: false, error: err.message });
          });
      })
      .catch(err => {
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep message channel open for async response
  }

  if (request.action === 'check-duplicate') {
    getAuthToken()
      .then(token => {
        if (!token) {
          sendResponse({ isSaved: false });
          return;
        }
        fetch('http://localhost:3000/apartments', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch');
        })
        .then(list => {
          const match = list.find(a => {
            const normA = normalizeUrl(a.originalListingUrl);
            const normB = normalizeUrl(request.data.originalListingUrl);
            return (normA && normB && normA === normB) || 
                   (a.listingId && a.listingId === request.data.listingId);
          });
          sendResponse({ isSaved: !!match, id: match ? match.id : null });
        })
        .catch(() => {
          sendResponse({ isSaved: false });
        });
      })
      .catch(() => {
        sendResponse({ isSaved: false });
      });
    return true; // Keep message channel open for async response
  }
});
