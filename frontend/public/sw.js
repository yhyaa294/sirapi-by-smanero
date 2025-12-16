const CACHE_NAME = 'smartapd-v1';
const urlsToCache = [
  '/',
  '/mobile',
  '/dashboard',
  '/admin',
  '/alerts',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/framework.js',
  '/_next/static/css/globals.css',
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - cache first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Background sync for alerts
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-alerts') {
    event.waitUntil(syncAlerts());
  }
});

async function syncAlerts() {
  try {
    const response = await fetch('/api/alerts');
    const alerts = await response.json();
    
    // Store in IndexedDB for offline access
    const db = await openDB('smartapd-offline', 1, {
      upgrade(db) {
        db.createObjectStore('alerts', { keyPath: 'id' });
      },
    });
    
    const tx = db.transaction('alerts', 'readwrite');
    const store = tx.objectStore('alerts');
    
    for (const alert of alerts) {
      await store.put(alert);
    }
    
    await tx.done;
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [200, 100, 200],
      tag: 'safety-alert',
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/alerts')
    );
  }
});

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-alerts-sync') {
    event.waitUntil(syncAlerts());
  }
});

// Utility function for IndexedDB
function openDB(name, version, upgradeCallback) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => upgradeCallback(event.target.result);
  });
}
