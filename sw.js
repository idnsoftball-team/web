const CACHE_NAME = 'idn-softball-v17';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 安裝 Service Worker (快取靜態資源)


// 允許頁面主動要求跳過等待，立即套用新版本
self.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// 啟用 Service Worker (清除舊快取)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 攔截網路請求 (策略：網路優先，失敗則讀快取)
// 這樣能確保賽程資料永遠是最新的，只有在斷網時才讀取舊畫面
self.addEventListener('fetch', (event) => {
  // 對於 Google Sheets API 和 YouTube，直接走網路，不快取 (避免資料不同步)
  if (event.request.url.includes('script.google.com') || 
      event.request.url.includes('youtube') || 
      event.request.url.includes('drive.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});