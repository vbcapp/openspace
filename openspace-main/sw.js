/* ================================================================
   sw.js — Service Worker：靜態資源快取 + 離線友善提示
   ================================================================ */

const CACHE_NAME = 'doomsday-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './login.html',
  './manifest.json',
  './css/tokens.css',
  './css/base.css',
  './css/atoms.css',
  './css/effects.css',
  './css/layouts.css',
  './css/components.css',
  './css/utilities.css',
  './js/supabase.js',
  './js/auth.js',
  './js/router.js',
  './js/components/matrix-grid.js',
  './js/pages/profile.js',
  './js/pages/matrix.js',
  './js/pages/vote.js',
  './js/pages/vote-result.js',
  './js/pages/zones.js',
  './js/pages/question-gen.js',
  './js/pages/answer.js',
  './js/app.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

// Install：預快取靜態資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate：清除舊版快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch：Network First，失敗時回 cache，全部失敗時回離線頁
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 只處理 http/https 的 GET 請求
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;
  if (request.url.includes('supabase.co')) return;
  if (request.url.includes('googleapis.com')) return;
  if (request.url.includes('cdn.jsdelivr.net')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // 成功取得：更新快取
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() =>
        // 網路失敗：嘗試快取
        caches.match(request).then((cached) => {
          if (cached) return cached;
          // 導航請求：返回離線提示
          if (request.mode === 'navigate') {
            return new Response(OFFLINE_HTML, {
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          }
        })
      )
  );
});

// 離線提示頁面 HTML
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI末日議會 — 離線</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      background: #020002;
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background-image:
        linear-gradient(rgba(255,0,60,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,0,60,0.05) 1px, transparent 1px);
      background-size: 20px 20px;
    }
    .offline-box {
      padding: 48px 24px;
      max-width: 360px;
    }
    .offline-icon {
      font-size: 64px;
      margin-bottom: 24px;
      opacity: 0.6;
    }
    h1 {
      font-family: sans-serif;
      font-size: 28px;
      letter-spacing: 0.2em;
      color: #ff003c;
      margin-bottom: 16px;
    }
    p {
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      line-height: 1.6;
      margin-bottom: 32px;
    }
    button {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #fff;
      background: #ff003c;
      border: none;
      padding: 12px 32px;
      border-radius: 4px;
      cursor: pointer;
      box-shadow: 0 0 20px rgba(255,0,60,0.3);
    }
    button:hover { background: #e60036; }
  </style>
</head>
<body>
  <div class="offline-box">
    <div class="offline-icon">&#x26A0;</div>
    <h1>SIGNAL LOST</h1>
    <p>
      無法連線至伺服器<br>
      CONNECTION TO MAINFRAME DISRUPTED<br>
      請檢查網路後重試
    </p>
    <button onclick="location.reload()">RECONNECT</button>
  </div>
</body>
</html>`;
