const CACHE_NAME = 'song-diary-cache-v4';
const ASSETS = ['./','./index.html','./manifest.json'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE_NAME).then((c)=>c.addAll(ASSETS))); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME && caches.delete(k))))); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then((cached)=>
    cached || fetch(e.request).then((res)=>{ const copy=res.clone(); caches.open(CACHE_NAME).then((c)=>c.put(e.request, copy)); return res; })
      .catch(()=>caches.match('./index.html'))
  ));
});
