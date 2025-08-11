const CACHE_NAME = 'song-diary-cache-v1754908888';
const CORE_ASSETS = ['./','./index.html','./manifest.json'];
self.addEventListener('install', e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE_ASSETS))); });
self.addEventListener('activate', e=>{ e.waitUntil((async()=>{ for (const k of await caches.keys()) if (k!==CACHE_NAME) await caches.delete(k); await self.clients.claim(); })()); });
self.addEventListener('fetch', e=>{
  const r=e.request;
  if(r.method!=='GET') return;
  const isHTML = r.mode === 'navigate' || (r.headers.get('accept')||'').includes('text/html');
  if (isHTML) {
    e.respondWith((async()=>{ try{ const f=await fetch(r); const x=f.clone(); (await caches.open(CACHE_NAME)).put(r,x); return f; }catch{ return (await caches.match(r)) || caches.match('./index.html'); } })());
    return;
  }
  e.respondWith((async()=>{ const c=await caches.match(r); if (c) return c; try{ const f=await fetch(r); (await caches.open(CACHE_NAME)).put(r,f.clone()); return f; }catch{ return caches.match('./index.html'); } })());
});
